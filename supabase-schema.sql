-- Supabase Database Schema for Secret Santa App
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Table for storing Secret Santa assignments
CREATE TABLE IF NOT EXISTS assignments (
  id BIGSERIAL PRIMARY KEY,
  giver TEXT NOT NULL,
  receiver TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing participants list
CREATE TABLE IF NOT EXISTS participants (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing viewer log (who has viewed their assignment)
CREATE TABLE IF NOT EXISTS viewer_log (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  receiver TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assignments_giver ON assignments(giver);
CREATE INDEX IF NOT EXISTS idx_participants_name ON participants(name);
CREATE INDEX IF NOT EXISTS idx_viewer_log_name ON viewer_log(name);
CREATE INDEX IF NOT EXISTS idx_viewer_log_viewed_at ON viewer_log(viewed_at DESC);

-- Enable Row Level Security (RLS) - Allow public read/write for this app
-- You may want to restrict this based on your security requirements
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewer_log ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (adjust based on your needs)
CREATE POLICY "Allow public read access" ON assignments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON assignments FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON participants FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON participants FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON viewer_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON viewer_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON viewer_log FOR DELETE USING (true);
