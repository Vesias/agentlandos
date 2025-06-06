# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**AGENTLAND.SAARLAND** is an AI-powered platform for the Saarland region (Germany) targeting €25,000+ MRR by Q3 2025. This is a production system with real users, revenue targets, and enterprise requirements.

**Live Domain**: https://agentland.saarland  
**Tech Stack**: Next.js 15 + TypeScript + Supabase + Vercel + DeepSeek R1 + Multi-Agent AI  
**Target**: 50,000+ users, €10 premium subscriptions, cross-border DE/FR/LU services

## Repository Structure

```
agentlandos/                 # Monorepo root
├── apps/web/               # Next.js 15 app (primary)
├── apps/api/               # FastAPI backend (specialized AI)
├── scripts/                # Deployment & maintenance
├── infrastructure/         # Docker & K8s configs
└── .cursorrules           # Development rules
```

## Essential Commands

### Development Workflow
```bash
# Start development (from root)
pnpm dev                    # All services in parallel
cd apps/web && pnpm dev     # Frontend only (:3000)

# Build & Test
pnpm build                  # Build all packages
pnpm lint                   # ESLint all packages  
pnpm typecheck              # TypeScript validation
cd apps/web && pnpm vercel-build  # Vercel-optimized build

# Database
supabase start              # Local Supabase
supabase db reset           # Reset database
supabase gen types typescript --local > apps/web/src/types/supabase.ts

# Deployment
vercel --prod               # Deploy to production
vercel env add DEEPSEEK_API_KEY  # Add environment variables
```

### Package Management
- **Package Manager**: pnpm (required, faster than npm)
- **Root commands**: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`
- **App-specific**: `cd apps/web && pnpm <command>`
- **Monorepo**: Uses Turbo for build pipeline optimization

## Architecture Patterns

### API Routes (Next.js App Router)
```typescript
// API route pattern: apps/web/src/app/api/*/route.ts
export const runtime = 'edge'  // Use edge runtime for performance

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 })
    
    const response = await enhancedAI.process(query)
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

### Multi-Agent AI System
- **Primary**: DeepSeek R1 (deepseek-reasoner-r1-0528) for advanced reasoning
- **Fallback**: Gemini 2.5 Flash for fast responses
- **Integration**: LangChain + LangGraph for multi-agent orchestration
- **Cost Optimization**: Context caching for 74% cost reduction

### Component Architecture
```typescript
// Component pattern: apps/web/src/components/
// Use TypeScript strict mode, no 'any' types
interface ComponentProps {
  data: SpecificType
  onAction: (id: string) => void
}

export function Component({ data, onAction }: ComponentProps) {
  // Always include error boundaries, loading states, accessibility
  return (
    <div className="wcag-compliant-classes">
      {/* WCAG 2.1 AA compliant UI */}
    </div>
  )
}
```

## Critical Development Rules

### Security Requirements
- **No hardcoded API keys** - Use environment variables via Vercel
- **GDPR Compliance** - All features must include data protection
- **Input Validation** - Use Zod for TypeScript, Pydantic for Python
- **Error Handling** - Graceful degradation with user-friendly messages

### Performance Standards
- **API Response**: <300ms target, <500ms maximum
- **Page Load**: <2s first paint, <4s fully interactive  
- **Build Size**: Keep bundle <100MB
- **Accessibility**: WCAG 2.1 AA minimum compliance

### Code Quality
```typescript
// TypeScript strict mode required
// Component props must have interfaces
// All async operations need loading states
// Mobile-first responsive design mandatory
// Error boundaries for all major components
```

## Environment Variables

### Required for Development
```bash
DEEPSEEK_API_KEY=sk-xxxxx           # DeepSeek R1 for AI processing
GOOGLE_AI_API_KEY=xxxxx             # Gemini fallback
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxxxx             # Public database access
SUPABASE_SERVICE_ROLE_KEY=xxxxx     # Server-side operations
```

### Optional Integrations
```bash
OPENAI_API_KEY=sk-xxxxx             # For embeddings/vector search
STRIPE_SECRET_KEY=sk_test_xxxxx     # Payment processing
NEXT_PUBLIC_VERCEL_URL=agentland.saarland
```

## Deployment Workflow

### Automated Deployment
```bash
# Quick deploy with automated setup
npx tsx claude-init.ts              # Auto-setup infrastructure + deploy

# Manual deployment  
cd apps/web
pnpm build                          # Verify build works
vercel --prod                       # Deploy to production
```

### Health Checks
```bash
# Verify deployments
curl https://agentland.saarland/api/health
curl https://agentland.saarland/api/analytics/real-users
```

## Known Issues & Solutions

### Current Issues (January 2025)
1. **OpenAI API Key**: Invalid key causing embedding failures - needs updating
2. **Dependency Vulnerabilities**: 11 vulnerabilities (1 critical) - run `pnpm update`
3. **Metadata Warnings**: Missing metadataBase property in Next.js metadata
4. **Vercel Config**: Uses npm instead of pnpm - already fixed in vercel.json

### Quick Fixes
```bash
# Update dependencies to fix vulnerabilities
pnpm update

# Check build before deployment
cd apps/web && pnpm build

# Verify environment variables
vercel env ls
```

## Revenue-Critical Features

Every change must support one of these revenue streams:
- **€10 Premium Subscriptions**: SAAR-ID/Business-ID registration
- **B2B AI Services**: €50-200/month enterprise automation
- **API Marketplace**: Pay-per-use AI agent services  
- **Cross-Border Services**: DE/FR/LU Grenzpendler premium features

## Regional Integration

### Multilingual Support
- **Primary**: German (Deutsch)
- **Secondary**: French (Français) for cross-border
- **Fallback**: English
- **Special**: Saarländischer Dialekt recognition

### Data Sources
- **GeoPortal Saarland**: Live regional data
- **saarVV**: Public transport GTFS-RT
- **Business Directory**: 25+ detailed authorities
- **Tourism Data**: Real-time events and attractions

## File Patterns

### Key Directories
```
apps/web/src/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes with edge runtime
│   ├── (pages)/           # App pages
├── components/            # React components with TypeScript
├── lib/                   # Utilities, AI services, connectors
│   ├── ai/               # Multi-agent AI integration
│   ├── search/           # Web search functionality
│   └── connectors/       # External API integrations
└── types/                # TypeScript definitions
```

### Configuration Files
- `next.config.js`: Next.js config with image optimization + CORS
- `tailwind.config.js`: Design system with Saarland brand colors
- `vercel.json`: Deployment config with pnpm support
- `turbo.json`: Monorepo build pipeline
- `.cursorrules`: Development guidelines (German)

## Testing & Quality

### Missing (High Priority)
- Unit tests with Jest + Testing Library
- E2E tests with Playwright  
- Visual regression testing
- Accessibility testing automation
- Performance monitoring

### Current Quality Measures
- ESLint with Next.js config
- TypeScript strict mode
- Prettier formatting
- Supabase type generation

---

**Last Updated**: January 6, 2025  
**Status**: Production deployment with search integration ✅  
**Next Priority**: Fix OpenAI API key, resolve security vulnerabilities, implement testing