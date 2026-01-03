'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllDemoEvents, type DemoEvent } from '@/lib/demoEvents';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your AI ticketing assistant. I can help you:\n• Search for events\n• Provide personalized recommendations\n• Suggest seats\n• Assist with ticket purchases\n\nPlease tell me what you need?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get all events data (demo + localStorage)
  const getAllEvents = (): DemoEvent[] => {
    const demoEvents = getAllDemoEvents();
    const savedEvents = JSON.parse(localStorage.getItem('demo_events') || '[]');
    
    // Merge and remove duplicates
    const allEvents = [...demoEvents, ...savedEvents];
    const uniqueEvents = allEvents.filter((event, index, self) =>
      index === self.findIndex((e) => e.id === event.id)
    );
    
    return uniqueEvents;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // Get all events data
      const allEvents = getAllEvents();
      
      // Prepare messages for API (convert to OpenAI format)
      const apiMessages = messages
        .filter((msg) => msg.role !== 'assistant' || msg.id !== '1') // Exclude initial greeting
        .map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }))
        .concat([{ role: 'user' as const, content: currentInput }]);

      // Call OpenAI API via Next.js API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          events: allEvents,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error: any) {
      console.error('AI API error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Please try again later.'}\n\nMake sure you have set up your OPENAI_API_KEY in the environment variables.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Find Concerts', query: 'Find concerts' },
    { label: 'Recommended Events', query: 'What events do you recommend?' },
    { label: 'View Seats', query: 'What seats are available?' },
    { label: 'Ticket Purchase', query: 'How do I purchase tickets?' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/customer/dashboard" className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-pink-500 bg-clip-text text-transparent">
            suiTicket - AI Assistant
          </Link>
          <Link
            href="/customer/dashboard"
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Back
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-700'}`}>
                  {message.timestamp.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setInput(action.query)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 whitespace-nowrap transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Enter your question..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

