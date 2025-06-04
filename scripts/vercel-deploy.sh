#!/bin/bash

echo "🚀 AGENTLAND.SAARLAND DEPLOYMENT SCRIPT"
echo "========================================="
echo ""

# Set project directory
cd /Users/deepsleeping/agentlandos/agentland-saarland

echo "📁 Working Directory: $(pwd)"
echo "🌐 Target Domain: agentland.saarland"
echo ""

# Deploy to Vercel
echo "🚀 Starting Vercel deployment..."
npx vercel --prod \
  --env DEEPSEEK_API_KEY="$DEEPSEEK_API_KEY" \
  --env NEXT_PUBLIC_API_URL=/api \
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
echo "   SAARTASKS: https://agentland.saarland/api/saartasks"
echo "   SAARAG: https://agentland.saarland/api/saarag"
echo ""
echo "🏛️ Das Saarland ist jetzt online! 🤖"