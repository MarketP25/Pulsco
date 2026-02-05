-- Regional Fee Policies Migration
-- Migration: 007_regional_fee_policies.sql
-- Description: Regional pricing matrices and dynamic fee policies for global rollout

-- Regional Pricing Matrix (base rates by region)
CREATE TABLE regional_pricing_matrix (
    id SERIAL PRIMARY KEY,
    region_code VARCHAR(5) NOT NULL, -- ISO 3166-1 alpha-2
    currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
    base_multiplier DECIMAL(5,4) NOT NULL DEFAULT 1.0, -- Regional cost multiplier
    text_translation_per_char DECIMAL(10,6) NOT NULL,
    speech_translation_per_minute DECIMAL(10,4) NOT NULL,
    video_translation_per_minute DECIMAL(10,4) NOT NULL,
    sign_translation_per_minute DECIMAL(10,4) NOT NULL,
    premium_multiplier DECIMAL(5,4) NOT NULL DEFAULT 2.0, -- Premium quality multiplier
    ultra_multiplier DECIMAL(5,4) NOT NULL DEFAULT 3.0, -- Ultra quality multiplier
    batch_discount DECIMAL(5,4) NOT NULL DEFAULT 0.1, -- 10% discount for batches
    enterprise_discount DECIMAL(5,4) NOT NULL DEFAULT 0.2, -- 20% discount for enterprise
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    effective_to TIMESTAMP WITH TIME ZONE NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(region_code, effective_from)
);

-- Dynamic Fee Rules (time-based, demand-based pricing)
CREATE TABLE dynamic_fee_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    region_codes TEXT[], -- NULL for global rules
    language_pairs TEXT[], -- Specific language pairs, NULL for all
    condition_type VARCHAR(50) NOT NULL CHECK (condition_type IN ('time', 'demand', 'quality', 'volume')),
    condition_params JSONB NOT NULL, -- e.g., {"hour_start": 9, "hour_end": 17}
    fee_adjustment DECIMAL(5,4) NOT NULL, -- Multiplier or fixed adjustment
    adjustment_type VARCHAR(20) NOT NULL CHECK (adjustment_type IN ('multiplier', 'fixed', 'percentage')),
    priority INTEGER NOT NULL DEFAULT 0, -- Higher priority rules override lower
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    effective_to TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Fee Policy Versions (version-controlled pricing)
CREATE TABLE fee_policy_versions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    base_policy JSONB NOT NULL, -- Complete pricing structure
    regional_overrides JSONB, -- Region-specific overrides
    dynamic_rules JSONB, -- Dynamic pricing rules
    approved_by INTEGER,
    approved_at TIMESTAMP WITH TIME ZONE,
    deployed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'deployed', 'deprecated')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Provider Cost Tracking (for dynamic pricing)
CREATE TABLE provider_cost_tracking (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    region_code VARCHAR(5),
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('text', 'speech', 'video', 'sign')),
    language_pair VARCHAR(7), -- 'eng-spa' format
    cost_per_unit DECIMAL(10,6) NOT NULL,
    latency_ms INTEGER,
    quality_score DECIMAL(3,2),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(provider, region_code, service_type, language_pair, recorded_at)
);

-- Indexes
CREATE INDEX idx_regional_pricing_matrix_region ON regional_pricing_matrix (region_code);
CREATE INDEX idx_regional_pricing_matrix_active ON regional_pricing_matrix (is_active);
CREATE INDEX idx_dynamic_fee_rules_active ON dynamic_fee_rules (is_active);
CREATE INDEX idx_dynamic_fee_rules_priority ON dynamic_fee_rules (priority DESC);
CREATE INDEX idx_fee_policy_versions_status ON fee_policy_versions (status);
CREATE INDEX idx_provider_cost_tracking_provider ON provider_cost_tracking (provider);
CREATE INDEX idx_provider_cost_tracking_recorded ON provider_cost_tracking (recorded_at);

