'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import CodeEditor from '../../components/CodeEditor';
import WebcamCapture from '../../components/WebcamCapture';
import TabMonitor from '../../components/TabMonitor';

export default function ExamPage() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClientComponentClient();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login');
        return;
      }

      setToken(data.session.access_token);
      setLoading(false);
    };

    fetchSession();
  }, [router, supabase]);

  if (loading) return <div className="p-6 text-white">Loading exam...</div>;
  if (!token) return <div className="p-6 text-red-600">Not authenticated</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">🧪 Exam ID: {id}</h1>

      <WebcamCapture token={token} />
      <TabMonitor token={token} />
      <CodeEditor token={token} />
    </div>
  );
}
