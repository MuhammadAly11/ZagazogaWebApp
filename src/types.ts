export type Option = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';
export type QuizMode = 'lesson' | 'custom';

export interface QuizQuestion {
  sn: string;
  source: string;
  question: string;
  answer: Option | '';
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
  f: string;
  g: string;
}

export interface LessonQuizData {
  type: 'lesson';
  module: string;
  subject: string;
  lesson: string;
  questions: QuizQuestion[];
}

export interface CustomQuizData {
  type: 'custom';
  title: string;
  module?: string;
  tags?: string[];
  questions: QuizQuestion[];
}

export type QuizData = LessonQuizData | CustomQuizData; 