import { supabase } from '@/lib/supabase'

export interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'ai_processor' | 'integration' | 'delay' | 'loop' | 'end'
  name: string
  description?: string
  position: { x: number; y: number }
  config: {
    trigger_type?: 'webhook' | 'schedule' | 'email' | 'form_submission' | 'file_upload' | 'api_call'
    schedule?: string // Cron expression
    condition?: {
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex'
      field: string
      value: any
      logic?: 'and' | 'or'
    }[]
    action_type?: 'send_email' | 'create_document' | 'api_request' | 'database_update' | 'notification'
    ai_model?: string
    ai_prompt?: string
    integration?: {
      service: 'salesforce' | 'hubspot' | 'slack' | 'teams' | 'zapier' | 'make' | 'custom'
      config: Record<string, any>
    }
    delay_duration?: number // milliseconds
    loop_config?: {
      type: 'for_each' | 'while' | 'repeat'
      data_source?: string
      condition?: string
      max_iterations?: number
    }
  }
  inputs: Array<{
    id: string
    name: string
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    required: boolean
    default_value?: any
  }>
  outputs: Array<{
    id: string
    name: string
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    description?: string
  }>
  connections: Array<{
    target_node_id: string
    source_output?: string
    target_input?: string
    condition?: string // For conditional routing
  }>
}

export interface Workflow {
  id: string
  tenant_id: string
  name: string
  description?: string
  category: 'business_automation' | 'data_processing' | 'customer_service' | 'marketing' | 'finance' | 'hr' | 'custom'
  status: 'draft' | 'active' | 'paused' | 'error' | 'archived'
  version: number
  nodes: WorkflowNode[]
  variables: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    value: any
    description?: string
  }>
  settings: {
    error_handling: 'stop' | 'continue' | 'retry'
    max_retries: number
    timeout_seconds: number
    logging_level: 'none' | 'basic' | 'detailed' | 'debug'
    notifications: {
      on_success: boolean
      on_error: boolean
      recipients: string[]
    }
  }
  metrics: {
    total_executions: number
    successful_executions: number
    failed_executions: number
    average_duration_ms: number
    last_execution?: string
    error_rate: number
  }
  created_by: string
  created_at: string
  updated_at: string
  tags: string[]
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  tenant_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  trigger_data: Record<string, any>
  execution_context: {
    variables: Record<string, any>
    node_results: Record<string, any>
    current_node_id?: string
    error_details?: {
      node_id: string
      error_message: string
      stack_trace?: string
    }
  }
  started_at: string
  completed_at?: string
  duration_ms?: number
  logs: Array<{
    timestamp: string
    level: 'info' | 'warn' | 'error' | 'debug'
    node_id?: string
    message: string
    data?: any
  }>
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  industry: string[]
  use_case: string
  complexity: 'simple' | 'intermediate' | 'advanced'
  estimated_setup_time: number // minutes
  workflow_definition: Omit<Workflow, 'id' | 'tenant_id' | 'created_by' | 'created_at' | 'updated_at' | 'metrics'>
  preview_image?: string
  demo_video_url?: string
  roi_estimate?: {
    time_saved_hours_per_month: number
    cost_saved_eur_per_month: number
    productivity_increase_percent: number
  }
  rating: number
  usage_count: number
  tags: string[]
}

