import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Initialize Supabase Admin client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Lemon Squeezy webhook secret for verification
const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || 'your-webhook-secret';

function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!webhookSecret) return true; // Skip verification if no secret is set (for development)
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');
  
  return signature === expectedSignature;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = JSON.stringify(req.body);
    const signature = req.headers['x-signature'] as string;

    // Verify webhook signature (optional but recommended for production)
    if (signature && !verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    
    // Handle the order_created event
    if (event.meta?.event_name === 'order_created') {
      console.log('Processing order_created webhook:', event.data?.id);
      
      // Extract user_id from custom data
      const customData = event.data?.attributes?.custom_data;
      const userId = customData?.user_id;
      
      if (!userId) {
        console.error('No user_id found in webhook custom_data');
        return res.status(400).json({ error: 'No user_id in custom_data' });
      }

      // Update user's premium status in Supabase
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_premium: true,
          // Optionally store the order ID for reference
          lemon_order_id: event.data?.id 
        })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Error updating user premium status:', error);
        return res.status(500).json({ error: 'Failed to update user status' });
      }

      if (data && data.length === 0) {
        console.error('User not found:', userId);
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('Successfully upgraded user to premium:', userId);
      return res.status(200).json({ 
        success: true, 
        message: 'User upgraded to premium',
        userId 
      });
    }

    // Handle other webhook events if needed
    console.log('Received webhook event:', event.meta?.event_name);
    return res.status(200).json({ success: true, message: 'Webhook received' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 