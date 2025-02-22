export interface ModuleMetadata {
  type: 'module';
  module: string;
  subject: string;
  lesson: string;
}

export interface CustomMetadata {
  type: 'custom';
  module: string;
  title: string;
  tags: string[];
}

export type QuizMetadata = ModuleMetadata | CustomMetadata;

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
  [key: string]: string;
}

export type Option = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';