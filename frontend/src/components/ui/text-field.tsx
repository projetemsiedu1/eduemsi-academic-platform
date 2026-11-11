import type { InputHTMLAttributes, ReactNode } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  action?: ReactNode;
}

export function TextField({ id, label, error, action, className = '', ...props }: TextFieldProps) {
  return <div className={`text-field ${error ? 'text-field-error' : ''}`}>
    <div className="field-control">
      <input {...props} id={id} className={`field-input ${action ? 'field-with-action' : ''} ${className}`} placeholder=" " aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : props['aria-describedby']} />
      <label htmlFor={id}>{label}</label>
      {action && <div className="field-action">{action}</div>}
    </div>
    {error && <p id={`${id}-error`} className="field-error">{error}</p>}
  </div>;
}
