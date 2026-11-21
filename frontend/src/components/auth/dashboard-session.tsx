'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient, ApiError } from '@/lib/api-client';
import { roleLabel, type AcademicUser } from '@/lib/auth';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export function DashboardSession() {
  const router = useRouter();
  const [user, setUser] = useState<AcademicUser | null>(null);
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

  return <main className="dashboard-shell" id="main-content">
    <header className="dashboard-header"><Image src="/brand/univora-horizontal.png" width={240} height={67} alt="Univora" priority /><button className="logout-button" onClick={logout}><Icon name="logout" />Se déconnecter</button></header>
    <section className="dashboard-content" aria-labelledby="dashboard-title">
      <h1 id="dashboard-title">Votre espace académique</h1>
      {user ? <>
        <p className="session-status" role="status"><Icon name="check" />Connexion réussie</p>
        <h2>{[user.prenom, user.nom].filter(Boolean).join(' ') || user.username}</h2>
        <p className="user-role">{roleLabel(user.role)}{user.campusNom && <> · {user.campusNom}</>}</p>
        <p className="dashboard-description">Vous êtes connecté à EMSI Univora. Votre tableau de bord sera disponible ici.</p>
        {['ROLE_SUPER_ADMIN', 'ROLE_RESPONSABLE_PLANNING'].includes(user.role) && <Link className="planning-entry-link" href="/timetable">Accéder à la planification <Icon name="arrow" /></Link>}
      </> : error ? <div role="alert"><p>Impossible de charger votre profil. Veuillez réessayer.</p><Button onClick={() => { setError(false); setRetry(value => value + 1); }}>Réessayer</Button></div> : <p role="status">Vérification de votre session…</p>}
    </section>
  </main>;
}
