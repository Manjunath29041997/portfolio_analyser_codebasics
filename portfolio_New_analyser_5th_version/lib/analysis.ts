import { loadPrompts, interpolate } from './prompts';
import { getChatCompletion } from './groq';
import {
    SHORT_DESC_SUGGESTIONS,
    TOOLS_SUGGESTIONS,
    IMPACT_SUGGESTIONS,
    LEARNING_SUGGESTIONS,
    ABOUT_SUGGESTIONS,
    EXPERIENCE_SUGGESTIONS,
    WELL_DONE_WITH_TIP,
    KEY_SKILLS_MIX_SUGGESTION,
    KEY_SKILLS_TECHNICAL_SUGGESTION,
    KEY_SKILLS_SOFT_SUGGESTION,
    pickRotated,
} from './suggestions';

export interface SectionAnalysis {
    name: string;
    score: number;
    max_score: number;
    suggestions: any[];
    input_data?: string;
    what_we_analyzed?: any;
}

export interface WhatWasAnalyzed {
    full_name: string;
    position: string;
    portfolio_url?: string;
    sections_analyzed: string[];
    project_count: number;
    project_titles: string[];
    key_skills_list: string[];
}

export interface AnalysisResult {
    overall_score: number;
    sections: SectionAnalysis[];
    what_was_analyzed: WhatWasAnalyzed;
}

const BASE_IMAGE_URL = 'https://images.codebasics.io/';
const WELL_DONE = 'Well done!';

// ─────────────────────────────────────────────────────────
// Phase 1: Text sanitizer — kills _x000D_, \r, and extra whitespace
// that comes from Windows line endings in the database text
// ─────────────────────────────────────────────────────────
function sanitizeText(value: any): any {
    if (typeof value === 'string') {
        return value
            .replace(/_x000D_/g, ' ')   // literal _x000D_ sequences
            .replace(/\r\n/g, '\n')      // Windows CRLF → LF
            .replace(/\r/g, '\n')        // stray CR → LF
            .replace(/[ \t]+\n/g, '\n')  // trailing spaces before newline
            .replace(/\n{3,}/g, '\n\n')  // collapse 3+ blank lines to 2
            .trim();
    }
    if (Array.isArray(value)) return value.map(sanitizeText);
    if (value && typeof value === 'object') {
        const out: any = {};
        for (const [k, v] of Object.entries(value)) out[k] = sanitizeText(v);
        return out;
    }
    return value;
}

function getScore(val: any): number {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
}

function ensureSuggestions(raw: any): string[] {
    if (Array.isArray(raw)) return raw.map(String);
    if (typeof raw === 'string' && raw.trim()) return [raw];
    return [];
}

// ─────────────────────────────────────────────────────────
// Phase 2: Code-side suggestion builder for profile sections
// Uses flags from API response + static strings from suggestions.ts
// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
// Phase 2: Code-side suggestion builder for profile sections
// Uses flags from API response + static strings from suggestions.ts
// ─────────────────────────────────────────────────────────
function buildAboutSuggestions(apiResult: any): { score: number; suggestions: string[] } {
    const flags = apiResult?.flags ?? {};
    const rawScore = getScore(apiResult?.score);

    const suggestions: string[] = [];
    if (flags.needs_target_role) suggestions.push(ABOUT_SUGGESTIONS.target_role_clarity);
    if (flags.needs_background) suggestions.push(ABOUT_SUGGESTIONS.background);

    let finalSuggestions: string[];
    if (suggestions.length === 0) {
        const modelSuggestions = ensureSuggestions(apiResult?.suggestions);
        const real = modelSuggestions.filter(s => s.trim() !== WELL_DONE);
        finalSuggestions = real.length > 0 ? real : [WELL_DONE];
    } else {
        finalSuggestions = suggestions;
    }

    const isWellDone = finalSuggestions.length === 1 && finalSuggestions[0] === WELL_DONE;
    return {
        score: isWellDone ? 15 : Math.min(15, rawScore),
        suggestions: isWellDone ? [WELL_DONE_WITH_TIP] : finalSuggestions
    };
}

