-- Translation Cache Migration
-- Migration: 008_translation_cache.sql
-- Description: Add caching infrastructure for translation performance optimization

-- Translation Cache (already created in 006, but expanding here)
-- Add cache invalidation and performance tracking

-- Cache Invalidation Rules
CREATE TABLE cache_invalidation_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    content_pattern VARCHAR(255), -- Regex pattern for content matching
    language_pattern VARCHAR(10), -- Language code pattern
    provider_pattern VARCHAR(50), -- Provider pattern
    ttl_seconds INTEGER NOT NULL, -- Time to live
    invalidation_reason VARCHAR(100), -- Why cache should be invalidated
    priority INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Cache Performance Metrics
CREATE TABLE cache_performance_metrics (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL,
    hit_count INTEGER NOT NULL DEFAULT 0,
    miss_count INTEGER NOT NULL DEFAULT 0,
    avg_hit_latency_ms INTEGER,
    avg_miss_latency_ms INTEGER,
    cost_savings_usd DECIMAL(10,6),
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(cache_key)
);

-- Batch Translation Jobs (for high-volume requests)
CREATE TABLE batch_translation_jobs (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    total_items INTEGER NOT NULL,
    processed_items INTEGER NOT NULL DEFAULT 0,
    source_language VARCHAR(3) NOT NULL,
    target_languages TEXT[] NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('text', 'speech', 'video')),
    priority VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    estimated_cost_usd DECIMAL(10,6),
    actual_cost_usd DECIMAL(10,6),
    callback_url VARCHAR(500),
    callback_headers JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Batch Translation Items
CREATE TABLE batch_translation_items (
    id SERIAL PRIMARY KEY,
    batch_job_id INTEGER NOT NULL REFERENCES batch_translation_jobs(id) ON DELETE CASCADE,
    item_index INTEGER NOT NULL,
    source_content TEXT NOT NULL,
    translated_content JSONB, -- { "target_lang": "translated_text", ... }
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    processing_time_ms INTEGER,
    cost_usd DECIMAL(10,6),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(batch_job_id, item_index)
);

-- Translation Queue (for load balancing)
CREATE TABLE translation_queue (
    id SERIAL PRIMARY KEY,
    queue_id VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('single', 'batch')),
    request_id VARCHAR(255), -- translation_event.trace_id or batch_job.job_id
    source_language VARCHAR(3) NOT NULL,
    target_language VARCHAR(3) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0, -- Higher = more urgent
    queue_depth INTEGER NOT NULL DEFAULT 0, -- Current queue position
    estimated_processing_time INTEGER, -- Estimated seconds
    region_code VARCHAR(5),
    provider VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_cache_invalidation_rules_active ON cache_invalidation_rules (is_active);
CREATE INDEX idx_cache_performance_metrics_updated ON cache_performance_metrics (last_updated);
CREATE INDEX idx_batch_translation_jobs_user_id ON batch_translation_jobs (user_id);
CREATE INDEX idx_batch_translation_jobs_status ON batch_translation_jobs (status);
CREATE INDEX idx_batch_translation_jobs_expires ON batch_translation_jobs (expires_at);
CREATE INDEX idx_batch_translation_items_batch_job ON batch_translation_items (batch_job_id);
CREATE INDEX idx_batch_translation_items_status ON batch_translation_items (status);
CREATE INDEX idx_translation_queue_status ON translation_queue (status);
CREATE INDEX idx_translation_queue_priority ON translation_queue (priority DESC);
CREATE INDEX idx_translation_queue_region ON translation_queue (region_code);

-- Triggers
CREATE TRIGGER update_cache_invalidation_rules_updated_at BEFORE UPDATE ON cache_invalidation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cache_performance_metrics_updated_at BEFORE UPDATE ON cache_performance_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add TTL to existing translation_cache table
ALTER TABLE translation_cache ADD COLUMN ttl_seconds INTEGER NOT NULL DEFAULT 3600; -- 1 hour default
ALTER TABLE translation_cache ADD COLUMN invalidation_reason VARCHAR(100);

-- Insert default cache invalidation rules
INSERT INTO cache_invalidation_rules (rule_name, content_pattern, language_pattern, ttl_seconds, invalidation_reason, priority) VALUES
('default_text_cache', '.*', '*', 3600, 'standard_ttl', 0),
('frequently_updated_content', '(news|weather|sports).*', '*', 300, 'frequent_updates', 10),
('sensitive_content', '(password|credit|ssn).*', '*', 0, 'never_cache', 100),
('low_quality_translations', NULL, '*', 1800, 'quality_refresh', 5);

-- Insert sample batch job
INSERT INTO batch_translation_jobs (job_id, user_id, total_items, source_language, target_languages, content_type, estimated_cost_usd, expires_at) VALUES
('batch_001', 1, 100, 'eng', ARRAY['spa', 'fra', 'deu'], 'text', 5.00, NOW() + INTERVAL '24 hours');

-- Insert sample queue items
INSERT INTO translation_queue (queue_id, user_id, request_type, request_id, source_language, target_language, priority, region_code) VALUES
('queue_001', 1, 'single', 'translation_123', 'eng', 'spa', 5, 'US'),
('queue_002', 2, 'batch', 'batch_001', 'eng', 'fra', 3, 'EU');
