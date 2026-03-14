/**
 * Example: How to use the AIConfiguration component
 *
 * This file shows different integration patterns for the AI Configuration component.
 */

'use client';

import AIConfiguration from './ai-config-component';
import { useState } from 'react';

// ============================================================================
// Example 1: Basic Usage with Local State
// ============================================================================
export function Example1_BasicUsage() {
  const handleSave = async (config: { provider: string; apiKey: string; model: string }) => {
    console.log('Saving configuration:', config);
    // Save to localStorage, database, etc.
    localStorage.setItem('ai_config', JSON.stringify(config));
  };

  const handleTest = async (config: { provider: string; apiKey: string; model: string }) => {
    console.log('Testing connection:', config);
    // Make a test API call to validate the key
    try {
      const response = await fetch('/api/test-ai-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return response.ok;
    } catch (error) {
      console.error('Test failed:', error);
      return false;
    }
  };

  const handleRemove = async () => {
    console.log('Removing API key');
    localStorage.removeItem('ai_config');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <AIConfiguration onSave={handleSave} onTest={handleTest} onRemove={handleRemove} />
    </div>
  );
}

// ============================================================================
// Example 2: Integration with Server-Side API
// ============================================================================
export function Example2_ServerIntegration() {
  const [savedConfig, setSavedConfig] = useState<any>(null);

  const handleSave = async (config: { provider: string; apiKey: string; model: string }) => {
    const response = await fetch('/api/ai/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('Failed to save configuration');
    }

    const data = await response.json();
    setSavedConfig(data);
  };

  const handleTest = async (config: { provider: string; apiKey: string; model: string }) => {
    const response = await fetch('/api/ai/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Connection test failed');
    }

    return true;
  };

  const handleRemove = async () => {
    await fetch('/api/ai/config', { method: 'DELETE' });
    setSavedConfig(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <AIConfiguration
        onSave={handleSave}
        onTest={handleTest}
        onRemove={handleRemove}
        initialProvider={savedConfig?.provider}
        initialModel={savedConfig?.model}
      />

      {savedConfig && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Active configuration: {savedConfig.provider} / {savedConfig.model}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 3: Backend API Route (Next.js App Router)
// ============================================================================

/*
// File: app/api/ai/config/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Save AI configuration
export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, model } = await req.json();

    // Validate the API key format
    if (!apiKey || apiKey.length < 20) {
      return NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 400 }
      );
    }

    // In production, encrypt the API key before storing
    // const encryptedKey = encrypt(apiKey);

    // Store in your database
    // await db.aiConfig.upsert({
    //   where: { userId: session.user.id },
    //   update: { provider, apiKey: encryptedKey, model },
    //   create: { userId: session.user.id, provider, apiKey: encryptedKey, model },
    // });

    return NextResponse.json({
      success: true,
      provider,
      model,
      // Never return the API key in the response
    });
  } catch (error) {
    console.error('Failed to save AI config:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

// Delete AI configuration
export async function DELETE(req: NextRequest) {
  try {
    // Delete from database
    // await db.aiConfig.delete({
    //   where: { userId: session.user.id },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete AI config:', error);
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// Example 4: Backend API Route for Testing Connection
// ============================================================================

/*
// File: app/api/ai/test/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, model } = await req.json();

    let success = false;

    switch (provider) {
      case 'openai':
        const openai = new OpenAI({ apiKey });
        await openai.chat.completions.create({
          model: model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5,
        });
        success = true;
        break;

      case 'claude':
        const anthropic = new Anthropic({ apiKey });
        await anthropic.messages.create({
          model: model || 'claude-sonnet-4-5',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'test' }],
        });
        success = true;
        break;

      case 'gemini':
        const genAI = new GoogleGenerativeAI(apiKey);
        const geminiModel = genAI.getGenerativeModel({ model: model || 'gemini-pro' });
        await geminiModel.generateContent('test');
        success = true;
        break;

      default:
        return NextResponse.json(
          { error: `Provider ${provider} not supported` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Connection test failed:', error);

    // Return user-friendly error messages
    if (error?.status === 401 || error?.message?.includes('Invalid API key')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check and try again.' },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Connection test failed. Please check your configuration.' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// Example 5: Using the Configuration in Your App
// ============================================================================

/*
// File: lib/ai-client.ts

export async function getAIClient() {
  // Retrieve stored configuration
  const config = JSON.parse(localStorage.getItem('ai_config') || '{}');

  if (!config.provider || !config.apiKey) {
    throw new Error('AI not configured. Please set up your API key first.');
  }

  switch (config.provider) {
    case 'openai':
      return new OpenAI({ apiKey: config.apiKey, dangerouslyAllowBrowser: true });

    case 'claude':
      return new Anthropic({ apiKey: config.apiKey });

    case 'gemini':
      const genAI = new GoogleGenerativeAI(config.apiKey);
      return genAI.getGenerativeModel({ model: config.model });

    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

// Usage in your components
async function generateText(prompt: string) {
  const client = await getAIClient();
  const config = JSON.parse(localStorage.getItem('ai_config') || '{}');

  if (config.provider === 'openai') {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content;
  }

  // Handle other providers...
}
*/
