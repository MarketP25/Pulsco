// Governance Registrar Dashboard CSI Service
// Handles governance and compliance metrics fetching and intelligence processing for Governance Registrar role

import { CSIClient, CSIMetricsRequest, CSIMetricsResponse } from '@pulsco/csi-client'
import { AdminRoleType } from '@pulsco/admin-shared-types'

export interface GovernanceMetrics {
  auditCompliance: number
  governanceViolations: number
  policyAdherence: number
  decisionLatency: number
  councilParticipation: number
  regulatoryFilings: number
  governanceTraining: number
  policyUpdates: number
  complianceAudits: number
  governanceMaturity: number
}

export interface GovernanceAnomaly {
  metric: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  timestamp: Date
  governanceImpact: string
}

export interface GovernanceIntelligence {
  type: 'anomaly' | 'trend' | 'correlation' | 'prediction'
  data: any
  confidence: number
  timestamp: Date
  recommendations?: string[]
}

export class GovernanceRegistrarCSIService {
  private csiClient: CSIClient
  private role: AdminRoleType = 'governance-registrar'

  constructor(csiClient: CSIClient) {
    this.csiClient = csiClient
  }

  /**
   * Fetch governance and compliance metrics for Governance Registrar dashboard
   */
  async fetchGovernanceMetrics(timeRange?: { start: Date; end: Date }): Promise<GovernanceMetrics> {
    const request: CSIMetricsRequest = {
      adminRole: this.role,
      metricKeys: [
        'audit_compliance',
        'governance_violations',
        'policy_adherence',
        'decision_latency',
        'council_participation',
        'regulatory_filings',
        'governance_training',
        'policy_updates',
        'compliance_audits',
        'governance_maturity'
      ],
      timeRange
    }

    const response: CSIMetricsResponse = await this.csiClient.fetchMetrics(request)

    return {
      auditCompliance: response.metrics.audit_compliance || 0,
      governanceViolations: response.metrics.governance_violations || 0,
      policyAdherence: response.metrics.policy_adherence || 0,
      decisionLatency: response.metrics.decision_latency || 0,
      councilParticipation: response.metrics.council_participation || 0,
      regulatoryFilings: response.metrics.regulatory_filings || 0,
      governanceTraining: response.metrics.governance_training || 0,
      policyUpdates: response.metrics.policy_updates || 0,
      complianceAudits: response.metrics.compliance_audits || 0,
      governanceMaturity: response.metrics.governance_maturity || 0
    }
  }

  /**
   * Get governance and compliance anomalies and alerts
   */
  async getGovernanceAnomalies(): Promise<GovernanceAnomaly[]> {
    const anomalies = await this.csiClient.getAnomalies()

    return anomalies.map(anomaly => ({
      metric: anomaly.metric,
      severity: anomaly.severity,
      description: anomaly.description,
      confidence: anomaly.confidence,
      timestamp: anomaly.timestamp,
      governanceImpact: this.calculateGovernanceImpact(anomaly.metric, anomaly.severity)
    }))
  }

  /**
   * Get governance and compliance intelligence and insights
   */
  async getGovernanceIntelligence(): Promise<GovernanceIntelligence[]> {
    const intelligence = await this.csiClient.getIntelligenceStream()

    return intelligence.map(item => ({
      type: item.type,
      data: item.data,
      confidence: item.confidence,
      timestamp: item.timestamp,
      recommendations: this.generateGovernanceRecommendations(item.type, item.data)
    }))
  }

