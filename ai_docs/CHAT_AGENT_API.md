# Chat Agent API

This endpoint exposes the Claude API via Next.js API routes.

## Endpoint
`/api/chat-agent`

### Request
```json
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "system": "optional system prompt"
}
```

### Response
```json
{ "role": "assistant", "content": "response text" }
```

The handler uses `@anthropic-ai/sdk` and expects `ANTHROPIC_API_KEY` to be set.
