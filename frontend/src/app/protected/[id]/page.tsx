// frontend/src/app/exam/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CodeBracketIcon,
  EyeIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

interface ExamDetails {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  allowedLanguages: string[];
  instructions: string[];
  proctoring: {
    webcamRequired: boolean;
    screenRecording: boolean;
    tabSwitchingAllowed: boolean;
    copyPasteAllowed: boolean;
  };
}

export default function ExamDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [webcamPermission, setWebcamPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  useEffect(() => {
    // Simulate API call to fetch exam details
    setTimeout(() => {
      setExam({
        id: id as string,
        title: 'JavaScript Advanced Concepts',
        description: 'This exam tests your knowledge of advanced JavaScript concepts including closures, promises, async/await, and ES6+ features.',
        duration: 120,
        totalQuestions: 15,
        passingScore: 70,
        allowedLanguages: ['JavaScript', 'TypeScript', 'Python', 'Java'],
        instructions: [
          'Ensure you have a stable internet connection throughout the exam',
          'Keep your webcam on and face visible at all times',
          'Do not switch tabs or applications during the exam',
          'Read each question carefully before answering',
          'You can use the built-in code editor to test your solutions',
          'Submit your answers before the time limit expires',
          'Contact support immediately if you encounter technical issues'
        ],
        proctoring: {
          webcamRequired: true,
          screenRecording: true,
          tabSwitchingAllowed: false,
          copyPasteAllowed: false,
        }
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const requestWebcamPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setWebcamPermission('granted');
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setWebcamPermission('denied');
    }
  };

  const startExam = () => {
    if (webcamPermission !== 'granted' || !agreedToTerms) {
      return;
    }
    router.push(`/exam/start?id=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Exam Not Found</h1>
          <button 
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{exam.title}</h1>
            <p className="text-gray-600 text-lg mb-6">{exam.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <ClockIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{exam.duration}</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CodeBracketIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{exam.totalQuestions}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{exam.passingScore}%</div>
                <div className="text-sm text-gray-600">Pass Score</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <ComputerDesktopIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{exam.allowedLanguages.length}</div>
                <div className="text-sm text-gray-600">Languages</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Instructions */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Exam Instructions</h2>
              </div>
              <div className="px-6 py-4">
                <ul className="space-y-3">
                  {exam.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Allowed Languages */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Allowed Programming Languages</h2>
              </div>
              <div className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {exam.allowedLanguages.map((language) => (
                    <span 
                      key={language}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Proctoring Requirements */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Proctoring Requirements
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Webcam Required</span>
                  <span className={`text-sm font-medium ${exam.proctoring.webcamRequired ? 'text-red-600' : 'text-green-600'}`}>
                    {exam.proctoring.webcamRequired ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Screen Recording</span>
                  <span className={`text-sm font-medium ${exam.proctoring.screenRecording ? 'text-red-600' : 'text-green-600'}`}>
                    {exam.proctoring.screenRecording ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tab Switching</span>
                  <span className={`text-sm font-medium ${!exam.proctoring.tabSwitchingAllowed ? 'text-red-600' : 'text-green-600'}`}>
                    {exam.proctoring.tabSwitchingAllowed ? 'Allowed' : 'Blocked'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Copy/Paste</span>
                  <span className={`text-sm font-medium ${!exam.proctoring.copyPasteAllowed ? 'text-red-600' : 'text-green-600'}`}>
                    {exam.proctoring.copyPasteAllowed ? 'Allowed' : 'Blocked'}
                  </span>
                </div>
              </div>
            </div>

            {/* System Check */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">System Check</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                {webcamPermission === 'pending' && (
                  <button
                    onClick={requestWebcamPermission}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Test Webcam Access
                  </button>
                )}
                
                {webcamPermission === 'granted' && (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm">Webcam access granted</span>
                  </div>
                )}
                
                {webcamPermission === 'denied' && (
                  <div className="flex items-center text-red-600">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm">Webcam access denied</span>
                  </div>
                )}
              </div>
            </div>

            {/* Start Exam */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4">
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I agree to the exam terms and conditions
                    </span>
                  </label>
                </div>
                
                <button
                  onClick={startExam}
                  disabled={!agreedToTerms || webcamPermission !== 'granted'}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    agreedToTerms && webcamPermission === 'granted'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Start Exam
                </button>
                
                {(!agreedToTerms || webcamPermission !== 'granted') && (
                  <div className="mt-3 text-xs text-gray-500">
                    {!agreedToTerms && 'Please agree to terms. '}
                    {webcamPermission !== 'granted' && 'Webcam access required.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}