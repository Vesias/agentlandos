#!/bin/bash

# Add Supabase environment variables to Vercel
echo "Adding Supabase environment variables to Vercel..."

# Supabase URL
echo "https://kgaksxcgedcpvjzqjwjj.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Supabase Anon Key
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnYWtzeGNnZWRjcHZqenFqd2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzAwNDAsImV4cCI6MjA2Mzk0NjA0MH0.bF1bmBriZlbXJJup_Ynq02MqOi9u6CS2GboFcWpmc3I" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Supabase Service Role Key
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnYWtzeGNnZWRjcHZqenFqd2pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM3MDA0MCwiZXhwIjoyMDYzOTQ2MDQwfQ.-d1TRuyQlm3kwHSBYBn1BrbuJAy2NXQ7sas3ahkrWNs" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo "Environment variables added successfully!"