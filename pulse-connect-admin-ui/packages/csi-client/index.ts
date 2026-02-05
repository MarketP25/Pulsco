// CSI Client for Pulsco Admin Governance System
// Handles metrics fetching, confidence scoring, and real-time intelligence streams

import WebSocket from 'ws';
import { EventSource } from 'eventsource';
import { SignedMetricBundle, AdminRoleType } from '@pulsco/admin-shared-types';

export interface CSIMetricsRequest {
  adminRole: AdminRoleType;
  metricKeys?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
}

export interface CSIMetricsResponse {
  metrics: Record<string, any>;
  confidence: Record<string, number>;
  freshness: Record<string, number>;
  anomalies: string[];
  timestamp: Date;
}

export interface CSIAnomaly {
  metric: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
  timestamp: Date;
}

export interface CSIIntelligenceStream {
  type: 'anomaly' | 'trend' | 'correlation' | 'prediction';
  data: any;
  confidence: number;
  timestamp: Date;
}

export interface CSIClientConfig {
  apiBaseUrl: string;
  wsUrl: string;
  sseUrl: string;
  authToken: string;
  reconnectInterval: number;
  maxRetries: number;
}

export class CSIClient {
  private config: CSIClientConfig;
  private ws: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private intelligenceListeners: ((stream: CSIIntelligenceStream) => void)[] = [];
  private anomalyListeners: ((anomaly: CSIAnomaly) => void)[] = [];

  constructor(config: CSIClientConfig) {
    this.config = config;
  }

