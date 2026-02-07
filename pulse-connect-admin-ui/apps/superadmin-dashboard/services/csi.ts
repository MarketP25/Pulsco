// SuperAdmin Dashboard CSI Service
// Handles global system metrics, cross-domain intelligence, and governance oversight for SuperAdmin role

import { CSIClient, CSIMetricsRequest, CSIMetricsResponse } from '@pulsco/csi-client'
import { AdminRoleType } from '@pulsco/admin-shared-types'

export interface SuperAdminMetrics {
  systemHealth: number
  governanceCompliance: number
  crossDomainCorrelations: number
  marpSignatures: number
  globalSecurityScore: number
  subsystemIntegration: number
  decisionEngineEfficiency: number
  planetaryIntelligence: number
  emergencyResponseReadiness: number
  governanceFirewallStatus: number
}

export interface SuperAdminAnomaly {
  metric: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  timestamp: Date
  systemImpact: number
  affectedDomains: string[]
}

export interface SuperAdminIntelligence {
  type: 'anomaly' | 'trend' | 'correlation' | 'prediction'
  data: any
  confidence: number
  timestamp: Date
  recommendations?: string[]
  crossDomainInsights?: string[]
}

export class SuperAdminCSIService {
  private csiClient: CSIClient
  private role: AdminRoleType = 'superadmin'

  constructor(csiClient: CSIClient) {
    this.csiClient = csiClient
  }

  /**
   * Fetch global system and governance metrics for SuperAdmin dashboard
   */
  async fetchGlobalMetrics(timeRange?: { start: Date; end: Date }): Promise<SuperAdminMetrics> {
    const request: CSIMetricsRequest = {
      adminRole: this.role,
      metricKeys: [
        'system_health',
        'governance_compliance',
        'cross_domain_correlations',
        'marp_signatures',
        'global_security_score',
        'subsystem_integration',
        'decision_engine_efficiency',
        'planetary_intelligence',
        'emergency_response_readiness',
        'governance_firewall_status'
      ],
      timeRange
    }

    const response: CSIMetricsResponse = await this.csiClient.fetchMetrics(request)

    return {
      systemHealth: response.metrics.system_health || 0,
      governanceCompliance: response.metrics.governance_compliance || 0,
      crossDomainCorrelations: response.metrics.cross_domain_correlations || 0,
      marpSignatures: response.metrics.marp_signatures || 0,
      globalSecurityScore: response.metrics.global_security_score || 0,
      subsystemIntegration: response.metrics.subsystem_integration || 0,
      decisionEngineEfficiency: response.metrics.decision_engine_efficiency || 0,
      planetaryIntelligence: response.metrics.planetary_intelligence || 0,
      emergencyResponseReadiness: response.metrics.emergency_response_readiness || 0,
      governanceFirewallStatus: response.metrics.governance_firewall_status || 0
    }
  }

  /**
   * Get global system anomalies and critical alerts
   */
  async getGlobalAnomalies(): Promise<SuperAdminAnomaly[]> {
    const anomalies = await this.csiClient.getAnomalies()

    return anomalies.map(anomaly => ({
      metric: anomaly.metric,
      severity: anomaly.severity,
      description: anomaly.description,
      confidence: anomaly.confidence,
      timestamp: anomaly.timestamp,
      systemImpact: this.calculateSystemImpact(anomaly.metric, anomaly.severity),
      affectedDomains: this.identifyAffectedDomains(anomaly.metric)
    }))
  }

  /**
   * Get global intelligence and planetary insights
   */
  async getGlobalIntelligence(): Promise<SuperAdminIntelligence[]> {
    const intelligence = await this.csiClient.getIntelligenceStream()

    return intelligence.map(item => ({
      type: item.type,
      data: item.data,
      confidence: item.confidence,
      timestamp: item.timestamp,
      recommendations: this.generateGlobalRecommendations(item.type, item.data),
      crossDomainInsights: this.generateCrossDomainInsights(item.type, item.data)
    }))
  }

  /**
   * Calculate system-wide impact of global anomalies
   */
  private calculateSystemImpact(metric: string, severity: string): number {
    const impactMap: Record<string, Record<string, number>> = {
      'system_health': {
        'high': -1000000,
        'critical': -5000000
      },
      'governance_compliance': {
        'high': -2000000,
        'critical': -10000000
      },
      'global_security_score': {
        'high': -1500000,
        'critical': -7500000
      },
      'governance_firewall_status': {
        'high': -500000,
        'critical': -2500000
      }
    }

    return impactMap[metric]?.[severity] || 0
  }

  /**
   * Identify domains affected by system anomalies
   */
  private identifyAffectedDomains(metric: string): string[] {
    const domainMap: Record<string, string[]> = {
      'system_health': ['operations', 'infrastructure', 'security'],
      'governance_compliance': ['legal', 'finance', 'governance'],
      'global_security_score': ['security', 'operations', 'people'],
      'cross_domain_correlations': ['all'],
      'subsystem_integration': ['operations', 'infrastructure', 'communication']
    }

    return domainMap[metric] || ['unknown']
  }

