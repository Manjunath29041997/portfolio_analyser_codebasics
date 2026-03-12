import { NextRequest, NextResponse } from 'next/server';
import { analyzePortfolio } from '@/lib/analysis';

export async function POST(req: NextRequest) {
    try {
        const { learner } = await req.json();

        if (!learner) {
            return NextResponse.json({ error: 'Learner data is required' }, { status: 400 });
        }

        const result = await analyzePortfolio(learner);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
    }
}
