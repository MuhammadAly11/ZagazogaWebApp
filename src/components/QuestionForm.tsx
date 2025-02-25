import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
import type { QuizQuestion, Option } from '../types';

// Constants
const DEFAULT_OPTIONS: Option[] = ['a', 'b', 'c', 'd'];
const EXTRA_OPTIONS: Option[] = ['e', 'f', 'g'];

interface QuestionFormProps {
  question: QuizQuestion;
  index: number;
  onUpdate: (index: number, updates: Partial<QuizQuestion>) => void;
  onRemove: (index: number) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ 
  question, 
  index, 
  onUpdate, 
  onRemove 
}) => {
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get all filled option letters
  const getFilledOptions = () => {
    const options = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const;
    return options.filter(opt => question[opt].trim() !== '');
  };
  
  const filledOptions = getFilledOptions();
  const hasEnoughOptions = filledOptions.length >= 2;
  
  // Validation checks
  const hasQuestion = question.question.trim() !== '';
  const hasSource = question.source.trim() !== '';
  const isAnswerValid = question.answer !== '' && question[question.answer]?.trim() !== '';
  
  // Calculate overall validity
  const isValid = hasQuestion && hasSource && hasEnoughOptions && isAnswerValid;
  
  const handleAnswerChange = (answer: string) => {
    onUpdate(index, { answer });
  };
  
  const confirmDelete = () => {
    if (showDeleteConfirm) {
      onRemove(index);
    } else {
      setShowDeleteConfirm(true);
      // Auto-hide after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-teal-900 rounded-lg shadow-md border border-gray-200 dark:border-teal-800 overflow-hidden">
      {/* Question Header */}
      <div className="border-b border-gray-200 dark:border-teal-800 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-700 text-teal-600 dark:text-teal-200 text-sm font-semibold">
              {index + 1}
            </span>
            <span>Question</span>
            {isValid && (
              <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                <Check className="w-3 h-3 mr-1" />
                Valid
              </span>
            )}
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={confirmDelete}
              className={`p-2 rounded-lg transition-colors ${
                showDeleteConfirm 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20'
              }`}
              aria-label={showDeleteConfirm ? "Confirm Delete" : "Delete Question"}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Main question content */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Source <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={question.source}
              onChange={(e) => onUpdate(index, { source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-teal-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-800 dark:text-white"
              placeholder="Enter source reference"
            />
            {!hasSource && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> 
                Source is required
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Question <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={question.question}
              onChange={(e) => onUpdate(index, { question: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-teal-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 min-h-[100px] dark:bg-teal-800 dark:text-white resize-none"
              placeholder="Enter the question text"
            />
            {!hasQuestion && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> 
                Question text is required
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Options Section */}
      <div className="p-4 sm:p-5 bg-gray-50 dark:bg-teal-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-gray-800 dark:text-white flex items-center gap-2">
            Options
            {!hasEnoughOptions && (
              <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                Min. 2 required
              </span>
            )}
          </h3>
          <button
            onClick={() => setIsOptionsExpanded(prev => !prev)}
            className="p-1.5 rounded-md text-gray-500 hover:text-teal-600 hover:bg-teal-100 dark:text-gray-400 dark:hover:text-teal-300 dark:hover:bg-teal-700 transition-colors"
            aria-label={isOptionsExpanded ? "Collapse options" : "Expand options"}
          >
            {isOptionsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {isOptionsExpanded && (
          <div className="space-y-4">
            {/* Answer selection */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correct Answer <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {(['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const).map((opt) => {
                  const isDisabled = question[opt].trim() === '';
                  const isSelected = question.answer === opt;
                  
                  return (
                    <button
                      key={opt}
                      onClick={() => !isDisabled && handleAnswerChange(opt)}
                      disabled={isDisabled}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                        ${isDisabled 
                          ? 'bg-gray-100 dark:bg-teal-900 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                          : isSelected
                            ? 'bg-teal-500 text-white shadow-sm ring-2 ring-teal-300 dark:ring-teal-700'
                            : 'bg-white dark:bg-teal-700 text-teal-700 dark:text-teal-200 hover:bg-teal-50 dark:hover:bg-teal-600 border border-gray-300 dark:border-teal-600'
                        }`}
                      aria-label={`Select option ${opt.toUpperCase()} as correct answer`}
                      aria-pressed={isSelected}
                      aria-disabled={isDisabled}
                    >
                      {opt.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              {!isAnswerValid && question.answer && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Selected answer option is empty
                </p>
              )}
              {!question.answer && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Select the correct answer
                </p>
              )}
            </div>
            
            {/* Option inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const).map((opt, i) => (
                <div key={opt} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                    <span>Option {opt.toUpperCase()}{i < 2 && <span className="text-red-500 ml-1">*</span>}</span>
                    {question.answer === opt && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                        Correct
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={question[opt]}
                    onChange={(e) => onUpdate(index, { [opt]: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-teal-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-800 dark:text-white ${question.answer === opt ? 'border-green-500 dark:border-green-600' : ''}`}
                    placeholder={`Enter option ${opt.toUpperCase()}`}
                  />
                  {i < 2 && question[opt].trim() === '' && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      First two options are required
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionForm; 