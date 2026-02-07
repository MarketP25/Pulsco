// Tech Security Dashboard CSI Service
// Handles security monitoring, threat intelligence, and compliance for Tech Security role

import { CSIClient, CSIMetricsRequest, CSIMetricsResponse } from '@pulsco/csi-client'
import { AdminRoleType } from '@pulsco/admin-shared-types'

export interface TechSecurityMetrics {
  threatLevel: string
  activeIncidents: number
  vulnerabilityCount: number
  patchCompliance: number
  securityScore: number
  failedLogins: number
  anomalyDetection: number
  incidentResponseTime: number
  complianceAudits: number
  threatIntelligence: number
}

export interface SecurityAnomaly {
  metric: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  timestamp: Date
  securityImpact: number
  affectedSystems: string[]
}

export interface SecurityIntelligence {
  type: 'anomaly' | 'trend' | 'correlation' | 'prediction'
  data: any
  confidence: number
  timestamp: Date
  recommendations?: string[]
  threatIndicators?: string[]
}

export class TechSecurityCSIService {
  private csiClient: CSIClient
  private role: AdminRoleType = 'tech-security'

  constructor(csiClient: CSIClient) {
    this.csiClient = csiClient
  }

  /**
   * Fetch security and threat metrics for Tech Security dashboard
   */
  async fetchSecurityMetrics(timeRange?: { start: Date; end: Date }): Promise<TechSecurityMetrics> {
    const request: CSIMetricsRequest = {
      adminRole: this.role,
      metricKeys: [
        'threat_level',
        'active_incidents',
        'vulnerability_count',
        'patch_compliance',
        'security_score',
        'failed_logins',
        'anomaly_detection',
        'incident_response_time',
        'compliance_audits',
        'threat_intelligence'
      ],
      timeRange
    }

    const response: CSIMetricsResponse = await this.csiClient.fetchMetrics(request)

    return {
      threatLevel: response.metrics.threat_level || 'low',
      activeIncidents: response.metrics.active_incidents || 0,
      vulnerabilityCount: response.metrics.vulnerability_count || 0,
      patchCompliance: response.metrics.patch_compliance || 0,
      securityScore: response.metrics.security_score || 0,
      failedLogins: response.metrics.failed_logins || 0,
      anomalyDetection: response.metrics.anomaly_detection || 0,
      incidentResponseTime: response.metrics.incident_response_time || 0,
      complianceAudits: response.metrics.compliance_audits || 0,
      threatIntelligence: response.metrics.threat_intelligence || 0
    }
  }

  /**
   * Get security anomalies and threat alerts
   */
  async getSecurityAnomalies(): Promise<SecurityAnomaly[]> {
    const anomalies = await this.csiClient.getAnomalies()

    return anomalies.map(anomaly => ({
      metric: anomaly.metric,
      severity: anomaly.severity,
      description: anomaly.description,
      confidence: anomaly.confidence,
      timestamp: anomaly.timestamp,
      securityImpact: this.calculateSecurityImpact(anomaly.metric, anomaly.severity),
      affectedSystems: this.identifyAffectedSystems(anomaly.metric)
    }))
  }

  /**
   * Get security intelligence and threat insights
   */
  async getSecurityIntelligence(): Promise<SecurityIntelligence[]> {
    const intelligence = await this.csiClient.getIntelligenceStream()

    return intelligence.map(item => ({
      type: item.type,
      data: item.data,
      confidence: item.confidence,
      timestamp: item.timestamp,
      recommendations: this.generateSecurityRecommendations(item.type, item.data),
      threatIndicators: this.extractThreatIndicators(item.type, item.data)
    }))
  }

  /**
   * Calculate security impact of threats and anomalies
   */
  private calculateSecurityImpact(metric: string, severity: string): number {
    const impactMap: Record<string, Record<string, number>> = {
      'threat_level': {
        'high': -500000,
        'critical': -2000000
      },
      'active_incidents': {
        'high': -100000,
        'critical': -500000
      },
      'vulnerability_count': {
        'high': -250000,
        'critical': -1000000
      },
      'security_score': {
        'high': -150000,
        'critical': -750000
      }
    }

    return impactMap[metric]?.[severity] || 0
  }

  /**
   * Identify systems affected by security anomalies
   */
  private identifyAffectedSystems(metric: string): string[] {
    const systemMap: Record<string, string[]> = {
      'threat_level': ['network', 'applications', 'infrastructure'],
      'active_incidents': ['user_systems', 'servers', 'databases'],
      'vulnerability_count': ['web_apps', 'apis', 'infrastructure'],
      'failed_logins': ['authentication', 'user_accounts', 'access_control'],
      'anomaly_detection': ['behavioral_analysis', 'traffic_monitoring', 'system_logs']
    }

    return systemMap[metric] || ['unknown']
  }

