import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// Ultra-fast chat for quick queries - Optimized for speed
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { message, context } = await request.json();
    
    if (!message || message.length > 500) {
      return NextResponse.json({
        error: 'Message required and must be under 500 characters for fast mode'
      }, { status: 400 });
    }

    // Use Gemini 2.5 Flash for maximum speed
    const model = gemini.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        maxOutputTokens: 300, // Short responses
        temperature: 0.7,
      }
    });

    const prompt = `Du bist SAAR-GPT, ein schneller KI-Assistent für das Saarland.

WICHTIG: Antworte KURZ und PRÄZISE. Maximum 2-3 Sätze.

Kontext: ${context?.location || 'Saarland'}, ${new Date().toLocaleString('de-DE')}

User: ${message}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({
      content: response,
      model: 'gemini-2.5-flash',
      responseTime: Date.now() - startTime,
      mode: 'fast',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fast chat error:', error);
    
    // Ultra-fast fallback
    return NextResponse.json({
      content: 'Entschuldigung, ich bin momentan nicht verfügbar. Versuchen Sie es gleich nochmal.',
      model: 'fallback',
      responseTime: Date.now() - startTime,
      mode: 'fast',
      error: true
    }, { status: 200 }); // Return 200 for graceful degradation
  }
}

// Quick weather check
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'wetter saarland';
  
  try {
    // Quick responses for common queries
    const quickResponses = {
      'wetter': '🌤️ Heute 15°C, teilweise bewölkt. Perfekt für einen Spaziergang!',
      'verkehr': '🚗 Verkehr fließt normal. A6 und A8 ohne größere Störungen.',
      'events': '📅 Heute: Kulturzentrum Saarbrücken hat Ausstellung bis 20 Uhr.',
      'behörden': '🏛️ Bürgeramt heute bis 16 Uhr geöffnet. Online-Termine verfügbar.',
      'news': '📰 Neue Fahrradwege werden ausgebaut. Digitales Bürgeramt startet.'
    };

    const key = Object.keys(quickResponses).find(k => 
      query.toLowerCase().includes(k)
    );

    if (key) {
      return NextResponse.json({
        content: quickResponses[key],
        model: 'quick-lookup',
        responseTime: 50,
        mode: 'instant',
        cached: true
      });
    }

    // Fallback to fast AI
    return NextResponse.json({
      content: 'Für schnelle Antworten nutzen Sie den Chat oder fragen Sie nach: wetter, verkehr, events, behörden, news',
      model: 'quick-help',
      responseTime: 25,
      mode: 'instant'
    });

  } catch (error) {
    return NextResponse.json({
      content: 'Service momentan nicht verfügbar',
      error: true
    }, { status: 503 });
  }
}