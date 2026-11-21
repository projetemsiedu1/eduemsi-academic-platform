"use client";
import Link from "next/link";
import { Menu, RefreshCw } from "lucide-react";
import { useTimetable } from "@/context/TimetableContext";
export function TimetableHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { verificationReport, setMobileMenuOpen, mode, reload, busy } =
    useTimetable();
  return (
    <header className="planning-header">
      <div className="planning-header-title">
        <button
          className="planning-menu-button"
          aria-label="Ouvrir la navigation"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={22} />
        </button>
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="planning-header-actions">
        <Link href="/timetable/constraints">
          {verificationReport.conflits.length} anomalies
        </Link>
        {mode === "live" && (
          <button
            disabled={busy}
            onClick={() => void reload()}
            aria-label="Actualiser les données"
          >
            <RefreshCw size={17} />
            <span>Actualiser</span>
          </button>
        )}
      </div>
    </header>
  );
}
