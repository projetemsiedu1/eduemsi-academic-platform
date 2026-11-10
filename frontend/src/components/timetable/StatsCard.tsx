'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'emerald' | 'blue' | 'purple' | 'amber' | 'slate';
  badge?: string;
  href?: string;
}

const variantStyles = {
  emerald: {
    bg: 'bg-emerald-50/70',
    border: 'border-emerald-200/80',
    text: 'text-emerald-950',
    iconBg: 'bg-emerald-600',
    iconText: 'text-white',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  blue: {
    bg: 'bg-blue-50/70',
    border: 'border-blue-200/80',
    text: 'text-blue-950',
    iconBg: 'bg-blue-600',
    iconText: 'text-white',
    badge: 'bg-blue-100 text-blue-800',
  },
  purple: {
    bg: 'bg-purple-50/70',
    border: 'border-purple-200/80',
    text: 'text-purple-950',
    iconBg: 'bg-purple-600',
    iconText: 'text-white',
    badge: 'bg-purple-100 text-purple-800',
  },
  amber: {
    bg: 'bg-amber-50/70',
    border: 'border-amber-200/80',
    text: 'text-amber-950',
    iconBg: 'bg-amber-600',
    iconText: 'text-white',
    badge: 'bg-amber-100 text-amber-800',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-900',
    iconBg: 'bg-slate-800',
    iconText: 'text-white',
    badge: 'bg-slate-200 text-slate-800',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'emerald',
  badge,
  href,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  const content = (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-200 ${styles.bg} ${styles.border} ${
        href ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs ${styles.iconBg} ${styles.iconText}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-2xl font-black tracking-tight ${styles.text}`}>{value}</span>
              {badge && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${styles.badge}`}>
                  {badge}
                </span>
              )}
            </div>
          </div>
        </div>
        {href && (
          <div className="w-6 h-6 rounded-lg bg-white/70 border border-slate-200/70 flex items-center justify-center text-slate-400 group-hover:text-slate-700">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-600 mt-3 pt-2 border-t border-slate-200/60">{subtitle}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block group">
        {content}
      </Link>
    );
  }

  return content;
}
