# CLAUDE.md - AGENTLAND.SAARLAND ARCHITECTURE & BUSINESS GUIDE

This file provides comprehensive guidance to Claude Code when working with this repository.

## Project Overview

**AGENTLAND.SAARLAND** is a sophisticated regional AI platform serving the Saarland region in Germany. It combines cutting-edge artificial intelligence with deep regional expertise, providing specialized services for citizens, businesses, and government entities.

**Current Status**: Production-ready platform with advanced multi-agent architecture  
**Live Domain**: https://agentland.saarland  
**Business Model**: Premium subscription services (€10/month) + API marketplace  
**Revenue Target**: €25,000+ Monthly Recurring Revenue by Q3 2025  
**User Target**: 50,000+ active users

## Architecture Overview

This is a **monorepo structure** with multiple applications and shared packages, optimized for scalability and maintainability.

### 🏗️ Repository Structure
```
agentlandos/
├── apps/
│   ├── web/           # Next.js 14 frontend (Primary)
│   └── api/           # FastAPI backend (Secondary)
├── packages/          # Shared libraries (Future)
├── infrastructure/    # Docker & K8s configs
├── ai_docs/          # AI agent documentation & memory
├── specs/            # Technical specifications
└── scripts/          # Deployment & maintenance scripts
```

### 🎨 Frontend (Next.js 14 + TypeScript + App Router)
- **Framework**: Next.js 14.1.0 with App Router for optimal performance
- **UI System**: Tailwind CSS + shadcn/ui components + custom design system
- **State Management**: Zustand for client state, SWR for server state
- **Authentication**: Supabase Auth with context provider
- **Mobile-First**: Responsive design with enhanced mobile optimization
- **PWA Support**: Progressive Web App capabilities with next-pwa

### 🚀 Backend Architecture (Dual-Stack)

#### Primary: Vercel Serverless Functions (Next.js API Routes)
```typescript
// Modern App Router API structure
apps/web/src/app/api/
├── ai/enhanced/          # Enhanced AI with DeepSeek R1 & Gemini
├── chat/                 # SAAR-GPT chat interface  
├── canvas/               # Open Canvas for content creation
├── realtime/             # Real-time data services
├── analytics/            # User analytics & revenue tracking
├── premium/              # Premium service management
└── registration/         # Business & SAAR-ID registration
```

#### Secondary: FastAPI Backend (apps/api/)
```python
# Specialized AI agent system
apps/api/app/
├── agents/               # Multi-agent AI system
├── services/             # Business logic & integrations
├── connectors/           # External API connectors
├── core/                 # Configuration & utilities
└── db/                   # Database models & connections
```

#### Key API Endpoints

**Core Revenue APIs (✅ Active)**
- `/api/ai/enhanced` - Advanced AI with DeepSeek R1 reasoning
- `/api/premium/saarland` - €10 premium SAAR-ID/Business-ID services
- `/api/registration/saar-id` - SAAR-ID registration & management
- `/api/registration/business` - Business registration services

**Real-time Services (✅ Active)**
- `/api/realtime/tourism` - Live tourism data
- `/api/realtime/business` - Business insights & funding
- `/api/realtime/analytics` - User analytics dashboard
- `/api/analytics/real-users` - Real user tracking (starting from 0)

### 🤖 Advanced AI Integration

#### Multi-Model AI Stack
- **DeepSeek R1 (deepseek-reasoner-r1-0528)**: Advanced reasoning and document analysis
- **Gemini 2.5 Flash**: Fast responses and multi-modal processing
- **LangChain Integration**: @langchain/anthropic, @langchain/openai for complex workflows
- **LangGraph**: Multi-agent orchestration and workflow management

#### Specialized AI Features
- **Enhanced AI Service**: `/api/ai/enhanced` with multiple modes (chat, artifact, RAG, stream)
- **Open Canvas**: AI-powered document and code generation
- **Context Caching**: 74% cost reduction with conversation memory
- **Real-time Streaming**: Server-sent events for live AI responses
- **RAG System**: Vector search with real Saarland data integration

#### Fallback Strategy
- **Graceful Degradation**: Intelligent fallbacks when primary AI unavailable
- **Cached Responses**: Local cache for common queries
- **Multi-provider**: DeepSeek → Gemini → Local fallback chain

## Development Workflow

### 🛠️ Prerequisites
- **Node.js**: 18+ required (checked in claude-init.ts)
- **Package Manager**: pnpm (faster than npm, automatically installed)
- **CLI Tools**: Vercel CLI, Supabase CLI, GitHub CLI
- **Environment**: `.env.local` with DEEPSEEK_API_KEY

