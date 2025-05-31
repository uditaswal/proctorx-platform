import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '../components/Navbar'; // ✅ Import global navbar

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  return (
    <>
      <Navbar />
      <main className="p-4">{children}</main>
    </>
  );
}
