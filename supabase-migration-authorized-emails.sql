-- Migration: Add authorized_emails table for Google Auth
-- Run this SQL in your Supabase SQL Editor to add email authorization

-- Table for storing authorized email addresses
CREATE TABLE IF NOT EXISTS authorized_emails (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_authorized_emails_email ON authorized_emails(email);

-- Enable Row Level Security (RLS)
ALTER TABLE authorized_emails ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access
CREATE POLICY "Allow public read access" ON authorized_emails FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON authorized_emails FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON authorized_emails FOR DELETE USING (true);
CREATE POLICY "Allow public update access" ON authorized_emails FOR UPDATE USING (true);
