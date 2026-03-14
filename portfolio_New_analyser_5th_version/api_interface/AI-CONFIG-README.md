# AI Configuration Component

A beautiful, production-ready React component for configuring AI provider API keys with a clean UI similar to popular AI tools.

## Features

✨ **Multiple AI Providers**: OpenAI, Claude, Gemini, DeepSeek, Grok, Mistral AI
🔒 **Secure**: API keys stored locally, never sent to your servers
✅ **Validation**: Built-in connection testing
🎨 **Beautiful UI**: Clean, professional design with Tailwind CSS
📱 **Responsive**: Works perfectly on mobile and desktop
⚡ **Fast**: Zero dependencies except React

## Preview

The component includes:
- Provider selection cards with visual feedback
- Secure API key input with show/hide toggle
- Model selection dropdown
- Test connection button with loading states
- Save and remove functionality
- Success/error status messages
- Security notices

## Installation

### 1. Copy the Component

Copy `ai-config-component.tsx` to your project:

```bash
cp ai-config-component.tsx your-project/components/
```

### 2. Install Tailwind CSS (if not already installed)

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Configure Tailwind

Make sure your `tailwind.config.js` includes the component path:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Usage

### Basic Usage

```tsx
import AIConfiguration from '@/components/ai-config-component';

export default function SettingsPage() {
  const handleSave = async (config) => {
    console.log('Saving:', config);
    localStorage.setItem('ai_config', JSON.stringify(config));
  };

  const handleTest = async (config) => {
    // Test the API key
    const response = await fetch('/api/test-ai', {
      method: 'POST',
      body: JSON.stringify(config),
    });
    return response.ok;
  };

  const handleRemove = async () => {
    localStorage.removeItem('ai_config');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <AIConfiguration
        onSave={handleSave}
        onTest={handleTest}
        onRemove={handleRemove}
      />
    </div>
  );
}
```

### With Initial Values

```tsx
<AIConfiguration
  initialProvider="openai"
  initialModel="gpt-4o-mini"
  onSave={handleSave}
  onTest={handleTest}
  onRemove={handleRemove}
/>
```

## API Reference

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onSave` | `(config) => Promise<void>` | Called when user clicks save |
| `onTest` | `(config) => Promise<boolean>` | Called when user tests connection. Return `true` for success |
| `onRemove` | `() => Promise<void>` | Called when user removes API key |
| `initialProvider` | `string` | Default provider (e.g., 'openai', 'claude') |
| `initialModel` | `string` | Default model for the provider |

### Config Object

The `config` object passed to callbacks has this shape:

```ts
{
  provider: 'openai' | 'claude' | 'gemini' | 'deepseek' | 'grok' | 'mistral',
  apiKey: string,
  model: string
}
```

## Backend Integration

### Example API Route (Next.js)

```ts
// app/api/ai/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, model } = await req.json();

    if (provider === 'openai') {
      const client = new OpenAI({ apiKey });
      await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Connection failed' },
      { status: 500 }
    );
  }
}
```

## Customization

### Add a New Provider

Edit the `AI_PROVIDERS` array in the component:

```ts
{
  id: 'your-provider',
  name: 'Your Provider',
  logo: '🤖',
  models: ['model-1', 'model-2'],
  recommendedModel: 'model-1',
  getKeyUrl: 'https://your-provider.com/api-keys',
}
```

### Styling

The component uses Tailwind CSS. You can customize colors by modifying the class names:

- Primary color: `blue-500`, `blue-600` → Change to your brand color
- Success: `green-50`, `green-800` → Change to your success color
- Error: `red-50`, `red-800` → Change to your error color

### Remove Providers

Simply filter out providers you don't need from the `AI_PROVIDERS` array.

## Security Best Practices

1. **Never store API keys in plain text**
   ```ts
   // Encrypt before storing
   const encrypted = encrypt(apiKey, SECRET_KEY);
   await db.config.create({ apiKey: encrypted });
   ```

2. **Use environment-specific keys**
   - Development: Test keys with low limits
   - Production: Production keys with proper quotas

3. **Validate on the server**
   - Always validate API keys server-side
   - Never trust client-side validation alone

4. **Rate limit your endpoints**
   ```ts
   // Limit API key tests to prevent abuse
   if (await isRateLimited(userId)) {
     throw new Error('Too many attempts');
   }
   ```

5. **Use HTTPS only**
   - Ensure your app runs on HTTPS in production
   - API keys should never be transmitted over HTTP

## Troubleshooting

### Styles not working
Make sure Tailwind CSS is properly configured and the component path is included in `content` array.

### TypeScript errors
The component uses TypeScript. If you're using JavaScript, remove type annotations or rename to `.jsx`.

### API key not saving
Check browser console for errors. Ensure your `onSave` function is properly handling the promise.

## License

MIT - Feel free to use in your projects, commercial or personal.

## Credits

Design inspired by modern AI configuration UIs. Built with React and Tailwind CSS.
