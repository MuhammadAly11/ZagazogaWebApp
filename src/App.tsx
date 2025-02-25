import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  PlusCircle,
  Trash2,
  HelpCircle,
  X,
  ChevronRight,
  FileQuestion,
  Settings,
  Download,
  Tag,
  BookOpen,
  SwitchCamera,
  Bookmark,
  GraduationCap,
  Layout,
  ListChecks,
  Moon,
  Sun,
  Monitor,
  FileText,
  ExternalLink
} from 'lucide-react';
import type { QuizMetadata, CustomMetadata, QuizQuestion, Option, LessonMetadata } from './types';

const DEFAULT_OPTIONS: Option[] = ['a', 'b', 'c', 'd'];
const EXTRA_OPTIONS: Option[] = ['e', 'f', 'g'];

const INITIAL_LESSON_METADATA: LessonMetadata = {
  type: 'lesson',
  module: '',
  subject: '',
  lesson: ''
};

const INITIAL_CUSTOM_METADATA: CustomMetadata = {
  type: 'custom',
  module: '',
  title: '',
  tags: []
};

const INITIAL_QUESTION: QuizQuestion = {
  sn: '1',
  source: '',
  question: '',
  answer: '',
  a: '',
  b: '',
  c: '',
  d: '',
  e: '',
  f: '',
  g: '',
};

