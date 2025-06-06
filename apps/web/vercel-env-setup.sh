#!/bin/bash

# Vercel Environment Variables Setup with Validation
# Adds Supabase environment variables to Vercel with proper validation

set -e  # Exit on any error

echo "🔍 Validating environment variables..."

# Function to validate required environment variable
validate_env_var() {
    local var_name="$1"
    local var_value="${!var_name}"
    
    if [ -z "${var_value}" ]; then
        echo "❌ ERROR: ${var_name} is not set or empty"
        echo "   Please set this environment variable before running the script"
        return 1
    else
        echo "✅ ${var_name} is set"
        return 0
    fi
}

# Validate all required environment variables
echo "Checking required Supabase environment variables..."

validate_env_var "NEXT_PUBLIC_SUPABASE_URL" || exit 1
validate_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" || exit 1  
validate_env_var "SUPABASE_SERVICE_ROLE_KEY" || exit 1
validate_env_var "OPENAI_API_KEY" || exit 1
validate_env_var "DEEPSEEK_API_KEY" || exit 1

echo ""
echo "🚀 Adding environment variables to Vercel..."

# Supabase Configuration
echo "Adding NEXT_PUBLIC_SUPABASE_URL..."
echo "${NEXT_PUBLIC_SUPABASE_URL}" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
echo "${SUPABASE_SERVICE_ROLE_KEY}" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# AI Provider API Keys
echo "Adding OPENAI_API_KEY..."
echo "${OPENAI_API_KEY}" | vercel env add OPENAI_API_KEY production

echo "Adding DEEPSEEK_API_KEY..."
echo "${DEEPSEEK_API_KEY}" | vercel env add DEEPSEEK_API_KEY production

echo ""
echo "✅ Environment variables added successfully!"
echo "🔗 You can verify them at: https://vercel.com/dashboard/env-vars"
