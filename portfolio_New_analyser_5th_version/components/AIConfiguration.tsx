'use client';

import React, { useState } from 'react';
import { Settings, Key, Zap, CheckCircle2, AlertCircle, Trash2, ArrowRight, Eye, EyeOff, ChevronDown } from 'lucide-react';

interface AIProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  models: string[];
  recommendedModel?: string;
  getKeyUrl: string;
}

interface AIConfigurationProps {
  onSave?: (config: { provider: string; apiKey: string; model: string }) => void;
  onTest?: (config: { provider: string; apiKey: string; model: string }) => Promise<boolean>;
  onRemove?: () => void;
  initialConfig?: { provider: string; apiKey: string; model: string } | null;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'groq',
    name: 'Groq',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 19.78h20L12 2zm0 3.78l6.39 11.33H5.61L12 5.78zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
      </svg>
    ),
    models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'],
    recommendedModel: 'llama-3.3-70b-versatile',
    getKeyUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'grok',
    name: 'Grok (xAI)',
    icon: (
      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-black italic text-xs">xAI</div>
    ),
    models: ['grok-beta', 'grok-vision-beta'],
    recommendedModel: 'grok-beta',
    getKeyUrl: 'https://console.x.ai/',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-blue-500" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
      </svg>
    ),
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
    recommendedModel: 'gemini-1.5-pro',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-green-600" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5153-4.9066 6.0462 6.0462 0 0 0-4.4439-2.9143 6.0857 6.0857 0 0 0-5.064 1.4774 6.0857 6.0857 0 0 0-5.064-1.4774 6.0462 6.0462 0 0 0-4.4439 2.9143 5.9847 5.9847 0 0 0-.5153 4.9066 6.0462 6.0462 0 0 0-1.4774 5.064 6.0857 6.0857 0 0 0 2.9143 4.4439 6.0857 6.0857 0 0 0 4.9066.5153 6.0462 6.0462 0 0 0 4.4439 2.9143 6.0857 6.0857 0 0 0 5.064-1.4774 6.0857 6.0857 0 0 0 5.064 1.4774 6.0462 6.0462 0 0 0 4.4439-2.9143 5.9847 5.9847 0 0 0 .5153-4.9066 6.0462 6.0462 0 0 0 1.4774-5.064zm-9.965 10.1372L12 16.3508l-3.3169 3.6075-1.5544-.6993L10.2312 12 7.1287 5.341l1.5544-.6993L12 7.6492l3.3169-3.0075 1.5544.6993L13.7688 12l3.1025 6.659-1.5544.6993z" />
      </svg>
    ),
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    recommendedModel: 'gpt-4o-mini',
    getKeyUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-orange-600" xmlns="http://www.w3.org/2000/svg">
         <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/>
      </svg>
    ),
    models: ['claude-3-5-sonnet-latest', 'claude-3-opus-latest', 'claude-3-haiku-20240307'],
    recommendedModel: 'claude-3-5-sonnet-latest',
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
  },
];

