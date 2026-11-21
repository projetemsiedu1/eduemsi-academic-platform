'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient, ApiError } from '@/lib/api-client';
import { roleLabel, type AcademicUser } from '@/lib/auth';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import type { ConvocationEtudiant } from '@/types/exams';

export function DashboardSession() {
  const router = useRouter();
  const [user, setUser] = useState<AcademicUser | null>(null);
  const [convocations, setConvocations] = useState<ConvocationEtudiant[]>([]);
  const [loadingConvocations, setLoadingConvocations] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    if (!ApiClient.getToken()) {
      router.replace('/login');
      return;
    }
    ApiClient.get<AcademicUser>('/auth/me').then(profile => {
      if (active) {
        if (!profile || typeof profile.role !== 'string' || typeof profile.nom !== 'string') throw new Error('Profil invalide');
        setUser(profile);
        setError(false);

        // Charger les convocations pour l'étudiant
        setLoadingConvocations(true);
        ApiClient.get<ConvocationEtudiant[]>('/examens/convocations/me')
          .then(data => {
            if (active) setConvocations(data || []);
          })
          .catch(() => {
            if (active) setConvocations([]);
          })
          .finally(() => {
            if (active) setLoadingConvocations(false);
          });
      }
    }).catch(reason => {
      if (!active) return;
      if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
        ApiClient.clearToken();
        router.replace('/login');
      } else setError(true);
    });
    return () => { active = false; };
  }, [router, retry]);

  function logout() {
    ApiClient.clearToken();
    router.replace('/login');
  }

  return (
    <main className="dashboard-shell" id="main-content">
      <header className="dashboard-header">
        <Image src="/brand/univora-horizontal.png" width={240} height={67} alt="Univora" priority />
        <button className="logout-button" onClick={logout}>
          <Icon name="logout" />Se déconnecter
        </button>
      </header>

      <section className="dashboard-content" aria-labelledby="dashboard-title">
        <h1 id="dashboard-title">Votre espace académique</h1>
        {user ? (
          <>
            <p className="session-status" role="status">
              <Icon name="check" />Connexion réussie
            </p>
            <h2>{[user.prenom, user.nom].filter(Boolean).join(' ') || user.username}</h2>
            <p className="user-role">
              {roleLabel(user.role)}{user.campusNom && <> · {user.campusNom}</>}
            </p>

            {['ROLE_SUPER_ADMIN', 'ROLE_RESPONSABLE_PLANNING'].includes(user.role) && (
              <div style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
                <Link className="planning-entry-link" href="/timetable">
                  Accéder à la planification des cours <Icon name="arrow" />
                </Link>
                <div style={{ marginTop: '0.5rem' }}>
                  <Link
                    href="/timetable/exams"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.1rem',
                      borderRadius: '0.5rem',
                      backgroundColor: '#047857',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      textDecoration: 'none'
                    }}
                  >
                    Gérer la planification des examens & tables →
                  </Link>
                </div>
              </div>
            )}

            {/* SECTION NOTIFICATION & CONVOCATIONS D'EXAMENS POUR L'ÉTUDIANT */}
            <section
              style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                textAlign: 'left'
              }}
              aria-label="Convocations aux examens"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Mes Convocations Officielles aux Examens
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                    Consultez vos épreuves, vos salles d&apos;examen et vos numéros de place attribués.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.3rem 0.6rem',
                    borderRadius: '9999px',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0'
                  }}
                >
                  Session Officielle 2026
                </span>
              </div>

              {loadingConvocations ? (
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Chargement de vos convocations d&apos;examen...</p>
              ) : convocations.length === 0 ? (
                <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>
                    Aucune convocation d&apos;examen programmée pour votre profil pour le moment.
                  </p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>
                    Les numéros de table apparaîtront ici dès que le planning de session sera finalisé.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {convocations.map(conv => (
                    <div
                      key={conv.affectationId}
                      style={{
                        padding: '1.1rem',
                        borderRadius: '0.75rem',
                        border: conv.estRadie ? '1px solid #fecaca' : '1px solid #cbd5e1',
                        backgroundColor: conv.estRadie ? '#fff5f5' : '#f8fafc',
                        position: 'relative'
                      }}
                    >
                      {/* En-tête de carte */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                            {conv.moduleCode} · Session {conv.session}
                          </span>
                          <h4 style={{ margin: '0.15rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                            {conv.moduleNom}
                          </h4>
                        </div>
                      </div>

                      {/* BADGE NUMÉRO DE PLACE / TABLE */}
                      <div style={{ margin: '0.75rem 0' }}>
                        {conv.estRadie ? (
                          <div
                            style={{
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.5rem',
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            ⚠️ NON CONVOQUÉ(E) — Radié(e) pour dépassement de 20% d&apos;absences
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 0.85rem',
                              borderRadius: '0.5rem',
                              backgroundColor: '#ecfdf5',
                              border: '1px solid #6ee7b7',
                              color: '#065f46',
                              fontSize: '0.85rem',
                              fontWeight: 800
                            }}
                          >
                            <span>🪑 {conv.codePlace || `Table N° ${conv.numeroPlace}`}</span>
                          </div>
                        )}
                      </div>

                      {/* Détails date, heure et salle */}
                      <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div>
                          <strong>Date :</strong> {conv.dateExamen}
                        </div>
                        <div>
                          <strong>Horaire :</strong> {conv.heureDebut?.substring(0, 5)} - {conv.heureFin?.substring(0, 5)} ({conv.dureeMinutes} min)
                        </div>
                        <div>
                          <strong>Lieu :</strong> Salle {conv.salleCode} ({conv.campusNom})
                        </div>
                        {conv.surveillantPrincipalNom && (
                          <div>
                            <strong>Surveillant :</strong> {conv.surveillantPrincipalNom}
                          </div>
                        )}
                        {conv.consignes && (
                          <div style={{ marginTop: '0.35rem', fontStyle: 'italic', fontSize: '0.75rem', color: '#64748b' }}>
                            ℹ️ {conv.consignes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : error ? (
          <div role="alert">
            <p>Impossible de charger votre profil. Veuillez réessayer.</p>
            <Button onClick={() => { setError(false); setRetry(value => value + 1); }}>Réessayer</Button>
          </div>
        ) : (
          <p role="status">Vérification de votre session…</p>
        )}
      </section>
    </main>
  );
}
