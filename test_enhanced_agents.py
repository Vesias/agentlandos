#!/usr/bin/env python3
"""
Test script for Enhanced Agent System with Sub-Agents
Demonstrates complex task decomposition and parallel execution
"""

import asyncio
import httpx
import json
from datetime import datetime
from typing import Dict, Any, List


BASE_URL = "http://localhost:8000"


async def test_enhanced_query(query: str, language: str = "de"):
    """Test enhanced agent query processing"""
    print(f"\n{'='*60}")
    print(f"Testing Enhanced Query: {query}")
    print(f"{'='*60}")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/enhanced-agents/query",
            json={
                "message": query,
                "language": language,
                "use_parallel": True,
                "max_parallel_tasks": 5
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success!")
            print(f"Agent: {data['agent_name']}")
            print(f"Confidence: {data['confidence']}")
            print(f"Execution Time: {data.get('execution_time', 'N/A')} seconds")
            print(f"\nResponse:\n{data['message']}")
            print(f"\nMetadata: {json.dumps(data['metadata'], indent=2)}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)


async def test_task_plan_execution():
    """Test direct task plan execution"""
    print(f"\n{'='*60}")
    print("Testing Task Plan Execution")
    print(f"{'='*60}")
    
    # Create a complex task plan
    task_plan = {
        "name": "Saarland Comprehensive Analysis",
        "description": "Analyze tourism, business, and culture in Saarland",
        "parallel_execution": True,
        "subtasks": [
            {
                "name": "Fetch Tourism Data",
                "description": "Get current tourism statistics",
                "dependencies": [],
                "metadata": {
                    "required_capabilities": ["fetch_data"],
                    "source": "tourism_api"
                }
            },
            {
                "name": "Fetch Business Data",
                "description": "Get economic indicators",
                "dependencies": [],
                "metadata": {
                    "required_capabilities": ["fetch_data"],
                    "source": "business_api"
                }
            },
            {
                "name": "Fetch Cultural Events",
                "description": "Get upcoming cultural events",
                "dependencies": [],
                "metadata": {
                    "required_capabilities": ["fetch_data"],
                    "source": "culture_api"
                }
            },
            {
                "name": "Analyze Combined Data",
                "description": "Synthesize all data sources",
                "dependencies": ["Fetch Tourism Data", "Fetch Business Data", "Fetch Cultural Events"],
                "metadata": {
                    "required_capabilities": ["analyze", "summarize"]
                }
            },
            {
                "name": "Format Report",
                "description": "Create final report",
                "dependencies": ["Analyze Combined Data"],
                "metadata": {
                    "required_capabilities": ["format"],
                    "format_type": "report"
                }
            }
        ]
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/enhanced-agents/execute-plan",
            json=task_plan
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Plan Execution Complete!")
            print(f"Plan ID: {data['plan_id']}")
            print(f"Execution Time: {data['execution_time']} seconds")
            print(f"Tasks Completed: {data['completed_tasks']}/{data['total_tasks']}")
            
            if data.get('failed_tasks'):
                print(f"\n⚠️  Failed Tasks:")
                for task in data['failed_tasks']:
                    print(f"  - {task['name']}: {task['error']}")
            
            print(f"\nSubtask Results:")
            for task_id, result in data.get('subtask_results', {}).items():
                print(f"  - Task {task_id[:8]}...: {json.dumps(result, indent=4)}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)


async def test_parallel_demonstration():
    """Test parallel tool execution demonstration"""
    print(f"\n{'='*60}")
    print("Testing Parallel Tool Execution")
    print(f"{'='*60}")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{BASE_URL}/api/v1/enhanced-agents/demonstrate-parallel"
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Parallel Execution Complete!")
            print(f"Tools Executed: {data['tools_executed']}")
            print(f"Execution Time: {data['execution_time']}")
            print(f"\nResults:")
            for result in data['results']:
                print(f"  - {result['tool']}: {'✅' if result['success'] else '❌'}")
                if result['success']:
                    print(f"    Result: {json.dumps(result['result'], indent=6)}")
                else:
                    print(f"    Error: {result['error']}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)


async def test_complexity_analysis(query: str):
    """Test query complexity analysis"""
    print(f"\n{'='*60}")
    print(f"Testing Complexity Analysis: {query}")
    print(f"{'='*60}")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/enhanced-agents/analyze-complexity",
            json={
                "message": query,
                "language": "de"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"Query: {data['query']}")
            print(f"Is Complex: {'Yes' if data['is_complex'] else 'No'}")
            print(f"Reasoning: {', '.join(data['reasoning'])}")
            
            if data.get('hypothetical_plan'):
                plan = data['hypothetical_plan']
                print(f"\nHypothetical Execution Plan:")
                print(f"  Plan: {plan['name']}")
                print(f"  Parallel Execution: {plan['parallel_execution']}")
                print(f"  Subtasks:")
                for task in plan['subtasks']:
                    deps = f" (depends on: {', '.join(task['dependencies'])})" if task['dependencies'] else ""
                    print(f"    - {task['name']}{deps}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)


async def test_agent_capabilities():
    """Test getting agent capabilities"""
    print(f"\n{'='*60}")
    print("Testing Agent Capabilities")
    print(f"{'='*60}")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{BASE_URL}/api/v1/enhanced-agents/capabilities"
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"Agent: {data['agent_name']}")
            print(f"Description: {data['description']}")
            print(f"\nCapabilities:")
            for cap in data['capabilities']:
                print(f"  - {cap}")
            
            print(f"\nSub-Agents ({len(data['sub_agents'])}):")
            for agent in data['sub_agents']:
                print(f"  - {agent['name']}: {', '.join(agent['capabilities'])}")
            
            print(f"\nFeatures:")
            for feature, enabled in data['features'].items():
                print(f"  - {feature}: {'✅' if enabled else '❌'}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)


async def main():
    """Run all tests"""
    print("🚀 Testing Enhanced Agent System with Sub-Agents")
    print("=" * 80)
    
    # Test 1: Agent capabilities
    await test_agent_capabilities()
    
    # Test 2: Simple query
    await test_enhanced_query("Was sind die Hauptsehenswürdigkeiten im Saarland?")
    
    # Test 3: Complex query requiring decomposition
    await test_enhanced_query(
        "Ich plane eine Geschäftsreise ins Saarland und möchte sowohl touristische "
        "Sehenswürdigkeiten besuchen als auch die Forschungslandschaft kennenlernen. "
        "Was können Sie mir empfehlen?"
    )
    
    # Test 4: Complexity analysis
    await test_complexity_analysis("Hallo")
    await test_complexity_analysis(
        "Vergleiche die Tourismusangebote und kulturellen Veranstaltungen "
        "im Saarland mit den wirtschaftlichen Entwicklungen der Region"
    )
    
    # Test 5: Direct task plan execution
    await test_task_plan_execution()
    
    # Test 6: Parallel tool demonstration
    await test_parallel_demonstration()
    
    print("\n" + "=" * 80)
    print("✅ All tests completed!")


if __name__ == "__main__":
    asyncio.run(main())