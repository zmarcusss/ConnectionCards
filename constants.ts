import { CardData, QuestionsData, QuestionsSelection } from './types';

const QUESTIONS_DATA: QuestionsData = require('./questions.json');

const LEVEL_NAME: Record<number, string> = {
    1: 'VIBE CHECK',
    2: 'REAL TALK',
    3: 'DEEP DIVE',
};

const stripQuestionNumbering = (q: string) => q.replace(/^\s*\d+\.\s*/, '').trim();

const shuffleInPlace = <T,>(arr: T[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const getAvailableQuestionCategories = () => Object.keys(QUESTIONS_DATA.categories);

export const buildDeckFromQuestions = (selection: QuestionsSelection): CardData[] => {
    const allCategories = getAvailableQuestionCategories();
    const selectedCategories =
        selection.categories?.length ? selection.categories : allCategories;

    const selectedThemes =
        selection.themes?.length ? selection.themes : ['general'];

    const raw: Array<{ category: string; theme: string; text: string }> = [];

    for (const category of selectedCategories) {
        const cat = QUESTIONS_DATA.categories[category];
        if (!cat) continue;

        for (const theme of selectedThemes) {
            const questions = cat.themes?.[theme] ?? [];
            for (const q of questions) {
                raw.push({
                    category,
                    theme,
                    text: stripQuestionNumbering(q),
                });
            }
        }
    }

    shuffleInPlace(raw);

    const total = raw.length || 1;

    return raw.map((q, i) => {
        const level = Math.min(3, Math.floor((i / total) * 3) + 1);
        const categoryLabel = q.category.replace(/_/g, ' ').toUpperCase();
        const footerText = `${categoryLabel} • ${LEVEL_NAME[level]}`;

        return {
            id: `q-${q.category}-${q.theme}-${i}-${Math.random().toString(36).slice(2, 8)}`,
            text: q.text,
            level,
            footerText,
            category: q.category,
        };
    });
};

export const INITIAL_DECK: CardData[] = buildDeckFromQuestions({ categories: [], themes: ['general'] });

// Helper to generate random consistent visual offsets for the stack
export const generateCardVisuals = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        rotation: (Math.random() * 12 - 6), // -6 to 6 degrees (increased)
        offsetX: (Math.random() * 30 - 15), // -15 to 15px (increased)
        offsetY: (Math.random() * 30 - 15), // -15 to 15px (increased)
    }));
};
