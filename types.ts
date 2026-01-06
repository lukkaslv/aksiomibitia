
export interface Axiom {
  id: string;
  title: string;
  description: string;
  examples?: string[];
}

export interface Level {
  id: number;
  code: string;
  name: string;
  subtitle: string;
  axioms: Axiom[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export type ModelType = 'flash' | 'pro';

export interface UserProgress {
  studiedAxiomIds: string[];
  notes: Record<string, string>;
  insights: { id: string; date: string; text: string }[];
}
