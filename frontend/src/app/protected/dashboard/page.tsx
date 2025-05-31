'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/utils/supabaseClient';

interface Exam {
  id: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/exams/list`, {
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

  if (loading) {
    return <div className="text-center mt-20">Loading exams...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Available Exams</h1>
      {exams.length === 0 ? (
        <p>No exams available.</p>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam.id} className="p-4 border rounded-xl shadow bg-white">
              <h2 className="text-lg font-semibold">{exam.title}</h2>
              {exam.description && <p className="text-gray-600">{exam.description}</p>}
              <button
                onClick={() => router.push(`/exam/${exam.id}`)}
                className="mt-2 inline-block px-4 py-1 bg-blue-500 text-white rounded"
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
