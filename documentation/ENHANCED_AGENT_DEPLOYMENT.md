# Enhanced Agent System Deployment Guide

## Overview

This guide covers the deployment of the enhanced AGENTLAND.SAARLAND platform with:
- **Sub-Agent Architecture**: Agents can spawn specialized sub-agents for complex tasks
- **Task Management with Subtasks**: Complex queries are decomposed into manageable subtasks
- **Parallel Tool Execution**: Multiple operations can run simultaneously for faster results

## New Features Implemented

### 1. Sub-Agent Framework (`app/agents/sub_agent.py`)
- **TaskStatus Enum**: Tracks task lifecycle (PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED)
- **SubTask Class**: Represents individual subtasks with dependencies
- **TaskPlan Class**: Orchestrates multiple subtasks with dependency resolution
- **SubAgent Abstract Class**: Base for specialized sub-agents
- **TaskOrchestrator**: Manages parallel execution of subtasks
- **ParallelToolExecutor**: Enables concurrent tool/API calls

### 2. Enhanced Base Agent (`app/agents/base_agent.py`)
- Added sub-agent registration and management
- Integrated task orchestrator setup
- Support for parallel tool execution
- Methods for complex task execution

### 3. Enhanced Navigator Agent (`app/agents/enhanced_navigator_agent.py`)
- Automatic query complexity analysis
- Dynamic task plan creation
- Specialized sub-agents for different domains:
  - DataFetcherSubAgent
  - AnalyzerSubAgent
  - FormatterSubAgent
  - TourismDataSubAgent
  - BusinessDataSubAgent
  - CulturalDataSubAgent

### 4. Enhanced API Endpoints (`app/api/enhanced_agents.py`)
- `/api/v1/enhanced-agents/query`: Process queries with automatic decomposition
- `/api/v1/enhanced-agents/execute-plan`: Execute custom task plans
- `/api/v1/enhanced-agents/demonstrate-parallel`: Show parallel execution
- `/api/v1/enhanced-agents/capabilities`: List agent capabilities
- `/api/v1/enhanced-agents/analyze-complexity`: Analyze query complexity

## Deployment Steps

### 1. Local Development Deployment

```bash
# Navigate to project directory
cd /Users/deepsleeping/agentlandos

# Install dependencies
./install-deps.sh

# Start services with Docker
./deploy.sh

# Or use docker-compose directly
docker-compose up -d
```

### 2. Test the Enhanced Features

```bash
# Run the test script
python test_enhanced_agents.py

# Or test individual endpoints
# Simple query
curl -X POST http://localhost:8000/api/v1/enhanced-agents/query \
  -H "Content-Type: application/json" \
  -d '{"message": "Was sind die Hauptsehenswürdigkeiten im Saarland?", "language": "de"}'

# Complex query (triggers decomposition)
curl -X POST http://localhost:8000/api/v1/enhanced-agents/query \
  -H "Content-Type: application/json" \
  -d '{"message": "Vergleiche Tourismus und Wirtschaft im Saarland und analysiere die kulturellen Veranstaltungen", "language": "de", "use_parallel": true}'

# Check capabilities
curl http://localhost:8000/api/v1/enhanced-agents/capabilities
```

### 3. Production Deployment Options

#### Option A: Vercel (Frontend) + Cloud Backend

```bash
# Deploy frontend to Vercel
./deploy-production.sh vercel

# Deploy backend to Railway
./deploy-production.sh railway
```

#### Option B: Docker Swarm

```bash
# Deploy with Docker Swarm
./deploy-production.sh docker
```

#### Option C: VPS Deployment

```bash
# Set environment variables
export VPS_HOST=your-vps-ip
export VPS_USER=your-username

# Deploy to VPS
./deploy-production.sh vps
```

## Environment Variables

Ensure these are set in your `.env` file:

```env
# API Keys
DEEPSEEK_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here

# Database
DATABASE_URL=postgresql+asyncpg://agentland:saarland2024@postgres:5432/agentland_saarland
REDIS_URL=redis://redis:6379

# Security
SECRET_KEY=your-secret-key-change-in-production

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (Next.js)                 │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Enhanced Agents API (FastAPI)                   │
├─────────────────────────────────────────────────────────────┤
│                   Enhanced Navigator Agent                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Task Orchestrator                       │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐            │   │
│  │  │ SubTask │  │ SubTask │  │ SubTask │  Parallel  │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘            │   │
│  │       │            │            │                  │   │
│  │  ┌────▼────┐  ┌───▼────┐  ┌───▼────┐            │   │
│  │  │SubAgent1│  │SubAgent2│  │SubAgent3│            │   │
│  │  └─────────┘  └─────────┘  └─────────┘            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
        ┌─────────────────────┐ ┌─────────────────────┐
        │    PostgreSQL       │ │       Redis         │
        │   (with pgvector)   │ │     (Cache)         │
        └─────────────────────┘ └─────────────────────┘
```

## Key Benefits

1. **Scalability**: Complex queries are broken down and executed in parallel
2. **Flexibility**: Custom task plans can be created and executed
3. **Efficiency**: Multiple data sources accessed simultaneously
4. **Modularity**: Sub-agents can be added/removed independently
5. **Transparency**: Query complexity analysis shows execution strategy

## Monitoring

### Check Service Health

```bash
# Docker services
docker-compose ps

# API health
curl http://localhost:8000/api/health

# Logs
docker-compose logs -f api
```

### Performance Metrics

The enhanced system provides execution time metrics for:
- Total query processing time
- Individual subtask completion times
- Parallel vs sequential execution comparison

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all Python dependencies are installed
   ```bash
   cd apps/api
   pip install -r requirements.txt
   ```

2. **Database Connection**: Check PostgreSQL is running
   ```bash
   docker-compose logs postgres
   ```

3. **Sub-Agent Registration**: Verify sub-agents are properly registered
   ```bash
   curl http://localhost:8000/api/v1/enhanced-agents/capabilities
   ```

## Next Steps

1. **Add More Sub-Agents**: Create specialized sub-agents for specific domains
2. **Implement Caching**: Add Redis caching for frequently accessed data
3. **Add Monitoring**: Integrate Prometheus/Grafana for detailed metrics
4. **Scale Horizontally**: Deploy multiple API instances behind a load balancer
5. **Add Authentication**: Implement JWT-based authentication for API access

## Conclusion

The enhanced agent system provides a robust foundation for handling complex, multi-faceted queries about Saarland. The sub-agent architecture allows for modular expansion while maintaining high performance through parallel execution.