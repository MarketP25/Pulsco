// COO Dashboard CSI Service
// Handles operational metrics fetching and intelligence processing for COO role

import { CSIClient, CSIMetricsRequest, CSIMetricsResponse } from '@pulsco/csi-client'
import { AdminRoleType } from '@pulsco/admin-shared-types'

export interface COOMetrics {
  cpuUtilization: number
  memoryUsage: number
  diskUsage: number
  networkThroughput: number
  activeConnections: number
  responseTime: number
  errorRate: number
  uptime: number
  infrastructureHealth: number
  serviceAvailability: number
}

export interface COOAnomaly {
  metric: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  timestamp: Date
  impact: string
}

export interface COOIntelligence {
  type: 'anomaly' | 'trend' | 'correlation' | 'prediction'
  data: any
  confidence: number
  timestamp: Date
  recommendations?: string[]
}

export class COOCSIService {
  private csiClient: CSIClient
  private role: AdminRoleType = 'coo'

  constructor(csiClient: CSIClient) {
    this.csiClient = csiClient
  }

  /**
   * Fetch operational metrics for COO dashboard
   */
  async fetchOperationalMetrics(timeRange?: { start: Date; end: Date }): Promise<COOMetrics> {
    const request: CSIMetricsRequest = {
      adminRole: this.role,
      metricKeys: [
        'cpu_utilization',
        'memory_usage',
        'disk_usage',
        'network_throughput',
        'active_connections',
        'response_time',
        'error_rate',
        'uptime',
        'infrastructure_health',
        'service_availability'
      ],
      timeRange
    }

    const response: CSIMetricsResponse = await this.csiClient.fetchMetrics(request)

    return {
      cpuUtilization: response.metrics.cpu_utilization || 0,
      memoryUsage: response.metrics.memory_usage || 0,
      diskUsage: response.metrics.disk_usage || 0,
      networkThroughput: response.metrics.network_throughput || 0,
      activeConnections: response.metrics.active_connections || 0,
      responseTime: response.metrics.response_time || 0,
      errorRate: response.metrics.error_rate || 0,
      uptime: response.metrics.uptime || 0,
      infrastructureHealth: response.metrics.infrastructure_health || 0,
      serviceAvailability: response.metrics.service_availability || 0
    }
  }

  /**
   * Get operational anomalies and alerts
   */
  async getOperationalAnomalies(): Promise<COOAnomaly[]> {
    const anomalies = await this.csiClient.getAnomalies()

    return anomalies.map(anomaly => ({
      metric: anomaly.metric,
      severity: anomaly.severity,
      description: anomaly.description,
      confidence: anomaly.confidence,
      timestamp: anomaly.timestamp,
      impact: this.calculateImpact(anomaly.metric, anomaly.severity)
    }))
  }

  /**
   * Get operational intelligence and insights
   */
  async getOperationalIntelligence(): Promise<COOIntelligence[]> {
    const intelligence = await this.csiClient.getIntelligenceStream()

    return intelligence.map(item => ({
      type: item.type,
      data: item.data,
      confidence: item.confidence,
      timestamp: item.timestamp,
      recommendations: this.generateRecommendations(item.type, item.data)
    }))
  }

  /**
   * Calculate business impact of operational anomalies
   */
  private calculateImpact(metric: string, severity: string): string {
    const impactMap: Record<string, Record<string, string>> = {
      'cpu_utilization': {
        'high': 'High CPU usage may cause service degradation',
        'critical': 'Critical CPU usage risks system failure'
      },
      'memory_usage': {
        'high': 'High memory usage may cause performance issues',
        'critical': 'Critical memory usage risks out-of-memory errors'
      },
      'error_rate': {
        'high': 'High error rate affecting user experience',
        'critical': 'Critical error rate requiring immediate attention'
      }
    }

    return impactMap[metric]?.[severity] || 'Operational impact assessment required'
  }

  /**
   * Generate operational recommendations based on intelligence
   */
  private generateRecommendations(type: string, data: any): string[] {
    const recommendations: Record<string, (data: any) => string[]> = {
      'anomaly': (data) => [
        'Review system logs for root cause analysis',
        'Consider scaling resources if utilization is consistently high',
        'Implement monitoring alerts for similar patterns'
      ],
      'trend': (data) => [
        'Plan capacity upgrades based on growth trends',
        'Optimize resource allocation for peak usage periods',
        'Review performance baselines and thresholds'
      ],
      'correlation': (data) => [
        'Investigate correlated system behaviors',
        'Review dependency chains for cascading failures',
        'Implement circuit breakers for critical paths'
      ],
      'prediction': (data) => [
        'Prepare contingency plans for predicted scenarios',
        'Schedule maintenance during predicted low-usage periods',
        'Review disaster recovery procedures'
      ]
    }

    return recommendations[type]?.(data) || ['Monitor closely and review operational procedures']
  }

  /**
   * Get infrastructure health score
   */
  async getInfrastructureHealthScore(): Promise<number> {
    const metrics = await this.fetchOperationalMetrics()
    const weights = {
      cpuUtilization: 0.2,
      memoryUsage: 0.2,
      diskUsage: 0.15,
      networkThroughput: 0.15,
      activeConnections: 0.1,
      responseTime: 0.1,
      errorRate: 0.05,
      uptime: 0.05
    }

    const score = (
      (metrics.cpuUtilization <= 80 ? 100 : 100 - (metrics.cpuUtilization - 80) * 2) * weights.cpuUtilization +
      (metrics.memoryUsage <= 85 ? 100 : 100 - (metrics.memoryUsage - 85) * 2) * weights.memoryUsage +
      (metrics.diskUsage <= 90 ? 100 : 100 - (metrics.diskUsage - 90)) * weights.diskUsage +
      (metrics.networkThroughput >= 100 ? 100 : metrics.networkThroughput) * weights.networkThroughput +
      (metrics.activeConnections <= 1000 ? 100 : Math.max(0, 100 - (metrics.activeConnections - 1000) / 10)) * weights.activeConnections +
      (metrics.responseTime <= 200 ? 100 : Math.max(0, 100 - (metrics.responseTime - 200) / 10)) * weights.responseTime +
      (metrics.errorRate <= 1 ? 100 : Math.max(0, 100 - metrics.errorRate * 10)) * weights.errorRate +
      metrics.uptime * weights.uptime
    )

    return Math.round(Math.max(0, Math.min(100, score)))
  }

  /**
   * Validate operational metrics access for COO role
   */
  static validateCOOMetricsAccess(metricKey: string): boolean {
    const allowedMetrics = [
      'cpu_utilization',
      'memory_usage',
      'disk_usage',
      'network_throughput',
      'active_connections',
      'response_time',
      'error_rate',
      'uptime',
      'infrastructure_health',
      'service_availability'
    ]

    return allowedMetrics.includes(metricKey)
  }
}

export default COOCSIService
