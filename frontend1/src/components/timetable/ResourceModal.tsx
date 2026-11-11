'use client';

import React, { useState } from 'react';
import { X, Save, Plus, Edit2, Info } from 'lucide-react';
import { useTimetable } from '@/context/TimetableContext';
import {
  Salle,
  Enseignant,
  Groupe,
  TypeSalle,
  TypeContrat,
} from '@/types/timetable';

export type ModalResourceType = 'salle' | 'enseignant' | 'groupe';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: ModalResourceType;
  itemToEdit?: Salle | Enseignant | Groupe | null;
}

export function ResourceModal({
  isOpen,
  onClose,
  resourceType,
  itemToEdit,
}: ResourceModalProps) {
  if (!isOpen) return null;

  const formKey = itemToEdit ? `${resourceType}-${itemToEdit.id}` : `${resourceType}-new`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <ResourceForm
          key={formKey}
          resourceType={resourceType}
          itemToEdit={itemToEdit}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function ResourceForm({
  resourceType,
  itemToEdit,
  onClose,
}: {
  resourceType: ModalResourceType;
  itemToEdit?: Salle | Enseignant | Groupe | null;
  onClose: () => void;
}) {
  const { campuses, filieres, options, addOrUpdateSalle, addOrUpdateEnseignant, addOrUpdateGroupe } =
    useTimetable();

  const salleToEdit = resourceType === 'salle' ? (itemToEdit as Salle | null) : null;
  const ensToEdit = resourceType === 'enseignant' ? (itemToEdit as Enseignant | null) : null;
  const grpToEdit = resourceType === 'groupe' ? (itemToEdit as Groupe | null) : null;

  // État formulaire Salle
  const [codeSalle, setCodeSalle] = useState(salleToEdit?.codeSalle || 'Lab TP-04');
  const [campusId, setCampusId] = useState(salleToEdit?.campusId || campuses[0]?.id || '');
  const [etage, setEtage] = useState(salleToEdit?.etage || '1er Étage');
  const [typeSalle, setTypeSalle] = useState<TypeSalle>(salleToEdit?.typeSalle || 'STANDARD');
  const [capacite, setCapacite] = useState(salleToEdit?.capacite || 35);
  const [nbPc, setNbPc] = useState(salleToEdit?.nombrePcOperationnels || 0);
  const [specsEquipements, setSpecsEquipements] = useState(
    salleToEdit?.specsEquipements || 'Vidéoprojecteur HD, Climatisation'
  );

  // État formulaire Enseignant
  const [nom, setNom] = useState(ensToEdit?.nom || '');
  const [prenom, setPrenom] = useState(ensToEdit?.prenom || '');
  const [matricule, setMatricule] = useState(ensToEdit?.matricule || 'ENS-MRK-105');
  const [email, setEmail] = useState(ensToEdit?.email || '');
  const [telephone, setTelephone] = useState(ensToEdit?.telephone || '+212 6 00 00 00 00');
  const [specialite, setSpecialite] = useState(
    ensToEdit?.specialite || 'Génie Logiciel & Architecture'
  );
  const [typeContrat, setTypeContrat] = useState<TypeContrat>(ensToEdit?.typeContrat || 'PERMANENT');
  const [heuresContractuelles, setHeuresContractuelles] = useState(
    ensToEdit?.heuresContractuellesSemaine || 18
  );

  // État formulaire Groupe
  const [codeGroupe, setCodeGroupe] = useState(grpToEdit?.codeGroupe || '5IIR 2DSI G3');
  const [filiereId, setFiliereId] = useState(grpToEdit?.filiereId || filieres[0]?.id || '');
  const [optionId, setOptionId] = useState(grpToEdit?.optionId || options[0]?.id || '');
  const [anneeEtude, setAnneeEtude] = useState(grpToEdit?.anneeEtude || 5);
  const [effectif, setEffectif] = useState(grpToEdit?.effectif || 30);
  const [delegueNom, setDelegueNom] = useState(grpToEdit?.delegueNom || '');
  const [campusFixeId, setCampusFixeId] = useState(grpToEdit?.campusFixeId || campuses[0]?.id || '');
  const [laboRequis, setLaboRequis] = useState<TypeSalle>(grpToEdit?.laboratoiresRequis || 'LI_PC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (resourceType === 'salle') {
      const newSalle: Salle = {
        id: salleToEdit?.id || `sal-custom-${Date.now()}`,
        codeSalle,
        campusId,
        etage,
        typeSalle,
        capacite: Number(capacite),
        nombrePcOperationnels: typeSalle === 'LI_PC' ? Number(nbPc || capacite) : 0,
        specsEquipements,
        estDisponible: true,
      };
      addOrUpdateSalle(newSalle);
    } else if (resourceType === 'enseignant') {
      const newEns: Enseignant = {
        id: ensToEdit?.id || `ens-custom-${Date.now()}`,
        matricule,
        nom,
        prenom,
        email: email || `${prenom.toLowerCase()}.${nom.toLowerCase()}@emsi.ma`,
        telephone,
        specialite,
        typeContrat,
        heuresContractuellesSemaine: Number(heuresContractuelles),
        estActif: true,
        competencesModulesIds: ensToEdit?.competencesModulesIds || ['mod-iir-501'],
        disponibilites: ensToEdit?.disponibilites || [
          { jour: 'LUNDI', creneaux: ['S1_08H30', 'S2_10H15', 'S3_12H00', 'S4_13H45'] },
          { jour: 'MARDI', creneaux: ['S1_08H30', 'S2_10H15', 'S3_12H00', 'S4_13H45'] },
          { jour: 'MERCREDI', creneaux: ['S1_08H30', 'S2_10H15'] },
        ],
      };
      addOrUpdateEnseignant(newEns);
    } else if (resourceType === 'groupe') {
      const newGrp: Groupe = {
        id: grpToEdit?.id || `grp-custom-${Date.now()}`,
        codeGroupe,
        filiereId,
        optionId: optionId || undefined,
        anneeEtude: Number(anneeEtude),
        effectif: Number(effectif),
        delegueNom: delegueNom || 'Non renseigné',
        campusFixeId,
        laboratoiresRequis: laboRequis,
      };
      addOrUpdateGroupe(newGrp);
    }

    onClose();
  };

  const titles = {
    salle: itemToEdit ? 'Modifier la Salle' : 'Ajouter une Nouvelle Salle',
    enseignant: itemToEdit ? 'Modifier l’Enseignant' : 'Ajouter un Nouvel Enseignant',
    groupe: itemToEdit ? 'Modifier le Groupe' : 'Créer un Nouveau Groupe',
  };

  return (
    <>
      {/* MODAL HEADER */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emsi-primary flex items-center justify-center font-bold">
            {itemToEdit ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">{titles[resourceType]}</h3>
            <p className="text-[11px] text-slate-500">Formulaire interactif de démonstration</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* MODAL FORM */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
        {/* DISCLAIMER LOCAL STORAGE */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-[11px]">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Mode Démonstration :</span> Les données sont enregistrées
            instantanément dans l’état local React et le cache du navigateur. La synchronisation
            MySQL Spring Boot sera active en Phase 2.
          </div>
        </div>

        {/* FORMULAIRE SALLE */}
        {resourceType === 'salle' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Code / Nom de la Salle *</label>
                <input
                  type="text"
                  required
                  value={codeSalle}
                  onChange={(e) => setCodeSalle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs"
                  placeholder="Ex: Lab TP-04"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Rattaché *</label>
                <select
                  value={campusId}
                  onChange={(e) => setCampusId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs bg-white"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Type de Salle *</label>
                <select
                  value={typeSalle}
                  onChange={(e) => setTypeSalle(e.target.value as TypeSalle)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs bg-white"
                >
                  <option value="STANDARD">Salle Standard</option>
                  <option value="LI_PC">Lab Info PC</option>
                  <option value="LR_RESEAUX">Lab Réseaux Cisco</option>
                  <option value="AMPHI">Amphithéâtre</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Capacité (Places) *</label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  required
                  value={capacite}
                  onChange={(e) => setCapacite(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nb PC Équipés</label>
                <input
                  type="number"
                  min="0"
                  max={capacite}
                  value={nbPc}
                  onChange={(e) => setNbPc(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Étage / Emplacement</label>
              <input
                type="text"
                value={etage}
                onChange={(e) => setEtage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs"
                placeholder="Ex: 2ème Étage, Aile Nord"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Spécifications Équipements</label>
              <textarea
                rows={2}
                value={specsEquipements}
                onChange={(e) => setSpecsEquipements(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs"
                placeholder="Vidéoprojecteur 4K, Climatisation, Switch..."
              />
            </div>
          </>
        )}

        {/* FORMULAIRE ENSEIGNANT */}
        {resourceType === 'enseignant' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs"
                  placeholder="Ex: Tariq"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom de famille *</label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs"
                  placeholder="Ex: Bouzid"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Matricule EMSI *</label>
                <input
                  type="text"
                  required
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs font-mono"
                  placeholder="Ex: ENS-MRK-088"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Statut Contractuel *</label>
                <select
                  value={typeContrat}
                  onChange={(e) => {
                    const t = e.target.value as TypeContrat;
                    setTypeContrat(t);
                    if (t === 'PERMANENT') setHeuresContractuelles(18);
                    else setHeuresContractuelles(8);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs bg-white"
                >
                  <option value="PERMANENT">Permanent (Quota 18h)</option>
                  <option value="VACATAIRE">Vacataire (Priorité 1 Solveur)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Institutionnel</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs"
                  placeholder="prenom.nom@emsi.ma"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Heures Hebdo *</label>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={heuresContractuelles}
                  onChange={(e) => setHeuresContractuelles(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone de Contact</label>
                <input
                  type="text"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs"
                  placeholder="+212 6..."
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Spécialité Pédagogique *</label>
                <input
                  type="text"
                  required
                  value={specialite}
                  onChange={(e) => setSpecialite(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs"
                  placeholder="Ex: Intelligence Artificielle & MLOps"
                />
              </div>
            </div>
          </>
        )}

        {/* FORMULAIRE GROUPE */}
        {resourceType === 'groupe' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Code du Groupe *</label>
                <input
                  type="text"
                  required
                  value={codeGroupe}
                  onChange={(e) => setCodeGroupe(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs font-bold"
                  placeholder="Ex: 5IIR 2DSI G3"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Année d&apos;étude *</label>
                <select
                  value={anneeEtude}
                  onChange={(e) => setAnneeEtude(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs bg-white"
                >
                  <option value={3}>3e Année</option>
                  <option value={4}>4e Année</option>
                  <option value={5}>5e Année</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Effectif Étudiants *</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  required
                  value={effectif}
                  onChange={(e) => setEffectif(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Filière *</label>
                <select
                  value={filiereId}
                  onChange={(e) => setFiliereId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs bg-white"
                >
                  {filieres.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.codeFiliere} — {f.intitule}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Option (si 5e année)</label>
                <select
                  value={optionId}
                  onChange={(e) => setOptionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs bg-white"
                >
                  <option value="">Aucune option (Tronc commun)</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.codeOption} — {o.intitule}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Fixe *</label>
                <select
                  value={campusFixeId}
                  onChange={(e) => setCampusFixeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs bg-white"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Besoin Matériel</label>
                <select
                  value={laboRequis}
                  onChange={(e) => setLaboRequis(e.target.value as TypeSalle)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs bg-white"
                >
                  <option value="LI_PC">Labo Informatique PC</option>
                  <option value="LR_RESEAUX">Labo Réseaux Cisco</option>
                  <option value="STANDARD">Salle Standard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nom du Délégué</label>
              <input
                type="text"
                value={delegueNom}
                onChange={(e) => setDelegueNom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emsi-primary text-xs"
                placeholder="Ex: Yassine Tazi"
              />
            </div>
          </>
        )}

        {/* ACTIONS MODAL */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emsi-primary hover:bg-emsi-dark text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{itemToEdit ? 'Enregistrer les modifications' : 'Créer la ressource'}</span>
          </button>
        </div>
      </form>
    </>
  );
}
