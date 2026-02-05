import { Injectable, Logger } from '@nestjs/common';

export interface CampaignAnalytics {
  campaignId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  cvr: number; // Conversion rate
  costPerClick: number;
  costPerConversion: number;
  totalSpend: number;
  roi: number;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface ProximityAnalytics {
  locationId: string;
  radius: number; // meters
  userDensity: number;
  engagementRate: number;
  conversionRate: number;
  avgDwellTime: number; // seconds
  peakHours: number[];
  demographics: {
    ageGroups: Record<string, number>;
    interests: Record<string, number>;
  };
}

export interface AITestResults {
  testId: string;
  variantA: {
    content: string;
    impressions: number;
    conversions: number;
    confidence: number;
  };
  variantB: {
    content: string;
    impressions: number;
    conversions: number;
    confidence: number;
  };
  winner: 'A' | 'B' | 'tie';
  statisticalSignificance: number; // p-value
  improvement: number; // percentage improvement
  recommendations: string[];
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  // PULSCO Planetary Analytics Engine
  private analyticsEngine = {
    realTimeProcessing: true,
    planetaryScale: true,
    aiPoweredInsights: true,
    privacyPreserving: true,
    federatedLearning: true,
  };

  /**
   * Get comprehensive campaign analytics with AI-powered insights
   */
  async getCampaignAnalytics(
    campaignId: string,
    timeRange: { start: Date; end: Date },
    granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<CampaignAnalytics & {
    insights: string[];
    predictions: {
      nextWeekPerformance: number;
      optimalBudget: number;
      bestTimeToRun: string[];
    };
    anomalies: Array<{
      type: string;
      description: string;
      impact: number;
      timestamp: Date;
    }>;
  }> {
    try {
      this.logger.log(`Generating AI-powered analytics for campaign ${campaignId}`);

      // Get base analytics data
      const baseAnalytics = await this.calculateBaseAnalytics(campaignId, timeRange);

      // Generate AI-powered insights
      const insights = await this.generateAIInsights(baseAnalytics);

      // Generate performance predictions
      const predictions = await this.generatePredictions(baseAnalytics, timeRange);

      // Detect anomalies
      const anomalies = await this.detectAnomalies(campaignId, timeRange);

      return {
        ...baseAnalytics,
        insights,
        predictions,
        anomalies,
      };

    } catch (error) {
      this.logger.error('Campaign analytics generation failed:', error);
      throw new Error(`Analytics generation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get proximity-based location intelligence analytics
   */
  async getProximityAnalytics(
    locationId: string,
    radius: number = 1000, // meters
    timeRange: { start: Date; end: Date }
  ): Promise<ProximityAnalytics & {
    heatmaps: {
      engagement: any; // GeoJSON heatmap data
      conversion: any;
      dwellTime: any;
    };
    optimalPlacement: {
      coordinates: [number, number];
      expectedEngagement: number;
      confidence: number;
    };
    competitorAnalysis: Array<{
      competitorId: string;
      proximity: number; // meters
      marketShare: number;
      threatLevel: 'low' | 'medium' | 'high';
    }>;
  }> {
    try {
      this.logger.log(`Generating proximity analytics for location ${locationId}, radius ${radius}m`);

      // Get base proximity data
      const baseAnalytics = await this.calculateProximityAnalytics(locationId, radius, timeRange);

    return {
      totalCampaigns: campaignStats.totalCampaigns,
      activeCampaigns: campaignStats.activeCampaigns,
      totalActionsSent: actionStats.totalActions,
      totalDeliveries: actionStats.deliveredActions,
      overallOpenRate: actionStats.totalActions > 0 ? actionStats.openedActions / actionStats.totalActions : 0,
      overallClickRate: actionStats.totalActions > 0 ? actionStats.clickedActions / actionStats.totalActions : 0,
      overallConversionRate: actionStats.totalActions > 0 ? actionStats.convertedActions / actionStats.totalActions : 0,
      totalRevenue,
      totalCost,
      overallROI,
      topPerformingCampaigns: campaignStats.topPerforming,
      channelPerformance: actionStats.channelPerformance,
      consentMetrics: consentStats,
      subscriptionMetrics: subscriptionStats,
    };
  }

  /**
   * Get detailed analytics for a specific campaign
   */
  async getCampaignAnalytics(
    campaignId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<CampaignAnalytics> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const dateFilter = startDate && endDate ? {
      createdAt: Between(startDate, endDate),
    } : {};

    const actions = await this.actionRepository.find({
      where: {
        campaignId,
        ...dateFilter,
      },
    });

    const totalActions = actions.length;
    const deliveredActions = actions.filter(a => a.status === 'delivered').length;
    const failedActions = actions.filter(a => a.status === 'failed').length;
    const openedActions = actions.filter(a => a.openedAt).length;
    const clickedActions = actions.filter(a => a.clickedAt).length;
    const convertedActions = actions.filter(a => a.convertedAt).length;

    const openRate = totalActions > 0 ? openedActions / totalActions : 0;
    const clickRate = totalActions > 0 ? clickedActions / totalActions : 0;
    const conversionRate = totalActions > 0 ? convertedActions / totalActions : 0;

    // Calculate revenue and cost (mock calculations)
    const revenue = convertedActions * 25; // Mock conversion value
    const cost = totalActions * 0.01; // Mock cost per action
    const roi = cost > 0 ? (revenue - cost) / cost : 0;

    // Calculate average delivery time
    const deliveredActionTimes = actions
      .filter(a => a.deliveredAt && a.createdAt)
      .map(a => a.deliveredAt!.getTime() - a.createdAt.getTime());
    const avgDeliveryTime = deliveredActionTimes.length > 0
      ? deliveredActionTimes.reduce((sum, time) => sum + time, 0) / deliveredActionTimes.length
      : 0;

    // Channel performance
    const channelStats = this.groupBy(actions, 'channel');
    const topPerformingChannels = Object.entries(channelStats)
      .map(([channel, channelActions]: [string, any[]]) => ({
        channel,
        actions: channelActions.length,
        performance: channelActions.filter(a => a.openedAt || a.clickedAt).length / channelActions.length,
      }))
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 5);

    // Geographic performance (mock data)
    const geographicPerformance = [
      { region: 'North America', actions: Math.floor(totalActions * 0.4), engagement: 0.25 },
      { region: 'Europe', actions: Math.floor(totalActions * 0.3), engagement: 0.22 },
      { region: 'Asia Pacific', actions: Math.floor(totalActions * 0.2), engagement: 0.18 },
      { region: 'Other', actions: Math.floor(totalActions * 0.1), engagement: 0.15 },
    ];

    // Time series data (mock daily data for last 30 days)
    const timeSeriesData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        actions: Math.floor(Math.random() * 100) + 50,
        opens: Math.floor(Math.random() * 50) + 20,
        clicks: Math.floor(Math.random() * 20) + 5,
        conversions: Math.floor(Math.random() * 5) + 1,
      };
    });

    return {
      campaignId,
      campaignName: campaign.name,
      totalActions,
      deliveredActions,
      failedActions,
      openRate,
      clickRate,
      conversionRate,
      revenue,
      cost,
      roi,
      avgDeliveryTime,
      topPerformingChannels,
      geographicPerformance,
      timeSeriesData,
    };
  }

  /**
   * Generate AI-powered targeting insights
   */
  async generateAITargetingInsights(
    campaignId?: string,
    userSegment?: string,
  ): Promise<AITargetingInsights> {
    // Mock AI insights - in real implementation, this would use ML models
    const recommendedAudiences = [
      {
        name: 'High-Value Customers',
        size: 12500,
        expectedEngagement: 0.35,
        confidence: 0.89,
        targetingCriteria: {
          purchaseHistory: 'premium',
          engagementScore: '>80',
          location: 'urban',
        },
      },
      {
        name: 'New User Onboarding',
        size: 8750,
        expectedEngagement: 0.28,
        confidence: 0.76,
        targetingCriteria: {
          accountAge: '<30days',
          hasCompletedOnboarding: false,
        },
      },
      {
        name: 'Lapsed Users',
        size: 15200,
        expectedEngagement: 0.22,
        confidence: 0.82,
        targetingCriteria: {
          lastActivity: '>90days',
          previousEngagement: 'high',
        },
      },
    ];

    const optimalTiming = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      dayOfWeek: Math.floor(Math.random() * 7),
      expectedPerformance: 0.1 + Math.random() * 0.3,
    })).sort((a, b) => b.expectedPerformance - a.expectedPerformance).slice(0, 10);

    const contentOptimization = [
      {
        contentType: 'email',
        recommendedVariations: [
          'Personalized subject lines',
          'Dynamic content blocks',
          'Interactive elements',
        ],
        expectedImprovement: 0.25,
      },
      {
        contentType: 'push',
        recommendedVariations: [
          'Emoji-enhanced messages',
          'Time-sensitive offers',
          'Location-based content',
        ],
        expectedImprovement: 0.18,
      },
    ];

    const churnPrediction = [
      {
        userSegment: 'Free Tier Users',
        churnRisk: 0.65,
        recommendedActions: [
          'Offer upgrade incentives',
          'Highlight premium features',
          'Send re-engagement campaigns',
        ],
      },
      {
        userSegment: 'Low Engagement',
        churnRisk: 0.45,
        recommendedActions: [
          'Personalized onboarding',
          'Feature education campaigns',
          'Usage-based nudges',
        ],
      },
    ];

    return {
      recommendedAudiences,
      optimalTiming,
      contentOptimization,
      churnPrediction,
    };
  }

  /**
   * Get A/B testing results for campaigns
   */
  async getABTestResults(campaignId: string): Promise<{
    testId: string;
    testName: string;
    variants: Array<{
      variantId: string;
      name: string;
      sampleSize: number;
      conversionRate: number;
      confidence: number;
      isWinner: boolean;
    }>;
    statisticalSignificance: number;
    recommendedWinner: string;
  }> {
    // Mock A/B test results
    return {
      testId: 'ab_test_001',
      testName: 'Subject Line Optimization',
      variants: [
        {
          variantId: 'variant_a',
          name: 'Original Subject',
          sampleSize: 5000,
          conversionRate: 0.032,
          confidence: 0.95,
          isWinner: false,
        },
        {
          variantId: 'variant_b',
          name: 'Personalized Subject',
          sampleSize: 5000,
          conversionRate: 0.045,
          confidence: 0.95,
          isWinner: true,
        },
        {
          variantId: 'variant_c',
          name: 'Urgency Subject',
          sampleSize: 5000,
          conversionRate: 0.038,
          confidence: 0.95,
          isWinner: false,
        },
      ],
      statisticalSignificance: 0.99,
      recommendedWinner: 'variant_b',
    };
  }

  /**
   * Export analytics data for compliance reporting
   */
  async exportAnalyticsData(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' | 'pdf' = 'json',
  ): Promise<any> {
    const analytics = await this.getPAPAnalyticsSummary(startDate, endDate);

    switch (format) {
      case 'json':
        return analytics;
      case 'csv':
        return this.convertToCSV(analytics);
      case 'pdf':
        return this.generatePDFReport(analytics);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Helper methods
  private async getCampaignStats(startDate: Date, endDate: Date) {
    const campaigns = await this.campaignRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const activeCampaigns = campaigns.filter(c => c.status === 'running').length;

    // Mock top performing campaigns
    const topPerforming = campaigns
      .map(c => ({
        campaignId: c.id,
        campaignName: c.name,
        roi: Math.random() * 5 + 0.5, // Mock ROI between 0.5x and 5.5x
        revenue: Math.random() * 10000 + 1000,
      }))
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5);

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns,
      topPerforming,
    };
  }

  private async getActionStats(startDate: Date, endDate: Date) {
    const actions = await this.actionRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const totalActions = actions.length;
    const deliveredActions = actions.filter(a => a.status === 'delivered').length;
    const openedActions = actions.filter(a => a.openedAt).length;
    const clickedActions = actions.filter(a => a.clickedAt).length;
    const convertedActions = actions.filter(a => a.convertedAt).length;

    // Mock revenue and cost calculations
    const totalRevenue = convertedActions * 25;
    const totalCost = totalActions * 0.01;

    // Channel performance
    const channelStats = this.groupBy(actions, 'channel');
    const channelPerformance = Object.entries(channelStats)
      .map(([channel, channelActions]: [string, any[]]) => ({
        channel,
        actions: channelActions.length,
        deliveryRate: channelActions.filter(a => a.status === 'delivered').length / channelActions.length,
        engagementRate: channelActions.filter(a => a.openedAt || a.clickedAt).length / channelActions.length,
        costPerAction: 0.01, // Mock cost
      }));

    return {
      totalActions,
      deliveredActions,
      openedActions,
      clickedActions,
      convertedActions,
      totalRevenue,
      totalCost,
      channelPerformance,
    };
  }

  private async getConsentStats(startDate: Date, endDate: Date) {
    const consents = await this.consentRepository.find({
      where: {
        grantedAt: Between(startDate, endDate),
      },
    });

    const activeConsents = consents.filter(c => !c.revokedAt).length;

    const consentByChannel = this.groupBy(consents, 'channel');
    const consentByPurpose = this.groupBy(consents, 'purpose');

    // Calculate revocation rate
    const totalGranted = consents.length;
    const revoked = consents.filter(c => c.revokedAt).length;
    const consentRevocationRate = totalGranted > 0 ? revoked / totalGranted : 0;

    return {
      totalConsents: consents.length,
      activeConsents,
      consentByChannel: Object.keys(consentByChannel).length,
      consentByPurpose: Object.keys(consentByPurpose).length,
      consentRevocationRate,
    };
  }

  private async getSubscriptionStats(startDate: Date, endDate: Date) {
    const subscriptions = await this.subscriptionRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

    // Mock entitlement calculations
    const avgEntitlementsPerUser = 3.2;
    const topEntitlements = [
      { entitlement: 'email_marketing', usage: 85, users: 12500 },
      { entitlement: 'sms_notifications', usage: 72, users: 8900 },
      { entitlement: 'push_alerts', usage: 68, users: 15600 },
    ];

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions,
      avgEntitlementsPerUser,
      topEntitlements,
    };
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion - in real implementation, use a proper CSV library
    return JSON.stringify(data, null, 2);
  }

  private generatePDFReport(data: any): Buffer {
    // Mock PDF generation - in real implementation, use a PDF library
    return Buffer.from(JSON.stringify(data));
  }
}
