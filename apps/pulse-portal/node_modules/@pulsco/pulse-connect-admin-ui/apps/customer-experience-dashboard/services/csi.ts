// Customer Experience Dashboard CSI Service
// Handles customer experience metrics fetching and intelligence processing for Customer Experience role

import { CSIClient, CSIMetricsRequest, CSIMetricsResponse } from '@pulsco/csi-client'
import { AdminRoleType } from '@pulsco/admin-shared-types'

export interface CustomerExperienceMetrics {
  customerSatisfaction: number
  supportResponseTime: number
  resolutionRate: number
  netPromoterScore: number
  customerEffortScore: number
  churnRate: number
  retentionRate: number
  firstContactResolution: number
  customerLifetimeValue: number
  repeatPurchaseRate: number
}

export interface CustomerExperienceAnomaly {
  metric: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  timestamp: Date
  customerImpact: string
}

export interface CustomerExperienceIntelligence {
  type: 'anomaly' | 'trend' | 'correlation' | 'prediction'
  data: any
  confidence: number
  timestamp: Date
  recommendations?: string[]
}

export class CustomerExperienceCSIService {
  private csiClient: CSIClient
  private role: AdminRoleType = 'customer-experience'

  constructor(csiClient: CSIClient) {
    this.csiClient = csiClient
  }

  /**
   * Fetch customer experience metrics for Customer Experience dashboard
   */
  async fetchCustomerExperienceMetrics(timeRange?: { start: Date; end: Date }): Promise<CustomerExperienceMetrics> {
    const request: CSIMetricsRequest = {
      adminRole: this.role,
      metricKeys: [
        'customer_satisfaction',
        'support_response_time',
        'resolution_rate',
        'net_promoter_score',
        'customer_effort_score',
        'churn_rate',
        'retention_rate',
        'first_contact_resolution',
        'customer_lifetime_value',
        'repeat_purchase_rate'
      ],
      timeRange
    }

    const response: CSIMetricsResponse = await this.csiClient.fetchMetrics(request)

    return {
      customerSatisfaction: response.metrics.customer_satisfaction || 0,
      supportResponseTime: response.metrics.support_response_time || 0,
      resolutionRate: response.metrics.resolution_rate || 0,
      netPromoterScore: response.metrics.net_promoter_score || 0,
      customerEffortScore: response.metrics.customer_effort_score || 0,
      churnRate: response.metrics.churn_rate || 0,
      retentionRate: response.metrics.retention_rate || 0,
      firstContactResolution: response.metrics.first_contact_resolution || 0,
      customerLifetimeValue: response.metrics.customer_lifetime_value || 0,
      repeatPurchaseRate: response.metrics.repeat_purchase_rate || 0
    }
  }

  /**
   * Get customer experience anomalies and alerts
   */
  async getCustomerExperienceAnomalies(): Promise<CustomerExperienceAnomaly[]> {
    const anomalies = await this.csiClient.getAnomalies()

    return anomalies.map(anomaly => ({
      metric: anomaly.metric,
      severity: anomaly.severity,
      description: anomaly.description,
      confidence: anomaly.confidence,
      timestamp: anomaly.timestamp,
      customerImpact: this.calculateCustomerImpact(anomaly.metric, anomaly.severity)
    }))
  }

  /**
   * Get customer experience intelligence and insights
   */
  async getCustomerExperienceIntelligence(): Promise<CustomerExperienceIntelligence[]> {
    const intelligence = await this.csiClient.getIntelligenceStream()

    return intelligence.map(item => ({
      type: item.type,
      data: item.data,
      confidence: item.confidence,
      timestamp: item.timestamp,
      recommendations: this.generateCustomerRecommendations(item.type, item.data)
    }))
  }

