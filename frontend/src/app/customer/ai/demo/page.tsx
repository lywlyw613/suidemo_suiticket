'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  showBuyButton?: boolean;
}

export default function DemoAIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your AI ticketing assistant. I can help you:\n• Search for events\n• Provide personalized recommendations\n• Suggest seats\n• Assist with ticket purchases\n\nPlease tell me what you need?',
      timestamp: new Date(),
    },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Predefined conversation flow
  const conversationFlow = [
    {
      user: 'Show me jazz concert next week around Taipei',
      assistant: 'I found a great jazz event for you!\n\n🎵 **Taipei Neo-Jazz Night 2026: Rhythms of the City**\n📅 Date: February 1, 2026 at 7:30 PM\n📍 Venue: National Concert Hall, Taipei\n\nThis exclusive gala features Taiwan\'s top jazz virtuosos and international guest artists. Experience the fusion of classic swing and modern electronic jazz.\n\nWould you like to see available ticket types and seating options?',
      showBuyButton: false,
    },
    {
      user: 'I need 2 tickets',
      assistant: 'Perfect! I recommend **Section A (VVIP - Prestige)** for the best experience:\n\n✨ **VVIP - Prestige**\n• Price: 150 SUI per ticket\n• Location: Ground Floor Front (Rows A-J, Seats 1-30)\n• Includes: Backstage pass & NFT\n• Closest to the stage\n\n**Total for 2 tickets: 300 SUI**\n\nShall I proceed to checkout?',
      showBuyButton: true,
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAutoConversation = () => {
    if (currentStep >= conversationFlow.length) {
      return; // Conversation complete
    }

    const step = conversationFlow[currentStep];
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: step.user,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Add assistant response after a short delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: step.assistant,
        timestamp: new Date(),
        showBuyButton: step.showBuyButton,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentStep((prev) => prev + 1);
    }, 1500);
  };

  const handleBuyTickets = () => {
    // Navigate to purchase page with pre-selected options
    // Open in new tab for better screenshot flow
    window.open('/events/demo-taipei-jazz-2026/purchase?ticketType=vvip-prestige&quantity=2', '_blank');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/customer/dashboard" className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-pink-500 bg-clip-text text-transparent">
            SuiTicket - AI Assistant (Demo)
          </Link>
          <div className="flex gap-2">
            {currentStep < conversationFlow.length && (
              <button
                onClick={handleAutoConversation}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Auto Next Step
              </button>
            )}
            <Link
              href="/customer/dashboard"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Back
            </Link>
          </div>
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
                  {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {message.showBuyButton && (
                  <button
                    onClick={handleBuyTickets}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl w-full"
                  >
                    🎫 Buy Tickets (2x VVIP - Prestige)
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Info Banner */}
      <div className="border-t border-gray-200 bg-blue-50">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <p className="text-sm text-blue-800">
            💡 <strong>Demo Mode:</strong> This is a simulated conversation. Click "Auto Next Step" to see the full flow, or use the "Buy Tickets" button to proceed to checkout.
          </p>
        </div>
      </div>
    </div>
  );
}