  /**
   * Calculate governance impact of compliance and policy anomalies
   */
  private calculateGovernanceImpact(metric: string, severity: string): string {
    const impactMap: Record<string, Record<string, string>> = {
      'governance_violations': {
        'high': 'High governance violations may undermine organizational trust',
        'critical': 'Critical governance violations risk regulatory intervention'
      },
      'policy_adherence': {
        'high': 'Policy adherence gaps affecting operational consistency',
        'critical': 'Critical policy failures requiring immediate governance review'
      },
      'audit_compliance': {
        'high': 'Audit compliance issues may trigger external investigations',
        'critical': 'Critical audit failures risk certification suspension'
      },
      'decision_latency': {
        'high': 'High decision latency impacting organizational agility',
        'critical': 'Critical decision delays risking competitive disadvantage'
      }
    }

    return impactMap[metric]?.[severity] || 'Governance impact assessment required'
  }

  /**
   * Generate governance and compliance recommendations based on intelligence
   */
  private generateGovernanceRecommendations(type: string, data: any): string[] {
    const recommendations: Record<string, (data: any) => string[]> = {
      'anomaly': (data) => [
        'Conduct immediate governance assessment',
        'Review policy compliance procedures',
        'Strengthen audit and oversight mechanisms',
        'Update governance training programs',
        'Implement corrective governance actions'
      ],
      'trend': (data) => [
        'Develop comprehensive governance frameworks',
        'Enhance policy management systems',
        'Strengthen compliance monitoring capabilities',
        'Review and update governance structures',
        'Implement proactive risk management'
      ],
      'correlation': (data) => [
        'Investigate correlated governance patterns',
        'Analyze compliance failure root causes',
        'Review decision-making processes',
        'Strengthen governance oversight mechanisms',
        'Develop integrated compliance approaches'
      ],
      'prediction': (data) => [
        'Prepare for anticipated regulatory changes',
        'Develop governance evolution strategies',
        'Plan for compliance technology investments',
        'Review governance maturity roadmaps',
        'Strengthen stakeholder engagement processes'
      ]
    }

    return recommendations[type]?.(data) || ['Monitor closely and review governance strategies']
  }

  /**
   * Get governance and compliance health score
   */
  async getGovernanceHealthScore(): Promise<number> {
    const metrics = await this.fetchGovernanceMetrics()
    const weights = {
      auditCompliance: 0.25,
      policyAdherence: 0.2,
      governanceViolations: 0.15,
      decisionLatency: 0.15,
      councilParticipation: 0.1,
      governanceTraining: 0.1,
      regulatoryFilings: 0.05
    }

    // Normalize metrics to 0-100 scale
    const normalized = {
      auditCompliance: metrics.auditCompliance, // Direct percentage
      policyAdherence: metrics.policyAdherence, // Direct percentage
      governanceViolations: Math.max(0, 100 - metrics.governanceViolations * 5), // Fewer violations = higher health
      decisionLatency: Math.max(0, 100 - (metrics.decisionLatency / 24)), // Lower latency = higher health (hours to days)
      councilParticipation: metrics.councilParticipation, // Direct percentage
      governanceTraining: metrics.governanceTraining, // Direct percentage
      regulatoryFilings: Math.min(metrics.regulatoryFilings * 20, 100) // More filings = higher health (up to 5)
    }

    const score = (
      normalized.auditCompliance * weights.auditCompliance +
      normalized.policyAdherence * weights.policyAdherence +
      normalized.governanceViolations * weights.governanceViolations +
      normalized.decisionLatency * weights.decisionLatency +
      normalized.councilParticipation * weights.councilParticipation +
      normalized.governanceTraining * weights.governanceTraining +
      normalized.regulatoryFilings * weights.regulatoryFilings
    )

    return Math.round(Math.max(0, Math.min(100, score)))
  }

  /**
   * Validate governance and compliance metrics access for Governance Registrar role
   */
  static validateGovernanceMetricsAccess(metricKey: string): boolean {
    const allowedMetrics = [
      'audit_compliance',
      'governance_violations',
      'policy_adherence',
      'decision_latency',
      'council_participation',
      'regulatory_filings',
      'governance_training',
      'policy_updates',
      'compliance_audits',
      'governance_maturity'
    ]

    return allowedMetrics.includes(metricKey)
  }
}

export default GovernanceRegistrarCSIService
