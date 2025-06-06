'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Bot, User, Loader2, RefreshCw, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabaseBrowser } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export default function AgentChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingMessage, setStreamingMessage] = useState('');

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session) {
        router.push('/auth?mode=login&redirect=/agent/chat');
        return;
      }
      setIsAuthenticated(true);
      
      // Initialize or retrieve session ID
      const storedSessionId = localStorage.getItem('agent-session-id');
      if (storedSessionId) {
        setSessionId(storedSessionId);
        loadSessionHistory(storedSessionId, session.access_token);
      } else {
        const newSessionId = uuidv4();
        setSessionId(newSessionId);
        localStorage.setItem('agent-session-id', newSessionId);
      }
    };

    checkAuth();
  }, [router]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const loadSessionHistory = async (sessionId: string, token: string) => {
    try {
      const response = await fetch(`/api/agent/claude?sessionId=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.session?.messages) {
          setMessages(data.session.messages);
        }
      }
    } catch (error) {
      console.error('Failed to load session history:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !isAuthenticated) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingMessage('');

    // Add user message
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/agent/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  assistantMessage += data.text;
                  setStreamingMessage(assistantMessage);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        // Add complete assistant message
        if (assistantMessage) {
          const newAssistantMessage: ChatMessage = {
            role: 'assistant',
            content: assistantMessage,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, newAssistantMessage]);
          setStreamingMessage('');
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = () => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    localStorage.setItem('agent-session-id', newSessionId);
    setMessages([]);
    setStreamingMessage('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Authentifizierung wird überprüft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-saarland-blue flex items-center gap-2">
                <Bot className="w-8 h-8" />
                AGENTLAND KI-Berater
              </h1>
              <p className="text-gray-600 mt-1">
                Ihr persönlicher KI-Assistent für Geschäftsautomatisierung
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={startNewSession}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Neue Sitzung
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-sm">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !streamingMessage && (
              <div className="text-center text-gray-500 py-12">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Willkommen! Wie kann ich Ihnen bei der KI-Automatisierung helfen?</p>
                <p className="text-sm mt-2">
                  Fragen Sie mich über Kosteneinsparungen, Prozessoptimierung oder KI-Integration.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-saarland-blue text-white'
                        : 'bg-innovation-cyan text-white'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-saarland-blue text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.timestamp && (
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString('de-DE')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming message */}
            {streamingMessage && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-innovation-cyan text-white flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                    <p className="whitespace-pre-wrap">{streamingMessage}</p>
                    <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Stellen Sie Ihre Frage zur KI-Automatisierung..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saarland-blue focus:border-transparent"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-saarland-blue hover:bg-blue-700 text-white gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Senden
              </Button>
            </form>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
          <p className="text-sm text-gray-600 text-center">
            💡 <strong>Tipp:</strong> Fragen Sie nach konkreten Einsparungsmöglichkeiten, 
            ROI-Berechnungen oder Automatisierungsstrategien für Ihr Unternehmen.
          </p>
        </div>
      </div>
    </div>
  );
}