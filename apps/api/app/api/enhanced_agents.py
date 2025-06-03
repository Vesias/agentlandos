"""
Enhanced Agents API Router
Demonstrates sub-agent orchestration and parallel execution
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

from app.agents.enhanced_navigator_agent import EnhancedNavigatorAgent
from app.agents.sub_agent import TaskPlan, SubTask
from app.core.config import settings


router = APIRouter(
    prefix="/api/v1/enhanced-agents",
    tags=["enhanced-agents"],
    responses={404: {"description": "Not found"}},
)


class QueryRequest(BaseModel):
    """Request model for agent queries"""
    message: str = Field(..., description="User query message")
    language: str = Field(default="de", description="Query language")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context")
    use_parallel: bool = Field(default=True, description="Enable parallel execution")
    max_parallel_tasks: int = Field(default=5, description="Maximum parallel tasks")


class SubTaskRequest(BaseModel):
    """Request model for creating subtasks"""
    name: str = Field(..., description="Task name")
    description: str = Field(..., description="Task description")
    dependencies: List[str] = Field(default_factory=list, description="Task dependencies")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Task metadata")


class TaskPlanRequest(BaseModel):
    """Request model for task plans"""
    name: str = Field(..., description="Plan name")
    description: str = Field(..., description="Plan description")
    subtasks: List[SubTaskRequest] = Field(..., description="List of subtasks")
    parallel_execution: bool = Field(default=True, description="Enable parallel execution")


class AgentResponse(BaseModel):
    """Response model for agent queries"""
    agent_id: str
    agent_name: str
    message: str
    confidence: float
    metadata: Dict[str, Any]
    execution_time: Optional[float] = None
    subtask_results: Optional[Dict[str, Any]] = None


# Initialize enhanced navigator agent
enhanced_navigator = EnhancedNavigatorAgent()


@router.post("/query", response_model=AgentResponse)
async def process_enhanced_query(request: QueryRequest):
    """
    Process query using enhanced agent with sub-agent orchestration
    
    This endpoint demonstrates:
    - Automatic query complexity analysis
    - Task decomposition for complex queries
    - Parallel execution of subtasks
    - Result aggregation
    """
    try:
        start_time = datetime.now()
        
        # Configure parallel execution
        if request.use_parallel:
            enhanced_navigator.setup_task_orchestrator(max_parallel_tasks=request.max_parallel_tasks)
        
        # Process query
        response = await enhanced_navigator.process_query(
            query=request.message,
            context={
                **request.context,
                "language": request.language,
                "timestamp": datetime.now().isoformat()
            }
        )
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return AgentResponse(
            agent_id=enhanced_navigator.name,
            agent_name=enhanced_navigator.name,
            message=response.content,
            confidence=response.confidence,
            metadata={
                **response.metadata,
                "execution_time_seconds": execution_time,
                "parallel_enabled": request.use_parallel
            },
            execution_time=execution_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/execute-plan", response_model=Dict[str, Any])
async def execute_task_plan(plan_request: TaskPlanRequest):
    """
    Execute a custom task plan with subtasks
    
    This endpoint allows direct specification of task plans for:
    - Custom workflows
    - Complex multi-step operations
    - Dependency-based task execution
    """
    try:
        # Create task plan
        plan = TaskPlan(
            name=plan_request.name,
            description=plan_request.description,
            parallel_execution=plan_request.parallel_execution
        )
        
        # Add subtasks
        task_map = {}
        for subtask_req in plan_request.subtasks:
            subtask = SubTask(
                name=subtask_req.name,
                description=subtask_req.description,
                metadata=subtask_req.metadata
            )
            task_map[subtask_req.name] = subtask.id
            plan.add_subtask(subtask)
        
        # Resolve dependencies
        for subtask_req, subtask in zip(plan_request.subtasks, plan.subtasks):
            if subtask_req.dependencies:
                subtask.dependencies = [
                    task_map.get(dep_name, dep_name) 
                    for dep_name in subtask_req.dependencies
                ]
        
        # Execute plan
        result = await enhanced_navigator.execute_with_sub_agents(
            plan, 
            {"language": "de", "source": "api"}
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/demonstrate-parallel")
async def demonstrate_parallel_execution():
    """
    Demonstrate parallel tool execution capabilities
    
    Shows how multiple API calls or tools can be executed simultaneously
    """
    try:
        result = await enhanced_navigator.demonstrate_parallel_tools(
            {"demonstration": True}
        )
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/capabilities")
async def get_agent_capabilities():
    """
    Get information about enhanced agent capabilities
    """
    return {
        "agent_name": enhanced_navigator.name,
        "description": enhanced_navigator.description,
        "capabilities": enhanced_navigator.capabilities,
        "sub_agents": [
            {
                "id": agent.id,
                "name": agent.name,
                "capabilities": agent.capabilities
            }
            for agent in enhanced_navigator.sub_agents.values()
        ],
        "features": {
            "parallel_execution": True,
            "task_decomposition": True,
            "sub_agent_orchestration": True,
            "dependency_resolution": True,
            "result_aggregation": True
        }
    }


@router.post("/analyze-complexity")
async def analyze_query_complexity(request: QueryRequest):
    """
    Analyze the complexity of a query without executing it
    
    Useful for understanding how the agent would approach a query
    """
    try:
        is_complex = await enhanced_navigator._analyze_query_complexity(request.message)
        
        response = {
            "query": request.message,
            "is_complex": is_complex,
            "reasoning": []
        }
        
        if is_complex:
            # Create hypothetical task plan
            plan = await enhanced_navigator._create_task_plan(
                request.message, 
                request.context
            )
            
            response["hypothetical_plan"] = {
                "name": plan.name,
                "subtasks": [
                    {
                        "name": task.name,
                        "description": task.description,
                        "dependencies": task.dependencies
                    }
                    for task in plan.subtasks
                ],
                "parallel_execution": plan.parallel_execution
            }
            response["reasoning"].append("Query contains complexity indicators or is lengthy")
        else:
            response["reasoning"].append("Query is straightforward and can be handled directly")
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))