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

## 4. Configure Google OAuth in Supabase

To enable Google authentication:

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name, user support email, and developer contact
   - Add scopes: `email`, `profile`
   - Add test users (if in testing mode)
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "Secret Santa App" (or any name)
   - Authorized redirect URIs: 
     - `https://xzhrepiwlthlhetzjygj.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/v1/callback` (for local development)
7. Copy the **Client ID** and **Client Secret**

### Step 2: Enable Google Provider in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `xzhrepiwlthlhetzjygj`
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and click to expand
5. Toggle **Enable Google provider**
6. Enter your Google OAuth credentials:
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
7. Click **Save**

### Step 3: Verify Configuration

1. The redirect URI should automatically be set to: `https://xzhrepiwlthlhetzjygj.supabase.co/auth/v1/callback`
2. Make sure this matches exactly in your Google Cloud Console
3. Test the login by clicking "Sign in with Google" in your app

### Troubleshooting

- **Error: "provider is not enabled"**: Make sure you toggled "Enable Google provider" in Supabase
- **Error: "redirect_uri_mismatch"**: Check that the redirect URI in Google Console matches exactly
- **Error: "invalid_client"**: Verify your Client ID and Secret are correct

## 5. Add Authorized Emails (Admin)

After logging in as admin:
1. Go to the "Authorized Emails" section
2. Click "Show Management"
3. Add email addresses and their corresponding participant names
4. Only these emails will be able to login via Google Auth

## Notes

- The database uses Row Level Security (RLS) with public read/write access
- You may want to restrict access based on your security requirements
- The app will fall back gracefully if Supabase is unavailable (though data won't persist)
- Users can still use manual name entry if their email is not authorized

