// Procurement Dashboard CSI Service
// Handles procurement metrics, vendor management, and supply chain intelligence for Procurement role

import { CSIClient, CSIMetricsRequest, CSIMetricsResponse } from '@pulsco/csi-client'
import { AdminRoleType } from '@pulsco/admin-shared-types'

export interface ProcurementMetrics {
  vendorPerformance: number
  contractCompliance: number
  costSavings: number
  supplierDiversity: number
  procurementCycleTime: number
  vendorSLACompliance: number
  riskAssessment: number
  negotiationSuccess: number
  supplyChainStability: number
  procurementEfficiency: number
}

export interface ProcurementAnomaly {
  metric: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  timestamp: Date
  procurementImpact: number
}

export interface ProcurementIntelligence {
  type: 'anomaly' | 'trend' | 'correlation' | 'prediction'
  data: any
  confidence: number
  timestamp: Date
  recommendations?: string[]
}

export class ProcurementCSIService {
  private csiClient: CSIClient
  private role: AdminRoleType = 'procurement'

  constructor(csiClient: CSIClient) {
    this.csiClient = csiClient
  }

  /**
   * Fetch procurement and vendor metrics for Procurement dashboard
   */
  async fetchProcurementMetrics(timeRange?: { start: Date; end: Date }): Promise<ProcurementMetrics> {
    const request: CSIMetricsRequest = {
      adminRole: this.role,
      metricKeys: [
        'vendor_performance',
        'contract_compliance',
        'cost_savings',
        'supplier_diversity',
        'procurement_cycle_time',
        'vendor_sla_compliance',
        'risk_assessment',
        'negotiation_success',
        'supply_chain_stability',
        'procurement_efficiency'
      ],
      timeRange
    }

    const response: CSIMetricsResponse = await this.csiClient.fetchMetrics(request)

    return {
      vendorPerformance: response.metrics.vendor_performance || 0,
      contractCompliance: response.metrics.contract_compliance || 0,
      costSavings: response.metrics.cost_savings || 0,
      supplierDiversity: response.metrics.supplier_diversity || 0,
      procurementCycleTime: response.metrics.procurement_cycle_time || 0,
      vendorSLACompliance: response.metrics.vendor_sla_compliance || 0,
      riskAssessment: response.metrics.risk_assessment || 0,
      negotiationSuccess: response.metrics.negotiation_success || 0,
      supplyChainStability: response.metrics.supply_chain_stability || 0,
      procurementEfficiency: response.metrics.procurement_efficiency || 0
    }
  }

  /**
   * Get procurement and vendor anomalies and alerts
   */
  async getProcurementAnomalies(): Promise<ProcurementAnomaly[]> {
    const anomalies = await this.csiClient.getAnomalies()

    return anomalies.map(anomaly => ({
      metric: anomaly.metric,
      severity: anomaly.severity,
      description: anomaly.description,
      confidence: anomaly.confidence,
      timestamp: anomaly.timestamp,
      procurementImpact: this.calculateProcurementImpact(anomaly.metric, anomaly.severity)
    }))
  }

  /**
   * Get procurement and supply chain intelligence and insights
   */
  async getProcurementIntelligence(): Promise<ProcurementIntelligence[]> {
    const intelligence = await this.csiClient.getIntelligenceStream()

    return intelligence.map(item => ({
      type: item.type,
      data: item.data,
      confidence: item.confidence,
      timestamp: item.timestamp,
      recommendations: this.generateProcurementRecommendations(item.type, item.data)
    }))
  }

  /**
   * Calculate procurement impact of vendor and supply chain anomalies
   */
  private calculateProcurementImpact(metric: string, severity: string): number {
    const impactMap: Record<string, Record<string, number>> = {
      'vendor_performance': {
        'high': -50000,
        'critical': -200000
      },
      'contract_compliance': {
        'high': -75000,
        'critical': -300000
      },
      'supply_chain_stability': {
        'high': -100000,
        'critical': -500000
      },
      'vendor_sla_compliance': {
        'high': -25000,
        'critical': -100000
      }
    }

    return impactMap[metric]?.[severity] || 0
  }

