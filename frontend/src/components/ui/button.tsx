import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  trailing?: ReactNode;
}

export function Button({ children, loading, loadingText = 'Connexion en cours…', trailing, className = '', disabled, ...props }: ButtonProps) {
  return <button className={`primary-button ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
    {loading ? <span className="spinner" aria-hidden="true" /> : null}
    <span>{loading ? loadingText : children}</span>
    {!loading && trailing}
  </button>;
}