function buildExperienceSuggestions(apiResult: any): { score: number; suggestions: string[] } {
    const flags = apiResult?.flags ?? {};
    const rawScore = getScore(apiResult?.score);

    const suggestions: string[] = [];
    if (flags.needs_responsibilities) suggestions.push(EXPERIENCE_SUGGESTIONS.responsibilities_clarity);
    if (flags.needs_tools_context) suggestions.push(EXPERIENCE_SUGGESTIONS.tools_in_context);
    if (flags.needs_impact) suggestions.push(EXPERIENCE_SUGGESTIONS.business_impact);

    let finalSuggestions: string[];
    if (suggestions.length === 0) {
        const modelSuggestions = ensureSuggestions(apiResult?.suggestions);
        const real = modelSuggestions.filter(s => s.trim() !== WELL_DONE);
        finalSuggestions = real.length > 0 ? real : [WELL_DONE];
    } else {
        finalSuggestions = suggestions;
    }

    const isWellDone = finalSuggestions.length === 1 && finalSuggestions[0] === WELL_DONE;
    return {
        score: isWellDone ? 15 : Math.min(15, rawScore),
        suggestions: isWellDone ? [WELL_DONE_WITH_TIP] : finalSuggestions
    };
}

function buildKeySkillsSuggestions(apiResult: any, keySkillsList: string[]): { score: number; suggestions: string[] } {
    // Count is done in code — model can't be trusted for counting
    const skillCount = Array.isArray(keySkillsList) ? keySkillsList.length : 0;
    const belowThreshold = skillCount < 5;

    // Soft skill presence is semantic — we trust the model flag for this
    const hasSoftSkill = apiResult?.flags?.has_soft_skill === true;
    const missingSoftSkill = !hasSoftSkill;

    // ── 4-case matrix ──────────────────────────────────────
    if (!belowThreshold && !missingSoftSkill) {
        // ≥5 skills AND has soft skill → full marks
        return { score: 10, suggestions: [WELL_DONE] };
    }

    const rawScore = getScore(apiResult?.score);

    if (belowThreshold && missingSoftSkill) {
        // <5 skills AND no soft skill → mix message
        return { score: Math.min(6, rawScore), suggestions: [KEY_SKILLS_MIX_SUGGESTION] };
    }

    if (belowThreshold && !missingSoftSkill) {
        // <5 skills but soft skill present → technical message
        return { score: Math.min(8, rawScore), suggestions: [KEY_SKILLS_TECHNICAL_SUGGESTION] };
    }

    // ≥5 skills but no soft skill → soft skill message
    return { score: Math.min(8, rawScore), suggestions: [KEY_SKILLS_SOFT_SUGGESTION] };
}

// ─────────────────────────────────────────────────────────
// Phase 2: Per-project suggestion builder with per-flag counters.
// Each counter advances ONLY when its flag fires, so every suggestion
// in a list is shown once before any repetition happens.
// ─────────────────────────────────────────────────────────
interface FlagCounters {
    shortDesc: number;
    tools: number;
    impact: number;
    learning: number;
}

