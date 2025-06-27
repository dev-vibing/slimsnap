# Lemon Squeezy Integration Setup

This document explains how to set up the Lemon Squeezy payment integration for SlimSnap.

## Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Service Role Key (for backend operations)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Lemon Squeezy Configuration (optional, for future API use)
LEMON_SQUEEZY_API_KEY=sk_test_your_lemon_squeezy_test_api_key
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_from_lemon_squeezy
```

## Webhook Setup

1. **Create a webhook in Lemon Squeezy:**
   - Go to your Lemon Squeezy dashboard
   - Navigate to Settings > Webhooks
   - Create a new webhook with URL: `https://slimsnap.vercel.app/api/webhooks/lemon`
   - Select the `order_created` event
   - Copy the webhook secret and add it to your environment variables

2. **Database Schema:**
   Make sure your Supabase `profiles` table has these columns:
   ```sql
   -- Add this column if it doesn't exist
   ALTER TABLE profiles ADD COLUMN lemon_order_id TEXT;
   ```

## How It Works

### Frontend Flow
1. User clicks "Upgrade" button
2. UpgradeModal opens with user information
3. User clicks "Upgrade Now" 
4. Browser redirects to Lemon Squeezy checkout with:
   - `checkout[custom][user_id]` = user's Supabase ID
   - `checkout[custom][email]` = user's email
   - `checkout[success_url]` = return URL with success parameter

### Backend Webhook Flow
1. User completes payment on Lemon Squeezy
2. Lemon Squeezy sends `order_created` webhook to `/api/webhooks/lemon`
3. Webhook extracts `user_id` from `custom_data`
4. Updates user's `is_premium` field to `true` in Supabase
5. Stores the `lemon_order_id` for reference

### Success Flow
1. User returns to app with `?upgrade_success=true` parameter
2. App shows success message
3. Supabase session is refreshed to get updated premium status
4. User now has access to premium features

## Testing

### Test Mode
- Use the provided test API key
- Payments are simulated and won't charge real money
- Test webhooks will be sent to your endpoint

### Production Mode
- Replace test API key with live API key
- Configure webhook URL for production domain
- Ensure all environment variables are set in production environment

## Checkout URL Structure

The hosted checkout URL is pre-configured:
```
https://slimsnap.lemonsqueezy.com/buy/e962aeeb-a5b0-48a4-9f07-f329e23bda81
```

Custom data is appended as URL parameters:
- `checkout[custom][user_id]` - Supabase user ID
- `checkout[custom][email]` - User's email address
- `checkout[success_url]` - Return URL after successful payment

## Error Handling

The webhook includes comprehensive error handling:
- Signature verification (optional)
- User ID validation
- Database update error handling
- Detailed logging for debugging

## Security Notes

1. **Webhook Signatures:** Enable signature verification in production by setting `LEMON_SQUEEZY_WEBHOOK_SECRET`
2. **Service Role Key:** Keep your Supabase service role key secure and never expose it to the frontend
3. **HTTPS Only:** Webhooks must be served over HTTPS in production

## Deployment

This integration is designed for Vercel deployment:
1. The `/api/webhooks/lemon.ts` file will automatically become a serverless function
2. Set all environment variables in your Vercel project settings
3. Deploy and update your Lemon Squeezy webhook URL to point to your live domain 