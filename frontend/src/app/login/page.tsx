import type { Metadata } from 'next';
import Image from 'next/image';
import { BrandPanel } from '@/components/auth/brand-panel';
import { LoginForm } from '@/components/auth/login-form';
import { LoginMotion } from '@/components/auth/login-motion';

export const metadata: Metadata = { title: 'Connexion' };

export default function LoginPage() {
  return <main className="login-layout" id="main-content">
    <a className="skip-link" href="#login-title">Aller au formulaire de connexion</a>
    <BrandPanel />
    <section className="login-side" aria-labelledby="login-title">
      <div className="login-topline"><span>Portail académique EMSI</span><LoginMotion /></div>
      <div className="login-center">
        <Image className="mobile-logo enter" src="/brand/univora-horizontal.png" alt="UNIVORA — Plateforme de gestion académique" width={300} height={84} priority />
        <div className="login-card">
          <div className="login-heading enter"><h1 id="login-title" tabIndex={-1}>Connexion</h1><p>Retrouvez votre espace académique.</p></div>
          <LoginForm />
        </div>
        <p className="login-help enter enter-5">Un problème pour vous connecter ?<br /><span>Contactez le service scolarité de votre campus.</span></p>
      </div>
      <footer className="login-footer">EMSI Univora<span>Votre campus, simplement.</span></footer>
    </section>
  </main>;
}
