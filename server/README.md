# Express Server Setup

This Express server provides secure backend endpoints for the SlimSnap application, including user account deletion using Supabase Admin API.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the project root with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Service Role Key (KEEP SECRET - SERVER ONLY)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**⚠️ IMPORTANT:** Never expose the `SUPABASE_SERVICE_ROLE_KEY` to the frontend. This key has admin privileges and should only be used on the backend.

### 3. Run the Server
```bash
# Run server only
npm run server

# Run both server and frontend
npm run dev:full
```

The server will start on `http://localhost:3001`

## 📋 API Endpoints

### Health Check
- **GET** `/health`
- Returns server status and timestamp

### Delete Account
- **POST** `/delete-account`
- **Body:** `{ "userId": "user_uuid" }`
- **Description:** Securely deletes a user account and all associated profile data
- **Response:** `{ "success": true, "message": "Account deleted successfully", "userId": "user_uuid" }`

## 🔒 Security Features

- **CORS Protection:** Only allows requests from localhost:3002 (Vite dev server)
- **Admin API Usage:** Uses Supabase service role key for secure user deletion
- **Input Validation:** Validates all incoming requests
- **Error Handling:** Comprehensive error handling with detailed logging
- **No Session Persistence:** Admin client doesn't persist sessions for security

## 🛠️ Architecture

```
Frontend (Vite:3002) → Express Server (3001) → Supabase Admin API
```

The frontend calls the Express server, which then uses the Supabase Admin API to securely delete user accounts. This keeps the service role key secure on the backend only.

## 📝 Logs

The server provides comprehensive logging:
- ✅ Successful operations
- ❌ Errors and failures  
- 🔄 Processing steps
- 🗑️ Account deletion tracking

## 🔧 Development

For development, you can run both the frontend and backend simultaneously:

```bash
npm run dev:full
```

This will start:
- Express server on `http://localhost:3001`
- Vite dev server on `http://localhost:3002` 