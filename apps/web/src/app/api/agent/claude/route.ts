import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, AuthService } from '@/lib/supabase';

export const runtime = 'edge';

// Claude API configuration
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-haiku-20241022'; // Cost-efficient model for high-volume business use
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Parse request
    const { message, sessionId, stream = true } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > 4000) {
      return NextResponse.json(
        { error: 'Message too long (max 4000 characters)' },
        { status: 400 }
      );
    }

    // Fetch conversation history if sessionId provided
    let conversationHistory: ChatMessage[] = [];
    if (sessionId) {
      const { data: history } = await supabaseServer
        .from('agent_conversations')
        .select('messages')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .single();
      
      if (history?.messages) {
        conversationHistory = history.messages as ChatMessage[];
      }
    }

    // Build messages for Claude
    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: message }
    ];

    // System prompt for AGENTLAND context
    const systemPrompt = `Du bist ein hilfreicher KI-Assistent von AGENTLAND.SAARLAND - der ersten KI-Agentur im Saarland. 
Du hilfst Unternehmen, ihre Umsätze durch KI-Automatisierung zu steigern und Kosten zu reduzieren. 
Antworte professionell, präzise und immer mit Fokus auf den Geschäftsnutzen.
Unsere Philosophie: "Das AGENTNET wird real - während andere noch im sterbenden Internet denken, bauen wir die Zukunft."`;

    // Call Claude API
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'messages-2023-12-15'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        temperature: 0.7,
        system: systemPrompt,
        messages,
        stream
      })
    });

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text();
      console.error('Claude API error:', error);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Handle streaming response
    if (stream && claudeResponse.body) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      // Create a TransformStream for SSE
      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          const text = decoder.decode(chunk);
          const lines = text.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: data.delta.text })}\n\n`));
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      });

      // Save conversation to database (non-blocking)
      const saveConversation = async () => {
        const reader = claudeResponse.body!.getReader();
        let assistantMessage = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const text = decoder.decode(value);
          const lines = text.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  assistantMessage += data.delta.text;
                }
              } catch (e) {
                // Skip
              }
            }
          }
        }

        // Save to database
        if (sessionId && assistantMessage) {
          const updatedMessages = [
            ...conversationHistory,
            { role: 'user' as const, content: message },
            { role: 'assistant' as const, content: assistantMessage }
          ];

          await supabaseServer
            .from('agent_conversations')
            .upsert({
              session_id: sessionId,
              user_id: user.id,
              messages: updatedMessages,
              updated_at: new Date().toISOString()
            });
        }
      };

      // Start saving in background
      saveConversation().catch(console.error);

      // Return streaming response
      return new Response(claudeResponse.body.pipeThrough(transformStream), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    } else {
      // Non-streaming response
      const data = await claudeResponse.json();
      const assistantMessage = data.content?.[0]?.text || '';

      // Save conversation
      if (sessionId && assistantMessage) {
        const updatedMessages = [
          ...conversationHistory,
          { role: 'user' as const, content: message },
          { role: 'assistant' as const, content: assistantMessage }
        ];

        await supabaseServer
          .from('agent_conversations')
          .upsert({
            session_id: sessionId,
            user_id: user.id,
            messages: updatedMessages,
            updated_at: new Date().toISOString()
          });
      }

      return NextResponse.json({
        success: true,
        message: assistantMessage,
        sessionId
      });
    }
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// GET endpoint for session history
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      // Return user's recent sessions
      const { data: sessions } = await supabaseServer
        .from('agent_conversations')
        .select('session_id, updated_at, messages')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      return NextResponse.json({
        success: true,
        sessions: sessions || []
      });
    } else {
      // Return specific session
      const { data: session } = await supabaseServer
        .from('agent_conversations')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        session
      });
    }
  } catch (error) {
    console.error('Agent history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}