class UserModel {
  final int? id;
  final String username;
  final String email;
  final String nom;
  final String prenom;
  final String role;
  final String? campusNom;
  final String? token;

  UserModel({
    this.id,
    required this.username,
    required this.email,
    required this.nom,
    required this.prenom,
    required this.role,
    this.campusNom,
    this.token,
  });

  String get fullName => '$prenom $nom'.trim().isEmpty ? username : '$prenom $nom';

  bool get isStudent => role == 'ROLE_ETUDIANT';
  bool get isTeacher => role == 'ROLE_PROFESSEUR_PERMANENT' || role == 'ROLE_PROFESSEUR_VACATAIRE';

  factory UserModel.fromJson(Map<String, dynamic> json, {String? token}) {
    return UserModel(
      id: json['id'] is int ? json['id'] : (json['userId'] is int ? json['userId'] : null),
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      nom: json['nom'] ?? '',
      prenom: json['prenom'] ?? '',
      role: json['role'] ?? '',
      campusNom: json['campusNom'] ?? (json['campus'] is Map ? json['campus']['nom'] : null),
      token: token ?? json['accessToken'] ?? json['token'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'username': username,
    'email': email,
    'nom': nom,
    'prenom': prenom,
    'role': role,
    'campusNom': campusNom,
    'token': token,
  };
}
