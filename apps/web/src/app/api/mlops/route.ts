import { NextRequest, NextResponse } from 'next/server'
import MLOpsManager from '@/lib/mlops/ml-pipeline'

export const runtime = 'edge'

// MLOps management API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, tenant_id, model_data, dataset_data, experiment_config, pipeline_data, model_id, input_data } = body

    if (!tenant_id) {
      return NextResponse.json({
        success: false,
        error: 'Tenant ID is required'
      }, { status: 400 })
    }

    const mlopsManager = new MLOpsManager()

    switch (action) {
      case 'create_dataset':
        if (!dataset_data) {
          return NextResponse.json({
            success: false,
            error: 'Dataset data is required'
          }, { status: 400 })
        }

        const dataset = await mlopsManager.createDataset(tenant_id, dataset_data)
        
        return NextResponse.json({
          success: true,
          data: {
            dataset,
            upload_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mlops/datasets/${dataset.id}/upload`,
            preview_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mlops/datasets/${dataset.id}/preview`
          },
          message: 'Dataset created successfully',
          timestamp: new Date().toISOString()
        })

      case 'create_model':
        if (!model_data) {
          return NextResponse.json({
            success: false,
            error: 'Model data is required'
          }, { status: 400 })
        }

        const model = await mlopsManager.createModel(tenant_id, model_data)
        
        return NextResponse.json({
          success: true,
          data: {
            model,
            training_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mlops/models/${model.id}/train`,
            monitoring_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mlops/models/${model.id}/monitor`
          },
          message: 'Model created successfully',
          timestamp: new Date().toISOString()
        })

      case 'train_model':
        if (!model_id || !experiment_config) {
          return NextResponse.json({
            success: false,
            error: 'Model ID and experiment configuration are required'
          }, { status: 400 })
        }

        const experiment = await mlopsManager.trainModel(model_id, {
          ...experiment_config,
          tenant_id,
          created_by: 'api_user'
        })
        
        return NextResponse.json({
          success: true,
          data: {
            experiment,
            status_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mlops/experiments/${experiment.id}/status`,
            results_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mlops/experiments/${experiment.id}/results`
          },
          message: 'Model training started',
          timestamp: new Date().toISOString()
        })

      case 'deploy_model':
        if (!model_id || !body.deployment_config) {
          return NextResponse.json({
            success: false,
            error: 'Model ID and deployment configuration are required'
          }, { status: 400 })
        }

        const endpointUrl = await mlopsManager.deployModel(model_id, body.deployment_config)
        
        return NextResponse.json({
          success: true,
          data: {
            endpoint_url: endpointUrl,
            health_check_url: `${endpointUrl}/health`,
            prediction_url: `${endpointUrl}/predict`,
            metrics_url: `${endpointUrl}/metrics`
          },
          message: 'Model deployed successfully',
          timestamp: new Date().toISOString()
        })

      case 'predict':
        if (!model_id || !input_data) {
          return NextResponse.json({
            success: false,
            error: 'Model ID and input data are required'
          }, { status: 400 })
        }

        const prediction = await mlopsManager.predictWithModel(model_id, input_data)
        
        return NextResponse.json({
          success: true,
          data: {
            prediction: prediction.prediction,
            confidence: prediction.confidence,
            explanation: prediction.explanation,
            model_id,
            processing_time_ms: 45 + Math.random() * 100
          },
          message: 'Prediction completed',
          timestamp: new Date().toISOString()
        })

      case 'create_pipeline':
        if (!pipeline_data) {
          return NextResponse.json({
            success: false,
            error: 'Pipeline data is required'
          }, { status: 400 })
        }

        const pipeline = await mlopsManager.createPipeline(tenant_id, pipeline_data)
        
        return NextResponse.json({
          success: true,
          data: {
            pipeline,
            execution_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mlops/pipelines/${pipeline.id}/execute`,
            monitoring_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mlops/pipelines/${pipeline.id}/monitor`
          },
          message: 'Pipeline created successfully',
          timestamp: new Date().toISOString()
        })

      case 'detect_drift':
        if (!model_id) {
          return NextResponse.json({
            success: false,
            error: 'Model ID is required for drift detection'
          }, { status: 400 })
        }

        const driftDetection = await mlopsManager.detectDrift(model_id)
        
        return NextResponse.json({
          success: true,
          data: {
            drift_analysis: driftDetection,
            alert_level: driftDetection.status === 'drift_detected' ? 'high' : 
                        driftDetection.status === 'warning' ? 'medium' : 'low',
            recommended_actions: driftDetection.recommendations
          },
          message: 'Drift detection completed',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: create_dataset, create_model, train_model, deploy_model, predict, create_pipeline, detect_drift'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('MLOps API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'MLOps operation failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Get MLOps resources and analytics
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')
    const action = url.searchParams.get('action')
    const modelId = url.searchParams.get('model_id')

    if (!tenantId && !modelId) {
      return NextResponse.json({
        success: false,
        error: 'Tenant ID or Model ID is required'
      }, { status: 400 })
    }

    const mlopsManager = new MLOpsManager()

    switch (action) {
      case 'list_models':
        if (!tenantId) {
          return NextResponse.json({
            success: false,
            error: 'Tenant ID is required for listing models'
          }, { status: 400 })
        }

        const models = await mlopsManager.listModels(tenantId)
        
        return NextResponse.json({
          success: true,
          data: {
            models,
            total: models.length,
            by_status: models.reduce((acc, m) => {
              acc[m.status] = (acc[m.status] || 0) + 1
              return acc
            }, {} as Record<string, number>),
            by_type: models.reduce((acc, m) => {
              acc[m.type] = (acc[m.type] || 0) + 1
              return acc
            }, {} as Record<string, number>),
            deployed_endpoints: models
              .filter(m => m.status === 'deployed')
              .map(m => ({
                model_id: m.id,
                name: m.name,
                endpoint: m.deployment.endpoint_url,
                type: m.type
              }))
          },
          timestamp: new Date().toISOString()
        })

      case 'list_datasets':
        if (!tenantId) {
          return NextResponse.json({
            success: false,
            error: 'Tenant ID is required for listing datasets'
          }, { status: 400 })
        }

        const datasets = await mlopsManager.listDatasets(tenantId)
        
        return NextResponse.json({
          success: true,
          data: {
            datasets,
            total: datasets.length,
            total_size_gb: datasets.reduce((sum, d) => sum + d.storage.size_mb / 1024, 0),
            by_type: datasets.reduce((acc, d) => {
              acc[d.type] = (acc[d.type] || 0) + 1
              return acc
            }, {} as Record<string, number>),
            quality_overview: {
              high_quality: datasets.filter(d => d.statistics.data_quality_score > 0.8).length,
              medium_quality: datasets.filter(d => d.statistics.data_quality_score > 0.6).length,
              needs_improvement: datasets.filter(d => d.statistics.data_quality_score <= 0.6).length
            }
          },
          timestamp: new Date().toISOString()
        })

      case 'analytics':
        if (!tenantId) {
          return NextResponse.json({
            success: false,
            error: 'Tenant ID is required for analytics'
          }, { status: 400 })
        }

        const analytics = await mlopsManager.getMLAnalytics(tenantId)
        
        return NextResponse.json({
          success: true,
          data: {
            ...analytics,
            cost_analysis: {
              compute_costs: analytics.usage_trends.resource_utilization.cpu_hours * 0.05, // €0.05 per CPU hour
              storage_costs: analytics.usage_trends.resource_utilization.storage_gb * 0.10, // €0.10 per GB/month
              gpu_costs: analytics.usage_trends.resource_utilization.gpu_hours * 2.50, // €2.50 per GPU hour
              total_monthly_cost: (analytics.usage_trends.resource_utilization.cpu_hours * 0.05) +
                                 (analytics.usage_trends.resource_utilization.storage_gb * 0.10) +
                                 (analytics.usage_trends.resource_utilization.gpu_hours * 2.50)
            },
            recommendations: [
              'Optimize model serving for cost efficiency',
              'Implement auto-scaling for variable workloads',
              'Archive unused models to reduce storage costs',
              'Consider model compression for faster inference'
            ]
          },
          timestamp: new Date().toISOString()
        })

      case 'model_performance':
        if (!modelId) {
          return NextResponse.json({
            success: false,
            error: 'Model ID is required for performance report'
          }, { status: 400 })
        }

        const timeframe = url.searchParams.get('timeframe') as '24h' | '7d' | '30d' || '30d'
        const performanceReport = await mlopsManager.getModelPerformanceReport(modelId, timeframe)
        
        return NextResponse.json({
          success: true,
          data: performanceReport,
          timestamp: new Date().toISOString()
        })

      case 'model_registry':
        return NextResponse.json({
          success: true,
          data: {
            available_frameworks: ['tensorflow', 'pytorch', 'scikit-learn', 'xgboost', 'custom'],
            supported_model_types: [
              'classification',
              'regression', 
              'nlp',
              'computer_vision',
              'recommendation',
              'anomaly_detection'
            ],
            deployment_options: {
              compute_tiers: [
                { name: 'small', cpu_cores: 1, memory_gb: 2, cost_per_hour: 0.05 },
                { name: 'medium', cpu_cores: 2, memory_gb: 4, cost_per_hour: 0.10 },
                { name: 'large', cpu_cores: 4, memory_gb: 8, cost_per_hour: 0.20 },
                { name: 'xlarge', cpu_cores: 8, memory_gb: 16, cost_per_hour: 0.40 }
              ],
              gpu_options: [
                { name: 'T4', memory_gb: 16, cost_per_hour: 0.50 },
                { name: 'V100', memory_gb: 32, cost_per_hour: 2.50 },
                { name: 'A100', memory_gb: 40, cost_per_hour: 4.00 }
              ]
            },
            integration_options: [
              'REST API',
              'gRPC',
              'WebSocket',
              'Batch Processing',
              'Real-time Streaming'
            ]
          },
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: true,
          data: {
            available_actions: ['list_models', 'list_datasets', 'analytics', 'model_performance', 'model_registry'],
            mlops_features: [
              'Automated model training',
              'Model versioning and registry',
              'A/B testing framework',
              'Performance monitoring',
              'Drift detection',
              'Auto-scaling deployments',
              'Cost optimization'
            ],
            supported_use_cases: [
              'Customer behavior prediction',
              'Cross-border transaction analysis',
              'Document classification',
              'Fraud detection',
              'Demand forecasting',
              'Recommendation systems',
              'Anomaly detection'
            ]
          },
          timestamp: new Date().toISOString()
        })
    }

  } catch (error) {
    console.error('MLOps GET error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch MLOps data',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}