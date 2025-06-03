# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AGENTLAND.SAARLAND is a regional AI platform for the Saarland region in Germany, featuring a multi-agent system with specialized agents for different domains (Tourism, Business, Education, Culture, Admin) orchestrated by a NavigatorAgent.

**Note**: This is a merged codebase combining agentland-saarland (main implementation) and agentland-deploy (deployment features).

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Radix UI
- **Backend**: FastAPI (Python 3.11+), async/await
- **Database**: PostgreSQL with pgvector extension
- **Cache**: Redis
- **Build**: Turbo monorepo with pnpm workspaces
- **Container**: Docker & Docker Compose

## Development Commands

```bash
# Install all dependencies
pnpm install
# or use the convenience script:
./install-deps.sh

# Run all services in development
pnpm dev

# Run services individually
cd apps/web && pnpm dev                                    # Frontend on :3000
cd apps/api && poetry run uvicorn app.main:app --reload   # Backend on :8000

# Build all packages
pnpm build

# Lint and type checking
pnpm lint
pnpm typecheck

# Testing
pnpm test

# Docker deployment
docker-compose up -d
./launch.sh  # Convenience script for Docker deployment
```

## Architecture

### Multi-Agent System
- **NavigatorAgent**: Central orchestrator that routes requests to specialized agents
- **Specialized Agents**: Tourism, Business, Education, Culture, Admin agents with domain expertise
- **Base Agent**: Common functionality for all agents (app/agents/base_agent.py)
- **Agent Router**: FastAPI router handling agent endpoints (app/api/agents_router.py)

### API Endpoints
- `/api/v1/saartasks`: Main agent query endpoint (multi-turn conversations)
- `/api/v1/saarag`: Vector database search endpoint
- `/api/v1/agents`: Agent management endpoints
- Authentication via JWT tokens

### Frontend Structure
- Pages in `src/app/` (Next.js app router)
- Components in `src/components/` with UI primitives in `ui/`
- API client in `src/lib/api-client.ts`
- Chat interfaces: simple and enhanced versions
- Vercel serverless functions in `apps/web/api/` for edge deployment

### Key Services
- **DeepSeek Service**: LLM integration (app/services/deepseek_service.py)
- **RAG Service**: Vector search and retrieval (app/services/rag_service.py)
- **Saarland Connectors**: Regional data integration (app/connectors/saarland_connectors.py)
- **Additional Connectors**: Enhanced data connectors with caching and DSGVO compliance (app/connectors/additional/)

## Design System

### Brand Colors
- Saarland Blue: #003399
- Innovation Cyan: #009FE3
- Nature Green: #00A54A
- Industrial Grey: #8B8680

### Typography
- Primary: "Quantum Sans" (custom)
- Secondary: "Nova Text"
- Monospace: "Circuit Mono"

## Important Configuration

### Environment Variables
Backend requires:
- `DEEPSEEK_API_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`

Frontend requires:
- `NEXT_PUBLIC_API_URL`

### Database
PostgreSQL with pgvector extension is required. Initialize with:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Code Conventions

### Python (Backend)
- Async/await for all endpoints
- Type hints throughout
- Pydantic for data validation
- Follow FastAPI best practices

### TypeScript (Frontend)
- Strict mode enabled
- React Server Components where possible
- TailwindCSS for styling
- Radix UI for accessible components

## Testing

Run tests with appropriate flags:
```bash
# Frontend tests
cd apps/web && pnpm test

# Backend tests  
cd apps/api && poetry run pytest

# Specific test file
cd apps/api && poetry run pytest tests/test_agents.py -v
```

## Deployment

### Local Development
```bash
docker-compose up -d         # All services with Docker
./deploy.sh                 # Automated local deployment
./bughunt.sh               # Check for common issues
```

### Production Deployment
```bash
./deploy-production.sh <target>
```

Available deployment targets:
- `vercel` - Deploy frontend to Vercel
- `railway` - Deploy to Railway
- `docker` - Deploy using Docker Swarm
- `k8s` - Deploy to Kubernetes
- `vps` - Deploy to VPS with Docker Compose

### Quick Commands
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f [service]

# Restart services
docker-compose restart

# Stop all services
docker-compose down
```

### Environment Variables
Ensure all required environment variables are set in `.env`:
- `DEEPSEEK_API_KEY` - Required for AI functionality
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SECRET_KEY` - JWT secret key
- `NEXT_PUBLIC_API_URL` - API URL for frontend

The project emphasizes technical sovereignty, data privacy, and regional identity while providing cutting-edge AI capabilities for the Saarland region.