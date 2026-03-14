import Groq from 'groq-sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIConfig {
    provider: string;
    apiKey: string;
    model: string;
}

export async function getChatCompletion(config: AIConfig, systemPrompt: string, userPrompt: string): Promise<any> {
    const { provider, apiKey, model } = config;

    try {
        if (provider === 'groq') {
            const groq = new Groq({ apiKey });
            const response = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                model: model || 'llama-3.3-70b-versatile',
                temperature: 0.2,
                response_format: { type: 'json_object' },
            });
            return tryExtractJson(response.choices[0]?.message?.content || '{}');
        }

        if (provider === 'openai' || provider === 'grok' || provider === 'mistral') {
            // Grok and Mistral are mostly OpenAI compatible
            const baseURL = provider === 'grok' ? 'https://api.x.ai/v1' : 
                            provider === 'mistral' ? 'https://api.mistral.ai/v1' : 
                            undefined;

            const openai = new OpenAI({ apiKey, baseURL });
            const response = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                model: model,
                temperature: 0.2,
                response_format: { type: 'json_object' },
            });
            return tryExtractJson(response.choices[0]?.message?.content || '{}');
        }

        if (provider === 'gemini') {
            const genAI = new GoogleGenerativeAI(apiKey);
            const geminiModel = genAI.getGenerativeModel({ 
                model: model || 'gemini-1.5-pro',
                generationConfig: { responseMimeType: "application/json" }
            });
            
            const prompt = `System: ${systemPrompt}\n\nUser: ${userPrompt}`;
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            return tryExtractJson(response.text());
        }

        if (provider === 'claude') {
            // Anthropic typically needs its own SDK, but many users use proxies. 
            // For now, let's assume raw fetch or provide a note.
            // Simplified for this implementation:
            throw new Error('Claude integration via SDK is pending. Please use Groq or Gemini for now.');
        }

        throw new Error(`Unsupported provider: ${provider}`);
    } catch (err: any) {
        console.error(`AI Error (${provider}):`, err);
        throw err;
    }
}

function tryExtractJson(text: string): any {
    try {
        return JSON.parse(text);
    } catch (e) {
        try {
            const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (match && match[1]) return JSON.parse(match[1]);

            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1) return JSON.parse(text.substring(start, end + 1));
        } catch (innerE) {
            console.error('JSON Extraction failed:', innerE);
        }
        throw new Error('Could not extract valid JSON from AI response');
    }
}
