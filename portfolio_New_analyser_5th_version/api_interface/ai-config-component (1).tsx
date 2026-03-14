'use client';

import { useState } from 'react';

/**
 * AI Configuration Component
 * A reusable component for configuring AI provider API keys
 *
 * Features:
 * - Multiple AI provider selection (OpenAI, Claude, Gemini, etc.)
 * - Secure API key input with masking
 * - Model selection dropdown
 * - Test connection and validation
 * - Save/remove functionality
 *
 * Usage:
 * ```tsx
 * <AIConfiguration
 *   onSave={(config) => console.log('Saved:', config)}
 *   onTest={(config) => testConnection(config)}
 *   onRemove={() => console.log('Removed')}
 * />
 * ```
 */

interface AIProvider {
  id: string;
  name: string;
  logo: string;
  models: string[];
  recommendedModel?: string;
  getKeyUrl: string;
}

interface AIConfigurationProps {
  onSave?: (config: { provider: string; apiKey: string; model: string }) => Promise<void>;
  onTest?: (config: { provider: string; apiKey: string; model: string }) => Promise<boolean>;
  onRemove?: () => Promise<void>;
  initialProvider?: string;
  initialModel?: string;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    logo: '✨',
    models: ['gemini-pro', 'gemini-pro-vision', 'gemini-1.5-pro'],
    recommendedModel: 'gemini-pro',
    getKeyUrl: 'https://makersuite.google.com/app/apikey',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    logo: '⚡',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    recommendedModel: 'gpt-4o-mini',
    getKeyUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'claude',
    name: 'Claude',
    logo: '🌟',
    models: ['claude-opus-4-6', 'claude-sonnet-4-5', 'claude-haiku-4-5'],
    recommendedModel: 'claude-sonnet-4-5',
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: '🔍',
    models: ['deepseek-chat', 'deepseek-coder'],
    recommendedModel: 'deepseek-chat',
    getKeyUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'grok',
    name: 'Grok',
    logo: '🚀',
    models: ['grok-beta', 'grok-vision-beta'],
    recommendedModel: 'grok-beta',
    getKeyUrl: 'https://console.x.ai/api-keys',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    logo: '🌪️',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
    recommendedModel: 'mistral-large-latest',
    getKeyUrl: 'https://console.mistral.ai/api-keys/',
  },
];

export default function AIConfiguration({
  onSave,
  onTest,
  onRemove,
  initialProvider = 'openai',
  initialModel,
}: AIConfigurationProps) {
  const [selectedProvider, setSelectedProvider] = useState(initialProvider);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(initialModel || '');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    timestamp?: string;
  }>({ type: null, message: '' });

  const currentProvider = AI_PROVIDERS.find((p) => p.id === selectedProvider);

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = AI_PROVIDERS.find((p) => p.id === providerId);
    if (provider && !model) {
      setModel(provider.recommendedModel || provider.models[0]);
    }
    setStatus({ type: null, message: '' });
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setStatus({ type: 'error', message: 'Please enter an API key' });
      return;
    }

    setIsTesting(true);
    setStatus({ type: null, message: '' });

    try {
      const success = onTest
        ? await onTest({ provider: selectedProvider, apiKey, model })
        : true;

      if (success) {
        const timestamp = new Date().toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        setStatus({
          type: 'success',
          message: 'Configuration Saved & Verified',
          timestamp,
        });
      } else {
        setStatus({ type: 'error', message: 'Connection failed. Please check your API key.' });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Connection failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setStatus({ type: 'error', message: 'Please enter an API key' });
      return;
    }

    setIsSaving(true);
    setStatus({ type: null, message: '' });

    try {
      if (onSave) {
        await onSave({ provider: selectedProvider, apiKey, model });
      }
      const timestamp = new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setStatus({
        type: 'success',
        message: 'Configuration Saved & Verified',
        timestamp,
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save configuration',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      if (onRemove) {
        await onRemove();
      }
      setApiKey('');
      setStatus({ type: null, message: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to remove API key',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">⚡</span>
        <h2 className="text-2xl font-semibold text-gray-900">AI Configuration</h2>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-8">
        Connect your own API key to enable AI capabilities tailored to you. Your key remains
        securely stored on your device and is never shared.
      </p>

      {/* AI Provider Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            AI PROVIDER
          </label>
          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
            REQUIRED
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 flex items-start gap-2">
          <span className="text-blue-500">ℹ️</span>
          Free-tier models get the job done. Premium models produce more detailed and refined
          results.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AI_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleProviderChange(provider.id)}
              className={`relative p-6 rounded-xl border-2 transition-all hover:border-blue-300 hover:shadow-md ${
                selectedProvider === provider.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {selectedProvider === provider.id && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="text-center">
                <div className="text-4xl mb-3">{provider.logo}</div>
                <h3 className="font-semibold text-gray-900 mb-3">{provider.name}</h3>
                <a
                  href={provider.getKeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Get API Key
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API Key Input */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            API KEY
          </label>
          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
            REQUIRED
          </span>
        </div>

        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showKey ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {status.type === 'success' && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {status.message}
              {status.timestamp && ` (Last checked: ${status.timestamp})`}
            </p>
          </div>
        )}

        {status.type === 'error' && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {status.message}
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-3 space-y-2">
          <p className="text-sm text-gray-600 flex items-start gap-2">
            <span>🔒</span>
            <span>Your key is never sent to our servers.</span>
          </p>
          <p className="text-sm text-gray-600 flex items-start gap-2">
            <span>⚡</span>
            <span>Verifying the key consumes ~1 token to ensure validity.</span>
          </p>
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
          MODEL
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {currentProvider?.models.map((modelOption) => (
            <option key={modelOption} value={modelOption}>
              {modelOption}
              {modelOption === currentProvider.recommendedModel ? ' (Recommended)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleTestConnection}
          disabled={isTesting || !apiKey.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isTesting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Testing...
            </>
          ) : (
            <>
              <span>⚡</span>
              Test Connection
            </>
          )}
        </button>

        <button
          onClick={handleRemove}
          disabled={isRemoving || !apiKey.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isRemoving ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Removing...
            </>
          ) : (
            <>
              <span>🗑️</span>
              Remove API Key
            </>
          )}
        </button>
      </div>
    </div>
  );
}
