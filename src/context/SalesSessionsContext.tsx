'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type SalesSessionStatus =
  | 'open'
  | 'closed';

export type SalesSession = {
  id: number;
  openedAt: string;
  closedAt: string | null;
  status: SalesSessionStatus;
};

type SalesSessionsContextType = {
  sessions: SalesSession[];
  activeSession: SalesSession | null;
  startSession: () => SalesSession;
  closeSession: () => void;
};

const SalesSessionsContext =
  createContext<
    SalesSessionsContextType | undefined
  >(undefined);

export function SalesSessionsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    sessions,
    setSessions,
  ] = useState<SalesSession[]>([]);

  const activeSession =
    useMemo(() => {
      return (
        sessions.find(
          (session) =>
            session.status === 'open'
        ) ?? null
      );
    }, [sessions]);

  const startSession = () => {
    if (activeSession) {
      return activeSession;
    }

    const newSession: SalesSession = {
      id: Date.now(),
      openedAt:
        new Date().toISOString(),
      closedAt: null,
      status: 'open',
    };

    setSessions(
      (currentSessions) => [
        newSession,
        ...currentSessions,
      ]
    );

    return newSession;
  };

  const closeSession = () => {
    if (!activeSession) {
      return;
    }

    const closedAt =
      new Date().toISOString();

    setSessions(
      (currentSessions) =>
        currentSessions.map(
          (session) =>
            session.id ===
            activeSession.id
              ? {
                  ...session,
                  closedAt,
                  status: 'closed',
                }
              : session
        )
    );
  };

  return (
    <SalesSessionsContext.Provider
      value={{
        sessions,
        activeSession,
        startSession,
        closeSession,
      }}
    >
      {children}
    </SalesSessionsContext.Provider>
  );
}

export function useSalesSessions() {
  const context =
    useContext(
      SalesSessionsContext
    );

  if (!context) {
    throw new Error(
      'useSalesSessions must be used inside SalesSessionsProvider'
    );
  }

  return context;
}