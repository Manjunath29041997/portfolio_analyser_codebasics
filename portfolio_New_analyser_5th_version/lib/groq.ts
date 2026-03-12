import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

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

export async function getChatCompletion(systemPrompt: string, userPrompt: string, retries = 3): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.2,
                max_tokens: 4096,
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0]?.message?.content || '{}';
            const u = response.usage;
            if (u) console.log(`  [tokens] prompt=${u.prompt_tokens} completion=${u.completion_tokens} total=${u.total_tokens}`);
            return tryExtractJson(content);
        } catch (err: any) {
            const is429 = err?.status === 429;
            if (is429 && attempt < retries) {
                const retryAfter = parseInt(err?.headers?.['retry-after'] || '15', 10);
                // If Retry-After > 60s, daily/hourly limit is likely exhausted — fail fast
                if (retryAfter > 60) {
                    throw new Error(`API daily limit reached. Please try again later (Retry-After: ${retryAfter}s).`);
                }
                // Cap wait at 30s max for normal per-minute limits
                const waitMs = Math.min(retryAfter + 2, 30) * 1000;
                console.log(`  [429] Rate limited. Waiting ${waitMs / 1000}s before retry ${attempt + 1}/${retries}...`);
                await new Promise(resolve => setTimeout(resolve, waitMs));
            } else {
                throw err;
            }
        }
    }
}




