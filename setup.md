# 🚀 SlimSnap Express Server Setup Guide

## Complete Setup Instructions

### 1. ✅ Dependencies Installed
The dependencies have already been installed successfully!

### 2. 🔧 Environment Configuration
Create a `.env` file in the project root with your Supabase credentials:

```bash
# Create .env file
touch .env
```

Add the following content to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Service Role Key (ADMIN - KEEP SECRET)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**🔍 Where to find these values:**
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the values:
   - **URL**: Project URL
   - **anon public**: Use for `VITE_SUPABASE_ANON_KEY`
   - **service_role**: Use for `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (Keep secret!)

### 3. 🎯 Run the Application

#### Option A: Run both servers together (Recommended)
```bash
npm run dev:full
```

#### Option B: Run servers separately
```bash
# Terminal 1 - Express server (port 3001)
npm run server

# Terminal 2 - Vite frontend (port 3002)  
npm run dev
```

### 4. 🔗 URLs
- Frontend: http://localhost:3002
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### 5. ✨ Test the Delete Account Feature

1. Sign up/Sign in to your app at `http://localhost:3002`
2. Click on your user profile dropdown
3. Click "Delete my account"
4. Confirm the deletion
5. The account will be securely deleted via the Express server

## 🔒 Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges - never expose it to the frontend
- The Express server runs on a separate port (3001) and uses CORS to only accept requests from your frontend (3002)
- User deletion is handled server-side using Supabase Admin API for maximum security

## 🛠️ Troubleshooting

**Server won't start:**
- Make sure your `.env` file exists and has all required variables
- Check that the Supabase URL and keys are correct
- Verify no other service is using port 3001

**Delete account fails:**
- Check the Express server console for detailed error logs
- Verify the service role key has the correct permissions
- Make sure both frontend and backend servers are running

## 📁 Project Structure
```
slimsnap/
├── server/
│   ├── index.js          # Express server
│   └── README.md         # Server documentation
├── src/
│   └── components/
│       └── UserMenu.tsx  # Updated with delete functionality
├── .env                  # Your environment variables (create this)
└── package.json          # Updated with Express scripts
```

Your complete Express + Vite + Supabase delete account flow is now ready! 🎉 