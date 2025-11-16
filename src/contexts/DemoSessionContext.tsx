"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { checkActiveDemoSession, getSessionInfo } from "@/lib/utils/demo-session";

interface DemoSessionContextType {
  hasActiveSession: boolean;
  activeDemoType: string | null;
  startSession: (demoType: string) => void;
  endSession: () => void;
  checkForActiveSession: () => Promise<void>;
}

const DemoSessionContext = createContext<DemoSessionContextType | undefined>(undefined);

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [activeDemoType, setActiveDemoType] = useState<string | null>(null);

  // Check for active session on mount
  useEffect(() => {
    checkForActiveSession();
  }, []);

  const checkForActiveSession = async () => {
    try {
      // Since all demos use the same agent, we only need to check if ANY active session exists
      // We'll check the most recent active session across all demo types
      const { sessionId, deviceId } = getSessionInfo();

      const response = await fetch('/api/demo/session/check-any', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (data.success && data.data?.status === 'active') {
        console.log('[DemoSessionContext] Found active session', data.data);
        setHasActiveSession(true);
        setActiveDemoType(data.data.demoType);
      } else {
        setHasActiveSession(false);
        setActiveDemoType(null);
      }
    } catch (error) {
      console.error('[DemoSessionContext] Error checking for active session:', error);
      setHasActiveSession(false);
      setActiveDemoType(null);
    }
  };

  const startSession = (demoType: string) => {
    console.log('[DemoSessionContext] Starting session', { demoType });
    setHasActiveSession(true);
    setActiveDemoType(demoType);
  };

  const endSession = () => {
    console.log('[DemoSessionContext] Ending session');
    setHasActiveSession(false);
    setActiveDemoType(null);
  };

  return (
    <DemoSessionContext.Provider
      value={{
        hasActiveSession,
        activeDemoType,
        startSession,
        endSession,
        checkForActiveSession,
      }}
    >
      {children}
    </DemoSessionContext.Provider>
  );
}

export function useDemoSession() {
  const context = useContext(DemoSessionContext);
  if (context === undefined) {
    throw new Error("useDemoSession must be used within a DemoSessionProvider");
  }
  return context;
}