class WorkflowEngine {
  private deepseekApiKey: string
  private executionQueue: Map<string, WorkflowExecution> = new Map()
  private scheduledWorkflows: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || ''
    this.initializeScheduler()
  }

  async createWorkflow(tenantId: string, workflowData: Omit<Workflow, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'metrics'>): Promise<Workflow> {
    try {
      const workflowId = crypto.randomUUID()
      const now = new Date().toISOString()

      const workflow: Workflow = {
        id: workflowId,
        tenant_id: tenantId,
        created_at: now,
        updated_at: now,
        metrics: {
          total_executions: 0,
          successful_executions: 0,
          failed_executions: 0,
          average_duration_ms: 0,
          error_rate: 0
        },
        ...workflowData
      }

      // Validate workflow structure
      this.validateWorkflow(workflow)

      // Save to database
      const { error } = await supabase
        .from('workflows')
        .insert([workflow])

      if (error) throw error

      // If workflow has scheduled triggers, set them up
      await this.setupScheduledTriggers(workflow)

      return workflow
    } catch (error) {
      console.error('Workflow creation failed:', error)
      throw error
    }
  }

  async executeWorkflow(workflowId: string, triggerData: Record<string, any> = {}): Promise<WorkflowExecution> {
    try {
      // Get workflow definition
      const { data: workflow, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .eq('status', 'active')
        .single()

      if (error || !workflow) {
        throw new Error('Workflow not found or not active')
      }

      // Create execution record
      const executionId = crypto.randomUUID()
      const execution: WorkflowExecution = {
        id: executionId,
        workflow_id: workflowId,
        tenant_id: workflow.tenant_id,
        status: 'pending',
        trigger_data: triggerData,
        execution_context: {
          variables: { ...workflow.variables },
          node_results: {},
          current_node_id: undefined
        },
        started_at: new Date().toISOString(),
        logs: []
      }

      // Save execution record
      const { error: execError } = await supabase
        .from('workflow_executions')
        .insert([execution])

      if (execError) throw execError

      // Add to execution queue
      this.executionQueue.set(executionId, execution)

      // Start execution
      this.processExecution(execution, workflow)

      return execution
    } catch (error) {
      console.error('Workflow execution failed:', error)
      throw error
    }
  }

  private async processExecution(execution: WorkflowExecution, workflow: Workflow): Promise<void> {
    try {
      execution.status = 'running'
      await this.updateExecution(execution)

      // Find trigger node
      const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger')
      if (triggerNodes.length === 0) {
        throw new Error('No trigger node found in workflow')
      }

      // Start with first trigger node
      const startNode = triggerNodes[0]
      await this.executeNode(startNode, execution, workflow)

      // Continue execution flow
      await this.followConnections(startNode, execution, workflow)

      // Mark as completed
      execution.status = 'completed'
      execution.completed_at = new Date().toISOString()
      execution.duration_ms = new Date().getTime() - new Date(execution.started_at).getTime()

      await this.updateExecution(execution)
      await this.updateWorkflowMetrics(workflow.id, true, execution.duration_ms!)

      this.executionQueue.delete(execution.id)
    } catch (error) {
      console.error('Execution processing failed:', error)
      
      execution.status = 'failed'
      execution.completed_at = new Date().toISOString()
      execution.execution_context.error_details = {
        node_id: execution.execution_context.current_node_id || 'unknown',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      }

      await this.updateExecution(execution)
      await this.updateWorkflowMetrics(workflow.id, false, 0)

      this.executionQueue.delete(execution.id)
    }
  }

  private async executeNode(node: WorkflowNode, execution: WorkflowExecution, workflow: Workflow): Promise<any> {
    execution.execution_context.current_node_id = node.id
    
    this.addExecutionLog(execution, 'info', `Executing node: ${node.name}`, node.id)

    let result: any = null

    switch (node.type) {
      case 'trigger':
        result = execution.trigger_data
        break

      case 'action':
        result = await this.executeAction(node, execution)
        break

      case 'condition':
        result = await this.evaluateCondition(node, execution)
        break

      case 'ai_processor':
        result = await this.executeAIProcessor(node, execution)
        break

      case 'integration':
        result = await this.executeIntegration(node, execution)
        break

      case 'delay':
        result = await this.executeDelay(node)
        break

      case 'loop':
        result = await this.executeLoop(node, execution, workflow)
        break

      case 'end':
        this.addExecutionLog(execution, 'info', 'Workflow completed', node.id)
        break

      default:
        throw new Error(`Unknown node type: ${node.type}`)
    }

    // Store node result
    execution.execution_context.node_results[node.id] = result

    // Update execution
    await this.updateExecution(execution)

    return result
  }

  private async executeAction(node: WorkflowNode, execution: WorkflowExecution): Promise<any> {
    const { action_type } = node.config

    switch (action_type) {
      case 'send_email':
        return await this.sendEmail(node.config, execution)

      case 'create_document':
        return await this.createDocument(node.config, execution)

      case 'api_request':
        return await this.makeAPIRequest(node.config, execution)

      case 'database_update':
        return await this.updateDatabase(node.config, execution)

      case 'notification':
        return await this.sendNotification(node.config, execution)

      default:
        throw new Error(`Unknown action type: ${action_type}`)
    }
  }

  private async evaluateCondition(node: WorkflowNode, execution: WorkflowExecution): Promise<boolean> {
    const conditions = node.config.condition || []
    
    const results = await Promise.all(conditions.map(async (condition) => {
      const fieldValue = this.getVariableValue(condition.field, execution)
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value
        case 'contains':
          return String(fieldValue).includes(String(condition.value))
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value)
        case 'less_than':
          return Number(fieldValue) < Number(condition.value)
        case 'regex':
          return new RegExp(condition.value).test(String(fieldValue))
        default:
          return false
      }
    }))

    // Apply logic (AND/OR)
    const logic = node.config.condition?.[0]?.logic || 'and'
    return logic === 'and' ? results.every(r => r) : results.some(r => r)
  }

  private async executeAIProcessor(node: WorkflowNode, execution: WorkflowExecution): Promise<any> {
    try {
      const model = node.config.ai_model || 'deepseek-reasoner-r1-0528'
      const prompt = this.interpolateVariables(node.config.ai_prompt || '', execution)

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deepseekApiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        ai_response: data.choices[0].message.content,
        model_used: model,
        tokens_used: data.usage?.total_tokens || 0
      }
    } catch (error) {
      console.error('AI processing failed:', error)
      throw error
    }
  }

  private async executeIntegration(node: WorkflowNode, execution: WorkflowExecution): Promise<any> {
    const { service, config } = node.config.integration || {}

    switch (service) {
      case 'slack':
        return await this.sendSlackMessage(config, execution)
      case 'teams':
        return await this.sendTeamsMessage(config, execution)
      case 'salesforce':
        return await this.salesforceAction(config, execution)
      case 'hubspot':
        return await this.hubspotAction(config, execution)
      case 'custom':
        return await this.customIntegration(config, execution)
      default:
        throw new Error(`Unknown integration service: ${service}`)
    }
  }

  private async executeDelay(node: WorkflowNode): Promise<void> {
    const duration = node.config.delay_duration || 1000
    await new Promise(resolve => setTimeout(resolve, duration))
  }

  private async executeLoop(node: WorkflowNode, execution: WorkflowExecution, workflow: Workflow): Promise<any> {
    const { type, data_source, condition, max_iterations = 100 } = node.config.loop_config || {}
    const results: any[] = []

    switch (type) {
      case 'for_each':
        const data = this.getVariableValue(data_source!, execution)
        if (!Array.isArray(data)) {
          throw new Error('For each loop requires array data source')
        }

        for (let i = 0; i < data.length && i < max_iterations; i++) {
          execution.execution_context.variables['loop_item'] = data[i]
          execution.execution_context.variables['loop_index'] = i
          
          // Execute connected nodes for each item
          const loopResults = await this.executeLoopIteration(node, execution, workflow)
          results.push(loopResults)
        }
        break

      case 'while':
        let iterations = 0
        while (iterations < max_iterations) {
          const conditionResult = await this.evaluateLoopCondition(condition!, execution)
          if (!conditionResult) break

          const loopResults = await this.executeLoopIteration(node, execution, workflow)
          results.push(loopResults)
          iterations++
        }
        break

      case 'repeat':
        const repeatCount = Math.min(max_iterations, 10)
        for (let i = 0; i < repeatCount; i++) {
          execution.execution_context.variables['repeat_index'] = i
          const loopResults = await this.executeLoopIteration(node, execution, workflow)
          results.push(loopResults)
        }
        break
    }

    return { loop_results: results, iterations: results.length }
  }

  private async followConnections(currentNode: WorkflowNode, execution: WorkflowExecution, workflow: Workflow): Promise<void> {
    for (const connection of currentNode.connections) {
      // Check connection condition if present
      if (connection.condition) {
        const conditionMet = await this.evaluateConnectionCondition(connection.condition, execution)
        if (!conditionMet) continue
      }

      // Find target node
      const targetNode = workflow.nodes.find(node => node.id === connection.target_node_id)
      if (!targetNode) {
        console.warn(`Target node ${connection.target_node_id} not found`)
        continue
      }

      // Execute target node
      await this.executeNode(targetNode, execution, workflow)

      // Continue following connections if not an end node
      if (targetNode.type !== 'end') {
        await this.followConnections(targetNode, execution, workflow)
      }
    }
  }

  private async sendEmail(config: any, execution: WorkflowExecution): Promise<any> {
    // Email service integration would go here
    this.addExecutionLog(execution, 'info', `Email sent to ${config.recipient}`)
    return { email_sent: true, recipient: config.recipient }
  }

  private async createDocument(config: any, execution: WorkflowExecution): Promise<any> {
    // Document creation logic would go here
    this.addExecutionLog(execution, 'info', `Document created: ${config.template}`)
    return { document_created: true, template: config.template }
  }

  private async makeAPIRequest(config: any, execution: WorkflowExecution): Promise<any> {
    try {
      const url = this.interpolateVariables(config.url, execution)
      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: config.headers || {},
        body: config.body ? JSON.stringify(this.interpolateVariables(config.body, execution)) : undefined
      })

      const data = await response.json()
      return { api_response: data, status: response.status }
    } catch (error) {
      throw new Error(`API request failed: ${error}`)
    }
  }

  private async updateDatabase(config: any, execution: WorkflowExecution): Promise<any> {
    // Database update logic would go here
    this.addExecutionLog(execution, 'info', `Database updated: ${config.table}`)
    return { database_updated: true, table: config.table }
  }

  private async sendNotification(config: any, execution: WorkflowExecution): Promise<any> {
    // Notification service integration would go here
    this.addExecutionLog(execution, 'info', `Notification sent: ${config.message}`)
    return { notification_sent: true, message: config.message }
  }

  private async sendSlackMessage(config: any, execution: WorkflowExecution): Promise<any> {
    // Slack API integration would go here
    this.addExecutionLog(execution, 'info', `Slack message sent to ${config.channel}`)
    return { slack_message_sent: true, channel: config.channel }
  }

  private async sendTeamsMessage(config: any, execution: WorkflowExecution): Promise<any> {
    // Teams API integration would go here
    this.addExecutionLog(execution, 'info', `Teams message sent`)
    return { teams_message_sent: true }
  }

  private async salesforceAction(config: any, execution: WorkflowExecution): Promise<any> {
    // Salesforce API integration would go here
    this.addExecutionLog(execution, 'info', `Salesforce action executed`)
    return { salesforce_action: true }
  }

  private async hubspotAction(config: any, execution: WorkflowExecution): Promise<any> {
    // HubSpot API integration would go here
    this.addExecutionLog(execution, 'info', `HubSpot action executed`)
    return { hubspot_action: true }
  }

  private async customIntegration(config: any, execution: WorkflowExecution): Promise<any> {
    // Custom integration logic would go here
    this.addExecutionLog(execution, 'info', `Custom integration executed`)
    return { custom_integration: true }
  }

  private getVariableValue(path: string, execution: WorkflowExecution): any {
    const parts = path.split('.')
    let value: any = {
      ...execution.execution_context.variables,
      ...execution.trigger_data,
      ...execution.execution_context.node_results
    }

    for (const part of parts) {
      value = value?.[part]
    }

    return value
  }

  private interpolateVariables(template: string, execution: WorkflowExecution): any {
    let result = template

    // Replace {{variable}} patterns
    const variablePattern = /\{\{([^}]+)\}\}/g
    result = result.replace(variablePattern, (match, variablePath) => {
      const value = this.getVariableValue(variablePath.trim(), execution)
      return value !== undefined ? String(value) : match
    })

    return result
  }

  private async evaluateConnectionCondition(condition: string, execution: WorkflowExecution): Promise<boolean> {
    // Simple condition evaluation
    // In production, would use a proper expression parser
    try {
      const interpolated = this.interpolateVariables(condition, execution)
      return Boolean(interpolated)
    } catch {
      return false
    }
  }

  private async evaluateLoopCondition(condition: string, execution: WorkflowExecution): Promise<boolean> {
    return this.evaluateConnectionCondition(condition, execution)
  }

  private async executeLoopIteration(node: WorkflowNode, execution: WorkflowExecution, workflow: Workflow): Promise<any> {
    // Execute connected nodes within loop
    // This is a simplified version
    return { iteration_completed: true }
  }

  private addExecutionLog(execution: WorkflowExecution, level: 'info' | 'warn' | 'error' | 'debug', message: string, nodeId?: string): void {
    execution.logs.push({
      timestamp: new Date().toISOString(),
      level,
      node_id: nodeId,
      message,
      data: {}
    })
  }

  private async updateExecution(execution: WorkflowExecution): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_executions')
        .update({
          status: execution.status,
          execution_context: execution.execution_context,
          completed_at: execution.completed_at,
          duration_ms: execution.duration_ms,
          logs: execution.logs
        })
        .eq('id', execution.id)

      if (error) throw error
    } catch (error) {
      console.error('Execution update failed:', error)
    }
  }

  private async updateWorkflowMetrics(workflowId: string, success: boolean, duration: number): Promise<void> {
    try {
      const { data: workflow } = await supabase
        .from('workflows')
        .select('metrics')
        .eq('id', workflowId)
        .single()

      if (!workflow) return

      const metrics = workflow.metrics
      metrics.total_executions++
      
      if (success) {
        metrics.successful_executions++
      } else {
        metrics.failed_executions++
      }

      metrics.error_rate = metrics.failed_executions / metrics.total_executions
      metrics.average_duration_ms = ((metrics.average_duration_ms * (metrics.total_executions - 1)) + duration) / metrics.total_executions
      metrics.last_execution = new Date().toISOString()

      await supabase
        .from('workflows')
        .update({ metrics })
        .eq('id', workflowId)
    } catch (error) {
      console.error('Metrics update failed:', error)
    }
  }

  private validateWorkflow(workflow: Workflow): void {
    // Basic workflow validation
    if (!workflow.nodes || workflow.nodes.length === 0) {
      throw new Error('Workflow must have at least one node')
    }

    const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger')
    if (triggerNodes.length === 0) {
      throw new Error('Workflow must have at least one trigger node')
    }

    // Validate node connections
    for (const node of workflow.nodes) {
      for (const connection of node.connections) {
        const targetExists = workflow.nodes.some(n => n.id === connection.target_node_id)
        if (!targetExists) {
          throw new Error(`Invalid connection: target node ${connection.target_node_id} not found`)
        }
      }
    }
  }

  private async setupScheduledTriggers(workflow: Workflow): Promise<void> {
    const scheduledNodes = workflow.nodes.filter(
      node => node.type === 'trigger' && node.config.trigger_type === 'schedule'
    )

    for (const node of scheduledNodes) {
      if (node.config.schedule) {
        // In production, would use a proper cron scheduler
        console.log(`Setting up scheduled trigger for workflow ${workflow.id}`)
      }
    }
  }

  private initializeScheduler(): void {
    // Initialize the workflow scheduler
    // In production, would integrate with a job queue system
    console.log('Workflow scheduler initialized')
  }

  // Public API methods
  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data as Workflow || null
    } catch (error) {
      console.error('Workflow fetch failed:', error)
      return null
    }
  }

  async listWorkflows(tenantId: string, filters?: { status?: string; category?: string }): Promise<Workflow[]> {
    try {
      let query = supabase
        .from('workflows')
        .select('*')
        .eq('tenant_id', tenantId)

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Workflow[]
    } catch (error) {
      console.error('Workflow list fetch failed:', error)
      return []
    }
  }

  async getWorkflowExecutions(workflowId: string, limit = 50): Promise<WorkflowExecution[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('started_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as WorkflowExecution[]
    } catch (error) {
      console.error('Execution history fetch failed:', error)
      return []
    }
  }

  async getWorkflowTemplates(category?: string): Promise<WorkflowTemplate[]> {
    try {
      let query = supabase
        .from('workflow_templates')
        .select('*')
        .order('rating', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error
      return data as WorkflowTemplate[]
    } catch (error) {
      console.error('Template fetch failed:', error)
      return []
    }
  }
}

export default WorkflowEngine