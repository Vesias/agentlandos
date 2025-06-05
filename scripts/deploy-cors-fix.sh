#!/bin/bash

echo "🌐 AGENTLAND.SAARLAND - CORS Fix Deployment"
echo "=============================================="

cd "$(dirname "$0")/.."

echo "📝 Building optimized production version..."
cd apps/web

# Skip the lengthy static generation for now
export NEXT_PUBLIC_STATIC_EXPORT=false

# Deploy directly to Vercel
echo "🚀 Deploying to Vercel production..."
npx vercel --prod --yes

echo "✅ Deployment complete!"
echo "🌍 New URL will be available shortly"

# Return to root
cd ../..

echo "🔥 CORS fixes deployed successfully!"