### 🚀 Quick Start
```bash
# 1. Initialize development environment
npx tsx claude-init.ts              # Auto-setup all infrastructure

# 2. Start development
cd apps/web
pnpm dev                            # Frontend dev server (:3000)

# 3. Optional: Backend development
cd apps/api
poetry run uvicorn app.main:app --reload  # FastAPI server (:8000)
```

### 📦 Package Management (Turbo Monorepo)
```bash
# Root level commands (affects all apps)
pnpm dev              # All services in parallel
pnpm build            # Build all packages  
pnpm lint             # Lint all packages
pnpm typecheck        # TypeScript check all

# Individual app commands
cd apps/web
pnpm dev              # Next.js dev server
pnpm build            # Production build
pnpm vercel-build     # Vercel-optimized build
pnpm start            # Production server
pnpm lint             # ESLint with Next.js config
pnpm typecheck        # TypeScript validation
```

### 🚢 Deployment Pipeline
```bash
# Automated deployment (recommended)
npx tsx claude-init.ts              # Includes automatic deployment

# Manual deployment
cd apps/web
pnpm build                          # Ensure build works
vercel --prod                       # Deploy to agentland.saarland

# Check deployment status
vercel ls                           # List deployments
vercel domains ls                   # Check domain status
```

### 🔧 Infrastructure Management
```bash
# Supabase (Database)
supabase status                     # Check local instance
supabase start                      # Start local development
supabase db reset                   # Reset database
supabase gen types typescript --local > apps/web/src/types/supabase.ts

# Vercel (Hosting)
vercel env ls                       # List environment variables
vercel env add DEEPSEEK_API_KEY     # Add API keys
vercel --prod                       # Production deployment

# GitHub (Code Management)
gh repo view                        # Repository status
gh pr create                        # Create pull request
gh workflow list                    # List workflows
```

## 📁 Key Files & Architecture

### 🎨 Core UI Components
```typescript
apps/web/src/components/
├── OpenCanvas.tsx              # AI-powered content creation
├── DeepSeekServiceChat.tsx     # Enhanced AI chat interface
├── InteractiveSaarlandMap.tsx  # Regional map with POIs
├── RealTimeUserCounter.tsx     # Live user analytics
├── MobileFeatures.tsx          # Mobile-optimized features
├── navigation/
│   ├── MainNavigation.tsx      # Primary navigation
│   └── ModularNavigation.tsx   # Modular nav system
├── registration/
│   ├── BusinessRegistrationForm.tsx  # €10 Business-ID
│   └── SaarIdRegistrationForm.tsx    # €10 SAAR-ID
└── ui/                         # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    └── form-components.tsx
```

### 🚀 API Architecture
```typescript
apps/web/src/app/api/
├── ai/enhanced/route.ts        # DeepSeek R1 + Gemini integration
├── chat/route.ts               # SAAR-GPT chat with reasoning
├── canvas/route.ts             # Open Canvas content creation
├── premium/saarland/route.ts   # €10 premium services
├── registration/
│   ├── saar-id/route.ts        # SAAR-ID registration
│   └── business/route.ts       # Business registration
├── realtime/
│   ├── tourism/route.ts        # Live tourism data
│   ├── business/route.ts       # Business insights
│   └── analytics/route.ts      # User analytics
└── analytics/real-users/route.ts  # Real user tracking
```

### ⚙️ Configuration Files
```bash
# Core Configuration
├── next.config.js              # Next.js + image optimization + CORS
├── tailwind.config.js          # Design system + Saarland brand colors
├── tsconfig.json               # TypeScript + path aliases
├── vercel.json                 # Deployment + build configuration
├── pnpm-workspace.yaml         # Monorepo workspace
├── turbo.json                  # Build pipeline optimization
└── package.json                # Dependencies + scripts

# Infrastructure
├── supabase/config.toml        # Database configuration
├── infrastructure/docker/      # Container configurations
└── claude-init.ts              # Auto-setup script
```

### 🧠 AI & Documentation
```bash
ai_docs/                        # AI agent memory & documentation
├── ARCHITECTURE_ANALYSIS.md   # Comprehensive technical analysis
├── docs/
│   ├── founder/               # Business strategy & vision
│   ├── technical/             # Technical specifications
│   └── deployment/            # Deployment guides
├── specs/
│   ├── AGENT_SPECIFICATIONS.md  # Multi-agent AI system
│   └── API_SPECIFICATIONS.md    # API documentation
└── brand-book.md              # Complete brand guidelines
```

