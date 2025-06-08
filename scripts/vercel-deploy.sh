#!/bin/bash

set -e  # Exit on any error

echo "🚀 AGENTLAND.SAARLAND DEPLOYMENT SCRIPT"
echo "========================================="
echo ""

# Function to validate environment variables
validate_env_var() {
    local var_name="$1"
    local var_value="${!var_name}"
    
    if [ -z "${var_value}" ]; then
        echo "❌ ERROR: ${var_name} is not set or empty"
        echo "   Please set this environment variable before deployment"
        return 1
    else
        echo "✅ ${var_name} is set"
        return 0
    fi
}

# Validate required environment variables
echo "🔍 Validating environment variables..."
validate_env_var "DEEPSEEK_API_KEY" || exit 1
validate_env_var "NEXT_PUBLIC_SUPABASE_URL" || exit 1
validate_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" || exit 1
validate_env_var "SUPABASE_SERVICE_ROLE_KEY" || exit 1
validate_env_var "OPENAI_API_KEY" || echo "⚠️  OPENAI_API_KEY not set - embeddings and fallback may fail"

echo ""

# Set project directory relative to repo root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(git -C "$SCRIPT_DIR/.." rev-parse --show-toplevel)"
cd "$PROJECT_ROOT/apps/web"

echo "📁 Working Directory: $(pwd)"
echo "🌐 Target Domain: agentland.saarland"
echo ""

# Deploy to Vercel
echo "🚀 Starting Vercel deployment..."
npx vercel --prod \
  --env DEEPSEEK_API_KEY="$DEEPSEEK_API_KEY" \
  --scope vesias \
  --force

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🎯 Your AGENTLAND.SAARLAND platform should now be live at:"
echo "   https://agentland.saarland"
echo ""
echo "🧪 Test endpoints:"
echo "   Health: https://agentland.saarland/api/health"
echo "   Chat: https://agentland.saarland/api/chat"
echo "   Premium: https://agentland.saarland/api/premium/saarland"
echo ""
echo "🏛️ Das Saarland ist jetzt online! 🤖"
