// Business Operations Dashboard CSI Service
// Handles business metrics fetching and intelligence processing for Business Ops role

import { CSIClient, CSIMetricsRequest, CSIMetricsResponse } from '@pulsco/csi-client'
import { AdminRoleType } from '@pulsco/admin-shared-types'

export interface BusinessOpsMetrics {
  dailyRevenue: number
  activeUsers: number
  transactionVolume: number
  conversionRate: number
  churnRate: number
  customerAcquisitionCost: number
  lifetimeValue: number
  monthlyRecurringRevenue: number
  grossMerchandiseValue: number
  netPromoterScore: number
}

export interface BusinessOpsAnomaly {
  metric: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  timestamp: Date
  businessImpact: string
}

export interface BusinessOpsIntelligence {
  type: 'anomaly' | 'trend' | 'correlation' | 'prediction'
  data: any
  confidence: number
  timestamp: Date
  recommendations?: string[]
}

export class BusinessOpsCSIService {
  private csiClient: CSIClient
  private role: AdminRoleType = 'business-ops'

  constructor(csiClient: CSIClient) {
    this.csiClient = csiClient
  }

  /**
   * Fetch business metrics for Business Ops dashboard
   */
  async fetchBusinessMetrics(timeRange?: { start: Date; end: Date }): Promise<BusinessOpsMetrics> {
    const request: CSIMetricsRequest = {
      adminRole: this.role,
      metricKeys: [
        'daily_revenue',
        'active_users',
        'transaction_volume',
        'conversion_rate',
        'churn_rate',
        'customer_acquisition_cost',
        'lifetime_value',
        'monthly_recurring_revenue',
        'gross_merchandise_value',
        'net_promoter_score'
      ],
      timeRange
    }

    const response: CSIMetricsResponse = await this.csiClient.fetchMetrics(request)

    return {
      dailyRevenue: response.metrics.daily_revenue || 0,
      activeUsers: response.metrics.active_users || 0,
      transactionVolume: response.metrics.transaction_volume || 0,
      conversionRate: response.metrics.conversion_rate || 0,
      churnRate: response.metrics.churn_rate || 0,
      customerAcquisitionCost: response.metrics.customer_acquisition_cost || 0,
      lifetimeValue: response.metrics.lifetime_value || 0,
      monthlyRecurringRevenue: response.metrics.monthly_recurring_revenue || 0,
      grossMerchandiseValue: response.metrics.gross_merchandise_value || 0,
      netPromoterScore: response.metrics.net_promoter_score || 0
    }
  }

  /**
   * Get business anomalies and alerts
   */
  async getBusinessAnomalies(): Promise<BusinessOpsAnomaly[]> {
    const anomalies = await this.csiClient.getAnomalies()

    return anomalies.map(anomaly => ({
      metric: anomaly.metric,
      severity: anomaly.severity,
      description: anomaly.description,
      confidence: anomaly.confidence,
      timestamp: anomaly.timestamp,
      businessImpact: this.calculateBusinessImpact(anomaly.metric, anomaly.severity)
    }))
  }

  /**
   * Get business intelligence and insights
   */
  async getBusinessIntelligence(): Promise<BusinessOpsIntelligence[]> {
    const intelligence = await this.csiClient.getIntelligenceStream()

    return intelligence.map(item => ({
      type: item.type,
      data: item.data,
      confidence: item.confidence,
      timestamp: item.timestamp,
      recommendations: this.generateBusinessRecommendations(item.type, item.data)
    }))
  }

  /**
   * Calculate business impact of operational anomalies
   */
  private calculateBusinessImpact(metric: string, severity: string): string {
    const impactMap: Record<string, Record<string, string>> = {
      'daily_revenue': {
        'high': 'Revenue decline may impact quarterly targets',
        'critical': 'Critical revenue drop requires immediate intervention'
      },
      'churn_rate': {
        'high': 'High churn rate affecting customer retention goals',
        'critical': 'Critical churn rate threatening business sustainability'
      },
      'conversion_rate': {
        'high': 'Conversion decline impacting sales funnel efficiency',
        'critical': 'Critical conversion drop requiring marketing overhaul'
      }
    }

    return impactMap[metric]?.[severity] || 'Business impact assessment required'
  }

  /**
   * Generate business recommendations based on intelligence
   */
  private generateBusinessRecommendations(type: string, data: any): string[] {
    const recommendations: Record<string, (data: any) => string[]> = {
      'anomaly': (data) => [
        'Review marketing campaigns for effectiveness',
        'Analyze customer feedback for pain points',
        'Consider pricing strategy adjustments',
        'Evaluate competitor positioning'
      ],
      'trend': (data) => [
        'Scale successful marketing channels',
        'Optimize customer acquisition strategies',
        'Plan for seasonal demand fluctuations',
        'Review product pricing and positioning'
      ],
      'correlation': (data) => [
        'Investigate correlated customer behaviors',
        'Analyze conversion funnel bottlenecks',
        'Review product-market fit hypotheses',
        'Optimize customer journey touchpoints'
      ],
      'prediction': (data) => [
        'Prepare for predicted market changes',
        'Adjust inventory based on demand forecasts',
        'Plan marketing campaigns for peak periods',
        'Review expansion opportunities'
      ]
    }

    return recommendations[type]?.(data) || ['Monitor closely and review business strategies']
  }

  /**
   * Get business health score
   */
  async getBusinessHealthScore(): Promise<number> {
    const metrics = await this.fetchBusinessMetrics()
    const weights = {
      dailyRevenue: 0.25,
      conversionRate: 0.2,
      churnRate: 0.15,
      customerAcquisitionCost: 0.15,
      lifetimeValue: 0.1,
      netPromoterScore: 0.1,
      activeUsers: 0.05
    }

    // Normalize metrics to 0-100 scale
    const normalized = {
      dailyRevenue: Math.min(metrics.dailyRevenue / 10000, 1) * 100, // Assuming $10k target
      conversionRate: Math.min(metrics.conversionRate * 100, 100), // Convert to percentage
      churnRate: Math.max(0, 100 - metrics.churnRate * 100), // Invert churn rate
      customerAcquisitionCost: Math.max(0, 100 - (metrics.customerAcquisitionCost / 100)), // Lower CAC is better
      lifetimeValue: Math.min(metrics.lifetimeValue / 500, 1) * 100, // Assuming $500 target LTV
      netPromoterScore: Math.min((metrics.netPromoterScore + 100) / 2, 100), // NPS scale -100 to 100
      activeUsers: Math.min(metrics.activeUsers / 1000, 1) * 100 // Assuming 1000 target users
    }

    const score = (
      normalized.dailyRevenue * weights.dailyRevenue +
      normalized.conversionRate * weights.conversionRate +
      normalized.churnRate * weights.churnRate +
      normalized.customerAcquisitionCost * weights.customerAcquisitionCost +
      normalized.lifetimeValue * weights.lifetimeValue +
      normalized.netPromoterScore * weights.netPromoterScore +
      normalized.activeUsers * weights.activeUsers
    )

    return Math.round(Math.max(0, Math.min(100, score)))
  }

  /**
   * Validate business metrics access for Business Ops role
   */
  static validateBusinessOpsMetricsAccess(metricKey: string): boolean {
    const allowedMetrics = [
      'daily_revenue',
      'active_users',
      'transaction_volume',
      'conversion_rate',
      'churn_rate',
      'customer_acquisition_cost',
      'lifetime_value',
      'monthly_recurring_revenue',
      'gross_merchandise_value',
      'net_promoter_score'
    ]

    return allowedMetrics.includes(metricKey)
  }
}

export default BusinessOpsCSIService
