-- Tutoring and Clubs Schema for AGENTLAND.SAARLAND
-- Migration: 20250106_tutoring_clubs_integration.sql

-- Tutoring services
CREATE TABLE IF NOT EXISTS tutoring_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  website TEXT,
  subjects TEXT[], -- Array of subjects like ['Mathematik', 'Deutsch', 'Englisch']
  levels TEXT[], -- Array like ['Grundschule', 'Gymnasium', 'Realschule', 'Universität']
  location_type VARCHAR(50) CHECK (location_type IN ('online', 'in_person', 'hybrid')),
  address TEXT,
  city VARCHAR(100) DEFAULT 'Saarbrücken',
  price_range VARCHAR(100), -- e.g. "15-25€ pro Stunde"
  availability JSONB, -- Flexible availability schedule
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clubs and associations (Vereine)
CREATE TABLE IF NOT EXISTS saarland_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  club_type VARCHAR(100), -- 'Sportverein', 'Kulturverein', 'Sozialverein', etc.
  category VARCHAR(100), -- 'Fußball', 'Tennis', 'Musik', 'Kultur', etc.
  description TEXT,
  founded_year INTEGER,
  membership_count INTEGER,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  website TEXT,
  social_media JSONB, -- {'facebook': 'url', 'instagram': 'url'}
  address TEXT,
  city VARCHAR(100) DEFAULT 'Saarbrücken',
  postal_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  meeting_schedule TEXT,
  membership_fee VARCHAR(100),
  age_groups TEXT[], -- ['Kinder', 'Jugendliche', 'Erwachsene', 'Senioren']
  facilities TEXT[], -- Available facilities
  achievements TEXT[], -- Recent achievements or honors
  events JSONB, -- Upcoming events
  is_active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Football specific data (SAARFUSSBALL)
CREATE TABLE IF NOT EXISTS saarland_football_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES saarland_clubs(id),
  saarland_verband_id VARCHAR(50), -- Official SFV ID
  league_name VARCHAR(255),
  league_level VARCHAR(100), -- 'Verbandsliga', 'Landesliga', 'Bezirksliga', etc.
  season VARCHAR(10) DEFAULT '2024/25',
  team_name VARCHAR(255),
  home_stadium VARCHAR(255),
  stadium_capacity INTEGER,
  current_position INTEGER,
  points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  last_match_date DATE,
  next_match_date DATE,
  coach_name VARCHAR(255),
  team_colors VARCHAR(100),
  founded_year INTEGER,
  stadium_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Football matches (SAARFUSSBALL specific)
CREATE TABLE IF NOT EXISTS saarland_football_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_club_id UUID REFERENCES saarland_football_clubs(id),
  away_club_id UUID REFERENCES saarland_football_clubs(id),
  league_name VARCHAR(255),
  matchday INTEGER,
  match_date TIMESTAMPTZ,
  kickoff_time TIME,
  home_goals INTEGER,
  away_goals INTEGER,
  match_status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'live', 'finished', 'postponed'
  stadium VARCHAR(255),
  attendance INTEGER,
  weather_conditions VARCHAR(100),
  referee VARCHAR(255),
  match_report TEXT,
  highlights_url TEXT,
  season VARCHAR(10) DEFAULT '2024/25',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutoring reviews and ratings
CREATE TABLE IF NOT EXISTS tutoring_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutoring_service_id UUID REFERENCES tutoring_services(id),
  reviewer_name VARCHAR(255),
  subject VARCHAR(100),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Club membership tracking
CREATE TABLE IF NOT EXISTS club_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES saarland_clubs(id),
  user_id UUID, -- References auth.users when implemented
  membership_type VARCHAR(100), -- 'Vollmitglied', 'Fördermitglied', 'Jugendmitglied'
  join_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  fees_paid BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tutoring_services_subjects ON tutoring_services USING GIN (subjects);
CREATE INDEX IF NOT EXISTS idx_tutoring_services_levels ON tutoring_services USING GIN (levels);
CREATE INDEX IF NOT EXISTS idx_tutoring_services_city ON tutoring_services(city);
CREATE INDEX IF NOT EXISTS idx_tutoring_services_verified ON tutoring_services(verified);

CREATE INDEX IF NOT EXISTS idx_saarland_clubs_category ON saarland_clubs(category);
CREATE INDEX IF NOT EXISTS idx_saarland_clubs_city ON saarland_clubs(city);
CREATE INDEX IF NOT EXISTS idx_saarland_clubs_active ON saarland_clubs(is_active);
CREATE INDEX IF NOT EXISTS idx_saarland_clubs_verified ON saarland_clubs(verified);

