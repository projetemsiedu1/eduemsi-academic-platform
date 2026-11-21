"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, RefreshCw, LogOut } from "lucide-react";
import { useTimetable } from "@/context/TimetableContext";
import { logout } from "@/lib/auth";

export function TimetableHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const { verificationReport, setMobileMenuOpen, mode, reload, busy } =
    useTimetable();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

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
        <button
          onClick={handleLogout}
          className="logout-header-button"
          aria-label="Se déconnecter"
          title="Se déconnecter et vider la session"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #fca5a5",
            borderRadius: "0.5rem",
            padding: "0.45rem 0.75rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
