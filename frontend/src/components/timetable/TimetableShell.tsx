"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiClient, ApiError } from "@/lib/api-client";
import type { AcademicUser } from "@/lib/auth";
import { TimetableProvider, useTimetable } from "@/context/TimetableContext";
import { TimetableSidebar } from "./TimetableSidebar";

export function TimetableShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [access, setAccess] = useState<
    "loading" | "granted" | "denied" | "error"
  >("loading");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    if (!ApiClient.getToken()) {
      router.replace("/login");
      return;
    }
    ApiClient.get<AcademicUser>("/auth/me")
      .then((user) => {
        if (active)
          setAccess(
            ["ROLE_SUPER_ADMIN", "ROLE_RESPONSABLE_PLANNING"].includes(
              user.role,
            )
              ? "granted"
              : "denied",
          );
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          ApiClient.clearToken();
          router.replace("/login");
        } else setAccess("error");
      });
    return () => {
      active = false;
    };
  }, [router, retry]);
  if (access === "loading")
    return (
      <main className="planning-access" role="status">
        Vérification de votre accès…
      </main>
    );
  if (access === "denied")
    return (
      <main className="planning-access">
        <h1>Accès réservé à la planification</h1>
        <p>
          Ce module est accessible aux responsables planning et aux
          administrateurs.
        </p>
        <Link href="/dashboard">Retour à mon espace</Link>
      </main>
    );
  if (access === "error")
    return (
      <main className="planning-access">
        <h1>Connexion au serveur indisponible</h1>
        <p>Votre session n’a pas pu être vérifiée.</p>
        <button onClick={() => setRetry((value) => value + 1)}>
          Réessayer
        </button>
        <Link href="/login">Retour à la connexion</Link>
      </main>
    );
  return (
    <TimetableProvider>
      <Workspace>{children}</Workspace>
    </TimetableProvider>
  );
}

function Workspace({ children }: { children: ReactNode }) {
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    mode,
    switchMode,
    loading,
    error,
    notice,
    reload,
    busy,
  } = useTimetable();
  const menu = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (mobileMenuOpen && !menu.current?.open) menu.current?.showModal();
    if (!mobileMenuOpen && menu.current?.open) menu.current.close();
  }, [mobileMenuOpen]);
  return (
    <div className="planning-app">
      <a className="skip-link" href="#planning-main">
        Aller au contenu de planification
      </a>
      <div className="planning-desktop-nav">
        <TimetableSidebar />
      </div>
      <dialog
        ref={menu}
        className="planning-mobile-dialog"
        aria-label="Navigation de planification"
        onCancel={() => setMobileMenuOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setMobileMenuOpen(false);
        }}
      >
        <TimetableSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
      </dialog>
      <div className="planning-main" id="planning-main">
        <div
          className={`planning-data-source ${mode === "demo" ? "planning-demo" : ""}`}
        >
          <span>
            {mode === "demo"
              ? "Démonstration — données fictives, modifications temporaires"
              : "Données partagées du serveur"}
          </span>
          <button
            disabled={busy || loading}
            onClick={() => switchMode(mode === "live" ? "demo" : "live")}
          >
            {mode === "live"
              ? "Explorer la démonstration"
              : "Revenir aux données réelles"}
          </button>
        </div>
        {error && (
          <div className="planning-feedback error" role="alert">
            {error}
            {mode === "live" && (
              <button disabled={busy} onClick={() => void reload()}>
                Réessayer
              </button>
            )}
          </div>
        )}
        {notice && (
          <div className="planning-feedback" role="status">
            {notice}
          </div>
        )}
        {loading && (
          <div className="planning-loading" role="status">
            Chargement des ressources académiques…
          </div>
        )}
        <div hidden={loading}>{children}</div>
      </div>
    </div>
  );
}
