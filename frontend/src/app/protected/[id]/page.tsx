// File: frontend/src/app/exam/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CodeEditor from '../../components/CodeEditor';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ExamPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { id } = useParams(); // exam ID from URL

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch token on mount
  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.push('/login');
        return;
      }
      setToken(data.session.access_token);
      setLoading(false);
    };

    fetchSession();
  }, [supabase, router]);

  if (loading) return <div className="p-4">Loading exam...</div>;

  if (!token) return <div className="p-4 text-red-600">Not authenticated</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Coding Exam - ID: {id}</h1>

      {/* You can render MCQ or exam metadata here */}

      <CodeEditor token={token} />
    </div>
  );
}
