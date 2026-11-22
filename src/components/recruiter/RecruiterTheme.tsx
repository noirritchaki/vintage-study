'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';
import { useRecruiterMode } from '@/lib/recruiterMode';

/** Recruiter mode inverts the home page, about page and case studies (dark page, light text). */
export function RecruiterTheme() {
  const recruiter = useRecruiterMode();
  const pathname = usePathname();
  const dark = recruiter && (pathname === '/' || pathname === '/about' || pathname.startsWith('/work'));
  useLayoutEffect(() => {
    document.documentElement.toggleAttribute('data-recruiter', dark);
  }, [dark]);
  return null;
}
