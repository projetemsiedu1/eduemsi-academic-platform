class ConvocationModel {
  final int examenId;
  final int affectationId;
  final String dateExamen;
  final String heureDebut;
  final String heureFin;
  final int dureeMinutes;
  final String moduleCode;
  final String moduleNom;
  final String salleCode;
  final String campusNom;
  final int numeroPlace;
  final String codePlace;
  final String? surveillantPrincipalNom;
  final String? consignes;
  final String session;
  final bool estRadie;

  ConvocationModel({
    required this.examenId,
    required this.affectationId,
    required this.dateExamen,
    required this.heureDebut,
    required this.heureFin,
    required this.dureeMinutes,
    required this.moduleCode,
    required this.moduleNom,
    required this.salleCode,
    required this.campusNom,
    required this.numeroPlace,
    required this.codePlace,
    this.surveillantPrincipalNom,
    this.consignes,
    required this.session,
    required this.estRadie,
  });

  factory ConvocationModel.fromJson(Map<String, dynamic> json) {
    return ConvocationModel(
      examenId: json['examenId'] ?? 0,
      affectationId: json['affectationId'] ?? 0,
      dateExamen: json['dateExamen'] ?? '',
      heureDebut: (json['heureDebut'] ?? '').toString().length >= 5
          ? (json['heureDebut'] as String).substring(0, 5)
          : (json['heureDebut'] ?? ''),
      heureFin: (json['heureFin'] ?? '').toString().length >= 5
          ? (json['heureFin'] as String).substring(0, 5)
          : (json['heureFin'] ?? ''),
      dureeMinutes: json['dureeMinutes'] ?? 120,
      moduleCode: json['moduleCode'] ?? '',
      moduleNom: json['moduleNom'] ?? '',
      salleCode: json['salleCode'] ?? '',
      campusNom: json['campusNom'] ?? '',
      numeroPlace: json['numeroPlace'] ?? 0,
      codePlace: json['codePlace'] ?? '',
      surveillantPrincipalNom: json['surveillantPrincipalNom'],
      consignes: json['consignes'],
      session: json['session'] ?? 'NORMALE',
      estRadie: json['estRadie'] ?? false,
    );
  }
}
