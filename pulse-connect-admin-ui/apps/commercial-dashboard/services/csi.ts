// Commercial Dashboard CSI Service
// Handles commercial metrics fetching and intelligence processing for Commercial role

import { CSIClient, CSIMetricsRequest, CSIMetricsResponse } from '@pulsco/csi-client'
import { AdminRoleType } from '@pulsco/admin-shared-types'

export interface CommercialMetrics {
  marketPenetration: number
  regionalGrowth: number
  customerAcquisitionCost: number
  brandAwareness: number
  competitivePositioning: number
  marketShare: number
  salesVelocity: number
  leadConversionRate: number
  customerLifetimeValue: number
  expansionRevenue: number
}

export interface CommercialAnomaly {
  metric: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  timestamp: Date
  marketImpact: string
}

export interface CommercialIntelligence {
  type: 'anomaly' | 'trend' | 'correlation' | 'prediction'
  data: any
  confidence: number
  timestamp: Date
  recommendations?: string[]
}

export class CommercialCSIService {
  private csiClient: CSIClient
  private role: AdminRoleType = 'commercial-outreach'

  constructor(csiClient: CSIClient) {
    this.csiClient = csiClient
  }

  /**
   * Fetch commercial metrics for Commercial dashboard
   */
  async fetchCommercialMetrics(timeRange?: { start: Date; end: Date }): Promise<CommercialMetrics> {
    const request: CSIMetricsRequest = {
      adminRole: this.role,
      metricKeys: [
        'market_penetration',
        'regional_growth',
        'customer_acquisition_cost',
        'brand_awareness',
        'competitive_positioning',
        'market_share',
        'sales_velocity',
        'lead_conversion_rate',
        'customer_lifetime_value',
        'expansion_revenue'
      ],
      timeRange
    }

    const response: CSIMetricsResponse = await this.csiClient.fetchMetrics(request)

    return {
      marketPenetration: response.metrics.market_penetration || 0,
      regionalGrowth: response.metrics.regional_growth || 0,
      customerAcquisitionCost: response.metrics.customer_acquisition_cost || 0,
      brandAwareness: response.metrics.brand_awareness || 0,
      competitivePositioning: response.metrics.competitive_positioning || 0,
      marketShare: response.metrics.market_share || 0,
      salesVelocity: response.metrics.sales_velocity || 0,
      leadConversionRate: response.metrics.lead_conversion_rate || 0,
      customerLifetimeValue: response.metrics.customer_lifetime_value || 0,
      expansionRevenue: response.metrics.expansion_revenue || 0
    }
  }

  /**
   * Get commercial anomalies and alerts
   */
  async getCommercialAnomalies(): Promise<CommercialAnomaly[]> {
    const anomalies = await this.csiClient.getAnomalies()

    return anomalies.map(anomaly => ({
      metric: anomaly.metric,
      severity: anomaly.severity,
      description: anomaly.description,
      confidence: anomaly.confidence,
      timestamp: anomaly.timestamp,
      marketImpact: this.calculateMarketImpact(anomaly.metric, anomaly.severity)
    }))
  }

  /**
   * Get commercial intelligence and insights
   */
  async getCommercialIntelligence(): Promise<CommercialIntelligence[]> {
    const intelligence = await this.csiClient.getIntelligenceStream()

    return intelligence.map(item => ({
      type: item.type,
      data: item.data,
      confidence: item.confidence,
      timestamp: item.timestamp,
      recommendations: this.generateCommercialRecommendations(item.type, item.data)
    }))
  }

  /**
   * Calculate market impact of commercial anomalies
   */
  private calculateMarketImpact(metric: string, severity: string): string {
    const impactMap: Record<string, Record<string, string>> = {
      'market_penetration': {
        'high': 'High market penetration challenges may affect growth targets',
        'critical': 'Critical market penetration issues risk competitive positioning'
      },
      'customer_acquisition_cost': {
        'high': 'High acquisition costs impacting profitability margins',
        'critical': 'Critical acquisition costs threatening business sustainability'
      },
      'market_share': {
        'high': 'Market share decline may signal competitive threats',
        'critical': 'Critical market share loss risks brand positioning'
      },
      'lead_conversion_rate': {
        'high': 'Conversion rate decline affecting sales pipeline health',
        'critical': 'Critical conversion failure impacting revenue forecasts'
      }
    }

    return impactMap[metric]?.[severity] || 'Market impact assessment required'
  }

