"""
RAG Service for AGENT_LAND_SAARLAND
Manages vector search and knowledge retrieval
"""

import asyncio
import asyncpg
from typing import List, Dict, Optional, Any
import numpy as np
from sentence_transformers import SentenceTransformer
import logging
from datetime import datetime
import json

logger = logging.getLogger(__name__)


class SaarlandRAGService:
    """
    Retrieval-Augmented Generation service for Saarland knowledge base
    Uses pgvector for semantic search
    """
    
    def __init__(self, db_config: Dict[str, str]):
        self.db_config = db_config
        self.pool = None
        
        # Initialize multilingual embedding model
        self.embedding_model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
        self.embedding_dim = 384  # Dimension for this model
        
        # Categories for filtering
        self.categories = [
            'tourism', 'administration', 'business', 
            'education', 'culture', 'general', 'emergency'
        ]
        
    async def initialize(self):
        """Initialize database connection and tables"""
        self.pool = await asyncpg.create_pool(**self.db_config)
        await self._create_tables()
        
    async def _create_tables(self):
        """Create necessary tables with pgvector extension"""
        async with self.pool.acquire() as conn:
            # Enable pgvector extension
            await conn.execute('CREATE EXTENSION IF NOT EXISTS vector')
            
            # Create knowledge base table
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS saarland_knowledge (
                    id SERIAL PRIMARY KEY,
                    content TEXT NOT NULL,
                    embedding vector($1),
                    category VARCHAR(50),
                    subcategory VARCHAR(50),
                    source VARCHAR(255),
                    language VARCHAR(10) DEFAULT 'de',
                    metadata JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''', self.embedding_dim)
            
            # Create indices
            await conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_embedding_cosine 
                ON saarland_knowledge 
                USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100)
            ''')
            
            await conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_category 
                ON saarland_knowledge(category)
            ''')
            
            await conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_language 
                ON saarland_knowledge(language)
            ''')
            
            # Create full-text search
            await conn.execute('''
                ALTER TABLE saarland_knowledge 
                ADD COLUMN IF NOT EXISTS search_vector tsvector
            ''')
            
            await conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_search_vector 
                ON saarland_knowledge 
                USING GIN(search_vector)
            ''')
            
    async def add_document(
        self,
        content: str,
        category: str,
        source: str,
        subcategory: Optional[str] = None,
        language: str = 'de',
        metadata: Optional[Dict] = None
    ) -> int:
        """Add a document to the knowledge base"""
        # Generate embedding
        embedding = self.embedding_model.encode(content)
        
        async with self.pool.acquire() as conn:
            # Insert document
            doc_id = await conn.fetchval('''
                INSERT INTO saarland_knowledge 
                (content, embedding, category, subcategory, source, language, metadata, search_vector)
                VALUES ($1, $2, $3, $4, $5, $6, $7, to_tsvector($8, $1))
                RETURNING id
            ''', content, embedding.tolist(), category, subcategory, 
                source, language, json.dumps(metadata or {}), 
                'german' if language == 'de' else 'simple')
            
        logger.info(f"Added document {doc_id} to knowledge base")
        return doc_id
        
    async def search(
        self,
        query: str,
        filter_category: Optional[str] = None,
        filter_language: Optional[str] = None,
        limit: int = 10,
        threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Search for relevant documents using semantic and full-text search
        """
        # Generate query embedding
        query_embedding = self.embedding_model.encode(query)
        
        async with self.pool.acquire() as conn:
            # Build query with filters
            base_query = '''
                WITH semantic AS (
                    SELECT 
                        id,
                        content,
                        category,
                        subcategory,
                        source,
                        language,
                        metadata,
                        1 - (embedding <=> $1) as similarity
                    FROM saarland_knowledge
                    WHERE 1=1
            '''
            
            params = [query_embedding.tolist()]
            param_count = 1
            
            if filter_category:
                param_count += 1
                base_query += f' AND category = ${param_count}'
                params.append(filter_category)
                
            if filter_language:
                param_count += 1
                base_query += f' AND language = ${param_count}'
                params.append(filter_language)
                
            base_query += f'''
                    ORDER BY embedding <=> $1
                    LIMIT {limit * 2}
                ),
                fulltext AS (
                    SELECT 
                        id,
                        ts_rank(search_vector, query) as rank
                    FROM saarland_knowledge,
                         plainto_tsquery($${param_count + 1}, $${param_count + 2}) query
                    WHERE search_vector @@ query
                )
                SELECT 
                    s.*,
                    COALESCE(f.rank, 0) as text_rank,
                    (0.7 * s.similarity + 0.3 * COALESCE(f.rank, 0)) as combined_score
                FROM semantic s
                LEFT JOIN fulltext f ON s.id = f.id
                WHERE s.similarity >= ${threshold}
                ORDER BY combined_score DESC
                LIMIT ${limit}
            '''
            
            params.extend(['german' if filter_language == 'de' else 'simple', query])
            
            results = await conn.fetch(base_query, *params)
            
        return [dict(r) for r in results]
        
    async def get_similar_documents(
        self,
        document_id: int,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Get documents similar to a given document"""
        async with self.pool.acquire() as conn:
            # Get the document's embedding
            embedding = await conn.fetchval('''
                SELECT embedding FROM saarland_knowledge WHERE id = $1
            ''', document_id)
            
            if not embedding:
                return []
                
            # Find similar documents
            results = await conn.fetch('''
                SELECT 
                    id,
                    content,
                    category,
                    source,
                    1 - (embedding <=> $1) as similarity
                FROM saarland_knowledge
                WHERE id != $2
                ORDER BY embedding <=> $1
                LIMIT $3
            ''', embedding, document_id, limit)
            
        return [dict(r) for r in results]
        
    async def update_document(
        self,
        document_id: int,
        content: Optional[str] = None,
        category: Optional[str] = None,
        metadata: Optional[Dict] = None
    ):
        """Update an existing document"""
        updates = []
        params = []
        param_count = 0
        
        if content:
            param_count += 1
            updates.append(f'content = ${param_count}')
            params.append(content)
            
            # Update embedding
            embedding = self.embedding_model.encode(content)
            param_count += 1
            updates.append(f'embedding = ${param_count}')
            params.append(embedding.tolist())
            
            # Update search vector
            param_count += 1
            updates.append(f'search_vector = to_tsvector(${param_count}, ${param_count - 2})')
            params.append('german')
            
        if category:
            param_count += 1
            updates.append(f'category = ${param_count}')
            params.append(category)
            
        if metadata:
            param_count += 1
            updates.append(f'metadata = ${param_count}')
            params.append(json.dumps(metadata))
            
        if updates:
            param_count += 1
            params.append(document_id)
            
            async with self.pool.acquire() as conn:
                await conn.execute(f'''
                    UPDATE saarland_knowledge
                    SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${param_count}
                ''', *params)
                
    async def delete_document(self, document_id: int):
        """Delete a document from the knowledge base"""
        async with self.pool.acquire() as conn:
            await conn.execute('''
                DELETE FROM saarland_knowledge WHERE id = $1
            ''', document_id)
            
    async def bulk_add_documents(
        self,
        documents: List[Dict[str, Any]]
    ) -> List[int]:
        """Add multiple documents efficiently"""
        # Prepare data
        contents = []
        embeddings = []
        categories = []
        sources = []
        languages = []
        metadatas = []
        
        for doc in documents:
            contents.append(doc['content'])
            embeddings.append(
                self.embedding_model.encode(doc['content']).tolist()
            )
            categories.append(doc.get('category', 'general'))
            sources.append(doc.get('source', 'unknown'))
            languages.append(doc.get('language', 'de'))
            metadatas.append(json.dumps(doc.get('metadata', {})))
            
        async with self.pool.acquire() as conn:
            # Bulk insert
            result = await conn.fetch('''
                INSERT INTO saarland_knowledge 
                (content, embedding, category, source, language, metadata, search_vector)
                SELECT 
                    unnest($1::text[]),
                    unnest($2::vector[]),
                    unnest($3::text[]),
                    unnest($4::text[]),
                    unnest($5::text[]),
                    unnest($6::jsonb[]),
                    to_tsvector(
                        CASE WHEN unnest($5::text[]) = 'de' 
                        THEN 'german' ELSE 'simple' END,
                        unnest($1::text[])
                    )
                RETURNING id
            ''', contents, embeddings, categories, sources, languages, metadatas)
            
        return [r['id'] for r in result]
        
    async def get_statistics(self) -> Dict[str, Any]:
        """Get statistics about the knowledge base"""
        async with self.pool.acquire() as conn:
            stats = await conn.fetchrow('''
                SELECT 
                    COUNT(*) as total_documents,
                    COUNT(DISTINCT category) as categories,
                    COUNT(DISTINCT source) as sources,
                    COUNT(DISTINCT language) as languages,
                    AVG(LENGTH(content)) as avg_content_length
                FROM saarland_knowledge
            ''')
            
            category_counts = await conn.fetch('''
                SELECT category, COUNT(*) as count
                FROM saarland_knowledge
                GROUP BY category
                ORDER BY count DESC
            ''')
            
        return {
            'total_documents': stats['total_documents'],
            'categories': stats['categories'],
            'sources': stats['sources'],
            'languages': stats['languages'],
            'avg_content_length': float(stats['avg_content_length'] or 0),
            'category_distribution': {
                r['category']: r['count'] for r in category_counts
            }
        }
        
    async def close(self):
        """Close database connections"""
        if self.pool:
            await self.pool.close()
