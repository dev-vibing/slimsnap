import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

// Initialize Supabase Admin client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { userId } = req.body;

    // Validate input
    if (!userId) {
      console.log('❌ Delete account request missing userId');
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    console.log('🗑️ Processing account deletion for user:', userId);

    // First, delete the user's profile data from custom tables
    console.log('🔄 Deleting user profile data...');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('❌ Error deleting user profile:', profileError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete user profile data' 
      });
    }

    console.log('✅ User profile data deleted successfully');

    // Then, delete the user account using Admin API
    console.log('🔄 Deleting user authentication account...');
    const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (userError) {
      console.error('❌ Error deleting user account:', userError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete user authentication account' 
      });
    }

    console.log('✅ User account deleted successfully');
    
    res.status(200).json({ 
      success: true, 
      message: 'Account deleted successfully',
      userId: userId 
    });

  } catch (error) {
    console.error('❌ Account deletion error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during account deletion' 
    });
  }
} 