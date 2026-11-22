"use client";

import { useEffect, useState } from "react";
import { TimetableHeader } from "@/components/timetable/TimetableHeader";
import { ApiClient } from "@/lib/api-client";
import type { ConvocationEtudiant } from "@/types/exams";
import type {
  EtudiantProfil,
  SeanceItem,
  BilanAbsence,
  ScolariteNotification,
} from "@/types/student";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  BookOpen,
  Bell,
  Mail,
  GraduationCap,
  FileText,
  AlertCircle,
  Check,
  Award,
} from "lucide-react";
import { StudentPfeTab } from "./StudentPfeTab";

export function StudentPortalView() {
  const [profil, setProfil] = useState<EtudiantProfil | null>(null);
  const [convocations, setConvocations] = useState<ConvocationEtudiant[]>([]);
  const [seances, setSeances] = useState<SeanceItem[]>([]);
  const [bilanAbsence, setBilanAbsence] = useState<BilanAbsence | null>(null);
  const [notifications, setNotifications] = useState<ScolariteNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"NOTIFICATIONS" | "PLANNING" | "ABSENCES" | "CONVOCATIONS" | "PFE">("NOTIFICATIONS");
  const [markingId, setMarkingId] = useState<number | null>(null);

  useEffect(() => {
    loadAllStudentData();
  }, []);

  async function loadAllStudentData() {
    setLoading(true);
    try {
      const [profData, convData, seanceData, absData, notifData] = await Promise.allSettled([
        ApiClient.get<EtudiantProfil>("/etudiants/me"),
        ApiClient.get<ConvocationEtudiant[]>("/examens/convocations/me"),
        ApiClient.get<SeanceItem[]>("/etudiants/me/emploi"),
        ApiClient.get<BilanAbsence>("/absences/me"),
        ApiClient.get<ScolariteNotification[]>("/notifications/me"),
      ]);

      if (profData.status === "fulfilled" && profData.value) setProfil(profData.value);
      if (convData.status === "fulfilled" && convData.value) setConvocations(convData.value);
      if (seanceData.status === "fulfilled" && seanceData.value) setSeances(seanceData.value);
      if (absData.status === "fulfilled" && absData.value) setBilanAbsence(absData.value);
      if (notifData.status === "fulfilled" && notifData.value) setNotifications(notifData.value);
    } catch (e) {
      console.error("Erreur de chargement du portail étudiant:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkNotificationAsRead(id: number) {
    setMarkingId(id);
    try {
      await ApiClient.patch(`/notifications/${id}/lire`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
      );
    } catch (err) {
      console.error("Erreur lors du marquage de notification:", err);
    } finally {
      setMarkingId(null);
    }
  }

  const unreadNotifsCount = notifications.filter((n) => !n.lu).length;
  const isRadie = bilanAbsence?.estRadieExamen || profil?.estRadieExamen;
  const tauxAbsence = bilanAbsence?.pourcentageAbsence ?? profil?.tauxAbsence ?? 0;
  const cumulHeures = bilanAbsence?.cumulHeuresAbsence ?? profil?.cumulHeuresAbsence ?? 0;

  // Grouper les séances par jour
  const joursOrdre = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
  const seancesParJour = joursOrdre.map((j) => ({
    jour: j,
    items: seances.filter((s) => s.jourSemaine && s.jourSemaine.toUpperCase() === j),
  }));

  return (
    <div className="planning-overview" style={{ padding: "1.5rem" }}>
      <TimetableHeader
        title={`Espace Étudiant · ${profil ? `${profil.prenom} ${profil.nom}` : "Chargement..."}`}
        subtitle="Consultez votre profil académique officiel, votre emploi du temps hebdomadaire, vos convocations d'examens et vos notifications de scolarité."
      />

      {/* BANDEAU PROFIL ÉTUDIANT */}
      {profil && (
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            padding: "1.25rem 1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "50%",
                backgroundColor: "#ecfdf5",
                color: "#059669",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: "1.2rem",
              }}
            >
              {profil.prenom ? profil.prenom[0] : "E"}{profil.nom ? profil.nom[0] : "T"}
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--foreground)" }}>
                {profil.prenom} {profil.nom}
              </h2>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                Matricule: <strong style={{ color: "var(--foreground)" }}>{profil.matricule}</strong> · Email: {profil.email}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.85rem" }}>
            <div>
              <span style={{ color: "var(--muted)", display: "block" }}>Filière & Niveau</span>
              <strong style={{ color: "var(--foreground)" }}>{profil.nomFiliere || "Ingénierie"}</strong>
            </div>
            <div>
              <span style={{ color: "var(--muted)", display: "block" }}>Groupe Académique</span>
              <span
                style={{
                  display: "inline-block",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "0.25rem",
                  backgroundColor: "#e0e7ff",
                  color: "#3730a3",
                  fontWeight: 600,
                }}
              >
                {profil.codeGroupe || "Groupe 1"}
              </span>
            </div>
            <div>
              <span style={{ color: "var(--muted)", display: "block" }}>Campus Principal</span>
              <strong style={{ color: "var(--foreground)" }}>{profil.nomCampus || "Campus EMSI"}</strong>
            </div>
          </div>
        </div>
      )}

      {/* STATS CARDS SYNCHRONISÉES */}
      <div className="planning-stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="planning-stat-card">
          <div className="planning-stat-header">
            <span>Notifications Scolarité</span>
            <Bell size={20} className={unreadNotifsCount > 0 ? "text-amber-500" : "text-emerald-600"} />
          </div>
          <p className="planning-stat-value" style={{ color: unreadNotifsCount > 0 ? "#d97706" : "#059669" }}>
            {unreadNotifsCount} non lue(s)
          </p>
          <span className="planning-stat-hint">{notifications.length} message(s) officiel(s)</span>
        </div>

        <div className="planning-stat-card">
          <div className="planning-stat-header">
            <span>Séances Hebdomadaires</span>
            <Calendar size={20} className="text-emerald-600" />
          </div>
          <p className="planning-stat-value">{seances.length} Séances</p>
          <span className="planning-stat-hint">Planning groupe {profil?.codeGroupe || ""}</span>
        </div>

        <div className="planning-stat-card">
          <div className="planning-stat-header">
            <span>Règle des 20% (Assiduité)</span>
            <AlertTriangle size={20} className={isRadie ? "text-rose-600" : "text-emerald-600"} />
          </div>
          <p className="planning-stat-value" style={{ color: isRadie ? "#dc2626" : "#059669" }}>
            {cumulHeures}h ({tauxAbsence}%)
          </p>
          <span className="planning-stat-hint">
            {isRadie ? "⚠️ Seuil de 20% dépassé : Radié(e)" : "Conforme (< 20% d'absence)"}
          </span>
        </div>

        <div className="planning-stat-card">
          <div className="planning-stat-header">
            <span>Épreuves Convoquées</span>
            <ShieldCheck size={20} className="text-emerald-600" />
          </div>
          <p className="planning-stat-value" style={{ color: "#059669" }}>{convocations.length} Épreuve(s)</p>
          <span className="planning-stat-hint">Avec table anti-triche attribuée</span>
        </div>
      </div>

      {/* NAVIGATION PAR ONGLETS */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("NOTIFICATIONS")}
          style={{
            padding: "0.6rem 1rem",
            fontWeight: 600,
            fontSize: "0.9rem",
            border: 0,
            borderBottom: activeTab === "NOTIFICATIONS" ? "2px solid var(--emsi-green-dark)" : "2px solid transparent",
            backgroundColor: "transparent",
            color: activeTab === "NOTIFICATIONS" ? "var(--emsi-green-dark)" : "var(--muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Bell size={16} />
          Messages Scolarité {unreadNotifsCount > 0 && `(${unreadNotifsCount})`}
        </button>

        <button
          onClick={() => setActiveTab("PLANNING")}
          style={{
            padding: "0.6rem 1rem",
            fontWeight: 600,
            fontSize: "0.9rem",
            border: 0,
            borderBottom: activeTab === "PLANNING" ? "2px solid var(--emsi-green-dark)" : "2px solid transparent",
            backgroundColor: "transparent",
            color: activeTab === "PLANNING" ? "var(--emsi-green-dark)" : "var(--muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Calendar size={16} />
          Emploi du Temps Hebdomadaire ({seances.length})
        </button>

        <button
          onClick={() => setActiveTab("ABSENCES")}
          style={{
            padding: "0.6rem 1rem",
            fontWeight: 600,
            fontSize: "0.9rem",
            border: 0,
            borderBottom: activeTab === "ABSENCES" ? "2px solid var(--emsi-green-dark)" : "2px solid transparent",
            backgroundColor: "transparent",
            color: activeTab === "ABSENCES" ? "var(--emsi-green-dark)" : "var(--muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={16} />
          Assiduité & Règle des 20%
        </button>

        <button
          onClick={() => setActiveTab("CONVOCATIONS")}
          style={{
            padding: "0.6rem 1rem",
            fontWeight: 600,
            fontSize: "0.9rem",
            border: 0,
            borderBottom: activeTab === "CONVOCATIONS" ? "2px solid var(--emsi-green-dark)" : "2px solid transparent",
            backgroundColor: "transparent",
            color: activeTab === "CONVOCATIONS" ? "var(--emsi-green-dark)" : "var(--muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <ShieldCheck size={16} />
          Convocations & Tables d&apos;Examen ({convocations.length})
        </button>

        <button
          onClick={() => setActiveTab("PFE")}
          style={{
            padding: "0.6rem 1rem",
            fontWeight: 600,
            fontSize: "0.9rem",
            border: 0,
            borderBottom: activeTab === "PFE" ? "2px solid var(--emsi-green-dark)" : "2px solid transparent",
            backgroundColor: "transparent",
            color: activeTab === "PFE" ? "var(--emsi-green-dark)" : "var(--muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Award size={16} />
          Mon PFE & Soutenance
        </button>
      </div>

      {/* CONTENU ONGLETS */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
          Chargement synchronisé des informations étudiantes...
        </div>
      ) : (
        <>
          {/* ONGLET 1 : NOTIFICATIONS SCOLARITÉ */}
          {activeTab === "NOTIFICATIONS" && (
            <div style={{ display: "grid", gap: "1rem" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
                  Aucune notification de scolarité pour le moment.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: "1.25rem",
                      backgroundColor: notif.lu ? "var(--surface)" : "var(--green-soft, #f0fdf4)",
                      border: notif.lu ? "1px solid var(--border)" : "1px solid #86efac",
                      borderRadius: "0.5rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          borderRadius: "0.5rem",
                          backgroundColor: notif.typeNotification === "ALERTE_ASSIDUITE" ? "#fee2e2" : notif.typeNotification === "EXAMEN" ? "#e0e7ff" : "#dcfce7",
                          color: notif.typeNotification === "ALERTE_ASSIDUITE" ? "#b91c1c" : notif.typeNotification === "EXAMEN" ? "#4338ca" : "#15803d",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        {notif.typeNotification === "ALERTE_ASSIDUITE" ? <AlertTriangle size={18} /> : notif.typeNotification === "EXAMEN" ? <ShieldCheck size={18} /> : <Bell size={18} />}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--foreground)" }}>
                            {notif.titre}
                          </h3>
                          {!notif.lu && (
                            <span style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", borderRadius: "0.25rem", backgroundColor: "#059669", color: "white", fontWeight: 700 }}>
                              NOUVEAU
                            </span>
                          )}
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                            {new Date(notif.dateEnvoi).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p style={{ margin: "0.4rem 0 0", fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.5 }}>
                          {notif.message}
                        </p>
                      </div>
                    </div>

                    {!notif.lu && (
                      <button
                        type="button"
                        disabled={markingId === notif.id}
                        onClick={() => handleMarkNotificationAsRead(notif.id)}
                        style={{
                          padding: "0.4rem 0.75rem",
                          borderRadius: "0.375rem",
                          backgroundColor: "var(--surface)",
                          border: "1px solid var(--border)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          color: "var(--foreground)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Check size={14} />
                        {markingId === notif.id ? "Mise à jour..." : "Marquer comme lu"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ONGLET 2 : EMPLOI DU TEMPS HEBDOMADAIRE OFFICIEL */}
          {activeTab === "PLANNING" && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {seances.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
                  Aucune séance programmée pour votre groupe pour le moment.
                </div>
              ) : (
                seancesParJour.filter((g) => g.items.length > 0).map((grp) => (
                  <div key={grp.jour} style={{ border: "1px solid var(--border)", borderRadius: "0.5rem", overflow: "hidden", backgroundColor: "var(--surface)" }}>
                    <div style={{ padding: "0.75rem 1.25rem", backgroundColor: "var(--background)", fontWeight: 700, fontSize: "0.9rem", color: "var(--foreground)", borderBottom: "1px solid var(--border)" }}>
                      {grp.jour} ({grp.items.length} séance(s))
                    </div>
                    <div style={{ padding: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                      {grp.items.map((s) => (
                        <div
                          key={s.id}
                          style={{
                            padding: "1rem",
                            border: "1px solid var(--border)",
                            borderRadius: "0.5rem",
                            backgroundColor: s.typeSalle === "LI_PC" ? "rgba(6, 182, 212, 0.05)" : "var(--surface)",
                            borderLeft: s.typeSalle === "LI_PC" ? "4px solid #06b6d4" : "4px solid var(--emsi-green-dark)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
                            <span>{s.horaireDebut} - {s.horaireFin}</span>
                            <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{s.salleCode}</span>
                          </div>
                          <h4 style={{ margin: "0.2rem 0", fontSize: "0.95rem", fontWeight: 700, color: "var(--foreground)" }}>
                            {s.elementModuleIntitule}
                          </h4>
                          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                            Prof. {s.enseignantNom} · {s.campusNom}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ONGLET 3 : ASSIDUITÉ & RÈGLE DES 20% */}
          {activeTab === "ABSENCES" && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {/* Carte alerte règle 20% */}
              <div
                style={{
                  padding: "1.25rem",
                  borderRadius: "0.5rem",
                  border: isRadie ? "1px solid #fca5a5" : "1px solid #86efac",
                  backgroundColor: isRadie ? "#fff1f2" : "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <AlertTriangle size={32} className={isRadie ? "text-rose-600" : "text-emerald-600"} />
                <div>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: isRadie ? "#b91c1c" : "#15803d" }}>
                    {isRadie ? "STATUT : ÉTUDIANT(E) RADIÉ(E) D'EXAMEN" : "ASSIDUITÉ RÉGULIÈRE : ÉLIGIBLE AUX EXAMENS"}
                  </h3>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: isRadie ? "#991b1b" : "#166534" }}>
                    Règle absolue EMSI : Au-delà de 20% d&apos;absence sur un module (ou 18h cumulées), la radiation de l&apos;examen est automatique.
                    Cumul actuel : <strong>{cumulHeures}h</strong> ({tauxAbsence}% du semestre).
                  </p>
                </div>
              </div>

              {/* Synthèse par module */}
              <div style={{ border: "1px solid var(--border)", borderRadius: "0.5rem", overflow: "hidden", backgroundColor: "var(--surface)" }}>
                <div style={{ padding: "0.75rem 1.25rem", backgroundColor: "var(--background)", fontWeight: 700, fontSize: "0.9rem", color: "var(--foreground)", borderBottom: "1px solid var(--border)" }}>
                  Synthèse de l&apos;Assiduité par Module
                </div>
                <div style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}>
                  {bilanAbsence?.syntheseModules && bilanAbsence.syntheseModules.length > 0 ? (
                    bilanAbsence.syntheseModules.map((m) => (
                      <div key={m.moduleCode} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                          <div>
                            <strong style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>{m.moduleNom}</strong>
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>
                              {m.heuresAbsence}h d&apos;absence sur {m.totalHeures}h programmées · {m.absencesJustifiees} justifiée(s)
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              padding: "0.2rem 0.6rem",
                              borderRadius: "0.25rem",
                              backgroundColor: m.seuilDepasse ? "#fee2e2" : "#ecfdf5",
                              color: m.seuilDepasse ? "#b91c1c" : "#059669",
                            }}
                          >
                            {m.pourcentage}% {m.seuilDepasse ? "(Seuil 20% Dépassé)" : "(Valide)"}
                          </span>
                        </div>
                        {/* Barre de progression */}
                        <div style={{ width: "100%", height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${Math.min(m.pourcentage, 100)}%`,
                              height: "100%",
                              backgroundColor: m.seuilDepasse ? "#dc2626" : m.pourcentage > 10 ? "#f59e0b" : "#059669",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "var(--muted)", margin: 0 }}>Aucune absence enregistrée pour ce semestre.</p>
                  )}
                </div>
              </div>

              {/* Historique des absences */}
              {bilanAbsence?.historiqueAbsences && bilanAbsence.historiqueAbsences.length > 0 && (
                <div style={{ border: "1px solid var(--border)", borderRadius: "0.5rem", overflow: "hidden", backgroundColor: "var(--surface)" }}>
                  <div style={{ padding: "0.75rem 1.25rem", backgroundColor: "var(--background)", fontWeight: 700, fontSize: "0.9rem", color: "var(--foreground)", borderBottom: "1px solid var(--border)" }}>
                    Historique Détaillé des Séances Non Émargées
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--muted)" }}>
                        <th style={{ padding: "0.75rem 1.25rem" }}>Date</th>
                        <th style={{ padding: "0.75rem" }}>Module</th>
                        <th style={{ padding: "0.75rem" }}>Volume</th>
                        <th style={{ padding: "0.75rem" }}>Statut</th>
                        <th style={{ padding: "0.75rem 1.25rem" }}>Motif</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bilanAbsence.historiqueAbsences.map((a) => (
                        <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "0.75rem 1.25rem", fontWeight: 600 }}>{a.dateSeance}</td>
                          <td style={{ padding: "0.75rem" }}>{a.moduleNom || "Module"}</td>
                          <td style={{ padding: "0.75rem" }}>{a.heuresAbsence}h</td>
                          <td style={{ padding: "0.75rem" }}>
                            <span
                              style={{
                                padding: "0.2rem 0.5rem",
                                borderRadius: "0.25rem",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                backgroundColor: a.statut === "ABSENT_JUSTIFIE" ? "#ecfdf5" : "#fee2e2",
                                color: a.statut === "ABSENT_JUSTIFIE" ? "#059669" : "#b91c1c",
                              }}
                            >
                              {a.statut === "ABSENT_JUSTIFIE" ? "Justifiée" : "Non justifiée"}
                            </span>
                          </td>
                          <td style={{ padding: "0.75rem 1.25rem", color: "var(--muted)" }}>{a.motifJustification || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ONGLET 4 : CONVOCATIONS D'EXAMEN AVEC TABLE ANTI-TRICHE */}
          {activeTab === "CONVOCATIONS" && (
            <div style={{ display: "grid", gap: "1rem" }}>
              {convocations.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
                  Aucune convocation d&apos;examen publiée pour le moment.
                </div>
              ) : (
                convocations.map((c) => (
                  <div
                    key={c.affectationId}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      backgroundColor: "var(--surface)",
                      padding: "1.25rem 1.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "1rem",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                        <span
                          style={{
                            padding: "0.15rem 0.5rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            backgroundColor: c.session === "NORMALE" ? "#e0e7ff" : "#fef3c7",
                            color: c.session === "NORMALE" ? "#3730a3" : "#92400e",
                          }}
                        >
                          Session {c.session}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{c.moduleCode}</span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--foreground)" }}>
                        {c.moduleNom}
                      </h3>
                      <p style={{ margin: "0.3rem 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                        Date : <strong style={{ color: "var(--foreground)" }}>{c.dateExamen}</strong> ({c.heureDebut} - {c.heureFin}) · Durée : {c.dureeMinutes} min
                      </p>
                      <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                        Surveillant : {c.surveillantPrincipalNom || "Non assigné"}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      {/* Badge Table Anti-Triche */}
                      <div
                        style={{
                          backgroundColor: "#ecfdf5",
                          border: "2px solid #059669",
                          borderRadius: "0.5rem",
                          padding: "0.75rem 1rem",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#065f46", textTransform: "uppercase", display: "block" }}>
                          Table Anti-Triche
                        </span>
                        <strong style={{ fontSize: "1.4rem", color: "#047857", fontWeight: 800 }}>
                          N° {c.numeroPlace}
                        </strong>
                        <span style={{ fontSize: "0.75rem", color: "#065f46", display: "block", marginTop: "0.1rem" }}>
                          Salle {c.salleCode}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ONGLET 5 : MON PFE & SOUTENANCE */}
          {activeTab === "PFE" && <StudentPfeTab profil={profil} />}
        </>
      )}
    </div>
  );
}