  /**
   * Generate global system recommendations based on intelligence
   */
  private generateGlobalRecommendations(type: string, data: any): string[] {
    const recommendations: Record<string, (data: any) => string[]> = {
      'anomaly': (data) => [
        'Initiate emergency response protocols',
        'Conduct immediate cross-domain impact assessment',
        'Activate governance firewall emergency measures',
        'Deploy planetary intelligence coordination',
        'Prepare system-wide contingency plans'
      ],
      'trend': (data) => [
        'Review global system architecture and integration',
        'Update governance compliance frameworks',
        'Enhance cross-domain correlation monitoring',
        'Strengthen planetary intelligence capabilities',
        'Optimize decision engine efficiency'
      ],
      'correlation': (data) => [
        'Analyze interconnected system dependencies',
        'Review governance firewall correlation patterns',
        'Implement integrated risk management protocols',
        'Strengthen cross-domain communication channels',
        'Update planetary intelligence correlation models'
      ],
      'prediction': (data) => [
        'Develop proactive global risk mitigation strategies',
        'Prepare planetary-scale emergency response plans',
        'Update governance compliance prediction models',
        'Strengthen global security posture',
        'Enhance cross-domain intelligence sharing'
      ]
    }

    return recommendations[type]?.(data) || ['Monitor closely and review global system procedures']
  }

  /**
   * Generate cross-domain insights from intelligence data
   */
  private generateCrossDomainInsights(type: string, data: any): string[] {
    const insights: Record<string, (data: any) => string[]> = {
      'anomaly': (data) => [
        'Security anomalies may impact operational efficiency',
        'Governance issues could affect financial compliance',
        'Infrastructure problems may cascade to user experience'
      ],
      'trend': (data) => [
        'Growing operational demands require infrastructure scaling',
        'Increasing compliance requirements need governance updates',
        'Rising security threats demand enhanced monitoring'
      ],
      'correlation': (data) => [
        'Operational efficiency correlates with user satisfaction',
        'Security incidents often precede compliance issues',
        'Infrastructure stability affects governance effectiveness'
      ],
      'prediction': (data) => [
        'Predicted operational growth requires proactive scaling',
        'Anticipated regulatory changes need compliance preparation',
        'Expected security threats require enhanced defenses'
      ]
    }

    return insights[type]?.(data) || ['Cross-domain analysis in progress']
  }

  /**
   * Get global system health and governance score
   */
  async getGlobalSystemHealthScore(): Promise<number> {
    const metrics = await this.fetchGlobalMetrics()
    const weights = {
      systemHealth: 0.25,
      governanceCompliance: 0.2,
      globalSecurityScore: 0.2,
      subsystemIntegration: 0.15,
      governanceFirewallStatus: 0.1,
      decisionEngineEfficiency: 0.1
    }

    const score = (
      metrics.systemHealth * weights.systemHealth +
      metrics.governanceCompliance * weights.governanceCompliance +
      metrics.globalSecurityScore * weights.globalSecurityScore +
      metrics.subsystemIntegration * weights.subsystemIntegration +
      metrics.governanceFirewallStatus * weights.governanceFirewallStatus +
      metrics.decisionEngineEfficiency * weights.decisionEngineEfficiency
    )

    return Math.round(Math.max(0, Math.min(100, score)))
  }

  /**
   * Get planetary intelligence assessment
   */
  async getPlanetaryIntelligenceAssessment(): Promise<{
    intelligenceScore: number
    correlationStrength: number
    predictionAccuracy: number
    planetaryInsights: string[]
    globalRiskLevel: 'low' | 'medium' | 'high' | 'critical'
  }> {
    const metrics = await this.fetchGlobalMetrics()
    const intelligence = await this.getGlobalIntelligence()

    const intelligenceScore = metrics.planetaryIntelligence
    const correlationStrength = metrics.crossDomainCorrelations
    const predictionAccuracy = intelligence.reduce((acc, item) => acc + item.confidence, 0) / intelligence.length || 0

    const planetaryInsights = intelligence.flatMap(item => item.crossDomainInsights || [])
    const avgRisk = intelligence.reduce((acc, item) => {
      const riskMap = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 }
      return acc + (riskMap[item.type as keyof typeof riskMap] || 1)
    }, 0) / intelligence.length

    let globalRiskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (avgRisk >= 3.5) globalRiskLevel = 'critical'
    else if (avgRisk >= 2.5) globalRiskLevel = 'high'
    else if (avgRisk >= 1.5) globalRiskLevel = 'medium'

    return {
      intelligenceScore: Math.round(intelligenceScore),
      correlationStrength: Math.round(correlationStrength),
      predictionAccuracy: Math.round(predictionAccuracy * 100),
      planetaryInsights: [...new Set(planetaryInsights)].slice(0, 5),
      globalRiskLevel
    }
  }

  /**
   * Validate global system and governance metrics access for SuperAdmin role
   */
  static validateSuperAdminMetricsAccess(metricKey: string): boolean {
    const allowedMetrics = [
      'system_health',
      'governance_compliance',
      'cross_domain_correlations',
      'marp_signatures',
      'global_security_score',
      'subsystem_integration',
      'decision_engine_efficiency',
      'planetary_intelligence',
      'emergency_response_readiness',
      'governance_firewall_status'
    ]

    return allowedMetrics.includes(metricKey)
  }
}

export default SuperAdminCSIService
