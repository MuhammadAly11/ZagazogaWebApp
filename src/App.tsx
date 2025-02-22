import React, { useState } from 'react';
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
  ListChecks
} from 'lucide-react';
import type { QuizMetadata, ModuleMetadata, CustomMetadata, QuizQuestion, Option } from './types';

const DEFAULT_OPTIONS: Option[] = ['a', 'b', 'c', 'd'];
const EXTRA_OPTIONS: Option[] = ['e', 'f', 'g'];

const INITIAL_MODULE_METADATA: ModuleMetadata = {
  type: 'module',
  module: '',
  subject: '',
  lesson: '',
};

const INITIAL_CUSTOM_METADATA: CustomMetadata = {
  type: 'custom',
  module: '',
  title: '',
  tags: [],
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
  const [metadata, setMetadata] = useState<QuizMetadata>(INITIAL_MODULE_METADATA);
  const [questions, setQuestions] = useState<QuizQuestion[]>([{ ...INITIAL_QUESTION }]);
  const [extraOptionsCount, setExtraOptionsCount] = useState<{ [key: string]: number }>({});
  const [showHelp, setShowHelp] = useState(false);

  const toggleMetadataType = () => {
    setMetadata((prev: QuizMetadata): QuizMetadata => {
      if (prev.type === 'module') {
        return INITIAL_CUSTOM_METADATA;
      }
      return INITIAL_MODULE_METADATA;
    });
  };

  const updateModuleMetadata = (updates: Partial<ModuleMetadata>) => {
    setMetadata(prev => ({
      ...prev,
      ...updates,
    } as ModuleMetadata));
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
    if (metadata.type === 'module') {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <FileQuestion className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Quiz Creator</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="relative group">
              <button
                onClick={downloadJSON}
                disabled={!areAllQuestionsValid}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${areAllQuestionsValid
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </button>
              {!areAllQuestionsValid && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 p-3 hidden group-hover:block z-10">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium text-gray-900 mb-2">Please fix the following:</div>
                    <ul className="space-y-1">
                      {!isMetadataValid() && (
                        <li className="flex items-center space-x-2 text-amber-600">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {metadata.type === 'module'
                              ? 'Fill in all module details (module, subject, lesson)'
                              : 'Fill in the quiz title'}
                          </span>
                        </li>
                      )}
                      {questions.map((q, i) => !isQuestionValid(q) && (
                        <li key={i} className="flex items-center space-x-2 text-amber-600">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Question {q.sn}: {getQuestionValidationMessage(q)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Metadata Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">Quiz Details</h2>
              </div>
              <button
                onClick={toggleMetadataType}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <SwitchCamera className="w-4 h-4" />
                <span>Switch to {metadata.type === 'module' ? 'Custom' : 'Module'}</span>
              </button>
            </div>

            {!isMetadataValid() && (
              <div className="mb-6 flex items-start space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  {metadata.type === 'module'
                    ? 'Please fill in all required fields: module, subject, and lesson.'
                    : 'Please fill in the quiz title.'}
                </p>
              </div>
            )}

            {metadata.type === 'module' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Module</label>
                  <input
                    type="text"
                    value={metadata.module}
                    onChange={(e) => updateModuleMetadata({ module: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter module name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={metadata.subject}
                    onChange={(e) => updateModuleMetadata({ subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter subject"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Lesson</label>
                  <input
                    type="text"
                    value={metadata.lesson}
                    onChange={(e) => updateModuleMetadata({ lesson: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter lesson"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Module</label>
                    <input
                      type="text"
                      value={metadata.module}
                      onChange={(e) => updateCustomMetadata({ module: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter module name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={metadata.title}
                      onChange={(e) => updateCustomMetadata({ title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter quiz title"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(index)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Add tag..."
                      className="px-3 py-1 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            )}
          </div>

          {/* Questions Section */}
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                      {question.sn}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Question {question.sn}</h3>
                  </div>
                  <button
                    onClick={() => removeQuestion(index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="Remove question"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Source</label>
                      <input
                        type="text"
                        value={question.source}
                        onChange={(e) => updateQuestion(index, { source: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter question source"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Correct Answer
                      </label>
                      <select
                        value={question.answer}
                        onChange={(e) => updateQuestion(index, { answer: e.target.value as Option })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Question Text</label>
                    <textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(index, { question: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows={3}
                      placeholder="Enter your question"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">Options</label>
                      <div className="relative group">
                        <button
                          onClick={() => addExtraOption(index)}
                          disabled={extraOptionsCount[index] >= EXTRA_OPTIONS.length || !areOptionsFilledInSequence(questions[index], getAvailableOptions(index))}
                          className={`flex items-center space-x-1 text-sm font-medium
                            ${extraOptionsCount[index] >= EXTRA_OPTIONS.length || !areOptionsFilledInSequence(questions[index], getAvailableOptions(index))
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-indigo-600 hover:text-indigo-800'}`}
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Add Option</span>
                        </button>
                        {(extraOptionsCount[index] >= EXTRA_OPTIONS.length || !areOptionsFilledInSequence(questions[index], getAvailableOptions(index))) && (
                          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 p-3 hidden group-hover:block z-10">
                            <div className="text-sm text-gray-600">
                              {extraOptionsCount[index] >= EXTRA_OPTIONS.length ? (
                                <span>Maximum number of options (7) reached</span>
                              ) : !areOptionsFilledInSequence(questions[index], getAvailableOptions(index)) ? (
                                <span>Please fill in existing options in sequence before adding more</span>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getAvailableOptions(index).map((opt) => (
                        <div key={opt} className="relative">
                          <input
                            type="text"
                            value={question[opt]}
                            onChange={(e) => updateQuestion(index, { [opt]: e.target.value })}
                            className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                              ${question.answer === opt
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-300'}`}
                            placeholder={`Option ${opt.toUpperCase()}`}
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                            {opt.toUpperCase()}.
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!isQuestionValid(question) && (
                    <div className="flex items-start space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{getQuestionValidationMessage(question)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">Add New Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Help Guide</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="prose prose-indigo max-w-none">
                <h3>Creating a Quiz</h3>
                <p>
                  Start by selecting either Module or Custom quiz type. Fill in all required metadata
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;