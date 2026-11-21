"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Users,
  GraduationCap,
  Sliders,
  X,
  LogOut,
  ArrowLeft,
  BookOpen,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { useTimetable } from "@/context/TimetableContext";
export function TimetableSidebar({
  onCloseMobile,
}: {
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname(),
    router = useRouter();
  const { verificationReport } = useTimetable();
  const links = [
    { href: "/timetable", label: "Vue d’ensemble", icon: LayoutDashboard },
    {
      href: "/timetable/resources",
      label: "Ressources académiques",
      icon: Layers,
    },
    { href: "/timetable/groups", label: "Planning des groupes", icon: Users },
    {
      href: "/timetable/teachers",
      label: "Planning des enseignants",
      icon: GraduationCap,
    },
    {
      href: "/timetable/constraints",
      label: "Planifier les cours",
      icon: Sliders,
    },
    {
      href: "/timetable/exams",
      label: "Planning des examens",
      icon: BookOpen,
    },
    {
      href: "/timetable/student",
      label: "Espace Étudiant",
      icon: UserCheck,
    },
    {
      href: "/timetable/teacher",
      label: "Espace Enseignant",
      icon: ShieldCheck,
    },
  ];
  return (
    <aside className="planning-sidebar">
      <div className="planning-brand">
        <Image
          src="/brand/univora-horizontal.png"
          alt="Univora"
          width={230}
          height={62}
          priority
        />
        {onCloseMobile && (
          <button onClick={onCloseMobile} aria-label="Fermer la navigation">
            <X size={20} />
          </button>
        )}
      </div>
      <p className="planning-workspace-name">Responsable planning</p>
      <nav aria-label="Planification">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onCloseMobile}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            <link.icon size={18} />
            <span>{link.label}</span>
            {link.href.endsWith("/constraints") &&
              verificationReport.conflits.length > 0 && (
                <span className="planning-count">
                  {verificationReport.conflits.length}
                </span>
              )}
          </Link>
        ))}
      </nav>
      <div className="planning-sidebar-bottom">
        <p>
          {verificationReport.totalSeancesVerifiees} séances ·{" "}
          {verificationReport.conflits.length} anomalies détectées
        </p>
        <Link href="/dashboard">
          <ArrowLeft size={16} />
          Mon espace
        </Link>
        <button
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