-- Triggers
CREATE TRIGGER update_regional_pricing_matrix_updated_at BEFORE UPDATE ON regional_pricing_matrix FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_fee_rules_updated_at BEFORE UPDATE ON dynamic_fee_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fee_policy_versions_updated_at BEFORE UPDATE ON fee_policy_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert regional pricing matrices
INSERT INTO regional_pricing_matrix (region_code, base_multiplier, text_translation_per_char, speech_translation_per_minute, video_translation_per_minute, sign_translation_per_minute) VALUES
-- Core markets - standard pricing
('US', 1.0, 0.0001, 0.05, 0.10, 0.08),
('GB', 1.1, 0.00011, 0.055, 0.11, 0.088),
('DE', 1.05, 0.000105, 0.0525, 0.105, 0.084),
('FR', 1.05, 0.000105, 0.0525, 0.105, 0.084),
('IT', 1.0, 0.0001, 0.05, 0.10, 0.08),
('ES', 1.0, 0.0001, 0.05, 0.10, 0.08),
('NL', 1.1, 0.00011, 0.055, 0.11, 0.088),

-- Emerging markets - discounted pricing
('KE', 0.5, 0.00005, 0.025, 0.05, 0.04),
('IN', 0.6, 0.00006, 0.03, 0.06, 0.048),
('BD', 0.5, 0.00005, 0.025, 0.05, 0.04),
('PK', 0.5, 0.00005, 0.025, 0.05, 0.04),
('NG', 0.5, 0.00005, 0.025, 0.05, 0.04),
('ZA', 0.7, 0.00007, 0.035, 0.07, 0.056),

-- Asia Pacific
('CN', 0.8, 0.00008, 0.04, 0.08, 0.064),
('JP', 1.2, 0.00012, 0.06, 0.12, 0.096),
('KR', 1.1, 0.00011, 0.055, 0.11, 0.088),
('SG', 1.0, 0.0001, 0.05, 0.10, 0.08),
('AU', 1.1, 0.00011, 0.055, 0.11, 0.088),

-- Middle East & Africa
('AE', 0.9, 0.00009, 0.045, 0.09, 0.072),
('SA', 0.8, 0.00008, 0.04, 0.08, 0.064),
('EG', 0.6, 0.00006, 0.03, 0.06, 0.048),
('MA', 0.7, 0.00007, 0.035, 0.07, 0.056),

-- Latin America
('BR', 0.8, 0.00008, 0.04, 0.08, 0.064),
('MX', 0.8, 0.00008, 0.04, 0.08, 0.064),
('AR', 0.7, 0.00007, 0.035, 0.07, 0.056),
('CO', 0.7, 0.00007, 0.035, 0.07, 0.056),
('CL', 0.8, 0.00008, 0.04, 0.08, 0.064),

-- Eastern Europe
('RU', 0.7, 0.00007, 0.035, 0.07, 0.056),
('PL', 0.8, 0.00008, 0.04, 0.08, 0.064),
('CZ', 0.8, 0.00008, 0.04, 0.08, 0.064),
('HU', 0.8, 0.00008, 0.04, 0.08, 0.064);

-- Insert dynamic fee rules
INSERT INTO dynamic_fee_rules (rule_name, condition_type, condition_params, fee_adjustment, adjustment_type, priority) VALUES
('peak_hours_us', 'time', '{"hour_start": 9, "hour_end": 17, "timezone": "America/New_York"}', 1.2, 'multiplier', 10),
('peak_hours_eu', 'time', '{"hour_start": 8, "hour_end": 18, "timezone": "Europe/London"}', 1.2, 'multiplier', 10),
('high_demand', 'demand', '{"queue_depth_threshold": 100}', 1.5, 'multiplier', 20),
('premium_quality', 'quality', '{"quality": "premium"}', 2.0, 'multiplier', 5),
('ultra_quality', 'quality', '{"quality": "ultra"}', 3.0, 'multiplier', 5),
('bulk_discount_1000', 'volume', '{"min_chars": 1000}', 0.9, 'multiplier', 15),
('bulk_discount_10000', 'volume', '{"min_chars": 10000}', 0.8, 'multiplier', 15);

-- Insert initial fee policy version
INSERT INTO fee_policy_versions (version, description, base_policy, regional_overrides, dynamic_rules, status) VALUES
('v1.0.0-global', 'Global rollout pricing v1.0.0',
 '{
   "text_translation_per_char": 0.0001,
   "speech_translation_per_minute": 0.05,
   "video_translation_per_minute": 0.10,
   "sign_translation_per_minute": 0.08,
   "bundle_100_minutes": 20.00,
   "bundle_500_minutes": 90.00
 }',
 '{
   "KE": {"multiplier": 0.5},
   "IN": {"multiplier": 0.6},
   "CN": {"multiplier": 0.8}
 }',
 '[
   {"name": "peak_hours", "multiplier": 1.2},
   {"name": "high_demand", "multiplier": 1.5}
 ]',
 'approved'
);
