'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { login, loginErrorMessage, logout } from '@/lib/auth';

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const summary = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);

  // Vider automatiquement les champs et purger le cache de session à l'arrivée sur la page
  useEffect(() => {
    setEmailOrUsername('');
    setPassword('');
    setErrors({});
    setMessage('');
    logout();
    if (formRef.current) {
      formRef.current.reset();
    }
  }, []);

  function announceError() {
    setAttempt(value => value + 1);
    requestAnimationFrame(() => summary.current?.focus());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const trimmedInput = emailOrUsername.trim();
    let usernameError: string | undefined;

    if (!trimmedInput) {
      usernameError = 'Saisissez votre email académique ou identifiant.';
    } else if (trimmedInput.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput)) {
      usernameError = 'Format d’adresse email invalide (ex: mehdi.tazi@emsi.ma).';
    }

    const nextErrors = {
      username: usernameError,
      password: password ? undefined : 'Saisissez votre mot de passe.',
    };

    setErrors(nextErrors);
    setMessage('');

    if (nextErrors.username || nextErrors.password) {
      announceError();
      return;
    }

    submitting.current = true;
    setPending(true);

    try {
      const user = await login(trimmedInput, password, remember);
      router.replace(user.role === 'ROLE_RESPONSABLE_PLANNING' ? '/timetable' : '/dashboard');
    } catch (error) {
      setMessage(loginErrorMessage(error));
      announceError();
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  const hasErrors = Boolean(message || errors.username || errors.password);

  return <form ref={formRef} noValidate autoComplete="off" onSubmit={handleSubmit} aria-label="Connexion à votre espace académique" aria-busy={pending}>
    <div className="form-content" data-shake={hasErrors ? (attempt % 2 ? 'odd' : 'even') : undefined}>
      {hasErrors && <div ref={summary} tabIndex={-1} role="alert" className="error-summary">
        <Icon name="alert" />
        <div>{message || 'Veuillez compléter les champs indiqués.'}
          {!message && <ul>{errors.username && <li><a href="#username">{errors.username}</a></li>}{errors.password && <li><a href="#password">{errors.password}</a></li>}</ul>}
        </div>
      </div>}
      <div className="enter enter-2">
        <TextField
          id="username"
          name="username"
          label="Email institutionnel ou identifiant"
          placeholder="ex: mehdi.tazi@emsi.ma ou resp_planning"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={emailOrUsername}
          required
          error={errors.username}
          readOnly={pending}
          onChange={(e) => {
            setEmailOrUsername(e.target.value);
            setErrors(current => ({ ...current, username: undefined }));
          }}
        />
      </div>
      <div className="enter enter-3">
        <TextField
          id="password"
          name="password"
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={password}
          required
          error={errors.password}
          readOnly={pending}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors(current => ({ ...current, password: undefined }));
          }}
          action={
            <button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={showPassword} aria-controls="password">
              <Icon name={showPassword ? 'eye-off' : 'eye'} />
            </button>
          }
        />
      </div>
      <div className="form-options enter enter-4">
        <label className="remember-label">
          <input
            type="checkbox"
            name="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            disabled={pending}
          />
          <span>Se souvenir de moi</span>
        </label>
        <span className="forgot-password" role="link" aria-disabled="true" title="Pour réinitialiser votre mot de passe, contactez votre scolarité.">Mot de passe oublié ?</span>
      </div>
      <div className="enter enter-5"><Button type="submit" loading={pending} trailing={<Icon name="arrow" />}>Se connecter</Button></div>
    </div>
    <p className="form-note enter enter-5"><Icon name="lock" /><span>Un accès personnel sécurisé à votre vie académique.</span></p>
    <p className="sr-only" role="status">{pending ? 'Connexion en cours. Veuillez patienter.' : ''}</p>
  </form>;
}