## 💰 Business Model & Revenue Strategy

### Premium Subscription Services (€10/month)
- **SAAR-ID Premium**: Enhanced digital identity with priority processing
  - Target: 2,500 subscriptions = €25,000 MRR
  - Features: 24h processing, premium support, API access, mobile app features
  
- **Business-ID Premium**: Advanced business registration with AI optimization
  - Target: 1,000 subscriptions = €10,000 MRR
  - Features: AI optimization, funding matching, dedicated advisor, tax optimization

### Revenue Streams
1. **Premium Subscriptions**: €10/month × 3,500 users = €35,000 MRR target
2. **API Marketplace**: Tiered developer access (future)
3. **Government Licensing**: White-label solutions for authorities
4. **Cross-border Services**: Premium Grenzpendler services

### Business Metrics (Real-time Tracking)
- **Current Users**: 0 (starting fresh with real analytics)
- **Revenue Target**: €25,000+ Monthly Recurring Revenue by Q3 2025
- **User Growth Target**: 50,000+ active users
- **Conversion Target**: 5% free → premium conversion rate
- **Churn Target**: <2% monthly churn rate
- **LTV Target**: €120 (12 months average subscription)

## 🎨 Brand Guidelines & Design System

### Brand Colors (Saarland Identity)
```css
/* Primary Brand Colors */
--color-saarland-blue: #003399;        /* Main brand color */
--color-innovation-cyan: #009FE3;      /* Interactive elements */
--color-technical-silver: #E6E6EB;     /* Backgrounds */

/* Functional Colors */
--color-success-green: #43B049;        /* Success states */
--color-alert-red: #E31E2D;            /* Error states */
--color-warm-gold: #FDB913;            /* Accents & CTAs */
--color-neutral-gray: #929497;         /* Text & UI elements */
```

### Typography System
- **Primary**: Quantum Sans (headings, UI) - custom font with geometric precision
- **Secondary**: Nova Text (body, content) - optimized for readability
- **Fallback**: Inter, Arial, sans-serif for system compatibility
- **Scale**: Responsive typography with proper line heights (1.4-1.6x)

### Design Principles
- **Regional Identity**: Authentic Saarland representation without clichés
- **Technical Sovereignty**: Independent, self-determined design language
- **Accessibility**: WCAG 2.1 AA compliance minimum
- **Mobile-First**: Progressive enhancement from mobile to desktop
- **Performance**: <300ms API responses, <2s page load times

### UI Components (shadcn/ui + Custom)
- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
- **Design Tokens**: Consistent spacing (8px grid), colors, typography
- **State Management**: Hover, focus, active, disabled, loading, error states
- **Animation**: Purposeful micro-interactions with natural easing

## 🚀 Implementation Status & Roadmap

### ✅ Completed (Production Ready)
- **Architecture**: Modern monorepo with Next.js 14 + App Router
- **AI Integration**: DeepSeek R1 + Gemini multi-model stack  
- **Premium Services**: €10 SAAR-ID/Business-ID registration system
- **Real-time Analytics**: User tracking starting from 0 (no fake data)
- **Mobile Optimization**: PWA-ready responsive design
- **Security**: Dependency vulnerabilities resolved, GDPR framework
- **Infrastructure**: Supabase + Vercel PRO + automated deployment
- **SAARBRETT**: Community bulletin board with blue navigation button (blauer Hintergrund, weiße Schrift)
- **Behördenfinder**: Maximally extended with 25+ detailed authorities database
- **Stripe Integration**: Real API with test keys, subscription handling, Stripe CLI installed
- **Navigation**: Enhanced with SAARBRETT prominent placement

### 🔄 Active Development
- **Enhanced AI Services**: Open Canvas content creation
- **Cross-border Features**: Grenzpendler specialized services  
- **Revenue Optimization**: Conversion funnel improvements
- **Data Integration**: Real-time Saarland authority data crawling
- **Performance**: Sub-300ms API response optimization

### 📋 Strategic Priorities (Q3 2025)
1. **Revenue Growth**: Scale to €25,000+ Monthly Recurring Revenue
2. **User Acquisition**: Grow to 50,000+ active users
3. **Premium Conversion**: Optimize 5% free→premium conversion rate
4. **Cross-border Expansion**: Launch Grenzpendler premium services
5. **Government Integration**: White-label solutions for authorities
6. **API Marketplace**: Developer-focused revenue stream

