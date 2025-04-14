// hooks/useRoleRequests.ts
import { useState, useEffect } from 'react';

export function useRoleRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  
  const refreshRequests = () => {
    const stored = localStorage.getItem('foodChainRoleRequests');
    setRequests(stored ? JSON.parse(stored) : []);
  };

  useEffect(() => {
    refreshRequests();
    
    const handleStorageChange = () => {
      refreshRequests();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { requests, refreshRequests };
}