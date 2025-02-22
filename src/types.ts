export interface QuizMetadata {
  module: string;
  subject: string;
  lesson: string;
}

export interface QuizQuestion {
  sn: string;
  source: string;
  question: string;
  answer: string;
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
  f: string;
  g: string;
}

export type Option = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';