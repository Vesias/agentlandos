#!/bin/bash

# Add Supabase environment variables to Vercel
echo "Adding Supabase environment variables to Vercel..."

# Supabase URL
echo "${NEXT_PUBLIC_SUPABASE_URL}" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Supabase Anon Key
echo "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Supabase Service Role Key
echo "${SUPABASE_SERVICE_ROLE_KEY}" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo "Environment variables added successfully!"
