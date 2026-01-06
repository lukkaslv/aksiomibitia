
export interface Axiom {
  id: string;
  title: string;
  description: string;
  explanation: string;
  practice: string;
}

export interface Level {
  id: number;
  code: string;
  name: string;
  subtitle: string;
  axioms: Axiom[];
}

export interface UserProgress {
  studiedAxiomIds: string[];
  notes: Record<string, string>;
  insights: { id: string; date: string; text: string }[];
}
