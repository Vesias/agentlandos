"""
Enhanced NavigatorAgent with Sub-Agent Support
Demonstrates complex task decomposition and parallel execution
"""

from typing import Dict, List, Optional, Any
import asyncio
from datetime import datetime

from app.agents.base_agent import BaseAgent, AgentResponse
from app.agents.sub_agent import (
    SubAgent, TaskPlan, SubTask, TaskStatus,
    DataFetcherSubAgent, AnalyzerSubAgent, FormatterSubAgent
)
from app.core.config import settings


class EnhancedNavigatorAgent(BaseAgent):
    """
    Enhanced NavigatorAgent with sub-agent orchestration capabilities
    Can decompose complex queries into subtasks and execute them in parallel
    """
    
    def __init__(self):
        super().__init__(
            name="EnhancedNavigatorAgent",
            description="Advanced orchestration agent with sub-agent support",
            capabilities=[
                "query_decomposition",
                "parallel_execution",
                "sub_agent_orchestration",
                "complex_task_planning",
                "multi_source_aggregation"
            ]
        )
        
        # Initialize sub-agents
        self._initialize_sub_agents()
        
        # Setup orchestrator and parallel executor
        self.setup_task_orchestrator(max_parallel_tasks=5)
        self.setup_parallel_executor(max_parallel=10)
        
        # Specialized agents registry
        self.specialized_agents: Dict[str, BaseAgent] = {}
    
    def _initialize_sub_agents(self):
        """Initialize default sub-agents"""
        # Data fetching sub-agents
        self.register_sub_agent(DataFetcherSubAgent(parent_agent=self))
        self.register_sub_agent(AnalyzerSubAgent(parent_agent=self))
        self.register_sub_agent(FormatterSubAgent(parent_agent=self))
        
        # Saarland-specific sub-agents
        self.register_sub_agent(TourismDataSubAgent(parent_agent=self))
        self.register_sub_agent(BusinessDataSubAgent(parent_agent=self))
        self.register_sub_agent(CulturalDataSubAgent(parent_agent=self))
    
    async def process_query(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None
    ) -> AgentResponse:
        """
        Process query with intelligent task decomposition
        """
        context = context or {}
        
        # Analyze query complexity
        is_complex = await self._analyze_query_complexity(query)
        
        if is_complex:
            # Create task plan for complex query
            task_plan = await self._create_task_plan(query, context)
            
            # Execute plan with sub-agents
            execution_result = await self.execute_with_sub_agents(task_plan, context)
            
            # Aggregate results
            final_response = await self._aggregate_results(execution_result, query, context)
            
            return self.format_response(
                content=final_response,
                confidence=0.9,
                metadata={
                    "execution_type": "complex_with_subagents",
                    "subtasks_completed": execution_result["completed_tasks"],
                    "execution_time": execution_result["execution_time"],
                    "parallel_execution": True
                }
            )
        else:
            # Handle simple query directly or delegate to specialized agent
            return await self._handle_simple_query(query, context)
    
    async def _analyze_query_complexity(self, query: str) -> bool:
        """
        Determine if query requires complex task decomposition
        """
        complexity_indicators = [
            " and ",
            " sowie ",
            " mit ",
            "vergleiche",
            "compare",
            "analysiere",
            "analyze",
            "mehrere",
            "multiple",
            "verschiedene",
            "different"
        ]
        
        query_lower = query.lower()
        
        # Check for complexity indicators
        has_indicators = any(indicator in query_lower for indicator in complexity_indicators)
        
        # Check query length (longer queries tend to be more complex)
        is_long = len(query.split()) > 15
        
        return has_indicators or is_long
    
    async def _create_task_plan(self, query: str, context: Dict[str, Any]) -> TaskPlan:
        """
        Create execution plan with subtasks for complex query
        """
        plan = TaskPlan(
            name=f"Query Plan: {query[:50]}...",
            description=f"Execution plan for: {query}",
            parallel_execution=True,
            max_parallel_tasks=3
        )
        
        # Example: Tourism and cultural information query
        if "tourismus" in query.lower() or "tourism" in query.lower():
            # Task 1: Fetch tourism data
            tourism_task = SubTask(
                name="Fetch Tourism Data",
                description="Retrieve current tourism information",
                metadata={
                    "required_capabilities": ["fetch_data"],
                    "source": "tourism_api",
                    "query": query
                }
            )
            plan.add_subtask(tourism_task)
            
            # Task 2: Fetch cultural events (can run in parallel)
            culture_task = SubTask(
                name="Fetch Cultural Events",
                description="Retrieve cultural events and activities",
                metadata={
                    "required_capabilities": ["fetch_data"],
                    "source": "culture_api",
                    "query": query
                }
            )
            plan.add_subtask(culture_task)
            
            # Task 3: Analyze combined data (depends on tasks 1 and 2)
            analysis_task = SubTask(
                name="Analyze Tourism and Culture Data",
                description="Analyze and combine tourism and cultural information",
                dependencies=[tourism_task.id, culture_task.id],
                metadata={
                    "required_capabilities": ["analyze"],
                    "analysis_type": "tourism_culture_synthesis"
                }
            )
            plan.add_subtask(analysis_task)
            
            # Task 4: Format final response (depends on task 3)
            format_task = SubTask(
                name="Format Response",
                description="Format the analysis into user-friendly response",
                dependencies=[analysis_task.id],
                metadata={
                    "required_capabilities": ["format"],
                    "format_type": "user_response",
                    "language": context.get("language", "de")
                }
            )
            plan.add_subtask(format_task)
        
        # Example: Business and research query
        elif "wirtschaft" in query.lower() or "business" in query.lower():
            # Similar decomposition for business queries
            business_task = SubTask(
                name="Fetch Business Data",
                description="Retrieve business and economic information",
                metadata={
                    "required_capabilities": ["fetch_data"],
                    "source": "business_api"
                }
            )
            plan.add_subtask(business_task)
            
            research_task = SubTask(
                name="Fetch Research Data",
                description="Retrieve research and innovation information",
                metadata={
                    "required_capabilities": ["fetch_data"],
                    "source": "research_api"
                }
            )
            plan.add_subtask(research_task)
            
            synthesis_task = SubTask(
                name="Synthesize Business Intelligence",
                description="Combine business and research insights",
                dependencies=[business_task.id, research_task.id],
                metadata={
                    "required_capabilities": ["analyze", "summarize"]
                }
            )
            plan.add_subtask(synthesis_task)
        
        return plan
    
    async def _aggregate_results(
        self,
        execution_result: Dict[str, Any],
        original_query: str,
        context: Dict[str, Any]
    ) -> str:
        """
        Aggregate results from multiple subtasks into coherent response
        """
        subtask_results = execution_result.get("subtask_results", {})
        
        # Build response from subtask results
        response_parts = []
        
        for task_id, result in subtask_results.items():
            if isinstance(result, dict):
                if "formatted" in result:
                    response_parts.append(result["formatted"])
                elif "analysis" in result:
                    response_parts.append(result["analysis"])
                elif "data" in result:
                    response_parts.append(str(result["data"]))
        
        # Combine parts into coherent response
        if response_parts:
            return "\n\n".join(response_parts)
        else:
            return f"Ich habe Ihre Anfrage '{original_query}' verarbeitet, aber konnte keine spezifischen Ergebnisse finden."
    
    async def _handle_simple_query(self, query: str, context: Dict[str, Any]) -> AgentResponse:
        """
        Handle simple queries without task decomposition
        """
        # Try to find specialized agent
        for agent in self.specialized_agents.values():
            if hasattr(agent, 'can_handle') and agent.can_handle(query):
                return await agent.process_query(query, context)
        
        # Default response
        return self.format_response(
            content=self._generate_default_response(query, context),
            confidence=0.8,
            metadata={"execution_type": "simple"}
        )
    
    def _generate_default_response(self, query: str, context: Dict[str, Any]) -> str:
        """Generate default response"""
        language = context.get("language", "de")
        
        if language == "de":
            return (
                f"Ich habe Ihre Anfrage '{query}' erhalten. Als erweiterter NavigatorAgent "
                "kann ich komplexe Aufgaben in Teilaufgaben zerlegen und parallel bearbeiten. "
                "Wie kann ich Ihnen konkret helfen?"
            )
        else:
            return (
                f"I received your query '{query}'. As an enhanced NavigatorAgent, "
                "I can decompose complex tasks and execute them in parallel. "
                "How can I specifically help you?"
            )
    
    async def demonstrate_parallel_tools(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Demonstrate parallel tool execution capability
        """
        # Define multiple tool calls
        tool_calls = [
            {
                "name": "weather_api",
                "func": self._mock_weather_api,
                "kwargs": {"city": "Saarbrücken"}
            },
            {
                "name": "events_api",
                "func": self._mock_events_api,
                "kwargs": {"location": "Saarland", "date": "today"}
            },
            {
                "name": "traffic_api",
                "func": self._mock_traffic_api,
                "kwargs": {"region": "Saarland"}
            }
        ]
        
        # Execute tools in parallel
        results = await self.execute_parallel_tools(tool_calls)
        
        return {
            "demonstration": "Parallel tool execution",
            "tools_executed": len(results),
            "results": results,
            "execution_time": "< 1 second (parallel)"
        }
    
    # Mock tool functions for demonstration
    async def _mock_weather_api(self, city: str) -> Dict[str, Any]:
        await asyncio.sleep(0.5)  # Simulate API delay
        return {"city": city, "temperature": "18°C", "condition": "Sunny"}
    
    async def _mock_events_api(self, location: str, date: str) -> List[str]:
        await asyncio.sleep(0.7)  # Simulate API delay
        return ["Saarland Music Festival", "Tech Meetup Saarbrücken", "Völklinger Hütte Exhibition"]
    
    async def _mock_traffic_api(self, region: str) -> Dict[str, Any]:
        await asyncio.sleep(0.4)  # Simulate API delay
        return {"region": region, "status": "Normal", "incidents": 0}


# Specialized Sub-Agents for Saarland

class TourismDataSubAgent(SubAgent):
    """Sub-agent for tourism data retrieval"""
    
    def __init__(self, parent_agent=None):
        super().__init__(
            name="TourismDataAgent",
            capabilities=["fetch_data", "tourism_api", "attractions"],
            parent_agent=parent_agent
        )
    
    async def can_handle(self, task: SubTask) -> bool:
        return task.metadata.get("source") == "tourism_api"
    
    async def execute(self, task: SubTask, context: Dict[str, Any]) -> Any:
        # Simulate tourism data fetching
        await asyncio.sleep(0.6)
        return {
            "data": {
                "attractions": [
                    "Saarschleife",
                    "Völklinger Hütte",
                    "Bostalsee"
                ],
                "visitor_info": "Tourism is thriving in Saarland"
            }
        }


class BusinessDataSubAgent(SubAgent):
    """Sub-agent for business data retrieval"""
    
    def __init__(self, parent_agent=None):
        super().__init__(
            name="BusinessDataAgent",
            capabilities=["fetch_data", "business_api", "economic_data"],
            parent_agent=parent_agent
        )
    
    async def can_handle(self, task: SubTask) -> bool:
        return task.metadata.get("source") == "business_api"
    
    async def execute(self, task: SubTask, context: Dict[str, Any]) -> Any:
        await asyncio.sleep(0.5)
        return {
            "data": {
                "key_industries": ["Automotive", "IT", "Steel"],
                "economic_indicators": "Strong growth in tech sector"
            }
        }


class CulturalDataSubAgent(SubAgent):
    """Sub-agent for cultural data retrieval"""
    
    def __init__(self, parent_agent=None):
        super().__init__(
            name="CulturalDataAgent",
            capabilities=["fetch_data", "culture_api", "events"],
            parent_agent=parent_agent
        )
    
    async def can_handle(self, task: SubTask) -> bool:
        return task.metadata.get("source") == "culture_api"
    
    async def execute(self, task: SubTask, context: Dict[str, Any]) -> Any:
        await asyncio.sleep(0.4)
        return {
            "data": {
                "upcoming_events": [
                    "Saarland Music Festival",
                    "Modern Art Exhibition",
                    "Theater Performance"
                ],
                "cultural_highlights": "Rich cultural scene"
            }
        }