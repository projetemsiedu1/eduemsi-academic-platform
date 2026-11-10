import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-zinc-950 text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-white">
      <main className="max-w-3xl w-full text-center space-y-8 bg-white/5 backdrop-blur-xl p-10 rounded-2xl border border-emerald-500/20 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Next.js 16 + TypeScript Initialisé
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
          EMSI Univora Academic Platform
        </h1>

        <p className="text-slate-300 text-lg leading-relaxed max-w-xl mx-auto">
          Frontend moderne sous Next.js (App Router & TypeScript) connecté à l&apos;architecture Spring Boot 3, sécurité JWT RBAC et optimisation OR-Tools CP-SAT.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors">
            <h3 className="font-semibold text-emerald-400 mb-1">Architecture</h3>
            <p className="text-sm text-slate-400">Next.js App Router, React 19, TypeScript 5, Tailwind CSS.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors">
            <h3 className="font-semibold text-emerald-400 mb-1">Backend REST</h3>
            <p className="text-sm text-slate-400">Spring Boot 3.3.4, Java 21, MySQL 8.4, Flyway migrations.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors">
            <h3 className="font-semibold text-emerald-400 mb-1">Sécurité & IA</h3>
            <p className="text-sm text-slate-400">JWT HMAC-SHA512, OR-Tools CP-SAT et LLM OpenRouter.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          <a
            href="http://localhost:8085/swagger-ui.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/30 transition-all hover:scale-105"
          >
            Explorer Swagger UI (Port 8085)
          </a>
          <Link
            href="/api/health"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-all"
          >
            Statut du Système
          </Link>
        </div>
      </main>

      <footer className="mt-8 text-xs text-slate-500">
        École Marocaine des Sciences de l&apos;Ingénieur © 2026 — Plateforme Académique Univora
      </footer>
    </div>
  );
}
