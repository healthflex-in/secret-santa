# Supabase Setup Instructions

This app now uses Supabase for data persistence across devices. Follow these steps to set up your Supabase database.

## 1. Create Tables in Supabase

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` into the SQL Editor
4. Run the SQL script to create the required tables:
   - `assignments` - stores Secret Santa assignments
   - `participants` - stores participant names
   - `viewer_log` - tracks who has viewed their assignment

## 2. Set Environment Variables

### For Local Development:
Create a `.env` file in the root directory with:
```
VITE_SUPABASE_URL=https://xzhrepiwlthlhetzjygj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aHJlcGl3bHRobGhldHpqeWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTI2MTcsImV4cCI6MjA4MTAyODYxN30.2ivS5Szj4eUYT4mZODwrFxndDNTTo6TA2lX2wTXa5Rw
```

### For Vercel Deployment:
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add the following variables:
   - `VITE_SUPABASE_URL` = `https://xzhrepiwlthlhetzjygj.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aHJlcGl3bHRobGhldHpqeWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTI2MTcsImV4cCI6MjA4MTAyODYxN30.2ivS5Szj4eUYT4mZODwrFxndDNTTo6TA2lX2wTXa5Rw`

## 3. Verify Setup

After setting up:
1. The app will automatically load data from Supabase instead of localStorage
2. All data will persist across devices and browsers
3. Multiple users can access the same Secret Santa assignments

## Notes

- The database uses Row Level Security (RLS) with public read/write access
- You may want to restrict access based on your security requirements
- The app will fall back gracefully if Supabase is unavailable (though data won't persist)
