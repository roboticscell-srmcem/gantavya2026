-- ============================================
-- GANTAVYA - COMPLETE PRODUCTION DATABASE SCHEMA
-- Generated: January 22, 2026
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: events
-- Main events table for Gantavya fest
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    brief TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    
    min_team_size INT NOT NULL CHECK (min_team_size > 0),
    max_team_size INT NOT NULL CHECK (max_team_size >= min_team_size),
    
    rulebook_url TEXT,
    banner_url TEXT,
    
    entry_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    prize_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    prize_currency TEXT NOT NULL DEFAULT 'INR',
    
    start_time TIMESTAMP WITH TIME ZONE,
    venue TEXT,
    
    visibility TEXT NOT NULL DEFAULT 'draft' CHECK (visibility IN ('draft', 'public', 'hidden', 'archived')),
    registration_open BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for events
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_visibility ON events(visibility);

COMMENT ON TABLE events IS 'Main events table for Gantavya fest';
COMMENT ON COLUMN events.banner_url IS 'URL to the event banner image (Cloudinary)';
COMMENT ON COLUMN events.rulebook_url IS 'URL to the event rulebook PDF (Cloudinary)';
COMMENT ON COLUMN events.content IS 'Markdown content for detailed event description';

-- ============================================
-- TABLE: event_rules
-- Rules for each event
-- ============================================
CREATE TABLE event_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    rule_text TEXT NOT NULL
);

CREATE INDEX idx_event_rules_event_id ON event_rules(event_id);

-- ============================================
-- TABLE: teams
-- Registered teams for events
-- ============================================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    
    team_name TEXT NOT NULL,
    college_name TEXT NOT NULL,
    
    captain_name TEXT NOT NULL,
    captain_email TEXT NOT NULL UNIQUE,
    
    total_amount_payable NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    
    has_paid BOOLEAN NOT NULL DEFAULT false,
    passes_generated BOOLEAN NOT NULL DEFAULT false,
    
    payment_gateway TEXT NOT NULL DEFAULT 'razorpay',
    payment_order_id TEXT UNIQUE,
    payment_mode TEXT CHECK (payment_mode IN ('upi', 'card', 'netbanking')),
    payment_status TEXT NOT NULL DEFAULT 'created' CHECK (payment_status IN ('created', 'captured', 'failed')),
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_teams_event_id ON teams(event_id);
CREATE INDEX idx_teams_captain_email ON teams(captain_email);
CREATE INDEX idx_teams_payment_order_id ON teams(payment_order_id);
CREATE INDEX idx_teams_has_paid ON teams(has_paid);

-- ============================================
-- TABLE: team_members
-- Members of each team
-- ============================================
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    
    member_name TEXT NOT NULL,
    member_email TEXT NOT NULL,
    member_contact TEXT NOT NULL,
    
    role TEXT NOT NULL CHECK (role IN ('captain', 'member')),
    
    pass_url TEXT,  -- Cloudinary URL for member's unique pass
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, member_email)
);

-- Ensure only one captain per team
CREATE UNIQUE INDEX idx_team_members_captain ON team_members(team_id) WHERE role = 'captain';
CREATE INDEX idx_team_members_team_id ON team_members(team_id);

-- ============================================
-- TABLE: admin_users
-- Admin users for managing the platform
-- ============================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    access_code TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);

-- ============================================
-- TABLE: access_codes
-- Rotating access codes for admin registration
-- ============================================
CREATE TABLE access_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_access_codes_active ON access_codes(is_active, code);

-- ============================================
-- TRIGGER: Enforce max_team_size
-- ============================================
CREATE OR REPLACE FUNCTION check_team_size()
RETURNS TRIGGER AS $$
DECLARE
    current_size INT;
    max_size INT;
BEGIN
    -- Get current team size
    SELECT COUNT(*) INTO current_size
    FROM team_members
    WHERE team_id = NEW.team_id AND is_active = true;
    
    -- Get max team size for the event
    SELECT e.max_team_size INTO max_size
    FROM events e
    INNER JOIN teams t ON t.event_id = e.id
    WHERE t.id = NEW.team_id;
    
    -- Check if adding this member would exceed max
    IF current_size >= max_size THEN
        RAISE EXCEPTION 'Team has reached maximum size of % members', max_size;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_team_size
