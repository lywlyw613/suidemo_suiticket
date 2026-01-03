// Next.js API Route for AI Chat - Supports both OpenAI and Google Gemini
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize OpenAI client (only if API key is available)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Initialize Google Gemini client (only if API key is available)
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Determine which LLM provider to use (priority: Gemini > OpenAI)
function getProvider() {
  if (genAI && process.env.GEMINI_API_KEY) {
    return 'gemini';
  }
  if (openai && process.env.OPENAI_API_KEY) {
    return 'openai';
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const provider = getProvider();
    
    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          error: 'No AI provider configured. Please set either GEMINI_API_KEY or OPENAI_API_KEY in your environment variables.',
        },
        { status: 500 }
      );
    }

    const { messages, events } = await request.json();

    // Get events data from request
    const allEvents = events || [];

    // Build system prompt with event information
    const systemPrompt = `You are a helpful AI assistant for an NFT ticketing system. Your role is to help users find events, understand ticket information, and assist with ticket purchases.

IMPORTANT RULES:
1. ONLY answer questions about events and tickets that are available on this platform.
2. If asked about events not in the provided data, politely say you can only help with events on this platform.
3. Be friendly, helpful, and concise.
4. Always provide accurate information from the event data provided.
5. If you don't know something, say so rather than making up information.
6. When mentioning prices, always specify they are in SUI (cryptocurrency).
7. When mentioning dates/times, use the format provided in the event data.

AVAILABLE EVENTS:
${JSON.stringify(allEvents, null, 2)}

When users ask about events, tickets, prices, seating, or purchase information, use ONLY the data from the events listed above.`;

    let assistantMessage = '';

    if (provider === 'gemini') {
      // Use Google Gemini
      const model = genAI!.getGenerativeModel({ model: 'gemini-pro' });
      
      // Build the full prompt with system instructions and conversation
      // For Gemini, we'll include the system prompt as part of the first message
      const conversationHistory = messages
        .filter((msg: any) => msg.role !== 'system') // Exclude system messages
        .map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

      // Combine system prompt with the last user message
      const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
      const fullPrompt = `${systemPrompt}\n\nUser: ${lastUserMessage?.content || ''}`;

      // Start a chat with history
      const chat = model.startChat({
        history: conversationHistory.slice(0, -1), // All messages except the last one
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      });

      // Send the last message with system context
      const result = await chat.sendMessage(fullPrompt);
      const response = await result.response;
      assistantMessage = response.text();
    } else {
      // Use OpenAI
      const completion = await openai!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      assistantMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    }

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      provider: provider, // Return which provider was used
    });
  } catch (error: any) {
    console.error('AI API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get AI response',
      },
      { status: 500 }
    );
  }
}
