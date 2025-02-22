import React, { useState } from 'react';
import { AlertCircle, PlusCircle, Trash2, HelpCircle, X, ChevronRight, FileQuestion, Settings, Download, Tag, BookOpen, SwitchCamera } from 'lucide-react';
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
      return metadata.module.trim() !== '' &&
             metadata.title.trim() !== '' &&
             metadata.tags.length > 0;
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
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, ...updates } : q
    ));
  };

  const addExtraOption = (index: number) => {
    const currentCount = extraOptionsCount[index] || 0;
    if (currentCount < EXTRA_OPTIONS.length) {
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

  const getFilledOptionsCount = (question: QuizQuestion) => {
    return [...DEFAULT_OPTIONS, ...EXTRA_OPTIONS].filter(opt => question[opt].trim() !== '').length;
  };

  const isQuestionValid = (question: QuizQuestion) => {
    const hasQuestion = question.question.trim() !== '';
    const hasSource = question.source.trim() !== '';
    const hasEnoughOptions = getFilledOptionsCount(question) >= 2;
    const hasAnswer = question.answer !== '';
    
    return hasQuestion && hasSource && hasEnoughOptions && hasAnswer;
  };

  const getQuestionValidationMessage = (question: QuizQuestion) => {
    const missing = [];
    
    if (!question.question.trim()) missing.push('question text');
    if (!question.source.trim()) missing.push('source');
    if (getFilledOptionsCount(question) < 2) missing.push('at least 2 options');
    if (!question.answer) missing.push('correct answer selection');
    
    return `Please ensure you have filled in: ${missing.join(', ')}.`;
  };

  const areAllQuestionsValid = questions.every(isQuestionValid) && isMetadataValid();

  const downloadJSON = () => {
    const dataStr = JSON.stringify({
      ...metadata,
      questions
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Quiz Question Editor
            </h1>
            <p className="mt-2 text-gray-600">Create and manage your quiz questions with ease</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowHelp(prev => !prev)}
              className="btn-secondary"
            >
              <HelpCircle size={20} />
              Help
            </button>
            <button
              onClick={downloadJSON}
              disabled={!areAllQuestionsValid}
              className={`btn-primary flex items-center gap-2 ${
                !areAllQuestionsValid && 'opacity-50 cursor-not-allowed'
              }`}
            >
              <Download size={20} />
              Download JSON
            </button>
          </div>
        </div>

        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setShowHelp(false)} />
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl max-w-3xl w-full mx-auto animate-modal">
                <div className="absolute right-4 top-4">
                  <button
                    onClick={() => setShowHelp(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                      <HelpCircle className="text-indigo-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">Welcome to Quiz Editor</h3>
                      <p className="text-gray-500 mt-1">Learn how to create perfect quiz questions</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <FileQuestion size={18} className="text-indigo-600" />
                        </div>
                        Creating Questions
                      </h4>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                          <div className="p-1.5 bg-indigo-100 rounded-full mt-0.5">
                            <ChevronRight size={12} className="text-indigo-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Quiz Details</span>
                            <p className="text-sm text-gray-600 mt-0.5">Fill in the module, subject, and lesson information</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                          <div className="p-1.5 bg-indigo-100 rounded-full mt-0.5">
                            <ChevronRight size={12} className="text-indigo-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Question Content</span>
                            <p className="text-sm text-gray-600 mt-0.5">Write your question and specify its source</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                          <div className="p-1.5 bg-indigo-100 rounded-full mt-0.5">
                            <ChevronRight size={12} className="text-indigo-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Answer Options</span>
                            <p className="text-sm text-gray-600 mt-0.5">Add at least 2 options and mark the correct one</p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Settings size={18} className="text-purple-600" />
                        </div>
                        Advanced Features
                      </h4>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                          <div className="p-1.5 bg-purple-100 rounded-full mt-0.5">
                            <ChevronRight size={12} className="text-purple-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Multiple Options</span>
                            <p className="text-sm text-gray-600 mt-0.5">Add up to 7 options (A-G) for complex questions</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                          <div className="p-1.5 bg-purple-100 rounded-full mt-0.5">
                            <ChevronRight size={12} className="text-purple-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Validation</span>
                            <p className="text-sm text-gray-600 mt-0.5">All required fields are checked automatically</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3 bg-white/80 p-3 rounded-lg">
                          <div className="p-1.5 bg-purple-100 rounded-full mt-0.5">
                            <ChevronRight size={12} className="text-purple-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Export</span>
                            <p className="text-sm text-gray-600 mt-0.5">Download your quiz as JSON when all fields are valid</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={() => setShowHelp(false)}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      <span className="font-medium">Start Creating</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metadata Section */}
        <div className={`glass-card p-8 animate-slide-up ${
          !isMetadataValid() && 'ring-2 ring-amber-200'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Quiz Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {metadata.type === 'module' 
                  ? 'Organize your quiz by module, subject, and lesson'
                  : 'Add a title and relevant tags for your quiz'}
              </p>
            </div>
            <button
              onClick={toggleMetadataType}
              className="btn-secondary flex items-center gap-2"
            >
              <SwitchCamera size={20} />
              Switch to {metadata.type === 'module' ? 'Custom' : 'Module'} Format
            </button>
          </div>

          {metadata.type === 'module' ? (
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Module
                </label>
                <input
                  type="text"
                  value={metadata.module}
                  onChange={e => updateModuleMetadata({ module: e.target.value })}
                  placeholder="e.g., First Year"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  value={metadata.subject}
                  onChange={e => updateModuleMetadata({ subject: e.target.value })}
                  placeholder="e.g., Biology"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Lesson
                </label>
                <input
                  type="text"
                  value={metadata.lesson}
                  onChange={e => updateModuleMetadata({ lesson: e.target.value })}
                  placeholder="e.g., Cell Biology"
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Module
                  </label>
                  <input
                    type="text"
                    value={metadata.module}
                    onChange={e => updateCustomMetadata({ module: e.target.value })}
                    placeholder="e.g., First Year"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={e => updateCustomMetadata({ title: e.target.value })}
                    placeholder="e.g., Biology Quiz - Cell Structure"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {metadata.tags.map((tag, index) => (
                    <span key={index} className="tag group">
                      <Tag size={14} />
                      {tag}
                      <button
                        onClick={() => removeTag(index)}
                        className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a tag"
                    className="flex-1"
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          addTag(input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add a tag"]') as HTMLInputElement;
                      if (input.value.trim()) {
                        addTag(input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="btn-primary"
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isMetadataValid() && (
            <div className="mt-6 flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-xl text-amber-600 animate-fade-in">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">
                {metadata.type === 'module' 
                  ? 'Please fill in the module, subject, and lesson fields.'
                  : 'Please fill in the module, title, and add at least one tag.'}
              </p>
            </div>
          )}
        </div>

        {/* Questions Section */}
        {questions.map((question, index) => (
          <div 
            key={index}
            className={`glass-card p-8 animate-slide-up ${
              !isQuestionValid(question) && 'ring-2 ring-amber-200'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Question {question.sn}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isQuestionValid(question) 
                    ? 'All required fields are filled'
                    : 'Some required fields need attention'}
                </p>
              </div>
              <button
                onClick={() => removeQuestion(index)}
                className={`p-2 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-300 ${
                  questions.length === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={questions.length === 1}
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Question Text
                </label>
                <textarea
                  value={question.question}
                  onChange={e => updateQuestion(index, { question: e.target.value })}
                  placeholder="Enter your question here..."
                  rows={3}
                  className="w-full"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Source
                  </label>
                  <input
                    type="text"
                    value={question.source}
                    onChange={e => updateQuestion(index, { source: e.target.value })}
                    placeholder="e.g., Science, History, Math"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Correct Answer
                  </label>
                  <select
                    value={question.answer}
                    onChange={e => updateQuestion(index, { answer: e.target.value as Option })}
                    className="w-full"
                  >
                    <option value="">Select correct answer</option>
                    {getAvailableOptions(index).map(opt => (
                      <option key={opt} value={opt}>
                        Option {opt.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {getAvailableOptions(index).map(opt => (
                  <div key={opt} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Option {opt.toUpperCase()}
                      {question.answer === opt && (
                        <span className="ml-2 text-green-600 font-medium">(correct)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={question[opt]}
                      onChange={e => updateQuestion(index, { [opt]: e.target.value })}
                      placeholder={`Enter option ${opt.toUpperCase()}`}
                      className={`w-full ${
                        question.answer === opt ? 'border-green-200 bg-green-50/50' : ''
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => addExtraOption(index)}
                  disabled={(extraOptionsCount[index] || 0) >= EXTRA_OPTIONS.length}
                  className={`btn-secondary flex items-center gap-2 ${
                    (extraOptionsCount[index] || 0) >= EXTRA_OPTIONS.length ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <PlusCircle size={20} />
                  Add Option
                </button>
              </div>
            </div>

            {!isQuestionValid(question) && (
              <div className="mt-6 flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-xl text-amber-600 animate-fade-in">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">
                  {getQuestionValidationMessage(question)}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Add Question Button */}
        <button
          onClick={addQuestion}
          className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg active:shadow-sm transition-all duration-300 animate-fade-in"
        >
          <PlusCircle size={20} />
          Add Question
        </button>
      </div>
    </div>
  );
}

export default App;