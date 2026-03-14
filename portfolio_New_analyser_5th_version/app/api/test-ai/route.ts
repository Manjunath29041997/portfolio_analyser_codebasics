import { NextRequest, NextResponse } from 'next/server';
import { getChatCompletion } from '@/lib/ai';

export async function POST(req: NextRequest) {
    try {
        const config = await req.json();
        
        if (!config.apiKey) {
            return NextResponse.json({ error: 'API key is required' }, { status: 400 });
        }

        // Send a tiny test prompt to verify the key
        const result = await getChatCompletion(
            config,
            "You are a test assistant. Respond with 'OK' in JSON format.",
            "Test connection."
        );

        if (result) {
            return NextResponse.json({ success: true });
        }
        
        throw new Error('No response from AI');
    } catch (error: any) {
        console.error('Test AI Error:', error);
        return NextResponse.json({ 
            error: error.message || 'Connection failed' 
        }, { status: 500 });
    }
}
