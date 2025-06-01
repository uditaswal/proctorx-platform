// frontend/src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon,
  EyeIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalExams: number;
  totalStudents: number;
  activeExams: number;
  completedAttempts: number;
}

interface RecentExam {
  id: string;
  title: string;
  studentsEnrolled: number;
  duration: number;
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    totalStudents: 0,
    activeExams: 0,
    completedAttempts: 0,
  });

  const [recentExams, setRecentExams] = useState<RecentExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with dummy data
    setTimeout(() => {
      setStats({
        totalExams: 24,
        totalStudents: 156,
        activeExams: 3,
        completedAttempts: 89,
      });

      setRecentExams([
        {
          id: '1',
          title: 'JavaScript Fundamentals',
          studentsEnrolled: 45,
          duration: 120,
          createdAt: '2024-01-15',
          status: 'active',
        },
        {
          id: '2',
          title: 'React Advanced Concepts',
          studentsEnrolled: 32,
          duration: 180,
          createdAt: '2024-01-14',
          status: 'active',
        },
        {
          id: '3',
          title: 'Python Data Structures',
          studentsEnrolled: 67,
          duration: 150,
          createdAt: '2024-01-13',
          status: 'completed',
        },
        {
          id: '4',
          title: 'SQL Query Optimization',
          studentsEnrolled: 28,
          duration: 90,
          createdAt: '2024-01-12',
          status: 'draft',
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: 'Total Exams',
      value: stats.totalExams,
      icon: AcademicCapIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'Active Exams',
      value: stats.activeExams,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
    },
    {
      title: 'Completed Attempts',
      value: stats.completedAttempts,
      icon: CheckCircleIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800',
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your exams and student progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className={`${card.bgColor} rounded-lg p-6`}>
            <div className="flex items-center">
              <div className={`${card.color} rounded-md p-3`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Exams */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Exams</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {exam.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {exam.studentsEnrolled} enrolled
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {exam.duration} minutes
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(exam.status)}>
                      {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(exam.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                    {exam.status === 'draft' && (
                      <button className="text-green-600 hover:text-green-900 inline-flex items-center">
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Start
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
              Create New Exam
            </button>
            <button className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              Import Students
            </button>
            <button className="w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              View Reports
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">Proctoring Service: Online</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">Code Execution: Online</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-yellow-400 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">Database: High Load</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>Student John submitted React exam</div>
            <div>New exam "Python Basics" created</div>
            <div>Proctoring alert: Suspicious activity</div>
            <div>Exam "SQL Advanced" completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}