async function getCurrentSaarlandData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/cache/real-data`);
    
    if (response.ok) {
      const realData = await response.json();
      return {
        date: new Date().toISOString().split('T')[0],
        weather: realData.weather || {
          today: 'Wetterdaten werden geladen...',
          recommendation: 'Aktuelle Wetterempfehlungen folgen'
        },
        events: {
          verified: realData.events || [],
          today: realData.events?.filter((e: any) => 
            new Date(e.date).toDateString() === new Date().toDateString()
          ) || [],
          thisWeek: realData.events?.filter((e: any) => {
            const eventDate = new Date(e.date);
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return eventDate <= weekFromNow;
          }) || []
        },
        funding: realData.funding || [],
        userAnalytics: {
          activeUsers: 0,
          totalUsers: 0
        },
        lastUpdate: realData.lastUpdate || new Date().toISOString(),
        source: 'real-data-engine'
      };
    }
  } catch (error) {
    console.error('Real data fetch failed:', error);
  }

  // Fallback data structure
  return {
    date: new Date().toISOString().split('T')[0],
    weather: {
      today: 'Wetterdaten momentan nicht verfügbar',
      recommendation: 'Prüfen Sie lokale Wetterberichte'
    },
    events: {
      verified: [],
      today: [],
      thisWeek: []
    },
    funding: [],
    userAnalytics: {
      activeUsers: 0,
      totalUsers: 0
    },
    lastUpdate: new Date().toISOString(),
    source: 'fallback-structure',
    note: 'Real data temporarily unavailable'
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const validatedData = chatRequestSchema.parse(body);
    const { messages, userId, context, options } = validatedData;
    
    // Get user's latest message
    const userMessage = messages[messages.length - 1].content;
    
    // Get current Saarland data for context
    const saarlandData = await getCurrentSaarlandData();
    
    // Enhance context with real data
    let enhancedContext: any = {
      ...context,
      saarlandData,
      conversationHistory: messages.slice(-5),
      timestamp: new Date().toISOString(),
      location: context?.location || 'Saarland',
      language: context?.language || 'de'
    };

    // Try to enhance with embeddings-based context (graceful degradation)
    try {
      const embedding = await multiModelAI.createEmbedding(userMessage);
      if (embedding.length > 0) {
        try {
          // Search for similar previous conversations (if table exists)
          const result = await supabase
            .rpc('find_similar_chats', {
              query_embedding: embedding,
              similarity_threshold: 0.8,
              match_count: 3
            });
          
          const similar = result.data;

          if (similar && similar.length > 0) {
            enhancedContext.relatedTopics = similar.map((s: any) => s.topic);
          }
        } catch (dbError) {
          console.log('Database function not available, continuing without similarity search');
        }
      }
    } catch (embeddingError) {
      console.log('Embeddings not available, continuing without enhancement');
    }

    // Generate AI response using multi-model system
    const aiResponse = await multiModelAI.generateResponse(userMessage, {
      preferredModel: options?.preferredModel || 'auto',
      maxTokens: options?.maxTokens || 2000,
      temperature: options?.temperature || 0.7,
      context: enhancedContext,
      userId
    });

    // Log successful interaction
    if (userId) {
      try {
        await supabase.from('chat_interactions').insert({
          user_id: userId,
          message: userMessage,
          response: aiResponse.content,
          model_used: aiResponse.model,
          response_time_ms: Date.now() - startTime,
          context: enhancedContext
        });
      } catch (logError) {
        console.error('Failed to log interaction:', logError);
      }
    }

    // Return response
    return NextResponse.json({
      role: 'assistant',
      content: aiResponse.content,
      model: aiResponse.model,
      confidence: aiResponse.confidence,
      responseTime: Date.now() - startTime,
      enhanced: !!enhancedContext.relatedTopics,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);

    // Log error for monitoring
    try {
      await supabase.from('api_errors').insert({
        endpoint: '/api/chat',
        error_type: error?.name || 'Unknown',
        error_message: error?.message || 'Unknown error',
        error_stack: error?.stack || '',
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    // User-friendly error response
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Ungültige Anfrage',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      errorId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}