CREATE INDEX IF NOT EXISTS idx_football_clubs_league ON saarland_football_clubs(league_name);
CREATE INDEX IF NOT EXISTS idx_football_clubs_season ON saarland_football_clubs(season);
CREATE INDEX IF NOT EXISTS idx_football_clubs_position ON saarland_football_clubs(current_position);

CREATE INDEX IF NOT EXISTS idx_football_matches_date ON saarland_football_matches(match_date);
CREATE INDEX IF NOT EXISTS idx_football_matches_league ON saarland_football_matches(league_name);
CREATE INDEX IF NOT EXISTS idx_football_matches_status ON saarland_football_matches(match_status);

-- Row Level Security
ALTER TABLE tutoring_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE saarland_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saarland_football_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saarland_football_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_memberships ENABLE ROW LEVEL SECURITY;

-- Public read access for verified services
CREATE POLICY "Public tutoring access" ON tutoring_services
  FOR SELECT USING (verified = true);

CREATE POLICY "Public clubs access" ON saarland_clubs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public football access" ON saarland_football_clubs
  FOR SELECT USING (true);

CREATE POLICY "Public matches access" ON saarland_football_matches
  FOR SELECT USING (true);

CREATE POLICY "Public reviews access" ON tutoring_reviews
  FOR SELECT USING (verified = true);

-- Insert sample data for SAARFUSSBALL
INSERT INTO saarland_clubs (name, club_type, category, description, founded_year, city, website, is_active, verified) VALUES
('1. FC Saarbrücken', 'Sportverein', 'Fußball', 'Traditionsverein aus der Landeshauptstadt', 1903, 'Saarbrücken', 'https://www.fcsaarbruecken.de', true, true),
('SV Elversberg', 'Sportverein', 'Fußball', 'Erfolgreicher Verein aus dem Saarland', 1911, 'Spiesen-Elversberg', 'https://www.sv-elversberg.de', true, true),
('FC Homburg', 'Sportverein', 'Fußball', 'Traditioneller Fußballverein', 1900, 'Homburg', 'https://www.fc-homburg.de', true, true),
('SV Röchling Völklingen', 'Sportverein', 'Fußball', 'Historischer Verein aus Völklingen', 1906, 'Völklingen', 'https://www.sv-roechling.de', true, true);

INSERT INTO saarland_football_clubs (club_id, league_name, league_level, team_name, home_stadium, current_position, points, games_played, wins, draws, losses, goals_for, goals_against, coach_name, team_colors, founded_year) VALUES
((SELECT id FROM saarland_clubs WHERE name = '1. FC Saarbrücken'), '3. Liga', 'Profi', '1. FC Saarbrücken', 'Hermann-Neuberger-Stadion', 8, 32, 20, 9, 5, 6, 28, 24, 'Rüdiger Ziehl', 'Blau-Schwarz', 1903),
((SELECT id FROM saarland_clubs WHERE name = 'SV Elversberg'), '2. Bundesliga', 'Profi', 'SV 07 Elversberg', 'URSAPHARM-Arena an der Kaiserlinde', 12, 24, 18, 6, 6, 6, 22, 26, 'Horst Steffen', 'Blau-Gelb', 1911),
((SELECT id FROM saarland_clubs WHERE name = 'FC Homburg'), 'Regionalliga Südwest', 'Regional', 'FC 08 Homburg', 'Waldstadion Homburg', 3, 45, 22, 14, 3, 5, 42, 18, 'Timo Wenzel', 'Grün-Weiß', 1900);

-- Insert sample tutoring services
INSERT INTO tutoring_services (provider_name, subjects, levels, location_type, city, price_range, verified) VALUES
('Lernhilfe Saarbrücken', ARRAY['Mathematik', 'Physik', 'Chemie'], ARRAY['Gymnasium', 'Realschule'], 'hybrid', 'Saarbrücken', '20-30€ pro Stunde', true),
('Nachhilfe Plus', ARRAY['Deutsch', 'Englisch', 'Französisch'], ARRAY['Grundschule', 'Gymnasium'], 'in_person', 'Neunkirchen', '15-25€ pro Stunde', true),
('StudyBuddy Online', ARRAY['Informatik', 'Mathematik', 'Englisch'], ARRAY['Universität', 'Gymnasium'], 'online', 'Saarbrücken', '25-35€ pro Stunde', true),
('Sprachtraining Saar', ARRAY['Französisch', 'Englisch', 'Spanisch'], ARRAY['Erwachsenenbildung', 'Gymnasium'], 'hybrid', 'Saarlouis', '18-28€ pro Stunde', true);