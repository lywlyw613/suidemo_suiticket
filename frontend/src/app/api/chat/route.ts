// Next.js API Route for OpenAI Chat
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client (only if API key is available)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!openai || !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.',
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

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({
      success: true,
      message: assistantMessage,
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get AI response',
      },
      { status: 500 }
    );
  }
}

