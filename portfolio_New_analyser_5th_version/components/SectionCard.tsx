'use client';

import React, { useState } from 'react';
import { ChevronDown, Info, LucideIcon } from 'lucide-react';

const WELL_DONE = 'Well done! All key elements found.';
const DOMAIN_CORRECT = 'Your mentioned project domain is correct.';

const isWellDoneVariant = (s: any) => {
    const str = String(s).trim();
    return str === WELL_DONE || str === 'Well done!' || str === '__WELL_DONE_TIP__' || str === DOMAIN_CORRECT;
};

const SECTION_CRITERIA: Record<string, { headline: string; tags: string[] }> = {
    'About Me': {
        headline: 'Must Cover',
        tags: ['Targeted Role', 'Background'],
    },
    'Experience': {
        headline: 'Must Cover',
        tags: ['Responsibilities', 'Skills', 'Impact'],
    },
    'Key Skills': {
        headline: 'Must Cover',
        tags: ['Technical skills', 'Soft skills'],
    },
    'Projects': {
        headline: 'Must Cover',
        tags: ['Project Domain', 'Business Context', 'Impact', 'Learning'],
    },
    'Profile Photo': {
        headline: 'Must Cover',
        tags: ['Clear & well-lit', 'Professional', 'Clean background'],
    },
};

