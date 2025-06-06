#!/bin/bash

# AGENTLAND.SAARLAND Database Setup Script
# Sets up the complete database schema including missing tables

set -e

echo "🔧 Setting up AgentLand Saarland Database..."

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: supabase/config.toml not found. Please run this script from the project root."
    exit 1
fi

# Start Supabase local development
echo "🚀 Starting Supabase local development environment..."
supabase start

echo "📊 Creating main database schema..."
supabase db push

echo "🔧 Creating missing tables and additional schema..."
# Apply our missing tables schema
psql \
  -h localhost \
  -p 54322 \
  -U postgres \
  -d postgres \
  -f infrastructure/database/missing_tables.sql

echo "✅ Database setup complete!"

# Display connection info
echo ""
echo "📋 Database Connection Information:"
echo "Local Supabase URL: http://localhost:54321"
echo "Database URL: postgresql://postgres:postgres@localhost:54322/postgres"
echo "Studio URL: http://localhost:54323"
echo ""
echo "🔧 Environment Variables for .env.local:"
echo "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1NzkyOTUxLCJleHAiOjE5NjEzNjg5NTF9.mHq8FIKUM0gJBOaG8aEOLfbEHbRYAu2LQQnLFgJNhGM"
echo "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NDU3OTI5NTEsImV4cCI6MTk2MTM2ODk1MX0.MfZlPWh2jrZdh3dNMhvGm6jhtJqvgGz9JqEw5JjfEzE"
echo ""
echo "🔗 For production, use your Supabase project credentials:"
echo "- Project URL: https://your-project.supabase.co"
echo "- Public anon key: from your Supabase dashboard"
echo "- Service role key: from your Supabase dashboard (keep secret!)"
echo ""
echo "✨ Ready to develop with real database connection!"