  /**
   * Fetch metrics for a specific admin role with confidence scoring
   */
  async fetchMetrics(request: CSIMetricsRequest): Promise<CSIMetricsResponse> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/csi/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`CSI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        metrics: data.metrics,
        confidence: data.confidence,
        freshness: data.freshness,
        anomalies: data.anomalies || [],
        timestamp: new Date(data.timestamp)
      };
    } catch (error) {
      console.error('Failed to fetch CSI metrics:', error);
      throw error;
    }
  }

  /**
   * Fetch signed metric bundles from MARP
   */
  async fetchSignedBundles(adminRole: AdminRoleType): Promise<SignedMetricBundle[]> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/csi/signed-bundles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`,
          'X-Admin-Role': adminRole
        }
      });

      if (!response.ok) {
        throw new Error(`Signed bundles API error: ${response.status}`);
      }

      const data = await response.json();
      return data.bundles.map((bundle: any) => ({
        id: bundle.id,
        metrics: bundle.metrics,
        signature: bundle.signature,
        signer: bundle.signer,
        timestamp: new Date(bundle.timestamp),
        scope: bundle.scope,
        confidenceScore: bundle.confidenceScore,
        freshness: bundle.freshness,
        hashChain: bundle.hashChain
      }));
    } catch (error) {
      console.error('Failed to fetch signed bundles:', error);
      throw error;
    }
  }

  /**
   * Get CSI health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    components: Record<string, 'healthy' | 'degraded' | 'critical'>;
    lastCheck: Date;
  }> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/csi/health`, {
        headers: {
          'Authorization': `Bearer ${this.config.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Health API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: data.status,
        components: data.components,
        lastCheck: new Date(data.lastCheck)
      };
    } catch (error) {
      console.error('Failed to get CSI health:', error);
      return {
        status: 'critical',
        components: {},
        lastCheck: new Date()
      };
    }
  }

  /**
   * Connect to real-time intelligence WebSocket
   */
  connectIntelligenceStream(): void {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(`${this.config.wsUrl}/csi/intelligence`, {
      headers: {
        'Authorization': `Bearer ${this.config.authToken}`
      }
    });

    this.ws.on('open', () => {
      console.log('CSI intelligence stream connected');
      this.reconnectAttempts = 0;
    });

    this.ws.on('message', (data: Buffer) => {
      try {
        const stream: CSIIntelligenceStream = JSON.parse(data.toString());
        this.intelligenceListeners.forEach(listener => listener(stream));
      } catch (error) {
        console.error('Failed to parse intelligence stream:', error);
      }
    });

    this.ws.on('error', (error) => {
      console.error('CSI WebSocket error:', error);
    });

    this.ws.on('close', () => {
      console.log('CSI intelligence stream disconnected');
      this.scheduleReconnect();
    });
  }

  /**
   * Connect to anomaly SSE stream
   */
  connectAnomalyStream(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(`${this.config.sseUrl}/csi/anomalies`, {
      headers: {
        'Authorization': `Bearer ${this.config.authToken}`
      }
    });

    this.eventSource.onmessage = (event) => {
      try {
        const anomaly: CSIAnomaly = JSON.parse(event.data);
        this.anomalyListeners.forEach(listener => listener(anomaly));
      } catch (error) {
        console.error('Failed to parse anomaly event:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('CSI SSE error:', error);
    };
  }

  /**
   * Add intelligence stream listener
   */
  onIntelligenceStream(listener: (stream: CSIIntelligenceStream) => void): void {
    this.intelligenceListeners.push(listener);
  }

  /**
   * Add anomaly listener
   */
  onAnomaly(listener: (anomaly: CSIAnomaly) => void): void {
    this.anomalyListeners.push(listener);
  }

  /**
   * Remove intelligence stream listener
   */
  offIntelligenceStream(listener: (stream: CSIIntelligenceStream) => void): void {
    const index = this.intelligenceListeners.indexOf(listener);
    if (index > -1) {
      this.intelligenceListeners.splice(index, 1);
    }
  }

  /**
   * Remove anomaly listener
   */
  offAnomaly(listener: (anomaly: CSIAnomaly) => void): void {
    const index = this.anomalyListeners.indexOf(listener);
    if (index > -1) {
      this.anomalyListeners.splice(index, 1);
    }
  }

  /**
   * Disconnect all streams
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.intelligenceListeners = [];
    this.anomalyListeners = [];
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.config.maxRetries) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting CSI reconnection ${this.reconnectAttempts}/${this.config.maxRetries}`);
        this.connectIntelligenceStream();
      }, this.config.reconnectInterval);
    }
  }

  /**
   * Validate metric access for admin role
   */
  static validateMetricAccess(adminRole: AdminRoleType, metricKey: string): boolean {
    // This would integrate with governance-intent registry
    // For now, allow all metrics for superadmin, restrict others
    if (adminRole === 'superadmin') {
      return true;
    }

    // Implement role-based metric access control
    const roleMetrics: Record<AdminRoleType, string[]> = {
      'superadmin': ['*'],
      'coo': ['cpu_utilization', 'memory_usage', 'disk_usage', 'network_throughput', 'active_connections'],
      'business-ops': ['daily_revenue', 'active_users', 'transaction_volume', 'conversion_rate', 'churn_rate'],
      'people-risk': ['risk_score', 'compliance_violations', 'security_incidents', 'audit_findings', 'policy_breaches'],
      'procurement-partnerships': ['vendor_sla_compliance', 'partnership_revenue', 'procurement_costs', 'vendor_response_time'],
      'legal-finance': ['cash_flow', 'legal_violations', 'regulatory_compliance', 'financial_ratios', 'audit_status'],
      'commercial-outreach': ['market_penetration', 'regional_growth', 'customer_acquisition_cost', 'brand_awareness'],
      'tech-security': ['security_threats', 'vulnerability_count', 'patch_compliance', 'infrastructure_health'],
      'customer-experience': ['customer_satisfaction', 'support_response_time', 'resolution_rate', 'nps_score'],
      'governance-registrar': ['audit_compliance', 'governance_violations', 'policy_adherence', 'decision_latency']
    };

    const allowedMetrics = roleMetrics[adminRole] || [];
    return allowedMetrics.includes('*') || allowedMetrics.includes(metricKey);
  }
}

export default CSIClient;
