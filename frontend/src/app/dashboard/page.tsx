import type { Metadata } from 'next';
import { DashboardSession } from '@/components/auth/dashboard-session';

export const metadata: Metadata = { title: 'Tableau de bord', robots: { index: false, follow: false } };

export default function DashboardPage() {
  return <DashboardSession />;
}
