import Link from 'next/link'

type Role = 'admin' | 'instructor' | 'student'

const roleLinks: Record<Role, { label: string, href: string }[]> = {
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Manage Users', href: '/admin/users' }
  ],
  instructor: [
    { label: 'My Courses', href: '/instructor/courses' },
    { label: 'Add Course', href: '/instructor/new' }
  ],
  student: [
    { label: 'My Exams', href: '/student/exams' },
    { label: 'Profile', href: '/student/profile' }
  ]
}

export default function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="w-64 h-screen bg-gray-100 p-4 space-y-2">
      {roleLinks[role].map(link => (
        <Link key={link.href} href={link.href} className="block p-2 hover:bg-gray-200 rounded">
          {link.label}
        </Link>
      ))}
    </aside>
  )
}
