# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AGENTLAND.SAARLAND is a regional AI platform for the Saarland region in Germany, featuring a clean, focused interface with premium monetization services and specialized AI agents.

**Current Status**: Production-ready platform with simplified design and functional APIs
**Live Domain**: https://agentland.saarland

## Architecture

### Frontend (Next.js 14 + TypeScript)
- **Simple Design**: Clean homepage with Home/Chat navigation only
- **Mobile-First**: Responsive design with Tailwind CSS
- **Brand Colors**: Saarland Blue (#003399), Innovation Cyan (#009FE3)
- **Navigation**: SimpleNavigation.tsx (minimal, focused)

### Backend APIs (Vercel Serverless)
All APIs use edge runtime for performance:

#### Core Revenue APIs (Working ✅)
1. `/api/premium/saarland` - Premium pricing tiers (€0/€9.99/€49.99)
2. `/api/marketplace` - API monetization (€671+ MRR tracking)
3. `/api/autonomous-agents` - 4 specialized AI agents

#### Community & Content APIs (Working ✅)
4. `/api/saar-football` - FC Saarbrücken & SV Elversberg integration
5. `/api/saarnews` - Regional news aggregation
6. `/api/community` - Gamification & badge system

#### Additional APIs
- `/api/chat` - SAAR-GPT Premium interface
- `/api/canvas` - Visual planning tools
- `/api/realtime/*` - Real-time analytics

### AI Integration
- **DeepSeek R1**: Latest reasoning model for chat
- **RAG System**: Real Saarland data integration
- **Autonomous Agents**: 4 specialized domain agents
- **Fallback System**: Intelligent responses when API unavailable

## Development Commands

### Root Commands (Turbo Monorepo)
```bash
# Development
pnpm dev          # All services
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm typecheck    # Type check all packages

# Individual services
cd apps/web && pnpm dev        # Frontend only
cd apps/api && poetry run uvicorn app.main:app --reload  # Backend only
```

### Web App Commands
```bash
cd apps/web

# Development
pnpm dev              # Start dev server (:3000)
pnpm build           # Production build
pnpm vercel-build    # Vercel deployment build
pnpm start           # Production server
pnpm lint            # ESLint
pnpm typecheck       # TypeScript check
```

### Deployment
```bash
# Production deployment
cd apps/web && vercel --prod

# Check deployment status
vercel domains ls
vercel projects ls
```

## Key Files & Structure

### Core Components
- `src/components/SimpleNavigation.tsx` - Clean navigation header
- `src/app/page.tsx` - Simplified homepage
- `src/app/chat/simple-chat.tsx` - SAAR-GPT Premium interface
- `src/app/layout.tsx` - Root layout with AuthProvider

### API Routes
- `src/app/api/premium/saarland/route.ts` - Pricing tiers
- `src/app/api/marketplace/route.ts` - API monetization
- `src/app/api/autonomous-agents/route.ts` - AI agents
- `src/app/api/community/route.ts` - Gamification
- `src/app/api/saar-football/route.ts` - Sports integration
- `src/app/api/saarnews/route.ts` - News aggregation

### Configuration
- `vercel.json` - Vercel deployment config
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Design system
- `package.json` - Dependencies and scripts

## Revenue Model

### Monetization Strategy
- **Premium Tier**: €9.99/month for enhanced features
- **Business Tier**: €49.99/month for enterprise services
- **API Marketplace**: Tiered pricing for developers
- **Current MRR**: €671+ tracked via real-time analytics

### Success Metrics
- Monthly Revenue: €0 → €25,000 target
- Active Users: 591 current, 50,000 target
- API Calls: 1,247,891/month
- Conversion Rates: Free→Basic (12.3%), Basic→Premium (8.7%)

## Brand Guidelines

### Colors
- **Primary**: Saarland Blue (#003399)
- **Secondary**: Innovation Cyan (#009FE3)
- **Success**: Emerald (#10B981)
- **Warning**: Amber (#F59E0B)

### Typography
- **Headers**: Bold, Saarland Blue
- **Body**: Regular, Gray-600
- **Buttons**: Semi-bold, White on brand colors

### Design Principles
- **Simplicity**: Clean, uncluttered interface
- **Focus**: Clear user journeys (Home → Chat)
- **Performance**: Fast loading, minimal JavaScript
- **Mobile-First**: Responsive for all devices

## Current Implementation Status

### ✅ Completed
- Simplified navigation and homepage
- 6 working API endpoints with real data
- SAAR-GPT Premium chat interface
- Revenue tracking and analytics
- Mobile-responsive design
- Brand-compliant styling

### 🔄 In Progress
- Vercel deployment with vercel-build script
- Production domain updates
- Performance optimization

### 📋 Next Steps
1. Verify live domain deployment
2. Test all API endpoints on production
3. Validate mobile responsiveness
4. Monitor revenue analytics
5. Scale for user growth

## Development Guidelines

### Code Quality
- Use TypeScript strictly
- Follow Next.js 14 App Router patterns
- Maintain consistent component structure
- Implement proper error handling

### API Development
- All routes use edge runtime
- Implement CORS headers for external access
- Return consistent JSON response format
- Include success/error status in responses

### Deployment Process
1. Test build locally: `pnpm build`
2. Deploy to Vercel: `vercel --prod`
3. Verify domain: https://agentland.saarland
4. Test API endpoints
5. Monitor performance metrics

## Environment Variables

### Required (Production)
- `DEEPSEEK_API_KEY` - DeepSeek R1 integration
- `NEXT_PUBLIC_API_URL` - API base URL
- `SUPABASE_URL` - Database connection
- `SUPABASE_ANON_KEY` - Database access

### Optional
- `VERCEL_ENV` - Environment detection
- `NODE_ENV` - Runtime environment

## Monitoring & Health

### Key Metrics to Track
- API Response Times (<300ms target)
- Error Rates (<1% target)
- Monthly Revenue Growth
- User Engagement
- Mobile Performance

### Health Check Endpoints
- `/api/health` - Overall system health
- `/api/premium/saarland` - Core pricing API
- `/api/marketplace` - Revenue tracking
- `/api/autonomous-agents` - AI system status

---

**Platform Mission**: Build the leading regional AI platform for Saarland with focus on simplicity, performance, and revenue generation.

**Technical Sovereignty**: Maintain control over data, algorithms, and user experience while providing premium AI services.

*Last Updated: 5. Juni 2025*  
*Status: Production Ready - Clean & Focused Platform*