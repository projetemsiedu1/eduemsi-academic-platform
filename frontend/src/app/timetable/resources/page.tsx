"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  DoorOpen,
  GraduationCap,
  BookOpen,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Laptop,
  MapPin,
} from "lucide-react";
import { useTimetable } from "@/context/TimetableContext";
import { TimetableHeader } from "@/components/timetable/TimetableHeader";
import { Modal } from "@/components/ui/modal";
import {
  ResourceModal,
  ModalResourceType,
} from "@/components/timetable/ResourceModal";
import { Salle, Enseignant, Groupe } from "@/types/timetable";

type TabType = "salles" | "enseignants" | "groupes" | "modules" | "campus";

export default function ResourcesManagementPage() {
  const {
    campuses,
    salles,
    enseignants,
    groupes,
    modules,
    filieres,
    options,
    elements,
    deleteSalle,
    deleteEnseignant,
    deleteGroupe,
  } = useTimetable();

  const [activeTab, setActiveTab] = useState<TabType>("salles");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampusFilter, setSelectedCampusFilter] = useState("ALL");
  const [selectedTypeSalleFilter, setSelectedTypeSalleFilter] = useState("ALL");
  const [selectedContratFilter, setSelectedContratFilter] = useState("ALL");

  const [removal, setRemoval] = useState<{
    kind: "salles" | "enseignants" | "groupes";
    id: string;
    label: string;
  } | null>(null);
  const { busy, clearFeedback, error } = useTimetable();
  async function removeResource() {
    if (!removal) return;
    const success = await {
      salles: deleteSalle,
      enseignants: deleteEnseignant,
      groupes: deleteGroupe,
    }[removal.kind](removal.id);
    if (success) setRemoval(null);
  }

  // État du modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalResourceType>("salle");
  const [itemToEdit, setItemToEdit] = useState<
    Salle | Enseignant | Groupe | null
  >(null);

  const openCreateModal = (type: ModalResourceType) => {
    clearFeedback();
    setModalType(type);
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (
    type: ModalResourceType,
    item: Salle | Enseignant | Groupe,
  ) => {
    setModalType(type);
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  // Filtrage Salles
  const filteredSalles = useMemo(() => {
    return salles.filter((s) => {
      const matchSearch =
        s.codeSalle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.etage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.specsEquipements.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCampus =
        selectedCampusFilter === "ALL" || s.campusId === selectedCampusFilter;
      const matchType =
        selectedTypeSalleFilter === "ALL" ||
        s.typeSalle === selectedTypeSalleFilter;
      return matchSearch && matchCampus && matchType;
    });
  }, [salles, searchQuery, selectedCampusFilter, selectedTypeSalleFilter]);

  // Filtrage Enseignants
  const filteredEnseignants = useMemo(() => {
    return enseignants.filter((e) => {
      const fullName = `${e.prenom} ${e.nom}`.toLowerCase();
      const matchSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        e.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.specialite.toLowerCase().includes(searchQuery.toLowerCase());
      const matchContrat =
        selectedContratFilter === "ALL" ||
        e.typeContrat === selectedContratFilter;
      return matchSearch && matchContrat;
    });
  }, [enseignants, searchQuery, selectedContratFilter]);

  // Filtrage Groupes
  const filteredGroupes = useMemo(() => {
    return groupes.filter((g) => {
      const matchSearch =
        g.codeGroupe.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.delegueNom.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCampus =
        selectedCampusFilter === "ALL" ||
        g.campusFixeId === selectedCampusFilter;
      return matchSearch && matchCampus;
    });
  }, [groupes, searchQuery, selectedCampusFilter]);

  // Filtrage Modules
  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      return (
        m.codeModule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.intitule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.semestre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [modules, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen">
      <TimetableHeader
        title="Gestion des Ressources Académiques"
        subtitle="Inventaire unifié des campus, salles, enseignants, filières, modules et groupes d'étudiants"
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* BANDEAU ONGLETS ET BOUTON D'ACTION AJOUT */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              aria-pressed={activeTab === "salles"}
              onClick={() => setActiveTab("salles")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "salles"
                  ? "bg-emsi-primary text-white "
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <DoorOpen className="w-4 h-4" />
              <span>Salles ({salles.length})</span>
            </button>

            <button
              aria-pressed={activeTab === "enseignants"}
              onClick={() => setActiveTab("enseignants")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "enseignants"
                  ? "bg-emsi-primary text-white "
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Enseignants ({enseignants.length})</span>
            </button>

            <button
              aria-pressed={activeTab === "groupes"}
              onClick={() => setActiveTab("groupes")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "groupes"
                  ? "bg-emsi-primary text-white "
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Groupes ({groupes.length})</span>
            </button>

            <button
              aria-pressed={activeTab === "modules"}
              onClick={() => setActiveTab("modules")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "modules"
                  ? "bg-emsi-primary text-white "
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Modules ({modules.length})</span>
            </button>

            <button
              aria-pressed={activeTab === "campus"}
              onClick={() => setActiveTab("campus")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "campus"
                  ? "bg-emsi-primary text-white "
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Campus ({campuses.length})</span>
            </button>
          </div>

          {/* BOUTON D'AJOUT RAPIDE ADAPTÉ À L'ONGLET */}
          <div className="flex items-center gap-2 shrink-0">
            {activeTab === "modules" && (
              <button
                onClick={() => openCreateModal("module")}
                className="planning-primary"
              >
                <Plus size={16} />
                Ajouter un module
              </button>
            )}
            {activeTab === "salles" && (
              <button
                onClick={() => openCreateModal("salle")}
                className="px-4 py-2 rounded-xl bg-emsi-primary hover:bg-emsi-dark text-white font-bold text-xs transition-all  flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une Salle</span>
              </button>
            )}
            {activeTab === "enseignants" && (
              <button
                onClick={() => openCreateModal("enseignant")}
                className="px-4 py-2 rounded-xl bg-emsi-primary hover:bg-emsi-dark text-white font-bold text-xs transition-all  flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Enseignant</span>
              </button>
            )}
            {activeTab === "groupes" && (
              <button
                onClick={() => openCreateModal("groupe")}
                className="px-4 py-2 rounded-xl bg-emsi-primary hover:bg-emsi-dark text-white font-bold text-xs transition-all  flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Créer un Groupe</span>
              </button>
            )}
          </div>
        </div>

        {/* BARRE DE RECHERCHE ET FILTRES DYNAMIQUES */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200  flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Rechercher une ressource"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, code, spécialité, étage ou matériel..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emsi-primary bg-slate-50/50"
            />
          </div>

          {/* FILTRES SECONDAIRES */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === "salles" && (
              <>
                <select
                  aria-label="Filtrer par campus"
                  value={selectedCampusFilter}
                  onChange={(e) => setSelectedCampusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
                >
                  <option value="ALL">Tous les Campus</option>
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Filtrer par type de salle"
                  value={selectedTypeSalleFilter}
                  onChange={(e) => setSelectedTypeSalleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
                >
                  <option value="ALL">Tous les Types de Salle</option>
                  <option value="STANDARD">Salles Standard</option>
                  <option value="LI_PC">Labs Informatique PC</option>
                  <option value="LR_RESEAUX">Labs Réseaux Cisco</option>
                  <option value="AMPHI">Amphithéâtres</option>
                </select>
              </>
            )}

            {activeTab === "enseignants" && (
              <select
                aria-label="Filtrer par contrat"
                value={selectedContratFilter}
                onChange={(e) => setSelectedContratFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="ALL">Tous les Statuts</option>
                <option value="PERMANENT">Permanents (18h)</option>
                <option value="VACATAIRE">Vacataires (Priorité 1)</option>
              </select>
            )}

            {activeTab === "groupes" && (
              <select
                value={selectedCampusFilter}
                onChange={(e) => setSelectedCampusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="ALL">Tous les Campus Fixes</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* CONTENU TABLEAUX SELON ONGLET */}
        <div className="bg-white rounded-2xl border border-slate-200  overflow-hidden">
          {/* 1. TABLEAU DES SALLES */}
          {activeTab === "salles" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold  ">
                    <th className="py-3.5 px-4">Salle &amp; Code</th>
                    <th className="py-3.5 px-4">Campus &amp; Étage</th>
                    <th className="py-3.5 px-4">Type de Salle</th>
                    <th className="py-3.5 px-4">Capacité / PC</th>
                    <th className="py-3.5 px-4">Équipements</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSalles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-slate-400"
                      >
                        Aucune salle ne correspond aux critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredSalles.map((salle) => {
                      const campus = campuses.find(
                        (c) => c.id === salle.campusId,
                      );
                      const isTp = salle.typeSalle === "LI_PC";

                      return (
                        <tr
                          key={salle.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <DoorOpen className="w-4 h-4 text-slate-400" />
                              <span>{salle.codeSalle}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">
                              {campus?.nom || "Campus"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {salle.etage}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs ${
                                isTp
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : salle.typeSalle === "AMPHI"
                                    ? "bg-slate-100 text-slate-800 border border-slate-200"
                                    : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {isTp && (
                                <Laptop className="w-3 h-3 text-emerald-600" />
                              )}
                              {salle.typeSalle}
                            </span>
                          </td>
                          <td className="py-3 px-4 tabular-nums">
                            <span className="font-bold text-slate-900">
                              {salle.capacite} places
                            </span>
                            {isTp && (
                              <span className="text-emerald-700 block text-xs font-semibold">
                                {salle.nombrePcOperationnels} PC Opérationnels
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-slate-600 text-xs">
                            {salle.specsEquipements}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal("salle", salle)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emsi-primary hover:bg-slate-100 transition-colors"
                                title="Modifier la salle"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setRemoval({
                                    kind: "salles",
                                    id: salle.id,
                                    label: salle.codeSalle,
                                  })
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Supprimer la salle"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. TABLEAU DES ENSEIGNANTS */}
          {activeTab === "enseignants" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold  ">
                    <th className="py-3.5 px-4">Enseignant &amp; Matricule</th>
                    <th className="py-3.5 px-4">Statut &amp; Quota</th>
                    <th className="py-3.5 px-4">Spécialité</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Disponibilités Déclarées</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEnseignants.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-slate-400"
                      >
                        Aucun enseignant trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredEnseignants.map((ens) => {
                      const isVacataire = ens.typeContrat === "VACATAIRE";

                      return (
                        <tr
                          key={ens.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">
                              Pr. {ens.prenom} {ens.nom}
                            </span>
                            <span className="text-xs tabular-nums text-slate-400">
                              {ens.matricule}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs ${
                                isVacataire
                                  ? "bg-slate-100 text-slate-800 border border-slate-200"
                                  : "bg-slate-100 text-slate-800 border border-slate-200"
                              }`}
                            >
                              {isVacataire ? "VACATAIRE (P1)" : "PERMANENT"}
                            </span>
                            <span className="text-xs text-slate-500 block mt-0.5">
                              {ens.heuresContractuellesSemaine}h / semaine
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {ens.specialite}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600">
                            <span className="block">{ens.email}</span>
                            <span className="text-slate-400">
                              {ens.telephone}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 flex-wrap max-w-xs">
                              {ens.disponibilites.map((d, i) => (
                                <span
                                  key={i}
                                  className="text-xs font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700"
                                >
                                  {d.jour.slice(0, 3)} ({d.creneaux.length}{" "}
                                  créneaux)
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal("enseignant", ens)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emsi-primary hover:bg-slate-100 transition-colors"
                                title="Modifier l’enseignant"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setRemoval({
                                    kind: "enseignants",
                                    id: ens.id,
                                    label: ens.prenom + " " + ens.nom,
                                  })
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Supprimer l’enseignant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. TABLEAU DES GROUPES */}
          {activeTab === "groupes" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold  ">
                    <th className="py-3.5 px-4">Code Groupe</th>
                    <th className="py-3.5 px-4">Filière &amp; Option</th>
                    <th className="py-3.5 px-4">Effectif</th>
                    <th className="py-3.5 px-4">Campus Assigné (Fixe)</th>
                    <th className="py-3.5 px-4">Délégué de Groupe</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGroupes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-slate-400"
                      >
                        Aucun groupe d’étudiants trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredGroupes.map((grp) => {
                      const filiere = filieres.find(
                        (f) => f.id === grp.filiereId,
                      );
                      const option = options.find((o) => o.id === grp.optionId);
                      const campus = campuses.find(
                        (c) => c.id === grp.campusFixeId,
                      );

                      return (
                        <tr
                          key={grp.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                            {grp.codeGroupe}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">
                              {filiere?.codeFiliere} — {grp.anneeEtude}e Année
                            </span>
                            {option && (
                              <span className="text-xs text-slate-500">
                                Option {option.codeOption} ({option.intitule})
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="tabular-nums font-bold text-slate-800">
                              {grp.effectif} étudiants
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                              <MapPin className="w-3 h-3 text-emsi-primary" />
                              {campus?.nom || "Campus"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {grp.delegueNom}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal("groupe", grp)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emsi-primary hover:bg-slate-100 transition-colors"
                                title="Modifier le groupe"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setRemoval({
                                    kind: "groupes",
                                    id: grp.id,
                                    label: grp.codeGroupe,
                                  })
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Supprimer le groupe"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. TABLEAU DES MODULES & ELEMENTS */}
          {activeTab === "modules" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold  ">
                    <th className="py-3.5 px-4">
                      Code &amp; Intitulé du Module
                    </th>
                    <th className="py-3.5 px-4">Filière &amp; Semestre</th>
                    <th className="py-3.5 px-4">Volume Horaire</th>
                    <th className="py-3.5 px-4">
                      Éléments Constituants &amp; Type de Salle Requis
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredModules.map((mod) => {
                    const modElements = elements.filter(
                      (el) => el.moduleId === mod.id,
                    );
                    const filiere = filieres.find(
                      (f) => f.id === mod.filiereId,
                    );

                    return (
                      <tr
                        key={mod.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block text-xs">
                            {mod.intitule}
                          </span>
                          <span className="text-xs tabular-nums text-slate-400 font-bold">
                            {mod.codeModule}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {filiere?.codeFiliere}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">
                            Semestre {mod.semestre}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 tabular-nums font-bold text-slate-800">
                          {mod.volumeHoraireTotal}h total
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1.5">
                            {modElements.map((el) => (
                              <div
                                key={el.id}
                                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs"
                              >
                                <span className="font-medium text-slate-800">
                                  {el.intitule}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="tabular-nums text-slate-500">
                                    {el.volumeHoraire}h
                                  </span>
                                  {el.necessitePc ? (
                                    <span className="inline-flex items-center gap-1 font-bold text-xs px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                      <Laptop className="w-2.5 h-2.5" />
                                      Lab PC Requis
                                    </span>
                                  ) : (
                                    <span className="font-bold text-xs px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                      {el.typeElement}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. VUE DES CAMPUS */}
          {activeTab === "campus" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {campuses.map((c) => {
                const campusSalles = salles.filter((s) => s.campusId === c.id);
                const campusGroupes = groupes.filter(
                  (g) => g.campusFixeId === c.id,
                );

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-semibold text-slate-900">
                          {c.nom}
                        </h4>
                        <span className="text-xs tabular-nums font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                          {c.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-emsi-primary shrink-0" />
                        {c.adresse}, {c.ville}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-200">
                      <p className="text-xs font-bold text-slate-400   mb-2">
                        Équipements &amp; Étage :
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {c.etages.map((etage, i) => (
                          <span
                            key={i}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700"
                          >
                            {etage}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4 text-center">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <span className="text-xs font-bold text-slate-400 block">
                            SALLES TOTALES
                          </span>
                          <span className="text-lg font-semibold text-slate-900">
                            {campusSalles.length}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                          <span className="text-xs font-bold text-slate-400 block">
                            GROUPES ASSIGNÉS
                          </span>
                          <span className="text-lg font-semibold text-emsi-primary">
                            {campusGroupes.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Modal
        open={Boolean(removal)}
        title="Supprimer la ressource"
        onClose={() => setRemoval(null)}
        busy={busy}
      >
        <div className="planning-resource-form">
          <p>
            Supprimer « {removal?.label} » ? Une ressource utilisée par des
            séances ne peut pas être supprimée.
          </p>
          {error && <p role="alert" className="planning-form-error">{error}</p>}
          <div className="planning-form-actions">
            <button onClick={() => setRemoval(null)} disabled={busy}>
              Annuler
            </button>
            <button
              className="planning-primary"
              disabled={busy}
              onClick={() => void removeResource()}
            >
              {busy ? "Suppression…" : "Supprimer"}
            </button>
          </div>
        </div>
      </Modal>
      {/* MODAL AJOUT / MODIFICATION RESSOURCE */}
      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resourceType={modalType}
        itemToEdit={itemToEdit}
      />
    </div>
  );
}
