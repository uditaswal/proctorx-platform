// frontend/src/app/exam/start/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';

import { FolderIcon, DocumentTextIcon, ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon} from '@heroicons/react/24/outline';
  
interface Question {
  id: string;
  type: 'mcq' | 'coding';
  title: string;
  description: string;
  options?: string[];
  correctAnswer?: string;
  starterCode?: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
  }>;
  points: number;
}

interface ExamSession {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
  timeRemaining: number;
  currentQuestionIndex: number;
}

export default function ExamStartPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const examId = searchParams.get('id');
  
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize exam session
    const mockExamSession: ExamSession = {
      id: examId || '1',
      title: 'JavaScript Advanced Concepts',
      duration: 120 * 60, // 120 minutes in seconds
      timeRemaining: 120 * 60,
      currentQuestionIndex: 0,
      questions: [
        {
          id: '1',
          type: 'mcq',
          title: 'JavaScript Closures',
          description: 'What will be the output of the following code?\n\n```javascript\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n```',
          options: ['0 1 2', '3 3 3', '0 0 0', 'undefined undefined undefined'],
          points: 5
        },
        {
          id: '2',
          type: 'coding',
          title: 'Array Manipulation',
          description: 'Write a function that takes an array of numbers and returns a new array with only the even numbers, sorted in ascending order.',
          starterCode: 'function filterAndSort(numbers) {\n  // Your code here\n  \n}',
          testCases: [
            { input: '[4, 2, 7, 1, 8, 3]', expectedOutput: '[2, 4, 8]' },
            { input: '[1, 3, 5]', expectedOutput: '[]' },
            { input: '[10, 6, 2, 14]', expectedOutput: '[2, 6, 10, 14]' }
          ],
          points: 15
        },
        {
          id: '3',
          type: 'coding',
          title: 'String Reversal',
          description: 'Implement a function that reverses a string without using the built-in reverse() method.',
          starterCode: 'function reverseString(str) {\n  // Your code here\n  \n}',
          testCases: [
            { input: '"hello"', expectedOutput: '"olleh"' },
            { input: '"JavaScript"', expectedOutput: '"tpircSavaJ"' },
            { input: '""', expectedOutput: '""' }
          ],
          points: 10
        }
      ]
    };

    setExamSession(mockExamSession);
    setCode(mockExamSession.questions[0].starterCode || '');
  }, [examId]);

  useEffect(() => {
    if (!examSession) return;

    timerRef.current = setInterval(() => {
      setExamSession(prev => {
        if (!prev || prev.timeRemaining <= 0) {
          handleSubmitExam();
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examSession]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuestionChange = (index: number) => {
    if (!examSession) return;
    
    // Save current answer
    const currentQuestion = examSession.questions[examSession.currentQuestionIndex];
    if (currentQuestion.type === 'coding') {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: code }));
    }

    // Load new question
    const newQuestion = examSession.questions[index];
    setExamSession(prev => prev ? { ...prev, currentQuestionIndex: index } : null);
    setCode(answers[newQuestion.id] || newQuestion.starterCode || '');
    setOutput('');
  };

  const handleMCQAnswer = (questionId: string, selectedOption: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  const runCode = async () => {
    setIsRunning(true);
    try {
      // Simulate code execution
      setTimeout(() => {
        setOutput('Code executed successfully!\nTest case 1: Passed\nTest case 2: Passed\nTest case 3: Failed');
        setIsRunning(false);
      }, 2000);
    } catch (error) {
      setOutput('Error: ' + error);
      setIsRunning(false);
    }
  };

  const handleSubmitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Save final answers and redirect
    console.log('Final answers:', answers);
    router.push('/dashboard');
  };

  if (!examSession) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  const currentQuestion = examSession.questions[examSession.currentQuestionIndex];
  const progress = ((examSession.currentQuestionIndex + 1) / examSession.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{examSession.title}</h1>
            <div className="flex items-center mt-2">
              <div className="w-64 bg-gray-700 rounded-full h-2 mr-4">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-400">
                Question {examSession.currentQuestionIndex + 1} of {examSession.questions.length}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className={`flex items-center px-4 py-2 rounded-lg ${
              examSession.timeRemaining < 600 ? 'bg-red-900 text-red-200' : 'bg-gray-700'
            }`}>
              <ClockIcon className="h-5 w-5 mr-2" />
              <span className="font-mono text-lg">{formatTime(examSession.timeRemaining)}</span>
            </div>
            
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Question Navigation Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Questions</h3>
          <div className="space-y-2">
            {examSession.questions.map((question, index) => {
              const isAnswered = answers[question.id] !== undefined;
              const isCurrent = index === examSession.currentQuestionIndex;
              
              return (
                <button
                  key={question.id}
                  onClick={() => handleQuestionChange(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isCurrent 
                      ? 'bg-indigo-600 text-white' 
                      : isAnswered 
                        ? 'bg-green-800 text-green-200' 
                        : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Q{index + 1}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs">{question.points}pts</span>
                      {isAnswered && <CheckCircleIcon className="h-4 w-4" />}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 truncate">
                    {question.title}
                  </div>
                  <div className="text-xs mt-1">
                    <span className={`px-2 py-1 rounded ${
                      question.type === 'coding' ? 'bg-blue-900 text-blue-200' : 'bg-purple-900 text-purple-200'
                    }`}>
                      {question.type.toUpperCase()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Question Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{currentQuestion.title}</h2>
                  <span className="text-lg font-medium text-indigo-400">
                    {currentQuestion.points} points
                  </span>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-300">
                    {currentQuestion.description}
                  </pre>
                </div>
              </div>

              {/* MCQ Options */}
              {currentQuestion.type === 'mcq' && currentQuestion.options && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Select your answer:</h3>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <label key={index} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={(e) => handleMCQAnswer(currentQuestion.id, e.target.value)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-3 text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Editor */}
              {currentQuestion.type === 'coding' && (
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-700">
                      <h3 className="text-lg font-semibold">Code Editor</h3>
                      <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded text-sm font-medium transition-colors"
                      >
                        {isRunning ? (
                          <>
                            <PauseIcon className="h-4 w-4 mr-2" />
                            Running...
                          </>
                        ) : (
                          <>
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Run Code
                          </>
                        )}
                      </button>
                    </div>
                    
                    <Editor
                      height="400px"
                      defaultLanguage="javascript"
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on'
                      }}
                    />
                  </div>

                  {/* Output */}
                  {output && (
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-lg font-semibold mb-3">Output</h4>
                      <pre className="bg-gray-900 p-4 rounded text-green-400 font-mono text-sm whitespace-pre-wrap">
                        {output}
                      </pre>
                    </div>
                  )}

                  {/* Test Cases */}
                  {currentQuestion.testCases && (
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4">Test Cases</h4>
                      <div className="space-y-4">
                        {currentQuestion.testCases.map((testCase, index) => (
                          <div key={index} className="bg-gray-700 rounded p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-gray-400 mb-1">Input:</div>
                                <code className="text-yellow-400">{testCase.input}</code>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400 mb-1">Expected Output:</div>
                                <code className="text-green-400">{testCase.expectedOutput}</code>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3" />
              <h3 className="text-lg font-semibold">Submit Exam</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to submit your exam? You won't be able to make changes after submission.
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitExam}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}