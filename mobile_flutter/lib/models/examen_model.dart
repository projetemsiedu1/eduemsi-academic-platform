class ExamenModel {
  final int id;
  final String dateExamen;
  final String heureDebut;
  final String heureFin;
  final int dureeMinutes;
  final String session;
  final String moduleCode;
  final String moduleIntitule;
  final String groupeCode;
  final String salleCode;
  final String? campusNom;
  final String? surveillantPrincipalNom;
  final String? surveillantSecondaireNom;
  final String? consignes;

  ExamenModel({
    required this.id,
    required this.dateExamen,
    required this.heureDebut,
    required this.heureFin,
    required this.dureeMinutes,
    required this.session,
    required this.moduleCode,
    required this.moduleIntitule,
    required this.groupeCode,
    required this.salleCode,
    this.campusNom,
    this.surveillantPrincipalNom,
    this.surveillantSecondaireNom,
    this.consignes,
  });

  factory ExamenModel.fromJson(Map<String, dynamic> json) {
    return ExamenModel(
      id: json['id'] ?? 0,
      dateExamen: json['dateExamen'] ?? '',
      heureDebut: (json['heureDebut'] ?? '').toString().length >= 5
          ? (json['heureDebut'] as String).substring(0, 5)
          : (json['heureDebut'] ?? ''),
      heureFin: (json['heureFin'] ?? '').toString().length >= 5
          ? (json['heureFin'] as String).substring(0, 5)
          : (json['heureFin'] ?? ''),
      dureeMinutes: json['dureeMinutes'] ?? 120,
      session: json['session'] ?? 'NORMALE',
      moduleCode: json['moduleCode'] ?? '',
      moduleIntitule: json['moduleIntitule'] ?? '',
      groupeCode: json['groupeCode'] ?? '',
      salleCode: json['salleCode'] ?? '',
      campusNom: json['campusNom'],
      surveillantPrincipalNom: json['surveillantPrincipalNom'],
      surveillantSecondaireNom: json['surveillantSecondaireNom'],
      consignes: json['consignes'],
    );
  }
}

class ExamenAffectationModel {
  final int id;
  final int examenId;
  final int etudiantId;
  final String etudiantNom;
  final String etudiantPrenom;
  final String etudiantMatricule;
  final String etudiantEmail;
  final String groupeCode;
  final int numeroPlace;
  final String codePlace;
  String statutPresence; // CONVOQUE, PRESENT, ABSENT, FRAUDE_SUSPECTEE
  final bool notifie;
  final bool estRadie;

  ExamenAffectationModel({
    required this.id,
    required this.examenId,
    required this.etudiantId,
    required this.etudiantNom,
    required this.etudiantPrenom,
    required this.etudiantMatricule,
    required this.etudiantEmail,
    required this.groupeCode,
    required this.numeroPlace,
    required this.codePlace,
    required this.statutPresence,
    required this.notifie,
    required this.estRadie,
  });

  String get etudiantFullName => '$etudiantPrenom $etudiantNom';

  factory ExamenAffectationModel.fromJson(Map<String, dynamic> json) {
    return ExamenAffectationModel(
      id: json['id'] ?? 0,
      examenId: json['examenId'] ?? 0,
      etudiantId: json['etudiantId'] ?? 0,
      etudiantNom: json['etudiantNom'] ?? '',
      etudiantPrenom: json['etudiantPrenom'] ?? '',
      etudiantMatricule: json['etudiantMatricule'] ?? '',
      etudiantEmail: json['etudiantEmail'] ?? '',
      groupeCode: json['groupeCode'] ?? '',
      numeroPlace: json['numeroPlace'] ?? 0,
      codePlace: json['codePlace'] ?? '',
      statutPresence: json['statutPresence'] ?? 'CONVOQUE',
      notifie: json['notifie'] ?? true,
      estRadie: json['estRadie'] ?? false,
    );
  }
}
