// Legal Finance Dashboard CSI Service
// Handles financial metrics, compliance monitoring, and legal intelligence for Legal Finance role

import { CSIClient, CSIMetricsRequest, CSIMetricsResponse } from '@pulsco/csi-client'
import { AdminRoleType } from '@pulsco/admin-shared-types'

export interface LegalFinanceMetrics {
  revenueGrowth: number
  expenseRatio: number
  profitMargin: number
  cashFlowStability: number
  complianceScore: number
  legalCaseResolution: number
  regulatoryFilings: number
  contractValue: number
  auditFindings: number
  riskExposure: number
}

export interface LegalFinanceAnomaly {
  metric: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  timestamp: Date
  financialImpact: number
}

export interface LegalFinanceIntelligence {
  type: 'anomaly' | 'trend' | 'correlation' | 'prediction'
  data: any
  confidence: number
  timestamp: Date
  recommendations?: string[]
}

export class LegalFinanceCSIService {
  private csiClient: CSIClient
  private role: AdminRoleType = 'legal-finance'

  constructor(csiClient: CSIClient) {
    this.csiClient = csiClient
  }

  /**
   * Fetch financial and legal metrics for Legal Finance dashboard
   */
  async fetchFinancialMetrics(timeRange?: { start: Date; end: Date }): Promise<LegalFinanceMetrics> {
    const request: CSIMetricsRequest = {
      adminRole: this.role,
      metricKeys: [
        'revenue_growth',
        'expense_ratio',
        'profit_margin',
        'cash_flow_stability',
        'compliance_score',
        'legal_case_resolution',
        'regulatory_filings',
        'contract_value',
        'audit_findings',
        'risk_exposure'
      ],
      timeRange
    }

    const response: CSIMetricsResponse = await this.csiClient.fetchMetrics(request)

    return {
      revenueGrowth: response.metrics.revenue_growth || 0,
      expenseRatio: response.metrics.expense_ratio || 0,
      profitMargin: response.metrics.profit_margin || 0,
      cashFlowStability: response.metrics.cash_flow_stability || 0,
      complianceScore: response.metrics.compliance_score || 0,
      legalCaseResolution: response.metrics.legal_case_resolution || 0,
      regulatoryFilings: response.metrics.regulatory_filings || 0,
      contractValue: response.metrics.contract_value || 0,
      auditFindings: response.metrics.audit_findings || 0,
      riskExposure: response.metrics.risk_exposure || 0
    }
  }

  /**
   * Get financial and legal anomalies and alerts
   */
  async getFinancialAnomalies(): Promise<LegalFinanceAnomaly[]> {
    const anomalies = await this.csiClient.getAnomalies()

    return anomalies.map(anomaly => ({
      metric: anomaly.metric,
      severity: anomaly.severity,
      description: anomaly.description,
      confidence: anomaly.confidence,
      timestamp: anomaly.timestamp,
      financialImpact: this.calculateFinancialImpact(anomaly.metric, anomaly.severity)
    }))
  }

  /**
   * Get financial and legal intelligence and insights
   */
  async getFinancialIntelligence(): Promise<LegalFinanceIntelligence[]> {
    const intelligence = await this.csiClient.getIntelligenceStream()

    return intelligence.map(item => ({
      type: item.type,
      data: item.data,
      confidence: item.confidence,
      timestamp: item.timestamp,
      recommendations: this.generateFinancialRecommendations(item.type, item.data)
    }))
  }

  /**
   * Calculate financial impact of legal and financial anomalies
   */
  private calculateFinancialImpact(metric: string, severity: string): number {
    const impactMap: Record<string, Record<string, number>> = {
      'revenue_growth': {
        'high': -50000,
        'critical': -200000
      },
      'compliance_score': {
        'high': -100000,
        'critical': -500000
      },
      'legal_case_resolution': {
        'high': -250000,
        'critical': -1000000
      },
      'audit_findings': {
        'high': -150000,
        'critical': -750000
      }
    }

    return impactMap[metric]?.[severity] || 0
  }

  /**
   * Generate financial and legal recommendations based on intelligence
   */
  private generateFinancialRecommendations(type: string, data: any): string[] {
    const recommendations: Record<string, (data: any) => string[]> = {
      'anomaly': (data) => [
        'Conduct immediate financial impact assessment',
        'Review compliance procedures and documentation',
        'Engage legal counsel for risk mitigation',
        'Prepare contingency financial planning'
      ],
      'trend': (data) => [
        'Adjust financial forecasting models',
        'Review contract terms and pricing structures',
        'Optimize expense management strategies',
        'Update regulatory compliance frameworks'
      ],
      'correlation': (data) => [
        'Analyze interconnected financial and legal risks',
        'Review cross-functional compliance dependencies',
        'Implement integrated risk management protocols',
        'Strengthen governance oversight mechanisms'
      ],
      'prediction': (data) => [
        'Develop proactive financial risk mitigation strategies',
        'Prepare legal defense and compliance enhancement plans',
        'Update insurance coverage based on predicted exposures',
        'Strengthen audit and regulatory reporting capabilities'
      ]
    }

    return recommendations[type]?.(data) || ['Monitor closely and review financial procedures']
  }

  /**
   * Get financial health and compliance score
   */
  async getFinancialHealthScore(): Promise<number> {
    const metrics = await this.fetchFinancialMetrics()
    const weights = {
      revenueGrowth: 0.25,
      profitMargin: 0.2,
      cashFlowStability: 0.15,
      complianceScore: 0.2,
      legalCaseResolution: 0.1,
      auditFindings: 0.1
    }

    const score = (
      (metrics.revenueGrowth >= 0 ? Math.min(100, 50 + metrics.revenueGrowth * 10) : Math.max(0, 50 + metrics.revenueGrowth * 20)) * weights.revenueGrowth +
      (metrics.profitMargin >= 0 ? Math.min(100, metrics.profitMargin * 2) : 0) * weights.profitMargin +
      metrics.cashFlowStability * weights.cashFlowStability +
      metrics.complianceScore * weights.complianceScore +
      metrics.legalCaseResolution * weights.legalCaseResolution +
      (metrics.auditFindings === 0 ? 100 : Math.max(0, 100 - metrics.auditFindings * 10)) * weights.auditFindings
    )

    return Math.round(Math.max(0, Math.min(100, score)))
  }

  /**
   * Validate financial and legal metrics access for Legal Finance role
   */
  static validateLegalFinanceMetricsAccess(metricKey: string): boolean {
    const allowedMetrics = [
      'revenue_growth',
      'expense_ratio',
      'profit_margin',
      'cash_flow_stability',
      'compliance_score',
      'legal_case_resolution',
      'regulatory_filings',
      'contract_value',
      'audit_findings',
      'risk_exposure'
    ]

    return allowedMetrics.includes(metricKey)
  }
}

export default LegalFinanceCSIService