  /**
   * Generate security recommendations based on intelligence
   */
  private generateSecurityRecommendations(type: string, data: any): string[] {
    const recommendations: Record<string, (data: any) => string[]> = {
      'anomaly': (data) => [
        'Conduct immediate security incident investigation',
        'Isolate affected systems and contain the breach',
        'Review and update security policies and procedures',
        'Implement additional monitoring and alerting',
        'Prepare incident response and communication plans'
      ],
      'trend': (data) => [
        'Enhance threat detection and prevention capabilities',
        'Update security patching and vulnerability management',
        'Strengthen access controls and authentication',
        'Implement advanced threat intelligence integration',
        'Review and update security awareness training'
      ],
      'correlation': (data) => [
        'Analyze attack patterns and threat actor behaviors',
        'Review security control effectiveness across systems',
        'Implement coordinated threat response protocols',
        'Strengthen security information sharing',
        'Update threat modeling and risk assessments'
      ],
      'prediction': (data) => [
        'Develop proactive threat mitigation strategies',
        'Prepare advanced persistent threat defenses',
        'Update incident response playbooks for predicted scenarios',
        'Strengthen security monitoring and detection capabilities',
        'Implement predictive security analytics'
      ]
    }

    return recommendations[type]?.(data) || ['Monitor closely and review security procedures']
  }

  /**
   * Extract threat indicators from intelligence data
   */
  private extractThreatIndicators(type: string, data: any): string[] {
    const indicators: Record<string, (data: any) => string[]> = {
      'anomaly': (data) => [
        'Unusual network traffic patterns detected',
        'Abnormal authentication attempts observed',
        'Suspicious file system modifications identified',
        'Anomalous user behavior patterns noted'
      ],
      'trend': (data) => [
        'Increasing frequency of security events',
        'Growing number of vulnerability discoveries',
        'Rising authentication failure rates',
        'Expanding attack surface indicators'
      ],
      'correlation': (data) => [
        'Coordinated attack patterns identified',
        'Related security events correlated',
        'Attack chain progression detected',
        'Multi-system compromise indicators'
      ],
      'prediction': (data) => [
        'Potential zero-day exploit indicators',
        'Advanced persistent threat precursors',
        'Supply chain attack risk signals',
        'Ransomware campaign indicators'
      ]
    }

    return indicators[type]?.(data) || ['Threat analysis in progress']
  }

  /**
   * Get security posture and threat assessment score
   */
  async getSecurityPostureScore(): Promise<number> {
    const metrics = await this.fetchSecurityMetrics()
    const weights = {
      patchCompliance: 0.2,
      securityScore: 0.25,
      anomalyDetection: 0.15,
      incidentResponseTime: 0.15,
      complianceAudits: 0.1,
      threatIntelligence: 0.15
    }

    const threatLevelScore = metrics.threatLevel === 'low' ? 100 :
                            metrics.threatLevel === 'medium' ? 75 :
                            metrics.threatLevel === 'high' ? 50 : 25

    const score = (
      metrics.patchCompliance * weights.patchCompliance +
      metrics.securityScore * weights.securityScore +
      metrics.anomalyDetection * weights.anomalyDetection +
      (metrics.incidentResponseTime <= 3600 ? 100 : Math.max(0, 100 - (metrics.incidentResponseTime - 3600) / 360)) * weights.incidentResponseTime +
      (metrics.complianceAudits >= 12 ? 100 : metrics.complianceAudits * 8.33) * weights.complianceAudits +
      metrics.threatIntelligence * weights.threatIntelligence +
      threatLevelScore * 0.1 // Additional weight for threat level
    )

    return Math.round(Math.max(0, Math.min(100, score)))
  }

  /**
   * Get comprehensive threat assessment
   */
  async getThreatAssessment(): Promise<{
    overallThreatLevel: 'low' | 'medium' | 'high' | 'critical'
    activeThreats: number
    vulnerabilityRisk: number
    incidentReadiness: number
    recommendations: string[]
    criticalSystems: string[]
  }> {
    const metrics = await this.fetchSecurityMetrics()
    const anomalies = await this.getSecurityAnomalies()

    const threatScore = (metrics.activeIncidents * 10) + (metrics.vulnerabilityCount * 2) + (100 - metrics.securityScore)
    let overallThreatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (threatScore >= 200) overallThreatLevel = 'critical'
    else if (threatScore >= 100) overallThreatLevel = 'high'
    else if (threatScore >= 50) overallThreatLevel = 'medium'

    const vulnerabilityRisk = Math.min(100, metrics.vulnerabilityCount * 5)
    const incidentReadiness = Math.min(100, (3600 / Math.max(metrics.incidentResponseTime, 1)) * 100)

    const recommendations = []
    if (overallThreatLevel === 'critical') recommendations.push('Activate emergency security protocols')
    if (vulnerabilityRisk > 50) recommendations.push('Prioritize critical vulnerability patching')
    if (incidentReadiness < 70) recommendations.push('Improve incident response capabilities')

    const criticalSystems = anomalies.flatMap(a => a.affectedSystems).filter((v, i, a) => a.indexOf(v) === i)

    return {
      overallThreatLevel,
      activeThreats: metrics.activeIncidents,
      vulnerabilityRisk: Math.round(vulnerabilityRisk),
      incidentReadiness: Math.round(incidentReadiness),
      recommendations,
      criticalSystems
    }
  }

  /**
   * Validate security and threat metrics access for Tech Security role
   */
  static validateTechSecurityMetricsAccess(metricKey: string): boolean {
    const allowedMetrics = [
      'threat_level',
      'active_incidents',
      'vulnerability_count',
      'patch_compliance',
      'security_score',
      'failed_logins',
      'anomaly_detection',
      'incident_response_time',
      'compliance_audits',
      'threat_intelligence'
    ]

    return allowedMetrics.includes(metricKey)
  }
}

export default TechSecurityCSIService
