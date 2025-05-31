'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Exam {
  id: string;
  title: string;
  description?: string;
}

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const token = session.access_token;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/exams/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setExams(data);
      setLoading(false);
    };

    fetchExams();
  }, [router, supabase]);

  if (loading) return <div className="text-center text-white mt-20">Loading exams...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">📋 Available Exams</h1>

      {exams.length === 0 ? (
        <p>No exams found.</p>
      ) : (
        <div className="grid gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="p-5 bg-slate-700 rounded-xl shadow">
              <h2 className="text-xl font-semibold">{exam.title}</h2>
              {exam.description && <p className="text-gray-400">{exam.description}</p>}
              <button
                onClick={() => router.push(`/exam/${exam.id}`)}
                className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
              >
                Start Exam
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
