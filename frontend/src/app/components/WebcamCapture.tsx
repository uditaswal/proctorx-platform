'use client';

import React, { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';

interface Props {
  token: string; // JWT token from Supabase login
}

const WebcamCapture: React.FC<Props> = ({ token }) => {
  const webcamRef = useRef<Webcam>(null);

  const captureSnapshot = async () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        await fetch('/api/proctor/snapshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ imageBase64: screenshot })
        });
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(captureSnapshot, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden"> {/* Hide webcam from screen */}
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        width={320}
        height={240}
        videoConstraints={{ facingMode: "user" }}
      />
    </div>
  );
};

export default WebcamCapture;
