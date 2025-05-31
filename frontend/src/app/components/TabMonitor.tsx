'use client';

import { useEffect } from 'react';

interface Props {
  token: string;
}

const TabMonitor: React.FC<Props> = ({ token }) => {
  const logActivity = async (type: string) => {
    await fetch('/api/proctor/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type,
        timestamp: new Date().toISOString()
      })
    });
  };

  useEffect(() => {
    const handleBlur = () => logActivity('blur');
    const handleVisibility = () => {
      if (document.hidden) logActivity('tab-switch');
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return null;
};

export default TabMonitor;
