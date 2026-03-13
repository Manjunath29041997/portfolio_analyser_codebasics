'use client';

import React from 'react';
import { X, RotateCcw, UserCircle, FileText, Zap, Layers, History, Info, Sparkles } from 'lucide-react';
import SectionCard from './SectionCard';

interface Section {
    name: string;
    score: number;
    max_score: number;
    suggestions: any[];
    input_data?: string;
}

interface AnalysisData {
    overall_score: number;
    sections: Section[];
    what_was_analyzed?: unknown;
}

interface SidebarProps {
    data: AnalysisData | null;
    isLoading: boolean;
    error?: string | null;
    onClose: () => void;
    onReAnalyse: () => void;
}

const iconMap: Record<string, any> = {
    'About Me': FileText,
    'Key Skills': Zap,
    'Experience': History,
    'Projects': Layers,
    'Common Patterns in Winning Portfolios': Sparkles
};

export default function Sidebar({ data, isLoading, error, onClose, onReAnalyse }: SidebarProps) {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const score = data?.overall_score || 0;
    const offset = circumference - (score / 100) * circumference;

    const getScoreBand = (s: number) => {
        if (s >= 80) return { label: 'Well Done', color: 'text-brand-teal' };
        if (s >= 60) return { label: 'Minor improvements needed', color: 'text-brand-orange' };
        return { label: 'Needs significant improvement', color: 'text-red-500' };
    };

    const band = getScoreBand(score);

    return (
        <div className="w-[380px] h-full bg-white shadow-2xl flex flex-col z-50 border-l border-gray-100 relative overflow-hidden">
            {/* Header with Logo + Title */}
            <div className="bg-brand-blue py-4 px-4 flex items-center gap-8 text-white shrink-0 relative z-10 shadow-sm">
                <img
                    src="/codebasics_logo.png"
                    alt="Codebasics"
                    className="h-6 object-contain brightness-0 invert shrink-0"
                />
                <span className="font-display text-base tracking-[0.04em] font-bold leading-tight">
                    Portfolio Website Analyser
                </span>
                <button
                    onClick={onClose}
                    className="ml-auto hover:bg-white/10 p-1.5 rounded-full transition-colors flex items-center justify-center shrink-0"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-5 relative z-10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full py-20">
                        <div className="w-20 h-20 border-4 border-gray-100 border-t-brand-blue rounded-full animate-spin mb-6" />
                        <p className="text-brand-navy font-display text-sm tracking-widest text-center">
                            Analysing...
                        </p>
                    </div>
                ) : data ? (
                    <>
                        {/* Overall Score Gauge */}
                        <div className="flex flex-col items-center mb-10 py-6 bg-white rounded-2xl border border-gray-50 shadow-sm">
                            {/* Overall label above circle */}
                            <p className="mb-3 text-sm font-bold text-brand-navy font-display tracking-wide">Overall Profile Score</p>
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-gray-50"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        className="text-brand-blue transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-4xl font-bold text-brand-navy font-display leading-none">{score}</span>
                                </div>
                            </div>

                            {/* Score Legend */}
                            <div className="flex items-center justify-around w-full mt-6 pt-5 border-t border-gray-50 px-2">
                                <div className="flex flex-col items-center">
                                    <span className="text-base font-black text-red-500 font-display leading-none mb-1.5">&lt; 60</span>
                                    <span className="text-[10px] text-gray-500">Needs Work</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-base font-black text-brand-orange font-display leading-none mb-1.5">60-80</span>
                                    <span className="text-[10px] text-gray-500">Almost There</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-base font-black text-brand-blue font-display leading-none mb-1.5">&gt; 80</span>
                                    <span className="text-[10px] text-gray-500">Impressive</span>
                                </div>
                            </div>

                            <p className="mt-5 text-[11px] text-gray-400 font-sans leading-snug text-center px-8">
                                Every improvement you make in your portfolio increases your probability of getting hired.
                            </p>
                        </div>

                        {/* Sections List Headline */}
                        <div className="mb-4 px-1">
                            <h3 className="text-[11px] font-bold tracking-widest text-gray-400 font-display">Section Analysis</h3>
                        </div>

                        {/* Sections */}
                        <div className="space-y-1">
                            {data.sections.map((section: Section, idx: number) => (
                                <SectionCard
                                    key={idx}
                                    name={section.name}
                                    score={section.score}
                                    max_score={section.max_score}
                                    suggestions={section.suggestions}
                                    input_data={section.input_data}
                                    icon={iconMap[section.name] || Info}
                                />
                            ))}
                        </div>
                    </>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-10">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-red-400 text-2xl">✕</span>
                        </div>
                        <p className="text-red-500 font-bold text-sm mb-2">Analysis Failed</p>
                        <p className="text-gray-400 text-xs leading-relaxed mb-6">{error}</p>
                        <button
                            onClick={onReAnalyse}
                            className="px-5 py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl tracking-wide font-display"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-50">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <RotateCcw className="text-gray-200" size={24} />
                        </div>
                        <p className="text-gray-400 italic text-sm">Select a portfolio to start analysis.</p>
                    </div>
                )}
            </div>

            {/* Footer - Fixed Button */}
            <div className="p-4 bg-white border-t border-gray-50 shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <a
                    href="https://codebasics.io/learner-portfolio/step/basic-info"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-600 text-white w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-md active:scale-[0.98] font-display"
                >
                    Edit Your Portfolio
                </a>
            </div>
        </div>
    );
}
