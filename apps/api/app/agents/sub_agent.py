"""
Sub-Agent Framework for AGENTLAND.SAARLAND
Enables agents to spawn and manage sub-agents for complex tasks
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import asyncio
import logging
import uuid

logger = logging.getLogger(__name__)


class TaskStatus(Enum):
    """Status of a task or subtask"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class SubTask:
    """Represents a subtask within a larger task"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    parent_task_id: Optional[str] = None
    name: str = ""
    description: str = ""
    status: TaskStatus = TaskStatus.PENDING
    assigned_agent: Optional[str] = None
    dependencies: List[str] = field(default_factory=list)  # IDs of tasks this depends on
    result: Optional[Any] = None
    error: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def can_start(self, completed_tasks: Set[str]) -> bool:
        """Check if all dependencies are satisfied"""
        return all(dep_id in completed_tasks for dep_id in self.dependencies)
    
    def start(self):
        """Mark task as started"""
        self.status = TaskStatus.IN_PROGRESS
        self.started_at = datetime.now()
    
    def complete(self, result: Any):
        """Mark task as completed with result"""
        self.status = TaskStatus.COMPLETED
        self.completed_at = datetime.now()
        self.result = result
    
    def fail(self, error: str):
        """Mark task as failed with error"""
        self.status = TaskStatus.FAILED
        self.completed_at = datetime.now()
        self.error = error


@dataclass
class TaskPlan:
    """Execution plan for a complex task with subtasks"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    description: str = ""
    subtasks: List[SubTask] = field(default_factory=list)
    parallel_execution: bool = True
    max_parallel_tasks: int = 5
    created_at: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def add_subtask(self, subtask: SubTask):
        """Add a subtask to the plan"""
        subtask.parent_task_id = self.id
        self.subtasks.append(subtask)
    
    def get_ready_tasks(self, completed_tasks: Set[str]) -> List[SubTask]:
        """Get all tasks that are ready to execute"""
        return [
            task for task in self.subtasks
            if task.status == TaskStatus.PENDING and task.can_start(completed_tasks)
        ]
    
    def all_completed(self) -> bool:
        """Check if all subtasks are completed"""
        return all(
            task.status in [TaskStatus.COMPLETED, TaskStatus.CANCELLED]
            for task in self.subtasks
        )
    
    def get_failed_tasks(self) -> List[SubTask]:
        """Get all failed tasks"""
        return [task for task in self.subtasks if task.status == TaskStatus.FAILED]


class SubAgent(ABC):
    """
    Abstract base class for sub-agents that can handle specific subtasks
    """
    
    def __init__(self, name: str, capabilities: List[str], parent_agent: Optional['BaseAgent'] = None):
        self.id = str(uuid.uuid4())
        self.name = name
        self.capabilities = capabilities
        self.parent_agent = parent_agent
        self.logger = logging.getLogger(f"{__name__}.{name}")
        
    @abstractmethod
    async def can_handle(self, task: SubTask) -> bool:
        """Determine if this sub-agent can handle the given task"""
        pass
    
    @abstractmethod
    async def execute(self, task: SubTask, context: Dict[str, Any]) -> Any:
        """Execute the given task"""
        pass
    
    def matches_capabilities(self, required_capabilities: List[str]) -> bool:
        """Check if agent has required capabilities"""
        return all(cap in self.capabilities for cap in required_capabilities)


