# StudyPilot — Vercel Deployment & Production Readiness Guide

This document details the deployment architecture, configuration steps, environment variables, and operational workflows for deploying **StudyPilot** to **Vercel**.

---

## 1. Executive Summary & Vercel MCP Status

- **Vercel MCP Connection Status**: In this sandboxed session environment, no active Vercel MCP server connection is provisioned.
- **Manual / CLI Setup Steps Required**:
  To link and deploy via Vercel CLI or Vercel MCP:
  1. Install Vercel CLI: `npm i -g vercel`
  2. Authenticate: `vercel login` (or export `VERCEL_TOKEN=<token>`)
  3. Link Project: `vercel link`
  4. If configuring Vercel MCP in your AI IDE (e.g., Claude Code / Cursor), add the official Vercel MCP server configuration to your `mcpServers` settings:
     ```json
     {
       "mcpServers": {
         "vercel": {
           "command": "npx",
           "args": ["-y", "@vercel/mcp-server"],
           "env": {
             "VERCEL_TOKEN": "<your-vercel-personal-access-token>"
           }
         }
       }
     }
     ```

---

## 2. Architecture & Monorepo Triage

StudyPilot was originally scaffolded as an npm workspaces monorepo:
```
/
├── apps/
│   └── web/           # Next.js 16 (App Router) frontend
├── packages/
│   └── contracts/     # OpenAPI schemas and shared TypeScript contracts
├── services/
│   └── api/           # Python 3.14 FastAPI service with worker
└── supabase/          # PostgreSQL migrations, RLS rules, and seeds
```

### Deployment Models for Vercel

### Option A: React SPA Deployment (Root or Standalone)
- **Framework Preset**: Vite
- **Root Directory**: `.`
- **Build Command**: `npm run build` (`vite build`)
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Features**: Standalone client-side application with client-side AI generation, local data persistence (SuperMemo SM-2 flashcard scheduler, dynamic curriculum synthesis, and quiz grading). Runs with zero external infrastructure dependencies.

### Option B: Full-Stack Next.js Monorepo Deployment
- **Framework Preset**: Next.js
- **Root Directory**: `apps/web` (or root with `--workspace @studypilot/web`)
- **Build Command**: `npm run build --workspace @studypilot/web`
- **Install Command**: `npm install`
- **Output Directory**: `.next`
- **Runtime Requirement**: Requires Supabase environment variables defined below to succeed during build-time page pre-rendering.

---

## 3. Required Environment Variables

> **Security Rule**: Never commit secrets or service role keys to Git.

### Frontend Variables (Vercel Preview & Production)

| Variable Name | Environment | Required | Description |
|---|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | All | Optional | App display name (defaults to `StudyPilot`) |
| `NEXT_PUBLIC_SUPABASE_URL` | All | Required for Next.js Auth | Your Supabase project URL (`https://<project-ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | All | Required for Next.js Auth | Supabase anon/publishable key |
| `NEXT_PUBLIC_API_BASE_URL` | All | Optional | Backend FastAPI URL (if using external API service) |

### Backend / Worker Variables (If hosting FastAPI & Background Jobs)

| Variable Name | Environment | Required | Description |
|---|---|---|---|
| `DATABASE_URL` | Production / Backend | Required | PostgreSQL connection string (`postgresql://postgres:...@db...`) |
| `SUPABASE_URL` | Production / Backend | Required | Supabase API URL |
| `SUPABASE_JWT_SECRET` | Production / Backend | Required | JWT secret for verifying Supabase auth tokens |
| `LLM_PROVIDER` | Production / Backend | Required | `gemini` (or `fake` for testing) |
| `GEMINI_API_KEY` | Production / Backend | Required if `gemini` | Google Gemini API key |

---

## 4. Deploying via Vercel CLI

### Step 1: Link Project
From the repository root:
```bash
vercel link
```
Follow the interactive prompts:
- **Set up and deploy?**: `Y`
- **Which scope?**: Select your personal or team account
- **Link to existing project?**: `Y` (select `studypilot` if already created) or `N` to create a new project.

### Step 2: Set Environment Variables
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY preview
```

### Step 3: Deploy Preview
```bash
vercel
```
This builds and deploys a preview URL (e.g. `https://studypilot-xyz.vercel.app`).

### Step 4: Promote to Production
After inspecting the preview deployment and verifying routes:
```bash
vercel --prod
```

---

## 5. Background Processing & Python Backend Hosting

The original `services/api` contains:
1. **FastAPI Endpoints**: REST API endpoints for user goals, roadmaps, lessons, quizzes, and document storage.
2. **PostgreSQL Job Worker (`app.worker`)**: A persistent queue worker executing `FOR UPDATE SKIP LOCKED` loops for:
   - Long-running AI roadmap generation.
   - Grounded lesson synthesis.
   - Quiz grading.
   - PDF/Slide export generation.

### Vercel Limitations for Background Processing:
- Vercel Serverless Functions have a maximum execution timeout (10s on Hobby, 60s/300s on Pro).
- Permanent daemon loops (`python -m app.worker`) cannot run as serverless request handlers.
- **Recommended Production Worker Hosting**:
  - Deploy `services/api` as a Docker container on **Render**, **Railway**, **Google Cloud Run**, or **Fly.io**.
  - Connect the Vercel frontend via `NEXT_PUBLIC_API_BASE_URL`.

---

## 6. Verification & Route Testing Checklist

1. **Homepage & Navigation**:
   - `/` or `/dashboard` loads goals list, active/paused/completed counts, and progress overview.
2. **Goal Lifecycle**:
   - Create Goal (`/goals/new`): Generates new learning goal with automated initial curriculum roadmap.
   - Goal Detail (`/goals/:id`): Shows study progress, days countdown, document count, and flashcard deck.
   - Goal Actions: Pause, resume, complete, and archive goals.
3. **Curriculum Roadmap**:
   - `/goals/:id/roadmap`: Multi-module breakdown with topic kinds (Core, Enrichment, Revision), estimated time, and direct study links.
   - Version history and regeneration capabilities.
4. **Interactive Lessons**:
   - `/goals/:id/learn/:topicId`: Full structured lesson with objectives, sections, callouts, copyable code snippets, key terms, worked examples, common mistakes, and "In Simple Terms" plain-language analogies.
5. **Mastery Quizzes**:
   - `/goals/:id/learn/:topicId/quiz`: Multi-question assessment with instant local grading, detailed question-by-question explanations, weak concept diagnosis, and clear next steps.
6. **Study Material (Documents)**:
   - `/goals/:id/documents`: Upload file (PDF/text) or paste notes; searchable passages across all materials.
7. **Flashcards & Spaced Repetition**:
   - `/goals/:id/flashcards`: Due now counter, interactive flip cards, and SuperMemo SM-2 rating buttons (Again, Hard, Good, Easy).
8. **Export Center**:
   - `/goals/:id/exports`: Export lessons, roadmaps, and summaries to PDF/Text.
9. **System Diagnostics**:
   - `/status`: Live service health check, latency benchmarking, and build target information.
10. **Design System Preview**:
   - `/design`: Complete WCAG-compliant color tokens, typography scales, buttons, badges, alerts, and modal dialogs.
