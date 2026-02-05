-- Audit Compliance Migration
-- Migration: 009_audit_compliance.sql
-- Description: Enhanced audit logging and compliance tracking for global rollout

-- Compliance Audit Log (GDPR, SOX, etc.)
CREATE TABLE compliance_audit_log (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER,
    session_id VARCHAR(255),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('translation', 'access', 'modification', 'deletion', 'export')),
    compliance_framework VARCHAR(20) NOT NULL CHECK (compliance_framework IN ('gdpr', 'ccpa', 'sox', 'hipaa', 'custom')),
    region_code VARCHAR(5),
    data_subject_id INTEGER,
    data_categories JSONB,
    processing_purpose VARCHAR(100),
    legal_basis VARCHAR(100),
    consent_given BOOLEAN,
    consent_timestamp TIMESTAMP WITH TIME ZONE,
    retention_period_days INTEGER,
    data_residency_compliant BOOLEAN NOT NULL DEFAULT true,
    export_control_compliant BOOLEAN NOT NULL DEFAULT true,
    audit_trail JSONB NOT NULL,
    risk_score DECIMAL(3,2),
    flagged_for_review BOOLEAN NOT NULL DEFAULT false,
    reviewed_by INTEGER,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Data Residency Tracking
CREATE TABLE data_residency_tracking (
    id SERIAL PRIMARY KEY,
    data_id VARCHAR(255) NOT NULL UNIQUE,
    data_type VARCHAR(50) NOT NULL,
    owner_region VARCHAR(5) NOT NULL,
    storage_regions JSONB NOT NULL,
    transfer_log JSONB,
    residency_policy_version VARCHAR(50),
    compliance_status VARCHAR(20) NOT NULL DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'non_compliant', 'under_review')),
    last_audited TIMESTAMP WITH TIME ZONE,
    next_audit_due TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Export Control Tracking
CREATE TABLE export_control_tracking (
    id SERIAL PRIMARY KEY,
    export_id VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    source_region VARCHAR(5) NOT NULL,
    destination_region VARCHAR(5) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    content_classification VARCHAR(50),
    encryption_used BOOLEAN NOT NULL DEFAULT true,
    export_license_required BOOLEAN NOT NULL DEFAULT false,
    export_license_number VARCHAR(100),
    screening_result VARCHAR(20) CHECK (screening_result IN ('approved', 'denied', 'pending', 'escalated')),
    denied_reason TEXT,
    compliance_officer_id INTEGER,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Content Moderation Log
CREATE TABLE content_moderation_log (
    id SERIAL PRIMARY KEY,
    content_id VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    content_type VARCHAR(20) NOT NULL,
    source_language VARCHAR(3),
    target_language VARCHAR(3),
    content_hash VARCHAR(64) NOT NULL,
    moderation_engine VARCHAR(50) NOT NULL,
    risk_score DECIMAL(3,2) NOT NULL,
    risk_categories JSONB,
    action_taken VARCHAR(20) NOT NULL CHECK (action_taken IN ('allow', 'block', 'flag', 'modify')),
    moderator_id INTEGER,
    moderated_at TIMESTAMP WITH TIME ZONE,
    appeal_status VARCHAR(20) CHECK (appeal_status IN ('none', 'pending', 'approved', 'denied')),
    appeal_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Privacy Impact Assessments
CREATE TABLE privacy_impact_assessments (
    id SERIAL PRIMARY KEY,
    assessment_id VARCHAR(255) NOT NULL UNIQUE,
    feature_name VARCHAR(100) NOT NULL,
    regions_affected JSONB,
    data_processing_description TEXT NOT NULL,
    data_subjects_affected JSONB,
    privacy_risks JSONB,
    mitigation_measures JSONB,
    dpo_review_required BOOLEAN NOT NULL DEFAULT true,
    dpo_reviewed_by INTEGER,
    dpo_reviewed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'rejected')),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Incident Response Log
CREATE TABLE incident_response_log (
    id SERIAL PRIMARY KEY,
    incident_id VARCHAR(255) NOT NULL UNIQUE,
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    affected_regions JSONB,
    affected_users INTEGER,
    description TEXT NOT NULL,
    root_cause TEXT,
    impact_assessment JSONB,
    response_actions JSONB,
    resolution_time_minutes INTEGER,
    reported_by INTEGER NOT NULL,
    assigned_to INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_compliance_audit_log_event_id ON compliance_audit_log (event_id);
CREATE INDEX idx_compliance_audit_log_user_id ON compliance_audit_log (user_id);
CREATE INDEX idx_compliance_audit_log_framework ON compliance_audit_log (compliance_framework);
CREATE INDEX idx_compliance_audit_log_flagged ON compliance_audit_log (flagged_for_review);
CREATE INDEX idx_data_residency_tracking_data_id ON data_residency_tracking (data_id);
CREATE INDEX idx_data_residency_tracking_status ON data_residency_tracking (compliance_status);
CREATE INDEX idx_export_control_tracking_export_id ON export_control_tracking (export_id);
CREATE INDEX idx_export_control_tracking_screening ON export_control_tracking (screening_result);
CREATE INDEX idx_content_moderation_log_content_id ON content_moderation_log (content_id);
CREATE INDEX idx_content_moderation_log_risk_score ON content_moderation_log (risk_score);
CREATE INDEX idx_privacy_impact_assessments_status ON privacy_impact_assessments (status);
CREATE INDEX idx_incident_response_log_status ON incident_response_log (status);
CREATE INDEX idx_incident_response_log_severity ON incident_response_log (severity);

-- Triggers
CREATE TRIGGER update_data_residency_tracking_updated_at BEFORE UPDATE ON data_residency_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_privacy_impact_assessments_updated_at BEFORE UPDATE ON privacy_impact_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incident_response_log_updated_at BEFORE UPDATE ON incident_response_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample compliance data
INSERT INTO compliance_audit_log (event_id, user_id, event_type, compliance_framework, region_code, data_categories, processing_purpose, legal_basis, consent_given, audit_trail) VALUES
('audit_001', 1, 'translation', 'gdpr', 'EU', '["personal_data", "communication_data"]', 'language_translation', 'consent', true, '{"ip_address": "192.168.1.1", "user_agent": "Chrome/91.0", "timestamp": "2023-01-01T10:00:00Z"}'),
('audit_002', 2, 'access', 'ccpa', 'US', '["personal_data"]', 'user_profile_access', 'legitimate_interest', false, '{"access_type": "read", "fields_accessed": ["name", "email"]}');

INSERT INTO data_residency_tracking (data_id, data_type, owner_region, storage_regions, residency_policy_version, compliance_status) VALUES
('translation_123', 'translation_data', 'EU', '["EU", "US"]', 'gdpr_v1.0', 'compliant'),
('user_profile_456', 'user_data', 'US', '["US"]', 'ccpa_v1.0', 'compliant');

INSERT INTO content_moderation_log (content_id, user_id, content_type, risk_score, risk_categories, action_taken, moderation_engine) VALUES
('content_001', 1, 'text', 0.05, '[]', 'allow', 'automated_filter'),
('content_002', 2, 'text', 0.85, '["hate_speech"]', 'block', 'ai_moderator');

INSERT INTO privacy_impact_assessments (assessment_id, feature_name, regions_affected, data_processing_description, status) VALUES
('pia_001', 'global_translation', '["US", "EU", "CN"]', 'Processing user content for translation across multiple languages and regions', 'approved');