BEFORE INSERT ON team_members
FOR EACH ROW
EXECUTE FUNCTION check_team_size();

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEW: event_kpis
-- Key performance indicators for events
-- ============================================
CREATE OR REPLACE VIEW event_kpis AS
SELECT 
    e.id AS event_id,
    e.name AS event_name,
    e.visibility,
    COUNT(DISTINCT t.id) AS total_teams,
    COUNT(DISTINCT tm.id) AS total_participants,
    COUNT(DISTINCT CASE WHEN t.has_paid = true THEN t.id END) AS paid_teams,
    COALESCE(SUM(CASE WHEN t.has_paid = true THEN t.total_amount_payable END), 0) AS total_collection
FROM events e
LEFT JOIN teams t ON e.id = t.event_id AND t.is_active = true
LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.is_active = true
GROUP BY e.id, e.name, e.visibility;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- EVENTS POLICIES
-- ============================================

-- Public users can read public events
CREATE POLICY "Public events are viewable by everyone"
ON events FOR SELECT
USING (visibility = 'public');

-- Admins can do everything with events
CREATE POLICY "Admins can view all events"
ON events FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

CREATE POLICY "Admins can insert events"
ON events FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

CREATE POLICY "Admins can update events"
ON events FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

CREATE POLICY "Admins can delete events"
ON events FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- ============================================
-- EVENT_RULES POLICIES
-- ============================================

-- Public users can read rules for public events
CREATE POLICY "Rules for public events are viewable"
ON event_rules FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM events
        WHERE events.id = event_rules.event_id
        AND events.visibility = 'public'
    )
);

-- Admins can manage all rules
CREATE POLICY "Admins can view all rules"
ON event_rules FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

CREATE POLICY "Admins can insert rules"
ON event_rules FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

CREATE POLICY "Admins can update rules"
ON event_rules FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

CREATE POLICY "Admins can delete rules"
ON event_rules FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- ============================================
-- TEAMS POLICIES
-- ============================================

-- Public users can insert teams (registration)
CREATE POLICY "Anyone can register teams"
ON teams FOR INSERT
WITH CHECK (true);

-- Teams cannot read other teams
CREATE POLICY "Teams cannot view other teams"
ON teams FOR SELECT
USING (false);

-- Admins can view all teams
CREATE POLICY "Admins can view all teams"
ON teams FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- Admins can update teams
CREATE POLICY "Admins can update teams"
ON teams FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- ============================================
-- TEAM_MEMBERS POLICIES
-- ============================================

-- Public users can insert members during registration
CREATE POLICY "Anyone can add team members during registration"
ON team_members FOR INSERT
WITH CHECK (true);

-- Members cannot read other members
CREATE POLICY "Members cannot view others"
ON team_members FOR SELECT
USING (false);

-- Admins can view all members
CREATE POLICY "Admins can view all members"
ON team_members FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- Admins can update members
CREATE POLICY "Admins can update members"
ON team_members FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- ============================================
-- ADMIN_USERS POLICIES
-- ============================================

-- Only super_admins can manage admin_users
CREATE POLICY "Super admins can view admin users"
ON admin_users FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
        AND admin_users.role = 'super_admin'
    )
);

CREATE POLICY "Super admins can insert admin users"
ON admin_users FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
        AND admin_users.role = 'super_admin'
    )
);

CREATE POLICY "Super admins can update admin users"
ON admin_users FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
        AND admin_users.role = 'super_admin'
    )
);

CREATE POLICY "Super admins can delete admin users"
ON admin_users FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
        AND admin_users.role = 'super_admin'
    )
);

-- ============================================
-- ACCESS_CODES POLICIES
-- ============================================

CREATE POLICY "Anyone can check access codes"
ON access_codes FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage access codes"
ON access_codes FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert a default access code (CHANGE THIS IMMEDIATELY IN PRODUCTION!)
INSERT INTO access_codes (code, is_active) 
VALUES ('GANTAVYA2026', true)
ON CONFLICT (code) DO NOTHING;
