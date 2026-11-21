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
      jour: json['jour'] ?? 'LUNDI',
      heureDebut: (json['heureDebut'] ?? '').toString().length >= 5
          ? (json['heureDebut'] as String).substring(0, 5)
          : (json['heureDebut'] ?? ''),
      heureFin: (json['heureFin'] ?? '').toString().length >= 5
          ? (json['heureFin'] as String).substring(0, 5)
          : (json['heureFin'] ?? ''),
      moduleIntitule: json['moduleIntitule'] ?? (json['module'] is Map ? json['module']['intitule'] : 'Module'),
      moduleCode: json['moduleCode'] ?? (json['module'] is Map ? json['module']['codeModule'] : ''),
      salleCode: json['salleCode'] ?? (json['salle'] is Map ? json['salle']['codeSalle'] : ''),
      enseignantNom: json['enseignantNom'] ?? (json['enseignant'] is Map ? '${json['enseignant']['prenom']} ${json['enseignant']['nom']}' : ''),
      groupeCode: json['groupeCode'] ?? (json['groupe'] is Map ? json['groupe']['codeGroupe'] : ''),
      typeSeance: json['typeSeance'] ?? 'COURS',
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
