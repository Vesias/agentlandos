#!/usr/bin/env node

// Test Supabase connection script
// Load environment variables from .env.local manually
const fs = require('fs');
const path = require('path');

// Load .env.local if it exists
const envPath = path.join(__dirname, '..', 'apps', 'web', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('🔧 Testing Supabase Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Environment Variables:');
  console.log('✓ SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('✓ ANON_KEY:', anonKey ? '✅ Set' : '❌ Missing');
  console.log('✓ SERVICE_ROLE_KEY:', serviceRoleKey ? '✅ Set' : '❌ Missing');
  console.log('');

  if (!supabaseUrl || !anonKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  // Test browser client (anon key)
  console.log('🌐 Testing Browser Client...');
  const browserClient = createClient(supabaseUrl, anonKey);
  
  try {
    const { data, error } = await browserClient
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Browser client error (expected for empty table):', error.message);
    } else {
      console.log('✅ Browser client connection successful');
    }
  } catch (err) {
    console.log('⚠️  Browser client test failed:', err.message);
  }

  // Test server client (service role key)
  if (serviceRoleKey) {
    console.log('\n🔧 Testing Server Client...');
    const serverClient = createClient(supabaseUrl, serviceRoleKey);
    
    try {
      const { data, error } = await serverClient
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('⚠️  Server client error (expected for empty table):', error.message);
      } else {
        console.log('✅ Server client connection successful');
      }
    } catch (err) {
      console.log('⚠️  Server client test failed:', err.message);
    }
  } else {
    console.log('\n⚠️  Service role key not set - server operations will be limited');
  }

  // Test basic table existence
  console.log('\n📊 Testing Table Existence...');
  const testClient = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : browserClient;
  
  const tablesToTest = ['users', 'user_analytics', 'session_tracking', 'api_health_checks'];
  
  for (const table of tablesToTest) {
    try {
      const { data, error } = await testClient
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`❌ Table '${table}' does not exist`);
        } else {
          console.log(`⚠️  Table '${table}' exists but error: ${error.message}`);
        }
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
      }
    } catch (err) {
      console.log(`❌ Error testing table '${table}':`, err.message);
    }
  }

  console.log('\n🏁 Supabase connection test completed');
  console.log('\nNext steps:');
  console.log('1. If tables are missing, run: npm run setup-database');
  console.log('2. For production, update environment variables with your Supabase project credentials');
  console.log('3. Check Supabase dashboard for any RLS (Row Level Security) policies');
}

testSupabaseConnection().catch(console.error);