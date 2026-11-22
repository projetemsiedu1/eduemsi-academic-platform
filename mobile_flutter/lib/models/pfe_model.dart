class JuryMember {
  final String role;
  final String nom;

  const JuryMember({required this.role, required this.nom});
}

class PfeModel {
  final int id;
  final String titre;
  final String resume;
  final String? technologiesCles;
  final String binomeEtudiants;
  final String statut;
  final String? filiereCode;
  final String? entrepriseAccueil;
  final String? commentaireValidation;
  final double? noteFinale;
  final String? mention;
  final bool pvVerrouille;
  final int nbEvaluations;
  final String? monRoleJury;
  final double? maNoteSaisie;
  final String? salleSoutenanceCode;
  final String? dateSoutenance;
  final List<JuryMember> juryMembers;

  PfeModel({
    required this.id,
    required this.titre,
    required this.resume,
    this.technologiesCles,
    required this.binomeEtudiants,
    required this.statut,
    this.filiereCode,
    this.entrepriseAccueil,
    this.commentaireValidation,
    this.noteFinale,
    this.mention,
    this.pvVerrouille = false,
    this.nbEvaluations = 0,
    this.monRoleJury,
    this.maNoteSaisie,
    this.salleSoutenanceCode,
    this.dateSoutenance,
    this.juryMembers = const [],
  });

  factory PfeModel.fromJson(Map<String, dynamic> json) {
    final List<JuryMember> members = [];
    void addMember(String role, dynamic nom) {
      if (nom != null && nom.toString().trim().isNotEmpty) {
        members.add(JuryMember(role: role, nom: nom.toString()));
      }
    }

    addMember('Président HDR', json['presidentHdrNom']);
    addMember('Rapporteur', json['rapporteurNom']);
    addMember('Examinateur IA', json['examinateurIaNom']);
    addMember('Encadrant', json['encadrantNom']);

    return PfeModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      titre: (json['titre'] ?? 'Projet PFE').toString(),
      resume: (json['resume'] ?? '').toString(),
      technologiesCles: json['technologiesCles']?.toString(),
      binomeEtudiants: (json['binomeEtudiants'] ?? '').toString(),
      statut: (json['statut'] ?? 'SOUMIS').toString(),
      filiereCode: json['filiereCode']?.toString(),
      entrepriseAccueil: json['entrepriseAccueil']?.toString(),
      commentaireValidation: json['commentaireValidation']?.toString(),
      noteFinale: (json['noteFinale'] as num?)?.toDouble(),
      mention: json['mention']?.toString(),
      pvVerrouille: json['pvVerrouille'] == true,
      nbEvaluations: (json['nbEvaluations'] as num?)?.toInt() ?? 0,
      monRoleJury: json['monRoleJury']?.toString(),
      maNoteSaisie: (json['maNoteSaisie'] as num?)?.toDouble(),
      salleSoutenanceCode: json['salleSoutenanceCode']?.toString(),
      dateSoutenance: json['dateSoutenance']?.toString(),
      juryMembers: members,
    );
  }
}
