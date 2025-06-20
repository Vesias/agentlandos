# Vercel Deployment Guide

This guide describes the recommended way to deploy the **Agentland Saarland** project to Vercel.

## 1. Configure Environment Variables

Ensure the following variables are set in the Vercel dashboard:

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_API_URL`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

`NEXT_PUBLIC_API_URL` defaults to `/api` as defined in `vercel.json`.

The repository provides an `env.production.example` file with the full list of
required variables. Copy it to `.env.production` and fill in your secrets before
deploying. You can also use `apps/web/vercel-env-setup.sh` to add them via the
CLI.

## 2. Project Settings

Use the root `vercel.json` file. Important values are:

```json
{
  "installCommand": "cd apps/web && npm install",
  "buildCommand": "cd apps/web && npm run build",
  "framework": "nextjs",
  "outputDirectory": "apps/web/.next"
}
```

## 3. Deploying via Script

Run the helper script to deploy from the repository root:

```bash
bash scripts/vercel-deploy.sh
```

The script validates required environment variables and then executes `vercel --prod` in `apps/web`.

---

**Last Updated:** 9 June 2025