  /**
   * Generate commercial recommendations based on intelligence
   */
  private generateCommercialRecommendations(type: string, data: any): string[] {
    const recommendations: Record<string, (data: any) => string[]> = {
      'anomaly': (data) => [
        'Review marketing campaign effectiveness',
        'Analyze competitor positioning and strategies',
        'Optimize customer acquisition channels',
        'Strengthen brand awareness initiatives',
        'Refine lead qualification processes'
      ],
      'trend': (data) => [
        'Scale successful market expansion strategies',
        'Optimize regional growth initiatives',
        'Enhance customer lifetime value programs',
        'Develop competitive differentiation strategies',
        'Strengthen sales velocity processes'
      ],
      'correlation': (data) => [
        'Investigate correlated market performance factors',
        'Analyze regional growth patterns and drivers',
        'Review customer acquisition cost trends',
        'Assess brand awareness campaign effectiveness',
        'Optimize conversion funnel performance'
      ],
      'prediction': (data) => [
        'Prepare for predicted market changes',
        'Develop proactive competitive strategies',
        'Plan market expansion initiatives',
        'Optimize sales forecasting models',
        'Strengthen customer retention programs'
      ]
    }

    return recommendations[type]?.(data) || ['Monitor closely and review commercial strategies']
  }

  /**
   * Get commercial health score
   */
  async getCommercialHealthScore(): Promise<number> {
    const metrics = await this.fetchCommercialMetrics()
    const weights = {
      marketPenetration: 0.2,
      regionalGrowth: 0.15,
      customerAcquisitionCost: 0.15,
      brandAwareness: 0.1,
      competitivePositioning: 0.1,
      marketShare: 0.1,
      salesVelocity: 0.1,
      leadConversionRate: 0.1
    }

    // Normalize metrics to 0-100 scale
    const normalized = {
      marketPenetration: metrics.marketPenetration, // Direct percentage
      regionalGrowth: Math.min(metrics.regionalGrowth * 100, 100), // Convert to percentage
      customerAcquisitionCost: Math.max(0, 100 - (metrics.customerAcquisitionCost / 50)), // Lower CAC = higher health
      brandAwareness: metrics.brandAwareness, // Direct percentage
      competitivePositioning: metrics.competitivePositioning, // Direct percentage
      marketShare: metrics.marketShare, // Direct percentage
      salesVelocity: Math.min(metrics.salesVelocity / 10, 1) * 100, // Assuming 10 target velocity
      leadConversionRate: metrics.leadConversionRate // Direct percentage
    }

    const score = (
      normalized.marketPenetration * weights.marketPenetration +
      normalized.regionalGrowth * weights.regionalGrowth +
      normalized.customerAcquisitionCost * weights.customerAcquisitionCost +
      normalized.brandAwareness * weights.brandAwareness +
      normalized.competitivePositioning * weights.competitivePositioning +
      normalized.marketShare * weights.marketShare +
      normalized.salesVelocity * weights.salesVelocity +
      normalized.leadConversionRate * weights.leadConversionRate
    )

    return Math.round(Math.max(0, Math.min(100, score)))
  }

  /**
   * Validate commercial metrics access for Commercial role
   */
  static validateCommercialMetricsAccess(metricKey: string): boolean {
    const allowedMetrics = [
      'market_penetration',
      'regional_growth',
      'customer_acquisition_cost',
      'brand_awareness',
      'competitive_positioning',
      'market_share',
      'sales_velocity',
      'lead_conversion_rate',
      'customer_lifetime_value',
      'expansion_revenue'
    ]

    return allowedMetrics.includes(metricKey)
  }
}

export default CommercialCSIService