  /**
   * Generate procurement and vendor recommendations based on intelligence
   */
  private generateProcurementRecommendations(type: string, data: any): string[] {
    const recommendations: Record<string, (data: any) => string[]> = {
      'anomaly': (data) => [
        'Conduct immediate vendor performance review',
        'Assess supply chain disruption impacts',
        'Review contract compliance requirements',
        'Implement contingency procurement plans'
      ],
      'trend': (data) => [
        'Optimize vendor selection criteria',
        'Review procurement cycle time improvements',
        'Enhance supplier diversity initiatives',
        'Update cost management strategies'
      ],
      'correlation': (data) => [
        'Analyze vendor performance correlations',
        'Review supply chain dependency risks',
        'Implement integrated vendor management',
        'Strengthen procurement oversight protocols'
      ],
      'prediction': (data) => [
        'Develop proactive vendor risk mitigation',
        'Prepare supply chain contingency strategies',
        'Update procurement forecasting models',
        'Strengthen vendor relationship management'
      ]
    }

    return recommendations[type]?.(data) || ['Monitor closely and review procurement procedures']
  }

  /**
   * Get procurement health and vendor performance score
   */
  async getProcurementHealthScore(): Promise<number> {
    const metrics = await this.fetchProcurementMetrics()
    const weights = {
      vendorPerformance: 0.25,
      contractCompliance: 0.2,
      costSavings: 0.15,
      supplierDiversity: 0.1,
      vendorSLACompliance: 0.15,
      supplyChainStability: 0.15
    }

    const score = (
      metrics.vendorPerformance * weights.vendorPerformance +
      metrics.contractCompliance * weights.contractCompliance +
      (metrics.costSavings >= 0 ? Math.min(100, 50 + metrics.costSavings / 10000) : Math.max(0, 50 + metrics.costSavings / 20000)) * weights.costSavings +
      metrics.supplierDiversity * weights.supplierDiversity +
      metrics.vendorSLACompliance * weights.vendorSLACompliance +
      metrics.supplyChainStability * weights.supplyChainStability
    )

    return Math.round(Math.max(0, Math.min(100, score)))
  }

  /**
   * Get vendor risk assessment
   */
  async getVendorRiskAssessment(): Promise<{
    overallRisk: number
    vendorRisk: number
    supplyChainRisk: number
    complianceRisk: number
    recommendations: string[]
  }> {
    const metrics = await this.fetchProcurementMetrics()
    const anomalies = await this.getProcurementAnomalies()

    const vendorRisk = Math.min(100, (100 - metrics.vendorPerformance) + (100 - metrics.vendorSLACompliance) / 2)
    const supplyChainRisk = Math.min(100, (100 - metrics.supplyChainStability) + anomalies.filter(a => a.metric.includes('supply')).length * 10)
    const complianceRisk = Math.min(100, (100 - metrics.contractCompliance) + (100 - metrics.negotiationSuccess) / 2)

    const overallRisk = (vendorRisk * 0.4 + supplyChainRisk * 0.4 + complianceRisk * 0.2)

    const recommendations = []
    if (vendorRisk > 50) recommendations.push('Strengthen vendor performance monitoring')
    if (supplyChainRisk > 50) recommendations.push('Develop supply chain risk mitigation strategies')
    if (complianceRisk > 50) recommendations.push('Enhance contract compliance procedures')

    return {
      overallRisk: Math.round(overallRisk),
      vendorRisk: Math.round(vendorRisk),
      supplyChainRisk: Math.round(supplyChainRisk),
      complianceRisk: Math.round(complianceRisk),
      recommendations
    }
  }

  /**
   * Validate procurement and vendor metrics access for Procurement role
   */
  static validateProcurementMetricsAccess(metricKey: string): boolean {
    const allowedMetrics = [
      'vendor_performance',
      'contract_compliance',
      'cost_savings',
      'supplier_diversity',
      'procurement_cycle_time',
      'vendor_sla_compliance',
      'risk_assessment',
      'negotiation_success',
      'supply_chain_stability',
      'procurement_efficiency'
    ]

    return allowedMetrics.includes(metricKey)
  }
}

export default ProcurementCSIService
