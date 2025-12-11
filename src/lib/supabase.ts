import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xzhrepiwlthlhetzjygj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aHJlcGl3bHRobGhldHpqeWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTI2MTcsImV4cCI6MjA4MTAyODYxN30.2ivS5Szj4eUYT4mZODwrFxndDNTTo6TA2lX2wTXa5Rw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

