class SeanceModel {
  final int id;
  final String jour; // LUNDI, MARDI, etc.
  final String heureDebut;
  final String heureFin;
  final String moduleIntitule;
  final String moduleCode;
  final String salleCode;
  final String enseignantNom;
  final String groupeCode;
  final String typeSeance; // COURS, TP, TD

  SeanceModel({
    required this.id,
    required this.jour,
    required this.heureDebut,
    required this.heureFin,
    required this.moduleIntitule,
    required this.moduleCode,
    required this.salleCode,
    required this.enseignantNom,
    required this.groupeCode,
    required this.typeSeance,
  });

  factory SeanceModel.fromJson(Map<String, dynamic> json) {
    return SeanceModel(
      id: json['id'] ?? 0,
      jour: json['jourSemaine'] ?? json['jour'] ?? 'LUNDI',
      heureDebut: (json['horaireDebut'] ?? json['heureDebut'] ?? '08:30').toString().length >= 5
          ? (json['horaireDebut'] ?? json['heureDebut'] ?? '08:30').toString().substring(0, 5)
          : (json['horaireDebut'] ?? json['heureDebut'] ?? '08:30').toString(),
      heureFin: (json['horaireFin'] ?? json['heureFin'] ?? '10:00').toString().length >= 5
          ? (json['horaireFin'] ?? json['heureFin'] ?? '10:00').toString().substring(0, 5)
          : (json['horaireFin'] ?? json['heureFin'] ?? '10:00').toString(),
      moduleIntitule: json['elementModuleIntitule'] ?? json['moduleNom'] ?? json['moduleIntitule'] ?? 'Module',
      moduleCode: json['elementModuleCode'] ?? json['moduleCode'] ?? '',
      salleCode: json['salleCode'] ?? (json['salle'] is Map ? json['salle']['codeSalle'] : ''),
      enseignantNom: json['enseignantNom'] ?? (json['enseignant'] is Map ? '${json['enseignant']['prenom']} ${json['enseignant']['nom']}' : ''),
      groupeCode: json['groupeNom'] ?? json['groupeCode'] ?? (json['groupe'] is Map ? json['groupe']['codeGroupe'] : ''),
      typeSeance: json['typeSalle'] == 'LI_PC' ? 'TP' : (json['typeSeance'] ?? 'COURS'),
    );
  }
}

class AbsenceModel {
  final String moduleCode;
  final String moduleNom;
  final int totalHeuresModule;
  final int heuresAbsence;
  final int nombreAbsences;
  final bool estJustifiee;

  AbsenceModel({
    required this.moduleCode,
    required this.moduleNom,
    required this.totalHeuresModule,
    required this.heuresAbsence,
    required this.nombreAbsences,
    this.estJustifiee = false,
  });

  double get tauxAbsence => totalHeuresModule > 0 ? (heuresAbsence / totalHeuresModule) * 100 : 0.0;
  bool get estEliminatoire => tauxAbsence >= 20.0;
  bool get estAvertissement => tauxAbsence >= 15.0 && tauxAbsence < 20.0;
}
