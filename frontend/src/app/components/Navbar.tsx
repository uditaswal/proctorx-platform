'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Login', href: '/login' },
  { label: 'Register', href: '/register' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Exam Demo', href: '/exam/123' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 text-white px-4 py-3 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wide">ProctorX</h1>
        <div className="space-x-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span
                className={`px-3 py-1 rounded transition ${
                  pathname === item.href ? 'bg-indigo-500' : 'hover:bg-gray-700'
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
