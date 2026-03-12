/**
 * All static suggestion strings — source of truth.
 * Model returns boolean need-flags; code picks exact strings from here.
 * Never let the model generate these — that was the root cause of rotation drift and rephrasing.
 */


/** Static message: below 5 skills AND no soft skill */
export const KEY_SKILLS_MIX_SUGGESTION = 'Add 3 more skills, a mix of technical and soft skills relevant to your target role.';

/** Static message: below 5 skills but soft skill present */
export const KEY_SKILLS_TECHNICAL_SUGGESTION = 'Add 2 more technical skills relevant to your target role.';

/** Static message: 5+ skills but no soft skill */
export const KEY_SKILLS_SOFT_SUGGESTION = 'Add soft skills relevant to your target role.';

export const SHORT_DESC_SUGGESTIONS: string[] = [
    "Explain what business problem this project was trying to solve.",
    "Describe the challenge the business was facing that led to this project.",
    "State the core problem your project was built to address.",
    "Define the specific pain point your project was trying to resolve.",
    "Describe what the business or team was struggling with before this project began.",
];

export const TOOLS_SUGGESTIONS: string[] = [
    "Name the specific tools you used and explain how you applied them in this project.",
    "Mention the specific tools you used and describe what role they played in this project.",
    "List the tools you worked with and explain how they contributed to the project outcome.",
    "Name the specific tools used and how they were applied in this project.",
];

export const IMPACT_SUGGESTIONS: string[] = [
    "Include the business outcome this project contributed to and support it with a number wherever possible.",
    "Describe what changed or improved because of this project and back it with a specific number.",
    "State the outcome this project created and quantify it wherever you can.",
];

export const LEARNING_SUGGESTIONS: string[] = [
    "Share the specific learnings you took away from this project.",
    "Mention the key learnings this project gave you in terms of skills or approach.",
    "State the most important learnings from this project and how they helped you grow.",
];

export const ABOUT_SUGGESTIONS: Record<string, string> = {
    target_role_clarity: "Mention the specific role and domain you are targeting. This will help you find the right opportunity faster.",
    background: "Share what brought you to this field. It adds credibility and shows your interest is genuine.",
};

export const EXPERIENCE_SUGGESTIONS: Record<string, string> = {
    responsibilities_clarity: "Add the responsibilities you handled and the areas you worked on in your role.",
    tools_in_context: "Name the specific tools you used and how you applied them in your project.",
    business_impact: 'Include the business outcome your work contributed to with a number wherever possible.',
};

/**
 * Pick a suggestion from a list using a deterministic rotating index.
 * Index is zero-based (project index).
 */
export function pickRotated(list: string[], projectIndex: number): string {
    return list[projectIndex % list.length];
}
