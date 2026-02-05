// People Risk Dashboard CSI Service
// Handles people and risk metrics fetching and intelligence processing for People Risk role

import { CSIClient, CSIMetricsRequest, CSIMetricsResponse } from '@pulsco/csi-client'
import { AdminRoleType } from '@pulsco/admin-shared-types'

export interface PeopleRiskMetrics {
  riskScore: number
  complianceViolations: number
  securityIncidents: number
  auditFindings: number
  policyBreaches: number
  employeeSatisfaction: number
  turnoverRate: number
  trainingCompletion: number
  backgroundCheckStatus: number
  accessControlViolations: number
}

export interface PeopleRiskAnomaly {
  metric: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  timestamp: Date
  riskImpact: string
}

export interface PeopleRiskIntelligence {
  type: 'anomaly' | 'trend' | 'correlation' | 'prediction'
  data: any
  confidence: number
  timestamp: Date
  recommendations?: string[]
}

export class PeopleRiskCSIService {
  private csiClient: CSIClient
  private role: AdminRoleType = 'people-risk'

  constructor(csiClient: CSIClient) {
    this.csiClient = csiClient
  }

  /**
   * Fetch people and risk metrics for People Risk dashboard
   */
  async fetchPeopleRiskMetrics(timeRange?: { start: Date; end: Date }): Promise<PeopleRiskMetrics> {
    const request: CSIMetricsRequest = {
      adminRole: this.role,
      metricKeys: [
        'risk_score',
        'compliance_violations',
        'security_incidents',
        'audit_findings',
        'policy_breaches',
        'employee_satisfaction',
        'turnover_rate',
        'training_completion',
        'background_check_status',
        'access_control_violations'
      ],
      timeRange
    }

    const response: CSIMetricsResponse = await this.csiClient.fetchMetrics(request)

    return {
      riskScore: response.metrics.risk_score || 0,
      complianceViolations: response.metrics.compliance_violations || 0,
      securityIncidents: response.metrics.security_incidents || 0,
      auditFindings: response.metrics.audit_findings || 0,
      policyBreaches: response.metrics.policy_breaches || 0,
      employeeSatisfaction: response.metrics.employee_satisfaction || 0,
      turnoverRate: response.metrics.turnover_rate || 0,
      trainingCompletion: response.metrics.training_completion || 0,
      backgroundCheckStatus: response.metrics.background_check_status || 0,
      accessControlViolations: response.metrics.access_control_violations || 0
    }
  }

  /**
   * Get people and risk anomalies and alerts
   */
  async getPeopleRiskAnomalies(): Promise<PeopleRiskAnomaly[]> {
    const anomalies = await this.csiClient.getAnomalies()

    return anomalies.map(anomaly => ({
      metric: anomaly.metric,
      severity: anomaly.severity,
      description: anomaly.description,
      confidence: anomaly.confidence,
      timestamp: anomaly.timestamp,
      riskImpact: this.calculateRiskImpact(anomaly.metric, anomaly.severity)
    }))
  }

  /**
   * Get people and risk intelligence and insights
   */
  async getPeopleRiskIntelligence(): Promise<PeopleRiskIntelligence[]> {
    const intelligence = await this.csiClient.getIntelligenceStream()

    return intelligence.map(item => ({
      type: item.type,
      data: item.data,
      confidence: item.confidence,
      timestamp: item.timestamp,
      recommendations: this.generateRiskRecommendations(item.type, item.data)
    }))
  }

  /**
   * Calculate risk impact of people and compliance anomalies
   */
  private calculateRiskImpact(metric: string, severity: string): string {
    const impactMap: Record<string, Record<string, string>> = {
      'compliance_violations': {
        'high': 'High compliance violations may trigger regulatory scrutiny',
        'critical': 'Critical compliance violations risk legal action and fines'
      },
      'security_incidents': {
        'high': 'High security incidents may compromise data integrity',
        'critical': 'Critical security incidents require immediate breach response'
      },
      'policy_breaches': {
        'high': 'High policy breaches affecting organizational governance',
        'critical': 'Critical policy breaches requiring executive intervention'
      },
      'turnover_rate': {
        'high': 'High turnover rate impacting team stability and knowledge retention',
        'critical': 'Critical turnover rate threatening operational continuity'
      }
    }

    return impactMap[metric]?.[severity] || 'Risk impact assessment required'
  }

