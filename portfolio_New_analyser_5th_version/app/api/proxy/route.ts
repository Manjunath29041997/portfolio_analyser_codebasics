import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
        console.error('Proxy: URL missing');
        return new NextResponse('URL is required', { status: 400 });
    }

    console.log('Proxy: Fetching URL:', url);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            redirect: 'follow'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        let html = await response.text();

        // 1. Inject <base> tag so relative assets load correctly
        const baseUrl = new URL(url).origin;
        const baseTag = `<base href="${baseUrl}/">`;

        if (html.includes('<head>')) {
            html = html.replace('<head>', `<head>${baseTag}`);
        } else {
            html = `<head>${baseTag}</head>${html}`;
        }

        // 2. Remove scripts that might do frame-busting or cause cross-origin errors
        // Modified to be more aggressive against frame-busting
        html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, (match) => {
            if (match.includes('location.href') ||
                match.includes('top.location') ||
                match.includes('window.parent') ||
                match.includes('window.top') ||
                match.includes('self === top') ||
                match.includes('parent.location')) {
                return '<!-- script removed by proxy to prevent framing issues -->';
            }
            return match;
        });

        // 3. Strip any meta tags that might enforce CSP or X-Frame
        html = html.replace(/<meta http-equiv="(Content-Security-Policy|X-Frame-Options)"[^>]*>/gim, '<!-- meta security tag removed -->');

        // Create clean headers
        const resHeaders = new Headers();
        resHeaders.set('Content-Type', 'text/html; charset=utf-8');
        resHeaders.set('Access-Control-Allow-Origin', '*');
        // Removing X-Frame-Options entirely is better than ALLOWALL
        // resHeaders.set('X-Frame-Options', 'ALLOWALL'); 

        return new Response(html, {
            status: 200,
            headers: resHeaders
        });
    } catch (error: any) {
        console.error('Proxy Error:', error);
        return new NextResponse(`Error loading portfolio: ${error.message}`, { status: 500 });
    }
}
