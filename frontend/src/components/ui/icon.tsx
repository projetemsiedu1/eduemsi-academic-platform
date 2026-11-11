import type { ReactNode, SVGProps } from 'react';

type IconName = 'arrow' | 'eye' | 'eye-off' | 'lock' | 'calendar' | 'attendance' | 'jury' | 'alert' | 'logout' | 'check';

const paths: Record<IconName, ReactNode> = {
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  'eye-off': <><path d="m3 3 18 18M10.6 5.1 12 5c6.5 0 10 7 10 7a19 19 0 0 1-3 3.9M6.2 6.2A20 20 0 0 0 2 12s3.5 7 10 7a13 13 0 0 0 5.8-1.8M10 10a3 3 0 0 0 4 4" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 11h18m-13 5 2 2 5-5" /></>,
  attendance: <><circle cx="9" cy="7" r="4" /><path d="M2 21v-2a7 7 0 0 1 11-5m2 3 2 2 5-6" /></>,
  jury: <><path d="m2 8 10-5 10 5-10 5-10-5Zm4 3v6c4 3 8 3 12 0v-6m4-3v8" /></>,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 4h.01" /></>,
  logout: <><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4m5-13 5 5-5 5m-6-5h13" /></>,
  check: <path d="m5 12 4 4L19 6" />,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