function buildProjectSuggestions(
    projectApiResult: any,
    projectIndex: number,
    originalProject: any,
    counters: FlagCounters
) {
    const shortDesc = projectApiResult?.short_description ?? {};
    const fullDesc = projectApiResult?.full_description ?? {};
    const flags = fullDesc?.flags ?? {};

    // Short description — use & advance its own counter
    let shortSuggestions: string[];
    if (shortDesc.needs_suggestion) {
        shortSuggestions = [SHORT_DESC_SUGGESTIONS[counters.shortDesc % SHORT_DESC_SUGGESTIONS.length]];
        counters.shortDesc++;
    } else {
        shortSuggestions = [WELL_DONE];
    }

    // Full description — each category has its own counter
    const fullSuggestions: string[] = [];
    if (flags.needs_tools) {
        fullSuggestions.push(TOOLS_SUGGESTIONS[counters.tools % TOOLS_SUGGESTIONS.length]);
        counters.tools++;
    }
    if (flags.needs_impact) {
        fullSuggestions.push(IMPACT_SUGGESTIONS[counters.impact % IMPACT_SUGGESTIONS.length]);
        counters.impact++;
    }
    if (flags.needs_learning) {
        fullSuggestions.push(LEARNING_SUGGESTIONS[counters.learning % LEARNING_SUGGESTIONS.length]);
        counters.learning++;
    }
    if (fullSuggestions.length === 0) fullSuggestions.push(WELL_DONE);

    const shortScore = getScore(shortDesc.score);
    const fullScore = getScore(fullDesc.score);
    let totalScore = getScore(projectApiResult?.score) || (shortScore + fullScore);

    // Scoring for assets: +10 each for video, linkedin, github (total 30 pts)
    const assetScore = (originalProject.video_present ? 10 : 0) +
        (originalProject.linkedin_post_present ? 10 : 0) +
        (originalProject.github_link_present ? 10 : 0);

    totalScore += assetScore;

    return {
        project_title: originalProject.project_title || `Project ${projectIndex + 1}`,
        // Cap at 59 — projects never show full marks (always room to improve)
        score: Math.min(59, totalScore),
        breakdown: {
            short_info: { suggestions: shortSuggestions },
            full_description: { suggestions: fullSuggestions },
            assets: {
                video_present: !!originalProject.video_present,
                linkedin_post_present: !!originalProject.linkedin_post_present,
                github_link_present: !!originalProject.github_link_present,
            }
        },
        what_we_analyzed: {
            short_description: sanitizeText(originalProject.short_description ?? originalProject.project_short_description ?? ''),
            description: sanitizeText(originalProject.description ?? originalProject.full_description ?? originalProject.project_full_description ?? ''),
        },
    };
}

