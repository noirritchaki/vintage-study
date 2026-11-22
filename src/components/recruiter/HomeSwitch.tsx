'use client';

import { useEffect, type ReactNode } from 'react';
import { syncRecruiterParam, useRecruiterMode } from '@/lib/recruiterMode';
import { RecruiterView } from './RecruiterView';

/** The home page: the playful cassette shelf, or the plain recruiter summary. */
export function HomeSwitch({ children }: { children: ReactNode }) {
  const recruiter = useRecruiterMode();
  useEffect(() => {
    syncRecruiterParam();
  }, []);
  return recruiter ? <RecruiterView /> : <>{children}</>;
}