function App() {
  const [metadata, setMetadata] = useState<QuizMetadata>(INITIAL_LESSON_METADATA);
  const [questions, setQuestions] = useState<QuizQuestion[]>([{ ...INITIAL_QUESTION }]);
  const [extraOptionsCount, setExtraOptionsCount] = useState<{ [key: string]: number }>({});
  const [showHelp, setShowHelp] = useState(false);
  const [followSystem, setFollowSystem] = useState(() => {
    const savedPreference = localStorage.getItem('followSystem');
    return savedPreference === null ? true : savedPreference === 'true';
  });

  const [darkMode, setDarkMode] = useState(() => {
    const savedPreference = localStorage.getItem('darkMode');
    const followSystemPref = localStorage.getItem('followSystem');
    
    // If following system preference
    if (followSystemPref === null || followSystemPref === 'true') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // If manual preference is saved
    if (savedPreference !== null) {
      return savedPreference === 'true';
    }
    
    return false;
  });

  // Update dark mode class and handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (followSystem) {
        setDarkMode(e.matches);
      }
    };

    // Add listener for system theme changes
    mediaQuery.addEventListener('change', handleThemeChange);

    // Initial setup
    if (followSystem) {
      setDarkMode(mediaQuery.matches);
    }

    // Update document class and save preferences
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    if (!followSystem) {
      localStorage.setItem('darkMode', String(darkMode));
    }
    localStorage.setItem('followSystem', String(followSystem));

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, [darkMode, followSystem]);

  const toggleMetadataType = () => {
    setMetadata((prev: QuizMetadata): QuizMetadata => {
      if (prev.type === 'lesson') {
        return INITIAL_CUSTOM_METADATA;
      }
      return INITIAL_LESSON_METADATA;
    });
  };

  const updateLessonMetadata = (updates: Partial<LessonMetadata>) => {
    setMetadata(prev => ({
      ...prev,
      ...updates,
    } as LessonMetadata));
  };

  const updateCustomMetadata = (updates: Partial<CustomMetadata>) => {
    setMetadata(prev => ({
      ...prev,
      ...updates,
    } as CustomMetadata));
  };

  const addTag = (tag: string) => {
    if (metadata.type === 'custom') {
      setMetadata({
        ...metadata,
        tags: [...metadata.tags, tag]
      });
    }
  };

  const removeTag = (index: number) => {
    if (metadata.type === 'custom') {
      setMetadata({
        ...metadata,
        tags: metadata.tags.filter((_, i) => i !== index)
      });
    }
  };

  const isMetadataValid = () => {
    if (metadata.type === 'lesson') {
      return metadata.module.trim() !== '' &&
             metadata.subject.trim() !== '' &&
             metadata.lesson.trim() !== '';
    } else {
      return metadata.title.trim() !== '';
    }
  };

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        ...INITIAL_QUESTION,
        sn: String(prev.length + 1)
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => {
      const newQuestions = prev.filter((_, i) => i !== index);
      return newQuestions.map((q, i) => ({ ...q, sn: String(i + 1) }));
    });
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === index) {
        // Ensure all required fields are present
        const updatedQuestion: QuizQuestion = {
          ...q,
          ...updates,
          // Ensure these required fields are always strings
          sn: updates.sn || q.sn,
          source: updates.source || q.source,
          question: updates.question || q.question,
          answer: updates.answer || q.answer,
          a: updates.a || q.a,
          b: updates.b || q.b,
          c: updates.c || q.c,
          d: updates.d || q.d,
          e: updates.e || q.e,
          f: updates.f || q.f,
          g: updates.g || q.g,
        };
        return updatedQuestion;
      }
      return q;
    }));
  };

  const getFilledOptionsCount = (question: QuizQuestion) => {
    // Check options in sequence until we find an empty one
    for (let i = 0; i < DEFAULT_OPTIONS.length + EXTRA_OPTIONS.length; i++) {
      const opt = [...DEFAULT_OPTIONS, ...EXTRA_OPTIONS][i];
      if (!question[opt] || question[opt].trim() === '') {
        return i;
      }
    }
    return DEFAULT_OPTIONS.length + EXTRA_OPTIONS.length;
  };

  const areOptionsFilledInSequence = (question: QuizQuestion, availableOptions: Option[]) => {
    for (let i = 0; i < availableOptions.length - 1; i++) {
      const currentOpt = availableOptions[i];
      if (!question[currentOpt] || question[currentOpt].trim() === '') {
        return false;
      }
    }
    return true;
  };

  const addExtraOption = (index: number) => {
    const currentCount = extraOptionsCount[index] || 0;
    const availableOptions = getAvailableOptions(index);
    
    // Check if all existing options have content in sequence
    const optionsInSequence = areOptionsFilledInSequence(questions[index], availableOptions);
    
    if (currentCount < EXTRA_OPTIONS.length && optionsInSequence) {
      setExtraOptionsCount(prev => ({
        ...prev,
        [index]: currentCount + 1
      }));
    }
  };

  const getAvailableOptions = (index: number) => {
    const extraCount = extraOptionsCount[index] || 0;
    return [...DEFAULT_OPTIONS, ...EXTRA_OPTIONS.slice(0, extraCount)];
  };

  const isQuestionValid = (question: QuizQuestion) => {
    const hasQuestion = question.question.trim() !== '';
    const hasSource = question.source.trim() !== '';
    
    // Check if options are filled in sequence
    let optionsInSequence = true;
    let filledCount = 0;
    const allOptions = [...DEFAULT_OPTIONS, ...EXTRA_OPTIONS];
    
    for (let i = 0; i < allOptions.length; i++) {
      const opt = allOptions[i];
      const value = question[opt].trim();
      
      if (value === '') {
        // If we find an empty option, all following options must be empty
        for (let j = i + 1; j < allOptions.length; j++) {
          if (question[allOptions[j]].trim() !== '') {
            optionsInSequence = false;
            break;
          }
        }
        break;
      }
      filledCount++;
    }
    
    const hasEnoughOptions = filledCount >= 2;
    const hasAnswer = question.answer !== '';
    const isAnswerValid = hasAnswer && question[question.answer].trim() !== '';
    
    return hasQuestion && hasSource && hasEnoughOptions && hasAnswer && isAnswerValid && optionsInSequence;
  };

  const getQuestionValidationMessage = (question: QuizQuestion) => {
    const missing = [];
    
    if (!question.question.trim()) missing.push('question text');
    if (!question.source.trim()) missing.push('source');
    
    // Check options sequence
    let hasSequenceError = false;
    const allOptions = [...DEFAULT_OPTIONS, ...EXTRA_OPTIONS];
    for (let i = 0; i < allOptions.length - 1; i++) {
      const currentOpt = allOptions[i];
      const nextOpt = allOptions[i + 1];
      if (question[currentOpt].trim() === '' && question[nextOpt].trim() !== '') {
        hasSequenceError = true;
        break;
      }
    }
    
    if (hasSequenceError) {
      missing.push('options must be filled in sequence (no gaps allowed)');
    } else if (getFilledOptionsCount(question) < 2) {
      missing.push('at least 2 options');
    }
    
    if (!question.answer) missing.push('correct answer selection');
    else if (question.answer && question[question.answer].trim() === '') missing.push('content for the selected correct answer');
    
    return `Please ensure you have filled in: ${missing.join(', ')}.`;
  };

  const areAllQuestionsValid = questions.every(isQuestionValid) && isMetadataValid();

  const downloadJSON = () => {
    const cleanedQuestions = questions.map(question => {
      const cleanQuestion: Partial<QuizQuestion> = {
        sn: question.sn,
        source: question.source,
        question: question.question,
        answer: question.answer,
      };

      (['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const).forEach(opt => {
        const value = (question as any)[opt];
        if (value && value.trim() !== '') {
          (cleanQuestion as any)[opt] = value;
        }
      });

      return cleanQuestion;
    });

    const dataStr = JSON.stringify({
      ...metadata,
      questions: cleanedQuestions
    }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quiz-questions.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show the PDF info after download
    setShowPdfInfo(true);
    setTimeout(() => {
      setShowPdfInfo(false);
    }, 8000);
  };

  const enableSystemTheme = () => {
    setFollowSystem(true);
    setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  };

  // Add the infoBox state
  const [showPdfInfo, setShowPdfInfo] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:text-gray-100">
      {/* PDF Info Toast */}
      {showPdfInfo && (
        <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-purple-100 dark:border-purple-900 p-4 animate-fade-in z-50">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Create PDF Quizzes with Quizst</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Use <a href="https://github.com/MuhammadAly11/Quizst" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">Quizst</a> to convert your JSON into beautifully formatted PDF exam papers!
              </p>
            </div>
            <button
              onClick={() => setShowPdfInfo(false)}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-sm opacity-70"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-full p-2">
                <FileQuestion className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Zagazoga</span> Quiz Creator
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create interactive quizzes and export them as JSON</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={downloadJSON} 
              disabled={!questions.every(isQuestionValid) || !isMetadataValid()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 
                disabled:opacity-50 disabled:cursor-not-allowed 
                bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 
                shadow-md hover:shadow-lg disabled:shadow-none"
              title={!isMetadataValid() || !questions.every(isQuestionValid) ? 'Please fill in all required fields' : 'Download quiz as JSON'}
            >
              <Download className="w-5 h-5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="p-2.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Help"
              title="Show help guide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="relative group">
              <button
                onClick={() => {}}
                className="p-2.5 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Theme settings"
                title="Theme settings"
              >
                {followSystem ? (
                  <Monitor className="w-5 h-5" />
                ) : darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 w-40 hidden group-hover:block z-10">
                <button
                  onClick={() => { setFollowSystem(false); setDarkMode(false); }}
                  className={`w-full px-3 py-2 text-sm text-left flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700
                    ${!followSystem && !darkMode ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => { setFollowSystem(false); setDarkMode(true); }}
                  className={`w-full px-3 py-2 text-sm text-left flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700
                    ${!followSystem && darkMode ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark</span>
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                <button
                  onClick={enableSystemTheme}
                  className={`w-full px-3 py-2 text-sm text-left flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700
                    ${followSystem ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>System</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Quizst Integration Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-purple-100 dark:border-purple-800/30 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quizst Integration</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 md:mb-0 md:mr-6">
                  The JSON output from Zagazoga Quiz Creator is fully compatible with <a href="https://github.com/MuhammadAly11/Quizst" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">Quizst</a>, a Typst template for creating professional MCQ exam papers. Export your quiz and generate beautiful PDF documents.
                </p>
              </div>
              <a 
                href="https://github.com/MuhammadAly11/Quizst"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm"
              >
                <span>Learn More</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quiz Details</h2>
              </div>
              <button
                onClick={toggleMetadataType}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
              >
                <SwitchCamera className="w-4 h-4" />
                <span>Switch to {metadata.type === 'lesson' ? 'Custom Mode' : 'Lesson Mode'}</span>
              </button>
            </div>

            {!isMetadataValid() && (
              <div className="mb-6 flex items-start space-x-2 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  {metadata.type === 'lesson'
                    ? 'Please fill in all lesson details: module, subject, and lesson.'
                    : 'Please fill in the quiz title.'}
                </p>
              </div>
            )}

            {metadata.type === 'lesson' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Module</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={metadata.module}
                      onChange={(e) => updateLessonMetadata({ module: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter module"
                    />
                    {metadata.type === 'lesson' && metadata.module && (
                      <button
                        onClick={() => updateLessonMetadata({ module: '' })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title="Clear module"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={metadata.subject}
                      onChange={(e) => updateLessonMetadata({ subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter subject"
                    />
                    {metadata.type === 'lesson' && metadata.subject && (
                      <button
                        onClick={() => updateLessonMetadata({ subject: '' })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title="Clear subject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lesson</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={metadata.lesson}
                      onChange={(e) => updateLessonMetadata({ lesson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter lesson"
                    />
                    {metadata.type === 'lesson' && metadata.lesson && (
                      <button
                        onClick={() => updateLessonMetadata({ lesson: '' })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title="Clear lesson"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Title - Primary Field */}
                <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-900 dark:text-white">
                    Title
                    <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={metadata.title}
                      onChange={(e) => updateCustomMetadata({ title: e.target.value })}
                      className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter quiz title"
                    />
                    {metadata.type === 'custom' && metadata.title && (
                      <button
                        onClick={() => updateCustomMetadata({ title: '' })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title="Clear title"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional Fields - More Compact */}
                <div className="pt-4">
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center mt-3 mb-4">
                      <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700"></div>
                      <span className="px-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Optional Details</span>
                      <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Module Field */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
                          Module
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={metadata.module}
                            onChange={(e) => updateCustomMetadata({ module: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-gray-50/50 dark:bg-gray-700"
                            placeholder="Enter module name if applicable"
                          />
                          {metadata.type === 'custom' && metadata.module && (
                            <button
                              onClick={() => updateCustomMetadata({ module: '' })}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              title="Clear module"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Tags Field */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">
                          Tags
                        </label>
                        <div className="space-y-1.5">
                          {metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {metadata.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-600"
                                >
                                  {tag}
                                  <button
                                    onClick={() => removeTag(index)}
                                    className="ml-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          <input
                            type="text"
                            placeholder="Add tags (press Enter)"
                            className="w-full px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-gray-50/50 dark:bg-gray-700"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                  addTag(input.value.trim());
                                  input.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Questions Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <ListChecks className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Questions</h2>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {questions.map((question, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 font-semibold">
                        {question.sn}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Question {question.sn}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeQuestion(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Remove question"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span className="flex items-center space-x-1">
                          <Layout className="w-4 h-4" />
                          <span>Source</span>
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={question.source}
                          onChange={(e) => updateQuestion(index, { source: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter source"
                        />
                        {question.source && (
                          <button
                            onClick={() => updateQuestion(index, { source: '' })}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            title="Clear source"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Bookmark className="w-4 h-4" />
                        <span>Correct Answer</span>
                      </label>
                      <select
                        value={question.answer}
                        onChange={(e) => updateQuestion(index, { answer: e.target.value as Option })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select correct answer</option>
                        {getAvailableOptions(index).map((opt) => (
                          <option key={opt} value={opt}>
                            Option {opt.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <FileQuestion className="w-4 h-4" />
                      <span>Question</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(index, { question: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                        rows={3}
                        placeholder="Enter your question"
                      />
                      {question.question && (
                        <button
                          onClick={() => updateQuestion(index, { question: '' })}
                          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          title="Clear question"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Answer Options</h4>
                      <button
                        onClick={() => addExtraOption(index)}
                        disabled={extraOptionsCount[index] >= EXTRA_OPTIONS.length || !areOptionsFilledInSequence(questions[index], getAvailableOptions(index))}
                        className={`flex items-center space-x-1 text-xs p-1.5 rounded-lg transition-colors
                          ${extraOptionsCount[index] >= EXTRA_OPTIONS.length || !areOptionsFilledInSequence(questions[index], getAvailableOptions(index))
                            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
                        title={extraOptionsCount[index] >= EXTRA_OPTIONS.length 
                          ? "Maximum number of options reached" 
                          : !areOptionsFilledInSequence(questions[index], getAvailableOptions(index))
                          ? "Fill existing options in sequence before adding more"
                          : "Add another answer option"}
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Add Option</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getAvailableOptions(index).map((opt) => (
                        <div key={opt} className="relative">
                          <div className="absolute left-3 top-2.5 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                            {opt.toUpperCase()}
                          </div>
                          <input
                            type="text"
                            value={question[opt]}
                            onChange={(e) => updateQuestion(index, { [opt]: e.target.value })}
                            className={`w-full pl-8 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                              ${question.answer === opt
                                ? 'border-purple-500 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20'
                                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700'} dark:text-white`}
                            placeholder={`Option ${opt.toUpperCase()}`}
                          />
                          {question[opt] && (
                            <button
                              onClick={() => updateQuestion(index, { [opt]: '' })}
                              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              title="Clear input"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {!isQuestionValid(question) && (
                    <div className="flex items-start space-x-2 mt-6 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{getQuestionValidationMessage(question)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-500 transition-colors flex items-center justify-center space-x-2 hover:bg-purple-50/30 dark:hover:bg-purple-900/10"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">Add New Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-modal">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Help Guide</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="prose prose-purple dark:prose-invert max-w-none">
                <h3>Creating a Quiz</h3>
                <p>
                  Start by selecting either Lesson or Custom quiz type. Fill in all required metadata
                  fields for your quiz.
                </p>
                <h3>Adding Questions</h3>
                <p>
                  Each question requires:
                  <ul>
                    <li>A source reference</li>
                    <li>The question text</li>
                    <li>At least 2 options</li>
                    <li>A correct answer selection</li>
                  </ul>
                </p>
                <h3>Options</h3>
                <p>
                  You can add up to 7 options (A-G) for each question. Options must be filled in
                  sequence without gaps.
                </p>
                <h3>Exporting</h3>
                <p>
                  Once all questions are valid and complete, click the Export JSON button to download
                  your quiz.
                </p>
                <h3>Creating PDF Quizzes with Quizst</h3>
                <p>
                  The JSON output from Zagazoga Quiz Creator is fully compatible with <a href="https://github.com/MuhammadAly11/Quizst" target="_blank" rel="noopener noreferrer" className="hover:underline">Quizst</a>, a Typst template for creating professional MCQ exam papers.
                </p>
                <p>To create PDF quizzes with Quizst:</p>
                <ol>
                  <li>Export your quiz from this app as JSON</li>
                  <li>Use the JSON with Quizst to generate beautifully formatted PDF documents</li>
                </ol>
                <p>
                  Visit the <a href="https://github.com/MuhammadAly11/Quizst" target="_blank" rel="noopener noreferrer" className="hover:underline">Quizst GitHub repository</a> for detailed instructions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;