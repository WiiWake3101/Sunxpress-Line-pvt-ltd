"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingScreen from './LoadingScreen';

export default function PageTransitionLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;
  return <LoadingScreen />;
}