export default function AIConfiguration({
  onSave,
  onTest,
  onRemove,
  initialConfig
}: AIConfigurationProps) {
  const [selectedProvider, setSelectedProvider] = useState(initialConfig?.provider || 'groq');
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey || '');
  const [model, setModel] = useState(initialConfig?.model || '');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Sync state if initialConfig changes (e.g., loaded from localStorage)
  React.useEffect(() => {
    if (initialConfig) {
      setSelectedProvider(initialConfig.provider);
      setApiKey(initialConfig.apiKey);
      setModel(initialConfig.model);
    }
  }, [initialConfig]);

  // Set default model when provider changes
  const currentProvider = AI_PROVIDERS.find((p) => p.id === selectedProvider);
  
  React.useEffect(() => {
    if (currentProvider && !model) {
      setModel(currentProvider.recommendedModel || currentProvider.models[0]);
    }
  }, [selectedProvider, currentProvider, model]);

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = AI_PROVIDERS.find((p) => p.id === providerId);
    if (provider) {
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
      if (onTest) {
        const success = await onTest({ provider: selectedProvider, apiKey, model });
        if (success) {
          setStatus({
            type: 'success',
            message: 'Connection verified successfully!',
          });
        } else {
          setStatus({ type: 'error', message: 'Connection failed. Please check your API key.' });
        }
      } else {
          setStatus({ type: 'success', message: 'Ready to proceed.' });
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

  const handleSave = () => {
    if (!apiKey.trim()) {
      setStatus({ type: 'error', message: 'Please enter an API key' });
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        onSave({ provider: selectedProvider, apiKey, model });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-black text-brand-navy mb-4 font-display tracking-tighter leading-[0.9]">
          Let's Get <span className="text-brand-blue">Started!</span>
        </h1>
        
        <p className="text-gray-500 font-medium max-w-lg mx-auto leading-relaxed text-sm">
          Paste your API key below to begin your portfolio website analysis.
        </p>
      </div>

      <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-500/5 border border-gray-100 p-8 md:p-10 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        
        {/* Provider Selection */}
        <div className="mb-10 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={18} className="text-brand-blue text-brand-navy" />
            <h3 className="text-[14px] font-medium text-brand-navy uppercase tracking-[0.2em] font-display">Select Provider</h3>
          </div>
          
          <div className="relative group">
            <select
              value={selectedProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm font-normal text-brand-navy focus:outline-none focus:border-brand-blue focus:bg-white transition-all appearance-none cursor-pointer pr-12"
            >
              {AI_PROVIDERS.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-brand-blue transition-colors">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        {/* API Key Input */}
        <div className="mb-8 relative z-10">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <Key size={18} className="text-brand-blue" />
                <h3 className="text-[14px] font-medium text-brand-navy uppercase tracking-[0.2em] font-display">API Key</h3>
             </div>
             <a 
                href={currentProvider?.getKeyUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-[12px] font-black text-brand-blue hover:underline tracking-wide uppercase font-display bg-brand-blue/5 px-4 py-2 rounded-lg border border-brand-blue/10"
              >
                Get {currentProvider?.name} Key →
              </a>
          </div>
          
          <div className="relative group">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Paste your ${currentProvider?.name} API key here...`}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl font-mono text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-brand-blue transition-colors"
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Model Selection */}
        <div className="mb-10 relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <Settings size={18} className="text-brand-blue hover:rotate-90 transition-transform" />
             <h3 className="text-[14px] font-medium text-brand-navy uppercase tracking-[0.2em] font-display">Select Model</h3>
          </div>
          <div className="relative group">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm font-normal text-brand-navy focus:outline-none focus:border-brand-blue focus:bg-white transition-all appearance-none cursor-pointer pr-12"
            >
              {currentProvider?.models.map((m) => (
                <option key={m} value={m}>
                  {m} {m === currentProvider.recommendedModel ? '(Recommended)' : ''}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-brand-blue transition-colors">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        {/* Status Display */}
        {status.type && (
          <div className={`
            mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300
            ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}
          `}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-[11px] font-medium uppercase tracking-wider font-display">{status.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <button
            onClick={handleTestConnection}
            disabled={isTesting || !apiKey.trim()}
            className="flex-1 px-8 py-4 bg-white border-2 border-brand-blue/20 text-brand-blue rounded-2xl font-display font-black text-xs uppercase tracking-widest hover:border-brand-blue hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving || !apiKey.trim()}
            className="flex-[2] px-8 py-4 bg-brand-blue text-white rounded-2xl font-display font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
          >
            {isSaving ? 'Saving...' : (
              <>
                Confirm & Continue
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          {apiKey && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to remove this key?')) {
                  if (onRemove) onRemove();
                  setApiKey('');
                }
              }}
              className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
              title="Remove Key"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
