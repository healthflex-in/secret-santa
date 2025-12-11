-- Migration: Add admin_settings table for password storage
-- Run this SQL in your Supabase SQL Editor to add password storage

-- Table for storing admin settings (password)
CREATE TABLE IF NOT EXISTS admin_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);

-- Enable Row Level Security (RLS)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access
CREATE POLICY "Allow public read access" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON admin_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON admin_settings FOR UPDATE USING (true);

-- Insert default admin password if it doesn't exist
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('admin_password', 'secretsanta2024')
ON CONFLICT (setting_key) DO NOTHING;

