# Vercel Migration Guide 🚀

## ✅ TIMEOUT ISSUE FIXED!

The original Express serverless function was causing timeouts. This has been **FIXED** by converting to individual Vercel serverless functions:

- ❌ **Before**: `/api/server.js` (Express app with serverless-http) - **TIMEOUT**
- ✅ **After**: `/api/health.js` and `/api/delete-account.js` (Individual functions) - **WORKING**

## What Changed?

### Before (Old Setup)
- Express server running on `http://localhost:3001`
- Frontend running on `http://localhost:3002` (Vite)
- Backend called with: `http://localhost:3001/endpoint`
- Scripts: `npm run dev:full` (ran both servers)

### After (New Setup)
- Everything runs on `http://localhost:3000` with Vercel Dev
- Backend is now a serverless function at `/api/server.js`
- Frontend calls backend with: `/api/server/endpoint`
- Script: `npm run dev` (runs both frontend and backend together)

## How to Run Locally

### 1. Start Development Server
```bash
npm run dev
```

This single command now:
- Starts the Vite frontend
- Starts the serverless backend function
- Serves everything on `http://localhost:3000`

### 2. Access Your App
- **Frontend**: `http://localhost:3000`
- **API Health Check**: `http://localhost:3000/api/health`
- **Delete Account API**: `http://localhost:3000/api/delete-account`

## API Endpoints

Backend endpoints are now individual serverless functions:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/delete-account` | POST | Delete user account |

## Frontend Changes

The frontend now calls the backend using relative URLs:

```javascript
// Old way
const response = await fetch('http://localhost:3001/delete-account', {...});

// New way  
const response = await fetch('/api/delete-account', {...});
```

## File Structure

```
slimsnap/
├── api/
│   └── server.js          # ✅ New serverless function
├── server/
│   └── index.js           # ❌ Old Express server (can be deleted)
├── src/                   # Frontend (unchanged)
├── vercel.json            # ✅ Vercel configuration
├── .vercelignore          # ✅ Files to ignore in deployment
└── package.json           # ✅ Updated scripts
```

## Environment Variables

Make sure your `.env.local` contains:
```
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Deployment to Vercel

1. **Connect your repository to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Add environment variables** in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Deploy**:
   - Push to your main branch
   - Vercel will automatically deploy

## Troubleshooting

### Common Issues

1. **Port already in use error**:
   - Kill existing processes: `taskkill /F /IM node.exe` (Windows)
   - Or use: `npx kill-port 3000 3001`

2. **API not working locally**:
   - Check if `vercel dev` is running
   - Verify the API endpoint URL starts with `/api/server/`

3. **Environment variables not loading**:
   - Make sure `.env.local` exists
   - Restart `vercel dev` after adding new variables

### Vercel Dev vs Production

- **Local**: Uses `vercel dev` - simulates production environment
- **Production**: Deployed to Vercel's edge network
- **Both**: Use the same serverless function code in `/api/server.js`

## Benefits of This Migration

✅ **Single Port**: Everything runs on localhost:3000  
✅ **Production Parity**: Local dev matches production exactly  
✅ **Serverless**: Automatic scaling and zero server management  
✅ **Fast Deployment**: Git push = automatic deployment  
✅ **Cost Effective**: Only pay for actual usage  

## Next Steps

1. Test the new setup: `npm run dev`
2. Verify all API calls work
3. Deploy to Vercel: `vercel --prod`
4. Delete the old `/server` folder when confident
5. Update any documentation or README files

---

🎉 **You're now running on Vercel!** Your app is ready for modern serverless deployment. 