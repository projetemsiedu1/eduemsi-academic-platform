'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Icon } from '@/components/ui/icon';

const motionQuery = '(prefers-reduced-motion: reduce)';
function subscribe(listener: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}

export function LoginMotion() {
  const button = useRef<HTMLButtonElement>(null);
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(motionQuery).matches, () => false);
  const frame = useRef(0);

  function replay() {
    const layout = button.current?.closest<HTMLElement>('.login-layout');
    if (!layout || window.matchMedia(motionQuery).matches) return;
    cancelAnimationFrame(frame.current);
    delete layout.dataset.motion;
    // Allow the reset to be painted before restarting the CSS animations.
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => { layout.dataset.motion = 'running'; });
    });
  }

  useEffect(() => {
    const layout = button.current?.closest<HTMLElement>('.login-layout');
    if (layout && !reduced) layout.dataset.motion = 'running';
    else if (layout) delete layout.dataset.motion;
    return () => {
      cancelAnimationFrame(frame.current);
      if (layout) delete layout.dataset.motion;
    };
  }, [reduced]);

  return <button ref={button} className="motion-replay" type="button" onClick={replay} disabled={reduced} title={reduced ? 'La réduction des animations est activée dans vos préférences système.' : 'Rejouer l’apparition de la page'}>
    <Icon name="arrow" />{reduced ? 'Animations réduites' : 'Rejouer l’animation'}
  </button>;
}
