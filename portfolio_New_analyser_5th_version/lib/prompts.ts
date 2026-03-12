import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface PortfolioAnalyserYaml {
    system_profile: string;
    system_project: string;
    user_profile: string;
    user_project: string;
}

export interface PromptsConfig {
    system_profile: string;
    system_project: string;
    user_profile: string;
    user_project: string;
}

export function loadPrompts(): PromptsConfig {
    const filePath = path.join(process.cwd(), 'portolio_analyser.yml');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = yaml.load(fileContent) as PortfolioAnalyserYaml;

    if (!parsed?.system_profile) throw new Error('portolio_analyser.yml missing "system_profile"');
    if (!parsed?.system_project) throw new Error('portolio_analyser.yml missing "system_project"');
    if (!parsed?.user_profile) throw new Error('portolio_analyser.yml missing "user_profile"');
    if (!parsed?.user_project) throw new Error('portolio_analyser.yml missing "user_project"');

    return {
        system_profile: parsed.system_profile.trim(),
        system_project: parsed.system_project.trim(),
        user_profile: parsed.user_profile.trim(),
        user_project: parsed.user_project.trim(),
    };
}

export function interpolate(template: string, data: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(
            placeholder,
            typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '')
        );
    }
    return result;
}
