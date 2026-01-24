-- Add attendance tracking to team_members
-- Migration: 20260124000002_add_attendance_to_team_members.sql

ALTER TABLE team_members
ADD COLUMN is_present BOOLEAN DEFAULT false,
ADD COLUMN attendance_marked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN attendance_marked_by UUID REFERENCES admin_users(id);

-- Index for attendance queries
CREATE INDEX idx_team_members_is_present ON team_members(is_present);
CREATE INDEX idx_team_members_attendance_marked_at ON team_members(attendance_marked_at);

-- Comment
COMMENT ON COLUMN team_members.is_present IS 'Whether the team member attended the event';
COMMENT ON COLUMN team_members.attendance_marked_at IS 'When attendance was marked';
COMMENT ON COLUMN team_members.attendance_marked_by IS 'Admin user who marked attendance';