class TaskOrchestrator:
    """
    Orchestrates the execution of complex tasks with subtasks
    Manages sub-agents and parallel execution
    """
    
    def __init__(self, max_parallel_tasks: int = 5):
        self.sub_agents: Dict[str, SubAgent] = {}
        self.max_parallel_tasks = max_parallel_tasks
        self.active_tasks: Dict[str, asyncio.Task] = {}
        self.completed_tasks: Set[str] = set()
        self.logger = logging.getLogger(f"{__name__}.TaskOrchestrator")
    
    def register_sub_agent(self, sub_agent: SubAgent):
        """Register a sub-agent"""
        self.sub_agents[sub_agent.id] = sub_agent
        self.logger.info(f"Registered sub-agent: {sub_agent.name}")
    
    async def find_agent_for_task(self, task: SubTask) -> Optional[SubAgent]:
        """Find a suitable sub-agent for a task"""
        for agent in self.sub_agents.values():
            if await agent.can_handle(task):
                return agent
        return None
    
    async def execute_task(self, task: SubTask, context: Dict[str, Any]):
        """Execute a single task"""
        try:
            task.start()
            
            # Find suitable agent
            agent = await self.find_agent_for_task(task)
            if not agent:
                raise Exception(f"No suitable agent found for task: {task.name}")
            
            task.assigned_agent = agent.name
            
            # Execute task
            result = await agent.execute(task, context)
            task.complete(result)
            self.completed_tasks.add(task.id)
            
            self.logger.info(f"Task completed: {task.name} by {agent.name}")
            
        except Exception as e:
            task.fail(str(e))
            self.logger.error(f"Task failed: {task.name} - {str(e)}")
            raise
    
    async def execute_plan(self, plan: TaskPlan, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a task plan with parallel support
        Returns a dictionary with results and execution details
        """
        self.logger.info(f"Starting execution of plan: {plan.name}")
        
        results = {}
        start_time = datetime.now()
        
        while not plan.all_completed():
            # Get tasks ready to execute
            ready_tasks = plan.get_ready_tasks(self.completed_tasks)
            
            if not ready_tasks and not self.active_tasks:
                # No tasks ready and no active tasks - might be a dependency issue
                failed_tasks = plan.get_failed_tasks()
                if failed_tasks:
                    raise Exception(f"Plan execution halted due to failed tasks: {[t.name for t in failed_tasks]}")
                else:
                    raise Exception("No tasks ready to execute - possible circular dependency")
            
            # Start new tasks up to parallel limit
            for task in ready_tasks:
                if len(self.active_tasks) >= self.max_parallel_tasks:
                    break
                
                if plan.parallel_execution or len(self.active_tasks) == 0:
                    # Create async task
                    async_task = asyncio.create_task(self.execute_task(task, context))
                    self.active_tasks[task.id] = async_task
            
            # Wait for at least one task to complete
            if self.active_tasks:
                done, pending = await asyncio.wait(
                    self.active_tasks.values(),
                    return_when=asyncio.FIRST_COMPLETED
                )
                
                # Remove completed tasks from active list
                completed_ids = []
                for task_id, async_task in list(self.active_tasks.items()):
                    if async_task in done:
                        completed_ids.append(task_id)
                        del self.active_tasks[task_id]
                
                # Collect results
                for task in plan.subtasks:
                    if task.id in completed_ids and task.status == TaskStatus.COMPLETED:
                        results[task.id] = task.result
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "plan_id": plan.id,
            "plan_name": plan.name,
            "execution_time": execution_time,
            "subtask_results": results,
            "failed_tasks": [
                {"id": t.id, "name": t.name, "error": t.error}
                for t in plan.get_failed_tasks()
            ],
            "completed_tasks": len([t for t in plan.subtasks if t.status == TaskStatus.COMPLETED]),
            "total_tasks": len(plan.subtasks)
        }


class ParallelToolExecutor:
    """
    Enables parallel execution of multiple tools/functions
    """
    
    def __init__(self, max_parallel: int = 10):
        self.max_parallel = max_parallel
        self.semaphore = asyncio.Semaphore(max_parallel)
        self.logger = logging.getLogger(f"{__name__}.ParallelToolExecutor")
    
    async def execute_tool(self, tool_name: str, tool_func, *args, **kwargs):
        """Execute a single tool with semaphore control"""
        async with self.semaphore:
            self.logger.debug(f"Executing tool: {tool_name}")
            try:
                result = await tool_func(*args, **kwargs)
                self.logger.debug(f"Tool completed: {tool_name}")
                return {"tool": tool_name, "success": True, "result": result}
            except Exception as e:
                self.logger.error(f"Tool failed: {tool_name} - {str(e)}")
                return {"tool": tool_name, "success": False, "error": str(e)}
    
    async def execute_parallel(self, tool_calls: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Execute multiple tool calls in parallel
        
        tool_calls format:
        [
            {"name": "tool1", "func": callable, "args": [], "kwargs": {}},
            {"name": "tool2", "func": callable, "args": [], "kwargs": {}},
        ]
        """
        tasks = []
        for call in tool_calls:
            task = asyncio.create_task(
                self.execute_tool(
                    call["name"],
                    call["func"],
                    *call.get("args", []),
                    **call.get("kwargs", {})
                )
            )
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        return results


# Example specialized sub-agents

class DataFetcherSubAgent(SubAgent):
    """Sub-agent specialized in fetching data from various sources"""
    
    def __init__(self, parent_agent=None):
        super().__init__(
            name="DataFetcher",
            capabilities=["fetch_data", "api_call", "web_scraping"],
            parent_agent=parent_agent
        )
    
    async def can_handle(self, task: SubTask) -> bool:
        return any(cap in task.metadata.get("required_capabilities", []) 
                  for cap in ["fetch_data", "api_call", "web_scraping"])
    
    async def execute(self, task: SubTask, context: Dict[str, Any]) -> Any:
        # Simulate data fetching
        await asyncio.sleep(0.5)  # Simulate API call
        return {"data": f"Fetched data for {task.name}", "source": task.metadata.get("source", "unknown")}


class AnalyzerSubAgent(SubAgent):
    """Sub-agent specialized in analyzing data"""
    
    def __init__(self, parent_agent=None):
        super().__init__(
            name="Analyzer",
            capabilities=["analyze", "summarize", "extract_insights"],
            parent_agent=parent_agent
        )
    
    async def can_handle(self, task: SubTask) -> bool:
        return any(cap in task.metadata.get("required_capabilities", []) 
                  for cap in ["analyze", "summarize", "extract_insights"])
    
    async def execute(self, task: SubTask, context: Dict[str, Any]) -> Any:
        # Simulate analysis
        await asyncio.sleep(0.3)  # Simulate processing
        input_data = task.metadata.get("input_data", {})
        return {"analysis": f"Analysis of {task.name}", "insights": ["insight1", "insight2"]}


class FormatterSubAgent(SubAgent):
    """Sub-agent specialized in formatting and presenting results"""
    
    def __init__(self, parent_agent=None):
        super().__init__(
            name="Formatter",
            capabilities=["format", "present", "visualize"],
            parent_agent=parent_agent
        )
    
    async def can_handle(self, task: SubTask) -> bool:
        return any(cap in task.metadata.get("required_capabilities", []) 
                  for cap in ["format", "present", "visualize"])
    
    async def execute(self, task: SubTask, context: Dict[str, Any]) -> Any:
        # Simulate formatting
        await asyncio.sleep(0.2)  # Simulate processing
        return {"formatted": f"Formatted output for {task.name}", "format": "markdown"}