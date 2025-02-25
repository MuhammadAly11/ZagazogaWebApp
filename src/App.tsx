import { useState, useEffect, useRef } from 'react'
import { Save, Plus, HelpCircle, X, BookOpen, Download, Trash, Edit3, CheckCircle, Tag, Book, GraduationCap, Compass, Sun, Moon, ChevronLeft } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import QuestionForm from './components/QuestionForm'
import type { QuizQuestion, Option, QuizData, QuizMode, LessonQuizData, CustomQuizData } from './types'

// Constants
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
  const [quizMode, setQuizMode] = useState<QuizMode>('custom');
  // Lesson mode fields
  const [module, setModule] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [lesson, setLesson] = useState<string>('');
  // Custom mode fields
  const [title, setTitle] = useState<string>('');
  const [customModule, setCustomModule] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([{ ...INITIAL_QUESTION }]);
  const [showHelp, setShowHelp] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedPreference = localStorage.getItem('darkMode');
    return savedPreference !== null ? savedPreference === 'true' : false;
  });
  
  // Active question index 
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Refs
  const questionListRef = useRef<HTMLDivElement>(null);
  const tagsInputRef = useRef<HTMLInputElement>(null);

  // Theme effect
  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tagValue = tagsInput.trim();
    if (tagValue && !tags.includes(tagValue)) {
      setTags([...tags, tagValue]);
      setTagsInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addQuestion = () => {
    const newQuestions = [
      ...questions,
      { ...INITIAL_QUESTION, sn: String(questions.length + 1) }
    ];
    setQuestions(newQuestions);
    
    // Set active question to the newly added one
    setActiveQuestionIndex(newQuestions.length - 1);
    
    // Scroll to the new question after render
    setTimeout(() => {
      if (questionListRef.current) {
        questionListRef.current.scrollTop = questionListRef.current.scrollHeight;
      }
    }, 100);
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => {
      const newQuestions = prev.filter((_, i) => i !== index);
      
      // Renumber the questions
      const renumbered = newQuestions.map((q, i) => ({ ...q, sn: String(i + 1) }));
      
      // Adjust the active question index if needed
      if (activeQuestionIndex >= newQuestions.length) {
        setActiveQuestionIndex(Math.max(0, newQuestions.length - 1));
      }
      
      return renumbered;
    });
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === index) {
        // Ensure all required fields are always strings
        const updatedQuestion: QuizQuestion = {
          ...q,
          ...updates,
          // Make sure these fields are always strings
          sn: updates.sn !== undefined ? updates.sn : q.sn,
          source: updates.source !== undefined ? updates.source : q.source,
          question: updates.question !== undefined ? updates.question : q.question,
          answer: updates.answer !== undefined ? updates.answer : q.answer,
          a: updates.a !== undefined ? updates.a : q.a,
          b: updates.b !== undefined ? updates.b : q.b,
          c: updates.c !== undefined ? updates.c : q.c,
          d: updates.d !== undefined ? updates.d : q.d,
          e: updates.e !== undefined ? updates.e : q.e,
          f: updates.f !== undefined ? updates.f : q.f,
          g: updates.g !== undefined ? updates.g : q.g,
        };
        return updatedQuestion;
      }
      return q;
    }));
  };

  const isQuestionValid = (question: QuizQuestion): boolean => {
    const hasQuestion = question.question.trim() !== '';
    const hasSource = question.source.trim() !== '';
    
    // Check options sequence and count
    let filledCount = 0;
    const allOptions: Option[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    
    for (const opt of allOptions) {
      if (question[opt].trim() !== '') {
        filledCount++;
      }
    }
    
    const hasEnoughOptions = filledCount >= 2;
    const hasAnswer = question.answer !== '';
    const isAnswerValid = hasAnswer && question.answer !== '' && question[question.answer].trim() !== '';
    
    return hasQuestion && hasSource && hasEnoughOptions && hasAnswer && isAnswerValid;
  };

  const isQuizValid = (): boolean => {
    const allQuestionsValid = questions.every(isQuestionValid);
    
    if (quizMode === 'lesson') {
      return module.trim() !== '' && subject.trim() !== '' && lesson.trim() !== '' && allQuestionsValid;
    } else {
      return title.trim() !== '' && allQuestionsValid;
    }
  };

  const downloadJSON = () => {
    if (!isQuizValid()) {
      toast.error('Please fill in all required fields before downloading');
      return;
    }

    const cleanedQuestions = questions.map(question => {
      const cleanQuestion: Partial<QuizQuestion> = {
        sn: question.sn,
        source: question.source,
        question: question.question,
        answer: question.answer,
      };

      (['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const).forEach(opt => {
        const value = question[opt];
        if (value && value.trim() !== '') {
          cleanQuestion[opt] = value;
        }
      });

      return cleanQuestion;
    });

    let quizData: QuizData;
    
    if (quizMode === 'lesson') {
      quizData = {
        type: 'lesson',
        module,
        subject,
        lesson,
        questions: cleanedQuestions as QuizQuestion[],
      };
    } else {
      quizData = {
        type: 'custom',
        title,
        module: customModule.trim() !== '' ? customModule : undefined,
        tags: tags.length > 0 ? tags : undefined,
        questions: cleanedQuestions as QuizQuestion[],
      };
    }

    const dataStr = JSON.stringify(quizData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename based on quiz mode
    const filename = quizMode === 'lesson' 
      ? `${module.toLowerCase().replace(/\s+/g, '-')}-${subject.toLowerCase().replace(/\s+/g, '-')}-${lesson.toLowerCase().replace(/\s+/g, '-')}.json`
      : `${title.toLowerCase().replace(/\s+/g, '-')}-quiz.json`;
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Quiz exported successfully!');
  };

  // Navigation functions
  const goToNextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
    } else {
      // If at the last question, offer to add a new one
      if (window.confirm('Add a new question?')) {
        addQuestion();
      }
    }
  };

  const goToPrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prev => prev - 1);
    }
  };

  const renderSidebar = () => (
    <div className={`fixed left-0 top-0 bottom-0 bg-white dark:bg-teal-900 border-r border-gray-200 dark:border-teal-800 transition-all duration-300 ease-in-out z-10 ${sidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col`}>
      <div className="p-4 border-b border-gray-200 dark:border-teal-800 flex items-center justify-between">
        <h1 className={`font-bold ${sidebarCollapsed ? 'hidden' : 'block'}`}>
          <span className="text-teal-600 dark:text-teal-400">Quiz</span> Creator
        </h1>
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-md text-gray-500 hover:text-teal-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-teal-800"
        >
          {sidebarCollapsed ? <Compass className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className={`mb-6 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
            <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Quiz Mode</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setQuizMode('lesson')}
                className={`py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
                  quizMode === 'lesson' 
                    ? 'bg-teal-100 text-teal-600 dark:bg-teal-700 dark:text-teal-200' 
                    : 'bg-gray-100 text-gray-700 dark:bg-teal-800 dark:text-gray-300'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Lesson</span>
              </button>
              <button
                onClick={() => setQuizMode('custom')}
                className={`py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors ${
                  quizMode === 'custom' 
                    ? 'bg-teal-100 text-teal-600 dark:bg-teal-700 dark:text-teal-200' 
                    : 'bg-gray-100 text-gray-700 dark:bg-teal-800 dark:text-gray-300'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Custom</span>
              </button>
            </div>
          </div>
          
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center gap-4 mt-6">
              <button 
                onClick={() => setActiveQuestionIndex(0)}
                className={`p-3 rounded-md text-gray-500 hover:text-teal-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-teal-800 ${activeQuestionIndex === 0 ? 'bg-gray-100 dark:bg-teal-800' : ''}`}
                title="Quiz Info"
              >
                <BookOpen className="w-5 h-5" />
              </button>
              
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveQuestionIndex(idx + 1)}
                  className={`p-3 rounded-md text-gray-500 hover:text-teal-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-teal-800 ${activeQuestionIndex === idx + 1 ? 'bg-gray-100 dark:bg-teal-800' : ''}`}
                  title={`Question ${idx + 1}`}
                >
                  {isQuestionValid(questions[idx]) ? 
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" /> : 
                    <span className="w-5 h-5 flex items-center justify-center text-sm font-medium">{idx + 1}</span>
                  }
                </button>
              ))}
              
              <button
                onClick={addQuestion}
                className="p-3 rounded-md text-gray-500 hover:text-teal-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-teal-800"
                title="Add Question"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Navigation</div>
              <nav className="mb-6">
                <button
                  onClick={() => setActiveQuestionIndex(0)}
                  className={`w-full px-3 py-2 mb-1 rounded-md flex items-center gap-2 transition-colors ${
                    activeQuestionIndex === 0 
                      ? 'bg-teal-100 text-teal-600 dark:bg-teal-700 dark:text-teal-200' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-teal-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Quiz Information</span>
                </button>
                
                <div className="ml-4 space-y-1 max-h-[50vh] overflow-y-auto pr-2">
                  {questions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveQuestionIndex(idx + 1)}
                      className={`w-full px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                        activeQuestionIndex === idx + 1 
                          ? 'bg-teal-100 text-teal-600 dark:bg-teal-700 dark:text-teal-200' 
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-teal-800'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isQuestionValid(question) ? 
                          <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" /> : 
                          <span className="w-4 h-4 flex items-center justify-center text-xs font-medium">{idx + 1}</span>
                        }
                      </div>
                      <span className="truncate">
                        {question.question.trim() ? question.question.trim().substring(0, 20) + (question.question.length > 20 ? '...' : '') : `Question ${idx + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={addQuestion}
                  className="w-full mt-2 px-3 py-2 rounded-md flex items-center gap-2 text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-800/50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </nav>
              
              <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</div>
              <div className="space-y-2">
                <button
                  onClick={downloadJSON}
                  disabled={!isQuizValid()}
                  className="w-full px-3 py-2 rounded-md flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Quiz</span>
                </button>
                
                <button
                  onClick={() => setShowHelp(true)}
                  className="w-full px-3 py-2 rounded-md flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-teal-800 dark:hover:bg-teal-700 dark:text-gray-300 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Help</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-teal-800">
        <button
          onClick={() => setDarkMode(prev => !prev)}
          className={`w-full px-3 py-2 rounded-md flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-teal-800`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!sidebarCollapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </div>
  );

  const renderMainContent = () => (
    <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
      <main className="p-6 max-w-4xl mx-auto">
        {activeQuestionIndex === 0 ? (
          // Quiz information screen
          <div className="bg-white dark:bg-teal-900 shadow-md rounded-lg p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Quiz Information</h2>
            
            {quizMode === 'lesson' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Module <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text" 
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-teal-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-800 dark:text-white"
                    placeholder="Enter module name"
                  />
                  {!module.trim() && <p className="mt-1 text-sm text-red-500">Module is required</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-teal-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-800 dark:text-white"
                    placeholder="Enter subject name"
                  />
                  {!subject.trim() && <p className="mt-1 text-sm text-red-500">Subject is required</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lesson <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text" 
                    value={lesson}
                    onChange={(e) => setLesson(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-teal-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-800 dark:text-white"
                    placeholder="Enter lesson name"
                  />
                  {!lesson.trim() && <p className="mt-1 text-sm text-red-500">Lesson is required</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-teal-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-800 dark:text-white"
                    placeholder="Enter quiz title"
                  />
                  {!title.trim() && <p className="mt-1 text-sm text-red-500">Title is required</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Module <span className="text-gray-400 text-xs ml-1">(optional)</span>
                  </label>
                  <input
                    type="text" 
                    value={customModule}
                    onChange={(e) => setCustomModule(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-teal-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-800 dark:text-white"
                    placeholder="Enter optional module name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags <span className="text-gray-400 text-xs ml-1">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-teal-100 text-teal-800 dark:bg-teal-700 dark:text-teal-100"
                      >
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => removeTag(tag)}
                          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-teal-400 hover:text-teal-900 dark:text-teal-200 dark:hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      ref={tagsInputRef}
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      onKeyDown={handleTagInput}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-teal-700 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-800 dark:text-white"
                      placeholder="Add tags (press Enter or comma to add)"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 p-4 bg-gray-50 dark:bg-teal-800 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Quiz Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Questions:</span>
                  <span className="font-medium text-gray-800 dark:text-white">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Completed Questions:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {questions.filter(q => isQuestionValid(q)).length} of {questions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ready to Export:</span>
                  <span className={`font-medium ${isQuizValid() ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {isQuizValid() ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setActiveQuestionIndex(1)}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
              >
                {questions.length > 0 ? 'Edit Questions' : 'Add Question'}
              </button>
              
              <button
                onClick={downloadJSON}
                disabled={!isQuizValid()}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-teal-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-teal-600 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-teal-800 dark:disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
              >
                Export Quiz
              </button>
            </div>
          </div>
        ) : (
          // Question editing screen
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveQuestionIndex(0)}
                  className="p-2 rounded-md text-gray-500 hover:text-teal-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-teal-800/50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-medium text-gray-800 dark:text-white">Question {activeQuestionIndex} of {questions.length}</h2>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={goToPrevQuestion}
                  disabled={activeQuestionIndex <= 1}
                  className="p-2 rounded-md text-gray-500 hover:text-teal-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-teal-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToNextQuestion}
                  disabled={activeQuestionIndex >= questions.length}
                  className="p-2 rounded-md text-gray-500 hover:text-teal-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-teal-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 transform rotate-180" />
                </button>
              </div>
            </div>
            
            <QuestionForm
              question={questions[activeQuestionIndex - 1]}
              index={activeQuestionIndex - 1}
              onUpdate={updateQuestion}
              onRemove={removeQuestion}
            />
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={addQuestion}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Question</span>
              </button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="border-t border-gray-200 dark:border-teal-800 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Quiz Creator &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-teal-950 text-gray-900 dark:text-white">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme={darkMode ? 'dark' : 'light'}
        hideProgressBar={false}
      />
      
      {renderSidebar()}
      {renderMainContent()}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-teal-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Help Guide</h2>
                <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="prose prose-teal dark:prose-invert max-w-none">
                <div className="p-4 bg-teal-50 dark:bg-teal-800/40 rounded-lg border border-teal-100 dark:border-teal-800 mb-6">
                  <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-2">Two Quiz Modes</h3>
                  <p className="text-teal-700 dark:text-teal-300">
                    The Quiz Creator supports two quiz formats:
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li><strong>Lesson Mode</strong>: For structured educational content with module, subject, and lesson organization.</li>
                    <li><strong>Custom Mode</strong>: For flexible quizzes with optional categorization.</li>
                  </ul>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Getting Started</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  1. Choose either Lesson or Custom mode in the sidebar.<br />
                  2. Fill in the required information on the Quiz Information screen.<br />
                  3. Navigate to the Questions screen to add your quiz questions.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Creating Questions</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Each question requires:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4">
                  <li>A source reference</li>
                  <li>The question text</li>
                  <li>At least 2 answer options</li>
                  <li>Selecting which option is correct</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Exporting Your Quiz</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  When all required fields are complete, use the Export Quiz button to download your quiz as a JSON file.
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