  /**
   * Generate risk and compliance recommendations based on intelligence
   */
  private generateRiskRecommendations(type: string, data: any): string[] {
    const recommendations: Record<string, (data: any) => string[]> = {
      'anomaly': (data) => [
        'Conduct immediate security assessment',
        'Review access control policies and procedures',
        'Implement additional training programs',
        'Strengthen background check processes',
        'Update compliance monitoring protocols'
      ],
      'trend': (data) => [
        'Develop comprehensive risk mitigation strategies',
        'Enhance employee engagement initiatives',
        'Strengthen compliance training programs',
        'Improve incident response procedures',
        'Review and update security policies'
      ],
      'correlation': (data) => [
        'Investigate correlated risk patterns',
        'Analyze compliance violation root causes',
        'Review employee satisfaction drivers',
        'Assess training program effectiveness',
        'Strengthen governance frameworks'
      ],
      'prediction': (data) => [
        'Prepare for predicted compliance changes',
        'Plan for workforce expansion needs',
        'Develop risk mitigation roadmaps',
        'Schedule preventive security audits',
        'Update business continuity plans'
      ]
    }

    return recommendations[type]?.(data) || ['Monitor closely and review risk management strategies']
  }

  /**
   * Get people and risk health score
   */
  async getPeopleRiskHealthScore(): Promise<number> {
    const metrics = await this.fetchPeopleRiskMetrics()
    const weights = {
      riskScore: 0.25,
      complianceViolations: 0.2,
      securityIncidents: 0.15,
      policyBreaches: 0.15,
      employeeSatisfaction: 0.1,
      turnoverRate: 0.1,
      trainingCompletion: 0.05
    }

    // Normalize metrics to 0-100 scale (lower risk/compliance issues = higher score)
    const normalized = {
      riskScore: Math.max(0, 100 - metrics.riskScore), // Lower risk score = higher health
      complianceViolations: Math.max(0, 100 - metrics.complianceViolations * 10), // Fewer violations = higher health
      securityIncidents: Math.max(0, 100 - metrics.securityIncidents * 5), // Fewer incidents = higher health
      policyBreaches: Math.max(0, 100 - metrics.policyBreaches * 20), // Fewer breaches = higher health
      employeeSatisfaction: metrics.employeeSatisfaction, // Direct percentage
      turnoverRate: Math.max(0, 100 - metrics.turnoverRate * 100), // Lower turnover = higher health
      trainingCompletion: metrics.trainingCompletion // Direct percentage
    }

    const score = (
      normalized.riskScore * weights.riskScore +
      normalized.complianceViolations * weights.complianceViolations +
      normalized.securityIncidents * weights.securityIncidents +
      normalized.policyBreaches * weights.policyBreaches +
      normalized.employeeSatisfaction * weights.employeeSatisfaction +
      normalized.turnoverRate * weights.turnoverRate +
      normalized.trainingCompletion * weights.trainingCompletion
    )

    return Math.round(Math.max(0, Math.min(100, score)))
  }

  /**
   * Validate people and risk metrics access for People Risk role
   */
  static validatePeopleRiskMetricsAccess(metricKey: string): boolean {
    const allowedMetrics = [
      'risk_score',
      'compliance_violations',
      'security_incidents',
      'audit_findings',
      'policy_breaches',
      'employee_satisfaction',
      'turnover_rate',
      'training_completion',
      'background_check_status',
      'access_control_violations'
    ]

    return allowedMetrics.includes(metricKey)
  }
}

export default PeopleRiskCSIService