function CriteriaBanner({ name }: { name: string }) {
    const criteria = SECTION_CRITERIA[name];
    if (!criteria) return null;
    return (
        <div className="mt-4 mb-3 px-3 py-1.5 rounded-xl bg-brand-blue/[0.02] border border-brand-blue/10 flex items-center justify-start gap-x-2">
            <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold text-brand-blue font-display tracking-widest">
                    {criteria.headline}
                </span>
                <span className="text-brand-blue/20 font-light text-xs ml-0.5">|</span>
            </div>
            <div className="flex items-center gap-x-2 whitespace-nowrap overflow-hidden">
                {criteria.tags.map((tag, i) => (
                    <React.Fragment key={i}>
                        <span className="text-[9px] text-brand-navy/70 font-sans font-medium tracking-tight">
                            {tag}
                        </span>
                        {i < criteria.tags.length - 1 && (
                            <span className="w-1 h-1 rounded-full bg-brand-blue/30 shrink-0" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

function hasRealSuggestions(name: string, suggestions: any[]): boolean {
    if (name === 'Projects') {
        return suggestions.some((p: any) => {
            const short = p.breakdown?.short_info?.suggestions;
            const full = p.breakdown?.full_description?.suggestions;
            const shortReal = Array.isArray(short) && short.some((s: any) => !isWellDoneVariant(s));
            const fullReal = Array.isArray(full) && full.some((s: any) => !isWellDoneVariant(s));
            return shortReal || fullReal;
        });
    }
    if (!Array.isArray(suggestions) || suggestions.length === 0) return false;
    return suggestions.some((s: any) => !isWellDoneVariant(s));
}

interface SectionCardProps {
    name: string;
    score: number;
    max_score: number;
    suggestions: any[];
    input_data?: string;
    icon: LucideIcon;
}

export default function SectionCard({ name, score, max_score, suggestions, input_data, icon: Icon }: SectionCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

    const percentage = max_score > 0 ? (score / max_score) * 100 : 100;

    const getScoreColor = () => {
        if (max_score === 0) return 'text-brand-blue bg-blue-50 border-blue-100';
        if (percentage >= 80) return 'text-green-600 bg-green-100 border-green-200/50';
        if (percentage >= 60) return 'text-orange-600 bg-orange-100 border-orange-200/50';
        return 'text-red-600 bg-red-100 border-red-200/50';
    };

    const toggleProject = (title: string) => {
        setExpandedProjects(prev => ({ [title]: !prev[title] }));
    };

    return (
        <div className={`mb-3 overflow-hidden bg-white border border-gray-100 border-l-4 rounded-xl transition-all duration-200 border-l-brand-blue shadow-sm hover:shadow-md ${isOpen ? 'ring-1 ring-gray-100' : ''}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-4 transition-colors hover:bg-gray-50/50 group"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-brand-blue text-white' : 'bg-gray-50 text-gray-400 group-hover:text-brand-blue'}`}>
                        <Icon size={18} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold tracking-tight text-brand-navy leading-none">{name}</span>
                        {name !== 'Common Patterns in Winning Portfolios' && hasRealSuggestions(name, suggestions) && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-orange-600 bg-orange-100/80 px-1.5 py-0.5 rounded-md tracking-tighter border border-orange-200/30">
                                <Info size={10} />
                                Tips
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {max_score > 0 && (
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold border rounded-full font-display ${getScoreColor()}`}>
                            {score}/{max_score}
                        </span>
                    )}
                    <ChevronDown
                        size={16}
                        className={`text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-blue' : ''}`}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="p-4 pt-0 border-t border-gray-50 bg-gray-50/5">
                    <CriteriaBanner name={name} />

                    {name === 'Projects' ? (
                        <div className="mt-3 space-y-2">
                            <h4 className="mb-2 text-[11px] font-bold tracking-widest text-gray-400 font-display">Project Analysis</h4>
                            {suggestions.map((project: any, idx: number) => {
                                const title = project.project_title || `Project ${idx + 1}`;
                                const isProjectExpanded = expandedProjects[title];
                                const hasSuggestions =
                                    (project.breakdown?.short_info?.suggestions?.length > 0 && !project.breakdown.short_info.suggestions.includes(WELL_DONE)) ||
                                    (project.breakdown?.full_description?.suggestions?.length > 0 && !project.breakdown.full_description.suggestions.includes(WELL_DONE));

                                return (
                                    <div key={idx} className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:border-brand-blue/20 transition-all">
                                        <button
                                            onClick={() => toggleProject(title)}
                                            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors group/proj"
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <h5 className="text-[11px] font-bold text-brand-blue/80 font-display tracking-wide text-left truncate">{title}</h5>
                                                {hasSuggestions && (
                                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse shrink-0" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                                <span className="text-[9px] font-bold text-gray-400">{project.score}/60</span>
                                                <ChevronDown
                                                    size={11}
                                                    className={`text-gray-300 transition-transform ${isProjectExpanded ? 'rotate-180 text-brand-blue' : 'group-hover/proj:text-gray-400'}`}
                                                />
                                            </div>
                                        </button>

                                        {isProjectExpanded && (
                                            <div className="px-3 pb-3 border-t border-gray-50 pt-2 bg-slate-50/30 space-y-4">
                                                <div className="space-y-4">
                                                    {/* Project Domain */}
                                                    <div>
                                                        <span className="font-bold text-[9px] text-gray-400 tracking-tight block mb-2 border-b border-gray-100 pb-1">Project Domain</span>
                                                        <div className="space-y-2.5">
                                                            {project.breakdown?.project_domain?.suggestions?.length > 0 &&
                                                                project.breakdown.project_domain.suggestions.some((s: string) => !isWellDoneVariant(s)) ? (
                                                                project.breakdown.project_domain.suggestions.filter((s: string) => !isWellDoneVariant(s)).map((s: string, i: number) => (
                                                                    <div key={i} className="flex gap-3 text-[10px] bg-white border border-gray-100 rounded-xl p-2 shadow-sm">
                                                                        <span className="text-orange-500 font-black shrink-0 mt-0.5">•</span>
                                                                        <span className="text-brand-navy/90 leading-relaxed font-sans">{s}</span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-[10px] text-green-600 font-bold italic font-sans px-1">{DOMAIN_CORRECT}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Short Info */}
                                                    <div>
                                                        <span className="font-bold text-[9px] text-gray-400 tracking-tight block mb-2 border-b border-gray-100 pb-1">Project Short Info</span>
                                                        <div className="space-y-2.5">
                                                            {project.breakdown?.short_info?.suggestions?.length > 0 &&
                                                                project.breakdown.short_info.suggestions.some((s: string) => !isWellDoneVariant(s)) ? (
                                                                project.breakdown.short_info.suggestions.filter((s: string) => !isWellDoneVariant(s)).map((s: string, i: number) => (
                                                                    <div key={i} className="flex gap-3 text-[10px] bg-white border border-gray-100 rounded-xl p-2 shadow-sm">
                                                                        <span className="text-orange-500 font-black shrink-0 mt-0.5">•</span>
                                                                        <span className="text-brand-navy/90 leading-relaxed font-sans">{s}</span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-[10px] text-green-600 font-bold italic font-sans px-1">{WELL_DONE}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Full Description */}
                                                    <div>
                                                        <span className="font-bold text-[9px] text-gray-400 tracking-tight block mb-2 border-b border-gray-100 pb-1">Project Description</span>
                                                        <div className="space-y-2.5">
                                                            {(() => {
                                                                const fullSugs = project.breakdown?.full_description?.suggestions ?? [];
                                                                const hasRealFullSug = fullSugs.some((s: string) => !isWellDoneVariant(s));
                                                                const assets = project.breakdown?.assets;
                                                                const hasMissingAsset = assets && (
                                                                    !assets.video_present ||
                                                                    !assets.linkedin_post_present ||
                                                                    !assets.github_link_present
                                                                );

                                                                if (hasRealFullSug) {
                                                                    // Has actual suggestions — show them
                                                                    return fullSugs.filter((s: string) => !isWellDoneVariant(s)).map((s: string, i: number) => (
                                                                        <div key={i} className="flex gap-3 text-[10px] bg-white border border-gray-100 rounded-xl p-2 shadow-sm">
                                                                            <span className="text-orange-500 font-black shrink-0 mt-0.5">•</span>
                                                                            <span className="text-brand-navy/90 leading-relaxed font-sans">{s}</span>
                                                                        </div>
                                                                    ));
                                                                }
                                                                if (hasMissingAsset) {
                                                                    // Description is fine but assets missing — nudge toward assets
                                                                    return (
                                                                        <div className="flex gap-3 text-[10px] bg-white border border-gray-100 rounded-xl p-2 shadow-sm">
                                                                            <span className="text-orange-500 font-black shrink-0 mt-0.5">•</span>
                                                                            <span className="text-brand-navy/90 leading-relaxed font-sans">Add the missing elements.</span>
                                                                        </div>
                                                                    );
                                                                }
                                                                // All good
                                                                return <p className="text-[10px] text-green-600 font-bold italic font-sans px-1">{WELL_DONE}</p>;
                                                            })()}
                                                        </div>
                                                    </div>

                                                    {/* Missing Assets Section */}
                                                    {project.breakdown?.assets && (
                                                        (!project.breakdown.assets.video_present ||
                                                            !project.breakdown.assets.linkedin_post_present ||
                                                            !project.breakdown.assets.github_link_present) && (
                                                            <div className="mt-4 pt-3 border-t border-gray-100/50">
                                                                <span className="font-bold text-[9px] text-gray-400 tracking-tight block mb-2 pb-1">Missing</span>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {!project.breakdown.assets.github_link_present && (
                                                                        <span className="text-[9px] font-bold text-red-500/80 bg-red-50 px-2.5 py-1 rounded-md border border-red-100/50">GitHub Link</span>
                                                                    )}
                                                                    {!project.breakdown.assets.linkedin_post_present && (
                                                                        <span className="text-[9px] font-bold text-red-500/80 bg-red-50 px-2.5 py-1 rounded-md border border-red-100/50">LinkedIn Post</span>
                                                                    )}
                                                                    {!project.breakdown.assets.video_present && (
                                                                        <span className="text-[9px] font-bold text-red-500/80 bg-red-50 px-2.5 py-1 rounded-md border border-red-100/50">Project Video</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-3">
                            <ul className="space-y-2">
                                {suggestions
                                    .filter((s: any) => !isWellDoneVariant(s))
                                    .map((s, i) => (
                                        <li key={i} className="flex gap-3 text-[11px] text-brand-navy/90 leading-relaxed font-normal font-sans bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm hover:border-brand-blue/10 transition-colors">
                                            <span className="text-orange-500 text-xs font-black shrink-0 leading-none mt-px">•</span>
                                            <span className="[&>strong]:text-brand-navy [&>strong]:font-bold" dangerouslySetInnerHTML={{ __html: String(s).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                        </li>
                                    ))}
                                {(suggestions.length === 0 || suggestions.every(s => isWellDoneVariant(s))) && (
                                    <div className="py-4 px-1 text-center">
                                        <p className="text-xs text-green-600 font-bold italic font-sans tracking-wide">Well done! All key elements found.</p>
                                    </div>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
