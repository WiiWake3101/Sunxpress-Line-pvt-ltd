"use client";
import { useEffect, useState } from 'react';
import LoadingScreen from './LoadingScreen';

export default function InitialLoader({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div className={isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100 transition-opacity duration-300'}>
        {children}
      </div>
    </>
  );
}
