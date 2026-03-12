'use client';

import React, { useState } from 'react';
import { Upload, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function PortfolioAnalyser() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selectedLearner, setSelectedLearner] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'upload' | 'selection' | 'dashboard'>('upload');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Invalid file format. Please upload a .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.learners && Array.isArray(json.learners)) {
          setPortfolios(json.learners);
          setView('selection');
          setError(null);
        } else {
          setError('Invalid JSON structure. "learners" array not found.');
        }
      } catch (err) {
        setError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyse = async (learner: any) => {
    setSelectedLearner(learner);
    setView('dashboard');
    setIsLoading(true);
    setAnalysisData(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learner }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAnalysisData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center">
      {/* Navbar / Logo */}
      <nav className="w-full bg-white border-b border-gray-100 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-blue rounded-lg flex items-center justify-center text-white font-black text-xl shadow-md">
              C
            </div>
            <span className="font-display text-lg tracking-tight font-black text-brand-navy">Portfolio Analyser</span>
          </div>
          <div className="px-3 py-1 bg-brand-blue/5 text-brand-blue text-[10px] font-black tracking-wide rounded-full border border-brand-blue/10 font-display">
            v1.0 Demo
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-5xl p-6 md:p-10 flex flex-col items-center">
        {view === 'upload' && (
          <div className="w-full max-w-xl mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-6xl font-black text-brand-navy mb-4 font-display tracking-tighter leading-[0.9]">
                Master Your <span className="text-brand-blue">Portfolio</span> Analysis
              </h1>
              <p className="text-gray-500 font-medium max-w-lg mx-auto leading-relaxed text-sm">
                Get high-impact, actionable feedback on your Codebasics portfolios.
                Built for <span className="text-brand-navy font-bold">Aspirants</span> who want to stand out.
              </p>
            </div>

            <div className={`
              relative group cursor-pointer
              bg-white border-2 border-dashed rounded-3xl p-12
              flex flex-col items-center justify-center transition-all duration-300
              ${error ? 'border-red-200 bg-red-50/10' : 'border-gray-200 hover:border-brand-blue hover:bg-blue-50/30'}
              premium-shadow
            `}>
              <div className="w-20 h-20 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Upload Portfolio Data</h3>
              <p className="text-sm text-gray-400 mb-6">Drag and drop or click to select .json file</p>

              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              <button className="px-8 py-3 bg-brand-blue text-white rounded-xl font-display font-black text-sm shadow-xl shadow-blue-500/20 active-scale-95 transition-all tracking-wide">
                Select JSON File
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm animate-in zoom-in-95 duration-300">
                <AlertCircle size={20} />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { label: 'Instant Feedback', icon: <CheckCircle2 size={16} /> },
                { label: 'AI Score Breakdown', icon: <CheckCircle2 size={16} /> },
                { label: 'Actionable Tips', icon: <CheckCircle2 size={16} /> }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2">
                  <div className="text-brand-blue bg-white p-2 rounded-full shadow-sm">{feature.icon}</div>
                  <span className="text-[10px] font-bold text-gray-500 tracking-widest">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'selection' && (
          <div className="w-full animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-5">
              <div>
                <h2 className="text-2xl font-black text-brand-navy font-display tracking-tight">Select Aspirant</h2>
                <p className="text-[10px] text-gray-400 font-bold tracking-wide mt-1">{portfolios.length} Profiles loaded for analysis</p>
              </div>
              <button
                onClick={() => setView('upload')}
                className="text-[10px] font-black text-brand-blue hover:text-blue-700 tracking-wide font-display bg-brand-blue/5 px-4 py-2 rounded-lg border border-brand-blue/10 transition-colors"
              >
                Change File
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {portfolios.map((learner, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAnalyse(learner)}
                  className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-brand-blue/30 hover:bg-blue-50/20 cursor-pointer transition-all duration-300 flex flex-col group premium-shadow"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 shadow-sm">
                      <User className="text-gray-300" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-display text-sm font-black text-brand-navy leading-none group-hover:text-brand-blue transition-colors tracking-tight">{learner.full_name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-1.5 tracking-wider font-display opacity-80">{learner.position || 'Aspirant'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {learner.projects?.slice(0, 3).map((p: any, i: number) => (
                        <div key={i} title={p.project_title} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-100 text-[10px] flex items-center justify-center font-bold text-brand-blue">
                          {p.project_title?.[0]}
                        </div>
                      ))}
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-brand-blue tracking-[0.1em] font-display group-hover:translate-x-1 transition-transform">
                      Analyse Portfolio <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'dashboard' && selectedLearner && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-300">
            {/* Dashboard Navbar */}
            <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView('selection')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                >
                  <ArrowRight className="rotate-180" size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white font-black">C</div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 leading-none">{selectedLearner.full_name}</h2>
                    <p className="text-[10px] text-gray-400 font-medium mt-1 tracking-wider">{selectedLearner.position}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={selectedLearner.portfolio_url || `https://codebasics.io/portfolio/${selectedLearner.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-[10px] font-black tracking-wide transition-all shadow-md active:scale-95 font-display"
                >
                  Open Website
                  <ArrowRight size={14} className="-rotate-45" />
                </a>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative bg-gray-100 overflow-hidden">
              <iframe
                key={selectedLearner.slug}
                src={`/api/proxy?url=${encodeURIComponent(selectedLearner.portfolio_url || `https://codebasics.io/portfolio/${selectedLearner.slug}`)}`}
                className="w-full h-full border-none"
                title={`${selectedLearner.full_name}'s Portfolio`}
              />

              {/* Sidebar Overlay */}
              <div className="absolute top-4 bottom-4 right-4 z-40 transition-all duration-500 animate-in slide-in-from-right-full">
                <Sidebar
                  data={analysisData}
                  isLoading={isLoading}
                  error={error}
                  onClose={() => setView('selection')}
                  onReAnalyse={() => handleAnalyse(selectedLearner)}
                />
              </div>

              {/* Security/Access Note */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur rounded-full border border-gray-100 shadow-xl text-[10px] font-bold text-gray-400 pointer-events-none opacity-90 z-20">
                Note: Use &quot;Open Website&quot; if the view is blocked below.
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
