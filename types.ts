export interface CardData {
  id: string;
  text: string;
  level: number; // 1: Perception, 2: Connection, 3: Reflection
  footerText?: string;
  category?: string;
}

export interface CardState {
  rotation: number;
  offsetX: number;
  offsetY: number;
}

export enum DeckLevel {
  PERCEPTION = 1,
  CONNECTION = 2,
  REFLECTION = 3,
  WILDCARD = 4
}

export type QuestionsData = {
  categories: Record<
    string,
    {
      themes: Record<string, string[]>;
    }
  >;
};

export type QuestionsSelection = {
  categories: string[];
  themes?: string[];
};
