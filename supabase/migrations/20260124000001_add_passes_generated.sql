-- Add passes_generated column to teams table
ALTER TABLE teams ADD COLUMN passes_generated BOOLEAN NOT NULL DEFAULT false;

-- Index for faster queries
CREATE INDEX idx_teams_passes_generated ON teams(passes_generated);