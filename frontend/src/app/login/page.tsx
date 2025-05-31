'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/utils/supabaseClient';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">🔐 Login to ProctorX</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring focus:border-indigo-500"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring focus:border-indigo-500"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-medium"
          onClick={handleLogin}
        >
          Sign In
        </button>
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
}
