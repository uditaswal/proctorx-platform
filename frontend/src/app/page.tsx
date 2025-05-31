'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="text-center max-w-lg px-6">
        <h1 className="text-4xl font-extrabold mb-4 text-indigo-400 tracking-tight">
          🎓 Welcome to ProctorX
        </h1>
        <p className="text-gray-300 mb-8">
          A smart, secure, cloud-based platform for coding exams, MCQs, and real-time proctoring.
        </p>

        <div className="grid gap-4">
          <Link href="/login">
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg">
              🔐 Login
            </button>
          </Link>
          <Link href="/register">
            <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg">
              📝 Register
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-lg">
              📋 Dashboard
            </button>
          </Link>
          <Link href="/exam/123">
            <button className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-lg">
              🧪 Demo Exam
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
