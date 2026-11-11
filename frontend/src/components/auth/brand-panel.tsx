import Image from 'next/image';
import { Icon } from '@/components/ui/icon';

export function BrandPanel() {
  return <aside className="brand-panel" aria-label="Univora, plateforme académique EMSI">
    <Image className="brand-logo enter" src="/brand/univora-horizontal-white.png" alt="UNIVORA — Plateforme de gestion académique" width={370} height={104} priority />
    <svg className="brand-network" viewBox="0 0 680 900" fill="none" aria-hidden="true">
      <g className="network-drift" stroke="currentColor" strokeWidth="1">
        <path d="m20 405 130-110 145 120 140-145 160 105 100-140M-20 620l170-125 145 100 140-135 160 100 120-150M150 295v200m145-80v180m140-325v190m160-85v185M150 495l145-80 140 45 160-85M-20 820l170-110 145 105 140-145 160 100 120-90M150 495v215m145-115v220m140-355v210m160-110v210" />
        {[[150,295],[295,415],[435,270],[595,375],[150,495],[295,595],[435,460],[595,560],[150,710],[295,815],[435,670],[595,770]].map(([cx,cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill="currentColor" stroke="none" />)}
      </g>
    </svg>
    <div className="brand-content">
      <p className="brand-statement enter enter-1">Un même campus.<br />De nouvelles possibilités.</p>
      <p className="brand-description enter enter-2">Plateforme de gestion académique</p>
      <ul className="brand-features">
        <li className="enter enter-3"><Icon name="calendar" /><span>Emplois du temps intelligents</span></li>
        <li className="enter enter-4"><Icon name="attendance" /><span>Suivi des absences</span></li>
        <li className="enter enter-5"><Icon name="jury" /><span>Jurys PFE assistés par IA</span></li>
      </ul>
    </div>
    <p className="brand-footer enter enter-5">École Marocaine des Sciences de l’Ingénieur</p>
  </aside>;
}
