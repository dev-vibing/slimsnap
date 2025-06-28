import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local or .env
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env if .env.local doesn't exist

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://127.0.0.1:3002'],
  credentials: true
}));
app.use(express.json());

// Initialize Supabase Admin client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Express server is running',
    timestamp: new Date().toISOString()
  });
});

// Delete account endpoint
app.post('/delete-account', async (req, res) => {
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
    
    res.json({ 
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
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled server error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /health - Server health check`);
  console.log(`   POST /delete-account - Delete user account`);
}); 