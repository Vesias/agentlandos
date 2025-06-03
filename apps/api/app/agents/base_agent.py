"""
Base Agent class for AGENT_LAND_SAARLAND
Foundation for all specialized agents with sub-agent support
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import logging
import asyncio

logger = logging.getLogger(__name__)


@dataclass
class AgentResponse:
    """Standard response format for all agents"""
    content: str
    agent_name: str
    confidence: float
    metadata: Dict[str, Any] = None
    sources: List[str] = None
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
        if self.sources is None:
            self.sources = []
        if self.timestamp is None:
            self.timestamp = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert response to dictionary"""
        return {
            "content": self.content,
            "agent_name": self.agent_name,
            "confidence": self.confidence,
            "metadata": self.metadata,
            "sources": self.sources,
            "timestamp": self.timestamp.isoformat()
        }


class BaseAgent(ABC):
    """Abstract base class for all AGENT_LAND_SAARLAND agents with sub-agent support"""
    
    def __init__(self, name: str, description: str, capabilities: List[str]):
        self.name = name
        self.description = description
        self.capabilities = capabilities
        self.logger = logging.getLogger(f"{__name__}.{name}")
        
        # Sub-agent support
        self.sub_agents: Dict[str, 'SubAgent'] = {}
        self.task_orchestrator: Optional['TaskOrchestrator'] = None
        self.parallel_executor: Optional['ParallelToolExecutor'] = None
        
    @abstractmethod
    async def process_query(
        self, 
        query: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> AgentResponse:
        """Process a user query and return a response"""
        pass
    
    def validate_context(self, context: Dict[str, Any]) -> bool:
        """Validate context data"""
        required_fields = ["language"]
        return all(field in context for field in required_fields)
    
    def format_response(
        self, 
        content: str, 
        confidence: float = 0.8,
        sources: List[str] = None,
        metadata: Dict[str, Any] = None
    ) -> AgentResponse:
        """Format agent response in standard format"""
        return AgentResponse(
            content=content,
            agent_name=self.name,
            confidence=confidence,
            sources=sources or [],
            metadata=metadata or {}
        )
    
    def log_query(self, query: str, response: AgentResponse):
        """Log query and response for monitoring"""
        self.logger.info(f"Query: {query[:100]}... | Response confidence: {response.confidence}")
    
    # Sub-agent management methods
    def register_sub_agent(self, sub_agent: 'SubAgent'):
        """Register a sub-agent"""
        self.sub_agents[sub_agent.id] = sub_agent
        if self.task_orchestrator:
            self.task_orchestrator.register_sub_agent(sub_agent)
    
    def setup_task_orchestrator(self, max_parallel_tasks: int = 5):
        """Setup task orchestrator for complex tasks"""
        from .sub_agent import TaskOrchestrator
        self.task_orchestrator = TaskOrchestrator(max_parallel_tasks)
        # Register existing sub-agents
        for sub_agent in self.sub_agents.values():
            self.task_orchestrator.register_sub_agent(sub_agent)
    
    def setup_parallel_executor(self, max_parallel: int = 10):
        """Setup parallel tool executor"""
        from .sub_agent import ParallelToolExecutor
        self.parallel_executor = ParallelToolExecutor(max_parallel)
    
    async def execute_with_sub_agents(self, task_plan: 'TaskPlan', context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a complex task using sub-agents"""
        if not self.task_orchestrator:
            self.setup_task_orchestrator()
        
        return await self.task_orchestrator.execute_plan(task_plan, context)
    
    async def execute_parallel_tools(self, tool_calls: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Execute multiple tools in parallel"""
        if not self.parallel_executor:
            self.setup_parallel_executor()
        
        return await self.parallel_executor.execute_parallel(tool_calls)
