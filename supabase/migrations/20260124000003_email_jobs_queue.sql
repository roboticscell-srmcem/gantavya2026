-- Create email_jobs table for queuing delayed emails
CREATE TABLE email_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type TEXT NOT NULL DEFAULT 'send_pass_email',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    priority INT NOT NULL DEFAULT 1,

    -- Job data
    data JSONB NOT NULL,

    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Error handling
    error_message TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_email_jobs_status ON email_jobs(status);
CREATE INDEX idx_email_jobs_scheduled_at ON email_jobs(scheduled_at);
CREATE INDEX idx_email_jobs_status_scheduled ON email_jobs(status, scheduled_at);

-- Comments
COMMENT ON TABLE email_jobs IS 'Queue for delayed email sending jobs';
COMMENT ON COLUMN email_jobs.data IS 'JSON data containing email details (recipient, content, etc.)';
COMMENT ON COLUMN email_jobs.scheduled_at IS 'When the job should be processed';
COMMENT ON COLUMN email_jobs.retry_count IS 'Number of times this job has been retried';