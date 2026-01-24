-- Add pass_url to team_members table for storing unique pass URLs
-- This migration adds a field to store Cloudinary URLs for individual member passes

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS pass_url TEXT;

-- Add passes_generated to teams table to track if passes have been generated
ALTER TABLE teams ADD COLUMN IF NOT EXISTS passes_generated BOOLEAN NOT NULL DEFAULT false;

-- Add index for pass_url if needed for queries
CREATE INDEX IF NOT EXISTS idx_team_members_pass_url ON team_members(pass_url);

COMMENT ON COLUMN team_members.pass_url IS 'Cloudinary URL for the member''s unique event pass';
COMMENT ON COLUMN teams.passes_generated IS 'Flag indicating if passes have been generated for all team members';