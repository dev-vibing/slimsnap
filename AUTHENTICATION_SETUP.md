# Authentication Setup Guide

## Issue: User Avatar and Email Disappearing After Page Refresh

### Problem Description
The sign-in process works initially, but after refreshing the page, the user's avatar and email disappear from the header, even though the user remains logged in.

### Root Cause
This issue occurs because **Supabase environment variables are not configured**, causing the application to use a mock authentication client that doesn't persist session data properly.

### Solution

#### Step 1: Configure Supabase Environment Variables

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Get your Supabase credentials:**
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to **Settings** → **API**
   - Copy the **Project URL** and **anon public** key

3. **Update `.env.local` with your credentials:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

#### Step 2: Restart Your Development Server

After updating the environment variables, restart your development server:

```bash
npm run dev
```

### What Was Fixed

1. **Enhanced Error Handling**: The `useAuth` hook now properly handles session initialization errors and provides better debugging information.

2. **Improved Profile Fetching**: When a user profile doesn't exist in the database, the system now creates a default profile structure instead of leaving it undefined.

3. **Better Mock Client**: The mock Supabase client now provides clearer error messages when environment variables are missing.

4. **State Management**: Improved session state clearing during sign-out to prevent stale data.

### Verification

After configuring the environment variables correctly:

1. Sign in to your account
2. Verify that your avatar and email appear in the header
3. Refresh the page
4. Confirm that your avatar and email persist after the refresh

### Debugging

If you're still experiencing issues, check the browser console for:
- Any error messages about missing environment variables
- Authentication-related logs from the `useAuth` hook
- Network requests to verify Supabase is being called correctly

### Database Setup

If you haven't set up your Supabase database yet, you'll need to create a `profiles` table:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  subscription_status TEXT,
  lemon_order_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
``` 