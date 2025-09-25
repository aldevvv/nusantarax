'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '@/lib/api';

interface SessionCountdownOptions {
  onSessionExpired?: () => void;
}

interface SessionCountdownReturn {
  timeRemaining: number; // in seconds
  isExpired: boolean;
  formattedTime: string;
  resetSession: () => void;
}

export const useSessionCountdown = (
  options: SessionCountdownOptions = {}
): SessionCountdownReturn => {
  const { onSessionExpired } = options;

  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [sessionExp, setSessionExp] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onSessionExpiredRef = useRef(onSessionExpired);

  // Update the ref when callback changes
  useEffect(() => {
    onSessionExpiredRef.current = onSessionExpired;
  }, [onSessionExpired]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get session information from backend
  const fetchSessionInfo = useCallback(async (): Promise<{
    expiresAt: number;
    remainingSeconds: number;
    isExpired: boolean;
  } | null> => {
    try {
      const response = await authAPI.getSession();
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch session info:', error);
      return null;
    }
  }, []);

  const resetSession = useCallback(async () => {
    const sessionInfo = await fetchSessionInfo();
    if (sessionInfo) {
      setSessionExp(sessionInfo.expiresAt);
      setTimeRemaining(sessionInfo.remainingSeconds);
      setIsExpired(sessionInfo.isExpired);
    } else {
      // No valid session
      setSessionExp(null);
      setTimeRemaining(0);
      setIsExpired(true);
    }
  }, [fetchSessionInfo]);

  // Update countdown based on server-provided expiration time
  const updateCountdown = useCallback(() => {
    if (!sessionExp) return;

    const now = Date.now();
    const remaining = Math.max(0, Math.floor((sessionExp - now) / 1000));
    
    setTimeRemaining(remaining);
    
    if (remaining <= 0 && !isExpired) {
      setIsExpired(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (onSessionExpiredRef.current) {
        onSessionExpiredRef.current();
      }
    }
  }, [sessionExp, isExpired]);

  // Initialize and start countdown
  useEffect(() => {
    // Get initial session information
    resetSession();

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Update every second
    intervalRef.current = setInterval(updateCountdown, 1000);

    // Also refresh session info every 30 seconds to sync with server
    const sessionSyncInterval = setInterval(async () => {
      const sessionInfo = await fetchSessionInfo();
      if (sessionInfo && sessionInfo.expiresAt !== sessionExp) {
        setSessionExp(sessionInfo.expiresAt);
      }
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearInterval(sessionSyncInterval);
    };
  }, [resetSession, updateCountdown, fetchSessionInfo, sessionExp]);

  // Check for session changes when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      resetSession();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [resetSession]);

  return {
    timeRemaining,
    isExpired,
    formattedTime: formatTime(timeRemaining),
    resetSession,
  };
};