"use client";

import { useEffect, useState } from "react";
import { TimetableHeader } from "@/components/timetable/TimetableHeader";
import { ApiClient } from "@/lib/api-client";
import type { ConvocationEtudiant } from "@/types/exams";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

interface AbsenceItem {
  moduleCode: string;
  moduleNom: string;
  totalHeures: number;
  heuresAbsence: number;
  nombreSeances: number;
}

export function StudentPortalView() {
  const [convocations, setConvocations] = useState<ConvocationEtudiant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"CONVOCATIONS" | "PLANNING" | "ABSENCES">("CONVOCATIONS");

  const [absences] = useState<AbsenceItem[]>([
    {
      moduleCode: "DEV-JAVA-JEE",
      moduleNom: "Architecture JEE & Spring Boot 3",
      totalHeures: 40,
      heuresAbsence: 4,
      nombreSeances: 2,
    },
    {
      moduleCode: "MOBILE-FLUTTER",
      moduleNom: "Développement Mobile Cross-Platform Flutter",
      totalHeures: 32,
      heuresAbsence: 2,
      nombreSeances: 1,
    },
    {
      moduleCode: "CLOUD-DEVOPS",
      moduleNom: "Cloud Computing & Pipelines CI/CD",
      totalHeures: 36,
      heuresAbsence: 8, // 22.2% -> Dépassé seuil 20% !
      nombreSeances: 4,
    },
    {
      moduleCode: "IA-MACHINE-LEARNING",
      moduleNom: "Intelligence Artificielle & Deep Learning",
      totalHeures: 40,
      heuresAbsence: 0,
      nombreSeances: 0,
    },
  ]);

  useEffect(() => {
    loadConvocations();
  }, []);

  async function loadConvocations() {
    setLoading(true);
    try {
      const data = await ApiClient.get<ConvocationEtudiant[]>("/examens/convocations/me");
      setConvocations(data || []);
    } catch {
      setConvocations([]);
    } finally {
      setLoading(false);
    }
  }

  const radiesCount = convocations.filter((c) => c.estRadie).length;
  const activesCount = convocations.length - radiesCount;

  return (
    <div className="planning-overview">
      <TimetableHeader
        title="Espace Étudiant · Planning, Tables d'Examen & Assiduité"
        description="Consultez votre emploi du temps hebdomadaire, vos convocations officielles avec placement anti-triche et l'état de vos absences (règle des 20%)."
      />

      {/* STATS CARDS */}
      <div className="planning-stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="planning-stat-card">
          <div className="planning-stat-header">
            <span>Épreuves Convoquées</span>
            <BookOpen size={20} className="text-emerald-600" />
          </div>
          <p className="planning-stat-value">{activesCount}</p>
          <span className="planning-stat-hint">Places et numéros de table attribués</span>
        </div>

        <div className="planning-stat-card">
          <div className="planning-stat-header">
            <span>Contrôle Anti-Triche</span>
            <ShieldCheck size={20} className="text-emerald-600" />
          </div>
          <p className="planning-stat-value" style={{ color: "#059669" }}>100% Conforme</p>
          <span className="planning-stat-hint">Disposition 1 siège d&apos;écart validée</span>
        </div>

        <div className="planning-stat-card">
          <div className="planning-stat-header">
            <span>Alerte Radiation (20%)</span>
            <AlertTriangle size={20} className={radiesCount > 0 ? "text-rose-600" : "text-slate-400"} />
          </div>
          <p className="planning-stat-value" style={{ color: radiesCount > 0 ? "#dc2626" : "#059669" }}>
            {radiesCount} module(s)
          </p>
          <span className="planning-stat-hint">
            {radiesCount > 0 ? "Radiation pour absences excessives" : "Aucun dépassement de seuil"}
          </span>
        </div>

        <div className="planning-stat-card">
          <div className="planning-stat-header">
            <span>Statut Académique</span>
            <UserCheck size={20} className="text-emerald-600" />
          </div>
          <p className="planning-stat-value" style={{ fontSize: "1.25rem", color: "#0f172a" }}>Inscrit(e)</p>
          <span className="planning-stat-hint">5IIR - Casablanca Les Orangers</span>
        </div>
      </div>

      {/* ONGLETS NAVIGATION */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setActiveTab("CONVOCATIONS")}
          style={{
            padding: "0.75rem 1.25rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            borderBottom: activeTab === "CONVOCATIONS" ? "2px solid #059669" : "2px solid transparent",
            color: activeTab === "CONVOCATIONS" ? "#059669" : "var(--muted)",
            background: "none",
            borderTop: 0,
            borderLeft: 0,
            borderRight: 0,
            cursor: "pointer",
          }}
        >
          Convocations Officielles & Tables ({convocations.length})
        </button>
        <button
          onClick={() => setActiveTab("PLANNING")}
          style={{
            padding: "0.75rem 1.25rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            borderBottom: activeTab === "PLANNING" ? "2px solid #059669" : "2px solid transparent",
            color: activeTab === "PLANNING" ? "#059669" : "var(--muted)",
            background: "none",
            borderTop: 0,
            borderLeft: 0,
            borderRight: 0,
            cursor: "pointer",
          }}
        >
          Emploi du Temps des Cours
        </button>
        <button
          onClick={() => setActiveTab("ABSENCES")}
          style={{
            padding: "0.75rem 1.25rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            borderBottom: activeTab === "ABSENCES" ? "2px solid #059669" : "2px solid transparent",
            color: activeTab === "ABSENCES" ? "#059669" : "var(--muted)",
            background: "none",
            borderTop: 0,
            borderLeft: 0,
            borderRight: 0,
            cursor: "pointer",
          }}
        >
          Assiduité & Seuil d&apos;Absence (20%)
        </button>
      </div>

      {/* ONGLET 1 : CONVOCATIONS & TABLES */}
      {activeTab === "CONVOCATIONS" && (
        <div>
          {loading ? (
            <p className="planning-empty">Chargement de vos convocations...</p>
          ) : convocations.length === 0 ? (
            <div className="planning-empty" style={{ textAlign: "center", padding: "2rem" }}>
              <p>Aucune convocation d&apos;examen programmée pour votre profil pour le moment.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
              {convocations.map((conv) => (
                <div
                  key={conv.affectationId}
                  style={{
                    backgroundColor: "var(--surface)",
                    borderRadius: "0.75rem",
                    border: conv.estRadie ? "1px solid #fecaca" : "1px solid var(--border)",
                    padding: "1.25rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>
                        {conv.moduleCode} · Session {conv.session}
                      </span>
                      <h4 style={{ margin: "0.25rem 0", fontSize: "1.05rem", fontWeight: 700, color: "var(--foreground)" }}>
                        {conv.moduleNom}
                      </h4>
                    </div>
                  </div>

                  {/* BADGE PLACE ASSIGNÉE */}
                  <div style={{ margin: "0.75rem 0" }}>
                    {conv.estRadie ? (
                      <div
                        style={{
                          padding: "0.5rem 0.75rem",
                          borderRadius: "0.5rem",
                          backgroundColor: "#fee2e2",
                          color: "#991b1b",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <AlertTriangle size={16} />
                        NON CONVOQUÉ(E) — Radié(e) pour dépassement de 20% d&apos;absences
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "0.6rem 0.85rem",
                          borderRadius: "0.5rem",
                          backgroundColor: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                        }}
                      >
                        <ShieldCheck size={20} className="text-emerald-700" />
                        <div>
                          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>
                            Numéro de Table Officiel (Anti-Triche)
                          </div>
                          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>
                            {conv.codePlace}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: "0.4rem", fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Calendar size={14} />
                      <span><strong>Date :</strong> {conv.dateExamen}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Clock size={14} />
                      <span><strong>Horaire :</strong> {conv.heureDebut?.substring(0, 5)} - {conv.heureFin?.substring(0, 5)} ({conv.dureeMinutes} min)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <MapPin size={14} />
                      <span><strong>Salle :</strong> {conv.salleCode} ({conv.campusNom})</span>
                    </div>
                    {conv.surveillantPrincipalNom && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <UserCheck size={14} />
                        <span><strong>Surveillant :</strong> {conv.surveillantPrincipalNom}</span>
                      </div>
                    )}
                    {conv.consignes && (
                      <div style={{ marginTop: "0.5rem", padding: "0.5rem", backgroundColor: "rgba(0,0,0,0.02)", borderRadius: "0.375rem", fontSize: "0.8rem", fontStyle: "italic" }}>
                        ℹ️ {conv.consignes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ONGLET 2 : PLANNING DES COURS */}
      {activeTab === "PLANNING" && (
        <div style={{ backgroundColor: "var(--surface)", borderRadius: "0.75rem", border: "1px solid var(--border)", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Semaine Académique Standard (Groupe 5IIR-G1)
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table className="planning-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Horaires</th>
                  <th>Module</th>
                  <th>Salle & Campus</th>
                  <th>Enseignant</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Lundi</strong></td>
                  <td>08:30 - 11:30</td>
                  <td>Architecture JEE & Spring Boot 3</td>
                  <td>LAB-102 (Les Orangers)</td>
                  <td>Dr. Amine Alami</td>
                  <td><span className="badge badge-cours">COURS</span></td>
                </tr>
                <tr>
                  <td><strong>Lundi</strong></td>
                  <td>14:00 - 17:00</td>
                  <td>Développement Mobile Flutter</td>
                  <td>LAB-104 (Les Orangers)</td>
                  <td>Pr. Hanae Sbai</td>
                  <td><span className="badge badge-tp">TP</span></td>
                </tr>
                <tr>
                  <td><strong>Mardi</strong></td>
                  <td>09:00 - 12:00</td>
                  <td>Cloud Computing & Pipelines CI/CD</td>
                  <td>AMPHI-B (Les Orangers)</td>
                  <td>Dr. Yassine Kadiri</td>
                  <td><span className="badge badge-cours">COURS</span></td>
                </tr>
                <tr>
                  <td><strong>Mercredi</strong></td>
                  <td>14:00 - 17:00</td>
                  <td>Intelligence Artificielle & Deep Learning</td>
                  <td>LAB-102 (Les Orangers)</td>
                  <td>Dr. Nadia Berrada</td>
                  <td><span className="badge badge-td">TD</span></td>
                </tr>
                <tr>
                  <td><strong>Jeudi</strong></td>
                  <td>08:30 - 11:30</td>
                  <td>Recherche Opérationnelle & Algorithmes CP-SAT</td>
                  <td>SALLE-204 (Les Orangers)</td>
                  <td>Dr. Amine Alami</td>
                  <td><span className="badge badge-cours">COURS</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ONGLET 3 : SUIVI DES ABSENCES */}
      {activeTab === "ABSENCES" && (
        <div>
          <div style={{ padding: "1rem 1.25rem", backgroundColor: "#eff6ff", borderRadius: "0.75rem", border: "1px solid #bfdbfe", marginBottom: "1.5rem" }}>
            <h4 style={{ margin: "0 0 0.25rem", color: "#1e40af", fontWeight: 700, fontSize: "0.95rem" }}>
              Règlement Officiel de l&apos;EMSI concernant l&apos;Assiduité
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#1e3a8a" }}>
              Un étudiant totalisant <strong>20% ou plus d&apos;absences non justifiées</strong> dans un module est automatiquement exclu de la session d&apos;examen (Session Normale).
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {absences.map((abs) => {
              const taux = (abs.heuresAbsence / abs.totalHeures) * 100;
              const isElim = taux >= 20.0;
              const isWarning = taux >= 15.0 && taux < 20.0;
              const color = isElim ? "#dc2626" : isWarning ? "#ca8a04" : "#059669";

              return (
                <div
                  key={abs.moduleCode}
                  style={{
                    backgroundColor: "var(--surface)",
                    borderRadius: "0.75rem",
                    border: isElim ? "1px solid #fecaca" : "1px solid var(--border)",
                    padding: "1.25rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)" }}>{abs.moduleCode}</span>
                      <h4 style={{ margin: "0.2rem 0", fontSize: "1rem", fontWeight: 700 }}>{abs.moduleNom}</h4>
                    </div>
                    <span
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: "9999px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        backgroundColor: isElim ? "#fee2e2" : isWarning ? "#fef08a" : "#ecfdf5",
                        color,
                      }}
                    >
                      {taux.toFixed(1)}%
                    </span>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0.25rem 0 0.75rem" }}>
                    {abs.heuresAbsence}h manquées sur {abs.totalHeures}h ({abs.nombreSeances} séances)
                  </p>

                  {/* Barre de progression vers le seuil 20% */}
                  <div style={{ width: "100%", height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(taux, 100)}%`, height: "100%", backgroundColor: color }} />
                  </div>

                  <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem", color }}>
                    {isElim ? (
                      <>
                        <AlertTriangle size={15} />
                        <strong>Seuil dépassé (&gt; 20%) : Radié de l&apos;examen</strong>
                      </>
                    ) : isWarning ? (
                      <>
                        <AlertTriangle size={15} />
                        <span>Attention : seuil critique (proche des 20%)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={15} />
                        <span>Assiduité régulière conforme</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