// ─────────────────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────────────────
export async function analyzePortfolio(learner: any): Promise<AnalysisResult> {
    const config = loadPrompts();

    // Phase 1: sanitize all learner data before any API call
    const cleanLearner = sanitizeText(learner);

    console.log('--- ANALYSIS START ---');
    console.log('Learner:', cleanLearner.full_name);

    // ── Call B: Profile text (about + experience + key_skills) ──────────
    console.log('Starting profile text analysis...');
    const profileData = {
        full_name: cleanLearner.full_name,
        position: cleanLearner.position || 'Data Professional',
        about: cleanLearner.about,
        experience: cleanLearner.experience,
        key_skills: cleanLearner.key_skills,
    };
    const profileUserPrompt = interpolate(config.user_profile, { data: JSON.stringify(profileData, null, 2) });
    let profileResult: any = {};
    try {
        profileResult = sanitizeText(await getChatCompletion(config.system_profile, profileUserPrompt));
    } catch (err) {
        console.error('Profile analysis error:', err);
        throw err;
    }

    // ── Calls C1...Cn: One per project (Phase 2 — sequential with breathing space) ─
    const projects: any[] = cleanLearner.projects || [];
    console.log(`Starting sequential project analysis (${projects.length} projects)...`);
    const normalizedProjects: any[] = [];

    // Per-flag counters — each advances only when its flag fires.
    // This ensures all suggestions in a list are used before any repeats.
    const counters: FlagCounters = { shortDesc: 0, tools: 0, impact: 0, learning: 0 };

    for (let i = 0; i < projects.length; i++) {
        const p = projects[i];
        console.log(`  Project ${i + 1}/${projects.length}: ${p.project_title}`);
        try {
            const projectUserPrompt = interpolate(config.user_project, {
                position: cleanLearner.position || 'Data Professional',
                short_description: p.short_description ?? p.project_short_description ?? '(not provided)',
                description: p.description ?? p.full_description ?? p.project_full_description ?? '(not provided)',
            });
            const projectResult = sanitizeText(
                await getChatCompletion(config.system_project, projectUserPrompt)
            );
            // counters are mutated in-place so each flag tracks its own position
            normalizedProjects.push(buildProjectSuggestions(projectResult, i, p, counters));
        } catch (err) {
            console.error(`  Project ${i + 1} error:`, err);
            normalizedProjects.push({
                project_title: p.project_title || `Project ${i + 1}`,
                score: 0,
                breakdown: {
                    short_info: { suggestions: ['Analysis failed for this project.'] },
                    full_description: { suggestions: ['Please try re-analysing.'] },
                },
                what_we_analyzed: { short_description: p.short_description ?? '', description: p.description ?? '' },
            });
        }
        // Rate-limit buffer between project calls
        if (i < projects.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 400));
        }
    }

    const projectsSectionScore = normalizedProjects.length > 0
        ? Math.round(normalizedProjects.reduce((sum, p) => sum + p.score, 0) / normalizedProjects.length)
        : 0;

    // ── Build final section list ─────────────────────────────────────────
    const sections: SectionAnalysis[] = [
        {
            name: 'About Me',
            max_score: 15,
            ...buildAboutSuggestions(profileResult?.about),
            input_data: cleanLearner.about,
            what_we_analyzed: cleanLearner.about ?? null,
        },
        {
            name: 'Key Skills',
            max_score: 10,
            ...buildKeySkillsSuggestions(profileResult?.key_skills, cleanLearner.key_skills || []),
            input_data: (cleanLearner.key_skills || []).join(', '),
            what_we_analyzed: (cleanLearner.key_skills || []).length > 0 ? (cleanLearner.key_skills || []).join(', ') : null,
        },
        {
            name: 'Experience',
            max_score: 15,
            ...buildExperienceSuggestions(profileResult?.experience),
            input_data: cleanLearner.experience,
            what_we_analyzed: cleanLearner.experience ?? null,
        },
        {
            name: 'Projects',
            score: projectsSectionScore,
            max_score: 60,
            suggestions: normalizedProjects,
            input_data: projects.map((p: any) => p.project_title).join(', '),
            what_we_analyzed: projects.map((p: any) => ({
                project_title: p.project_title || 'Untitled',
                short_description: p.short_description ?? p.project_short_description ?? '',
                description: p.description ?? p.full_description ?? p.project_full_description ?? '',
            })),
        },
        {
            name: 'Common Patterns in Winning Portfolios',
            score: 0,
            max_score: 0,
            suggestions: [
                '**Profile Photo**: Has a plain background, a clearly visible face, professional attire, and a confident smile. **No selfies or casual photos.**',
                '**Projects**: Include projects relevant to their target role, covering key skills from their skill set. Each project has a **GitHub link**, a **LinkedIn post**, and a **project video** explaining what was built and why.',
                '**Certificates**: Only showcases certificates **relevant to the target role**, keeping the profile focused and clean.',
                '**Tone & Presentation**: Maintains a consistent and professional tone across all sections and **avoids using emojis** as it makes the profile look unprofessional and less serious.',
                '**LinkedIn Post**: Learners usually post about their portfolio website explaining what they have built and learned. You can do the same, make sure to tag **Codebasics** for better visibility'
            ],
        },
    ];

    const rawTotal = sections.reduce((acc, s) => acc + s.score, 0);
    const overall_score = Math.min(90, Math.round(rawTotal));

    const what_was_analyzed: WhatWasAnalyzed = {
        full_name: cleanLearner.full_name || 'Unknown',
        position: cleanLearner.position || 'Data Professional',
        portfolio_url: cleanLearner.portfolio_url,
        sections_analyzed: sections.map(s => s.name),
        project_count: normalizedProjects.length,
        project_titles: projects.map((p: any) => p.project_title || 'Untitled').filter(Boolean),
        key_skills_list: Array.isArray(cleanLearner.key_skills) ? cleanLearner.key_skills : [],
    };

    console.log('Analysis complete. Overall:', overall_score);
    return { overall_score, sections, what_was_analyzed };
}