### 🎯 Success Metrics Dashboard
- **Performance**: <300ms API, <2s page load, 99.9% uptime
- **Business**: €25k+ MRR, 50k+ users, <2% churn rate
- **Technical**: 0 security vulnerabilities, 100% mobile score
- **Regional**: Real-time Saarland data integration, cross-border services

## 👨‍💻 Development Guidelines & Best Practices

### Code Quality Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **Next.js 14**: App Router patterns, server/client components
- **Components**: Atomic design principles, prop interfaces
- **Error Handling**: Graceful degradation, user-friendly messages
- **Performance**: Code splitting, lazy loading, bundle optimization

### API Development Best Practices
```typescript
// API Route Structure (Edge Runtime)
export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // 1. Validate input
    const { query } = await request.json()
    if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 })
    
    // 2. Process with AI
    const response = await enhancedAI.process(query)
    
    // 3. Return consistent format
    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
```

### Deployment Workflow
1. **Local Testing**: `pnpm build && pnpm lint && pnpm typecheck`
2. **Automated Setup**: `npx tsx claude-init.ts` (includes deployment)
3. **Manual Deploy**: `cd apps/web && vercel --prod`
4. **Health Check**: Test APIs on https://agentland.saarland
5. **Monitoring**: Track performance, errors, and revenue metrics

### Security & Compliance
- **Environment Variables**: Never commit secrets, use Vercel env
- **CORS**: Restricted to agentland.saarland domains
- **Rate Limiting**: Implement for all public APIs
- **GDPR**: Data protection by design, user consent management
- **Vulnerability Scanning**: Automated dependency updates

## 🔐 Environment Variables & Configuration

### Required Production Variables
```bash
# AI Services
DEEPSEEK_API_KEY=sk-xxxxx          # DeepSeek R1 reasoning model
GOOGLE_AI_API_KEY=xxxxx            # Gemini 2.5 Flash fallback

# Database & Auth
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxxxx            # Public key for client
SUPABASE_SERVICE_ROLE_KEY=xxxxx    # Server-side operations

# Deployment
VERCEL_ENV=production              # Environment detection
NEXT_PUBLIC_VERCEL_URL=agentland.saarland
```

### Development Variables
```bash
# Local development
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional integrations
GITHUB_TOKEN=xxxxx                 # For automated deployments
ANALYTICS_KEY=xxxxx                # For revenue tracking
```

## 📊 Monitoring & Observability

### Performance Targets
- **API Response**: <300ms (target), <500ms (maximum)
- **Page Load**: <2s first paint, <4s fully interactive
- **Uptime**: 99.9% SLA (maximum 43 minutes downtime/month)
- **Error Rate**: <1% for critical paths, <0.1% for premium services

### Health Check Endpoints
```typescript
GET /api/ai/enhanced?test=health    # AI system health
GET /api/analytics/real-users       # User tracking health  
GET /api/premium/saarland           # Revenue system health
GET /api/registration/saar-id       # Registration system health
```

### Revenue Analytics Dashboard
- **MRR Growth**: Track €0 → €25,000+ monthly recurring revenue
- **User Conversion**: Monitor free → premium conversion rates
- **Churn Analysis**: Track subscription cancellations and retention
- **ARPU**: Average revenue per user optimization

## 🎯 Platform Vision & Mission

### Mission Statement
**"Souveräne KI-Technologie aus dem Saarland – für ein intelligentes Morgen"**

Build the leading regional AI platform that combines cutting-edge artificial intelligence with deep regional expertise, serving as the digital backbone for Saarland's citizens, businesses, and government entities.

### Technical Sovereignty Principles
- **Data Control**: Keep regional data within Saarland's jurisdiction
- **Algorithm Transparency**: Open about AI decision-making processes  
- **Regional Optimization**: Specialized for Saarland's unique needs
- **Democratic Governance**: Community-driven development priorities
- **Economic Independence**: Self-sustaining through premium services

### Success Vision (Q3 2025)
- **€25,000+ MRR**: Sustainable revenue through premium subscriptions
- **50,000+ Users**: Comprehensive market penetration in Saarland
- **Cross-border Excellence**: Leading platform for DE/FR/LU services
- **Government Integration**: Trusted partner for digital transformation
- **Technical Leadership**: Reference implementation for regional AI platforms

---

**Last Updated**: 6. Januar 2025  
**Status**: Production-Ready Advanced AI Platform  
**Live Domain**: https://agentland.saarland  
**Architecture**: Next.js 15 + Supabase + Vercel PRO + DeepSeek R1  
**Revenue Model**: €10 Premium Subscriptions + API Marketplace