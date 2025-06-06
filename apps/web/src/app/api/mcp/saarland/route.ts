import { NextRequest, NextResponse } from 'next/server'
import { saarlandMCPServer } from '@/lib/mcp/saarland-mcp-server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// MCP (Model Context Protocol) API endpoint for Saarland data access
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const resource = searchParams.get('resource')
  const tool = searchParams.get('tool')
  const prompt = searchParams.get('prompt')

  try {
    switch (action) {
      case 'list_resources':
        const resources = await saarlandMCPServer.listResources()
        return NextResponse.json({
          success: true,
          resources,
          protocol: 'MCP/1.0',
          server: 'saarland-data-access'
        })

      case 'get_resource':
        if (!resource) {
          return NextResponse.json({ error: 'Resource URI required' }, { status: 400 })
        }
        
        const resourceData = await saarlandMCPServer.getResource(resource)
        return NextResponse.json({
          success: true,
          resource,
          data: resourceData,
          timestamp: new Date().toISOString()
        })

      case 'list_tools':
        const tools = await saarlandMCPServer.listTools()
        return NextResponse.json({
          success: true,
          tools: tools.map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema
          })),
          protocol: 'MCP/1.0'
        })

      case 'list_prompts':
        const prompts = await saarlandMCPServer.listPrompts()
        return NextResponse.json({
          success: true,
          prompts: prompts.map(p => ({
            name: p.name,
            description: p.description,
            arguments: p.arguments
          })),
          protocol: 'MCP/1.0'
        })

      case 'get_prompt':
        if (!prompt) {
          return NextResponse.json({ error: 'Prompt name required' }, { status: 400 })
        }
        
        const args = Object.fromEntries(searchParams.entries())
        delete args.action
        delete args.prompt
        
        const promptText = await saarlandMCPServer.getPrompt(prompt, args)
        return NextResponse.json({
          success: true,
          prompt,
          text: promptText,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: true,
          protocol: 'MCP/1.0',
          server: 'Saarland Data Access Server',
          version: '1.0.0',
          capabilities: {
            resources: 'Structured access to Saarland data',
            tools: 'PLZ lookup, authority contact, business registration, events',
            prompts: 'Official response templates and guidance'
          },
          endpoints: {
            'list_resources': 'GET ?action=list_resources',
            'get_resource': 'GET ?action=get_resource&resource=<uri>',
            'list_tools': 'GET ?action=list_tools',
            'call_tool': 'POST with tool name and arguments',
            'list_prompts': 'GET ?action=list_prompts',
            'get_prompt': 'GET ?action=get_prompt&prompt=<name>&[args]'
          }
        })
    }

  } catch (error) {
    console.error('MCP Server error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'MCP server error',
      protocol: 'MCP/1.0',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, tool, arguments: toolArgs } = body

    if (action === 'call_tool') {
      if (!tool) {
        return NextResponse.json({ error: 'Tool name required' }, { status: 400 })
      }

      const result = await saarlandMCPServer.callTool(tool, toolArgs || {})
      
      return NextResponse.json({
        success: true,
        tool,
        result,
        protocol: 'MCP/1.0',
        timestamp: new Date().toISOString()
      })
    }

    // Batch operations
    if (action === 'batch') {
      const { operations } = body
      if (!Array.isArray(operations)) {
        return NextResponse.json({ error: 'Operations array required' }, { status: 400 })
      }

      const results = await Promise.allSettled(
        operations.map(async (op: any) => {
          switch (op.type) {
            case 'call_tool':
              return await saarlandMCPServer.callTool(op.tool, op.arguments)
            case 'get_resource':
              return await saarlandMCPServer.getResource(op.resource)
            case 'get_prompt':
              return await saarlandMCPServer.getPrompt(op.prompt, op.arguments)
            default:
              throw new Error(`Unknown operation type: ${op.type}`)
          }
        })
      )

      return NextResponse.json({
        success: true,
        results: results.map((result, index) => ({
          operation: operations[index],
          status: result.status,
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason.message : null
        })),
        protocol: 'MCP/1.0',
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('MCP Server POST error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'MCP server error',
      protocol: 'MCP/1.0',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}