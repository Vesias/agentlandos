# Agent System

## New API Endpoint

`POST /api/agent`

- Streams responses from Claude 3.5 using Server-Sent Events.
- Persists conversation history in the `agent_history` table.
- Requires authentication via middleware.

### Request Body
```json
{ "message": "text", "sessionId": "optional" }
```

### Response
Streaming text chunks forming the assistant reply.

## Frontend Chat

`/chat`

- Uses Supabase real-time subscriptions to reflect new messages instantly.
- Persists session id in browser storage for memory.
- Styled with Saarland brand colors and fonts.

## Authentication Middleware

Middleware now uses `withMiddlewareAuth` from `@supabase/auth-helpers-nextjs` to protect pages and API routes.