  /**
   * Calculate customer impact of experience anomalies
   */
  private calculateCustomerImpact(metric: string, severity: string): string {
    const impactMap: Record<string, Record<string, string>> = {
      'customer_satisfaction': {
        'high': 'High satisfaction decline may indicate service quality issues',
        'critical': 'Critical satisfaction drop risks customer retention and brand reputation'
      },
      'support_response_time': {
        'high': 'High response times affecting customer experience',
        'critical': 'Critical response delays risking customer abandonment'
      },
      'churn_rate': {
        'high': 'High churn rate impacting revenue and growth',
        'critical': 'Critical churn rate threatening business sustainability'
      },
      'net_promoter_score': {
        'high': 'NPS decline may signal competitive threats',
        'critical': 'Critical NPS drop risks referral and growth slowdown'
      }
    }

    return impactMap[metric]?.[severity] || 'Customer impact assessment required'
  }

  /**
   * Generate customer experience recommendations based on intelligence
   */
  private generateCustomerRecommendations(type: string, data: any): string[] {
    const recommendations: Record<string, (data: any) => string[]> = {
      'anomaly': (data) => [
        'Review customer feedback and pain points',
        'Analyze support ticket patterns and resolutions',
        'Optimize response time processes',
        'Enhance customer communication channels',
        'Strengthen customer success initiatives'
      ],
      'trend': (data) => [
        'Scale successful customer experience programs',
        'Optimize customer journey touchpoints',
        'Enhance retention and loyalty programs',
        'Improve support team training and processes',
        'Strengthen customer feedback collection'
      ],
      'correlation': (data) => [
        'Investigate correlated customer behavior patterns',
        'Analyze support interaction effectiveness',
        'Review customer satisfaction drivers',
        'Optimize customer effort and experience',
        'Strengthen customer retention strategies'
      ],
      'prediction': (data) => [
        'Prepare for predicted customer behavior changes',
        'Develop proactive customer retention strategies',
        'Plan customer experience improvements',
        'Optimize support capacity planning',
        'Strengthen customer loyalty programs'
      ]
    }

    return recommendations[type]?.(data) || ['Monitor closely and review customer experience strategies']
  }

  /**
   * Get customer experience health score
   */
  async getCustomerExperienceHealthScore(): Promise<number> {
    const metrics = await this.fetchCustomerExperienceMetrics()
    const weights = {
      customerSatisfaction: 0.2,
      supportResponseTime: 0.15,
      resolutionRate: 0.15,
      netPromoterScore: 0.15,
      customerEffortScore: 0.1,
      churnRate: 0.1,
      retentionRate: 0.1,
      firstContactResolution: 0.05
    }

    // Normalize metrics to 0-100 scale
    const normalized = {
      customerSatisfaction: metrics.customerSatisfaction, // Direct percentage
      supportResponseTime: Math.max(0, 100 - (metrics.supportResponseTime / 60)), // Lower response time = higher health (minutes)
      resolutionRate: metrics.resolutionRate, // Direct percentage
      netPromoterScore: Math.min((metrics.netPromoterScore + 100) / 2, 100), // NPS scale -100 to 100
      customerEffortScore: Math.max(0, 100 - metrics.customerEffortScore), // Lower effort = higher health
      churnRate: Math.max(0, 100 - metrics.churnRate * 100), // Lower churn = higher health
      retentionRate: metrics.retentionRate, // Direct percentage
      firstContactResolution: metrics.firstContactResolution // Direct percentage
    }

    const score = (
      normalized.customerSatisfaction * weights.customerSatisfaction +
      normalized.supportResponseTime * weights.supportResponseTime +
      normalized.resolutionRate * weights.resolutionRate +
      normalized.netPromoterScore * weights.netPromoterScore +
      normalized.customerEffortScore * weights.customerEffortScore +
      normalized.churnRate * weights.churnRate +
      normalized.retentionRate * weights.retentionRate +
      normalized.firstContactResolution * weights.firstContactResolution
    )

    return Math.round(Math.max(0, Math.min(100, score)))
  }

  /**
   * Validate customer experience metrics access for Customer Experience role
   */
  static validateCustomerExperienceMetricsAccess(metricKey: string): boolean {
    const allowedMetrics = [
      'customer_satisfaction',
      'support_response_time',
      'resolution_rate',
      'net_promoter_score',
      'customer_effort_score',
      'churn_rate',
      'retention_rate',
      'first_contact_resolution',
      'customer_lifetime_value',
      'repeat_purchase_rate'
    ]

    return allowedMetrics.includes(metricKey)
  }
}

export default CustomerExperienceCSIService
