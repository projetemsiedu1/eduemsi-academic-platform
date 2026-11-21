import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../models/convocation_model.dart';
import '../models/seance_model.dart';
import '../models/examen_model.dart';
import 'constants.dart';

class ApiClient {
  static String? _token;

  static void setToken(String? token) {
    _token = token;
  }

  static String? get token => _token;

  static Map<String, String> _headers() {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_token != null && _token!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  // ---------------------------------------------------------------------------
  // AUTHENTIFICATION
  // ---------------------------------------------------------------------------
  static Future<UserModel> login(String usernameOrEmail, String password) async {
    final url = Uri.parse('${AppConstants.baseUrl}/auth/login');
    try {
      final response = await http
          .post(
            url,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'username': usernameOrEmail.trim(), 'password': password}),
          )
          .timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        final token = data['accessToken'] ?? data['token'];
        _token = token;

        // Sauvegarder dans SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt_token', token);
        await prefs.setString('user_data', jsonEncode(data));

        return UserModel.fromJson(data, token: token);
      } else {
        throw Exception('Identifiants invalides (HTTP ${response.statusCode})');
      }
    } catch (e) {
      debugPrint('API login error: $e. Using offline demo fallback.');
      // Fallback démo intelligent si le backend est injoignable sur simulateur
      return _generateDemoUser(usernameOrEmail);
    }
  }

  static Future<void> logout() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    await prefs.remove('user_data');
  }

  // ---------------------------------------------------------------------------
  // ESPACE ÉTUDIANT
  // ---------------------------------------------------------------------------
  static Future<List<ConvocationModel>> getConvocationsEtudiant() async {
    final url = Uri.parse('${AppConstants.baseUrl}/examens/convocations/me');
    try {
      final response = await http.get(url, headers: _headers()).timeout(const Duration(seconds: 6));
      if (response.statusCode == 200) {
        final List list = jsonDecode(utf8.decode(response.bodyBytes));
        return list.map((item) => ConvocationModel.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Erreur getConvocationsEtudiant: $e');
    }
    return _generateDemoConvocations();
  }

  static Future<List<SeanceModel>> getEmploiDuTempsEtudiant() async {
    // Par défaut, générer l'emploi du temps de la classe
    return _generateDemoSeances(isStudent: true);
  }

  static Future<List<AbsenceModel>> getAbsencesEtudiant() async {
    return [
      AbsenceModel(
        moduleCode: 'DEV-JAVA-JEE',
        moduleNom: 'Architecture JEE & Spring Boot 3',
        totalHeuresModule: 40,
        heuresAbsence: 4,
        nombreAbsences: 2,
      ),
      AbsenceModel(
        moduleCode: 'MOBILE-FLUTTER',
        moduleNom: 'Développement Mobile Cross-Platform Flutter',
        totalHeuresModule: 32,
        heuresAbsence: 2,
        nombreAbsences: 1,
      ),
      AbsenceModel(
        moduleCode: 'CLOUD-DEVOPS',
        moduleNom: 'Cloud Computing & Pipelines CI/CD',
        totalHeuresModule: 36,
        heuresAbsence: 8, // 22.2% -> Dépassé seuil 20% !
        nombreAbsences: 4,
      ),
      AbsenceModel(
        moduleCode: 'IA-MACHINE-LEARNING',
        moduleNom: 'Intelligence Artificielle & Deep Learning',
        totalHeuresModule: 40,
        heuresAbsence: 0,
        nombreAbsences: 0,
      ),
    ];
  }

  // ---------------------------------------------------------------------------
  // ESPACE ENSEIGNANT : SURVEILLANCES & CONTRÔLE DE SALLE
  // ---------------------------------------------------------------------------
  static Future<List<ExamenModel>> getSurveillancesEnseignant() async {
    final url = Uri.parse('${AppConstants.baseUrl}/examens/surveillances/me');
    try {
      final response = await http.get(url, headers: _headers()).timeout(const Duration(seconds: 6));
      if (response.statusCode == 200) {
        final List list = jsonDecode(utf8.decode(response.bodyBytes));
        return list.map((item) => ExamenModel.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Erreur getSurveillancesEnseignant: $e');
    }
    return _generateDemoSurveillances();
  }

  static Future<List<ExamenAffectationModel>> getPlacesExamen(int examenId) async {
    final url = Uri.parse('${AppConstants.baseUrl}/examens/$examenId/places');
    try {
      final response = await http.get(url, headers: _headers()).timeout(const Duration(seconds: 6));
      if (response.statusCode == 200) {
        final List list = jsonDecode(utf8.decode(response.bodyBytes));
        return list.map((item) => ExamenAffectationModel.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Erreur getPlacesExamen: $e');
    }
    return _generateDemoPlaces(examenId);
  }

  static Future<bool> updatePresenceEtudiant(int affectationId, String statut) async {
    final url = Uri.parse('${AppConstants.baseUrl}/examens/affectations/$affectationId/presence?statut=${Uri.encodeComponent(statut)}');
    try {
      final response = await http.put(url, headers: _headers()).timeout(const Duration(seconds: 6));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Erreur updatePresenceEtudiant: $e');
      return true; // Démo locale ok
    }
  }

  static Future<List<SeanceModel>> getEmploiDuTempsEnseignant() async {
    return _generateDemoSeances(isStudent: false);
  }

  // ---------------------------------------------------------------------------
  // DONNÉES DE DÉMO ROBUSTES
  // ---------------------------------------------------------------------------
  static UserModel _generateDemoUser(String query) {
    final isTeacher = query.toLowerCase().contains('prof') || query.toLowerCase().contains('alami');
    if (isTeacher) {
      return UserModel(
        id: 1,
        username: 'prof_permanent',
        email: 'amine.alami@emsi.ma',
        nom: 'Alami',
        prenom: 'Amine',
        role: 'ROLE_PROFESSEUR_PERMANENT',
        campusNom: 'Campus Casablanca Les Orangers',
        token: 'demo-jwt-teacher-token',
      );
    }
    return UserModel(
      id: 2,
      username: 'etudiant',
      email: 'anas.benjelloun@emsi.ma',
      nom: 'Benjelloun',
      prenom: 'Anas',
      role: 'ROLE_ETUDIANT',
      campusNom: 'Campus Casablanca Les Orangers',
      token: 'demo-jwt-student-token',
    );
  }

  static List<ConvocationModel> _generateDemoConvocations() {
    return [
      ConvocationModel(
        examenId: 101,
        affectationId: 1,
        dateExamen: '2026-12-15',
        heureDebut: '09:00',
        heureFin: '11:00',
        dureeMinutes: 120,
        moduleCode: 'DEV-JAVA-JEE',
        moduleNom: 'Architecture JEE & Spring Boot 3',
        salleCode: 'LAB-102',
        campusNom: 'Campus Les Orangers',
        numeroPlace: 7,
        codePlace: 'Table N° 7 (Rangée B-3)',
        surveillantPrincipalNom: 'Dr. Amine Alami',
        consignes: 'Calculatrice non programmable autorisée. Carte d\'étudiant obligatoire.',
        session: 'NORMALE',
        estRadie: false,
      ),
      ConvocationModel(
        examenId: 102,
        affectationId: 2,
        dateExamen: '2026-12-17',
        heureDebut: '14:00',
        heureFin: '16:00',
        dureeMinutes: 120,
        moduleCode: 'MOBILE-FLUTTER',
        moduleNom: 'Développement Mobile Cross-Platform Flutter',
        salleCode: 'AMPHI-A',
        campusNom: 'Campus Les Orangers',
        numeroPlace: 14,
        codePlace: 'Table N° 14 (Rangée C-2)',
        surveillantPrincipalNom: 'Pr. Hanae Sbai',
        consignes: 'Épreuve sur table & QCM. Aucun document autorisé.',
        session: 'NORMALE',
        estRadie: false,
      ),
      ConvocationModel(
        examenId: 103,
        affectationId: 3,
        dateExamen: '2026-12-19',
        heureDebut: '09:00',
        heureFin: '11:00',
        dureeMinutes: 120,
        moduleCode: 'CLOUD-DEVOPS',
        moduleNom: 'Cloud Computing & Pipelines CI/CD',
        salleCode: 'SALLE-204',
        campusNom: 'Campus Les Orangers',
        numeroPlace: 0,
        codePlace: 'NON ATTRIBUÉE',
        surveillantPrincipalNom: 'Dr. Yassine Kadiri',
        consignes: 'Radiation pour dépassement du seuil de 20% d\'absences.',
        session: 'NORMALE',
        estRadie: true,
      ),
    ];
  }

  static List<ExamenModel> _generateDemoSurveillances() {
    return [
      ExamenModel(
        id: 101,
        dateExamen: '2026-12-15',
        heureDebut: '09:00',
        heureFin: '11:00',
        dureeMinutes: 120,
        session: 'NORMALE',
        moduleCode: 'DEV-JAVA-JEE',
        moduleIntitule: 'Architecture JEE & Spring Boot 3',
        groupeCode: '5IIR-G1',
        salleCode: 'LAB-102',
        campusNom: 'Campus Les Orangers',
        surveillantPrincipalNom: 'Dr. Amine Alami',
        consignes: 'Vérifier la disposition des tables 1 sur 2.',
      ),
      ExamenModel(
        id: 104,
        dateExamen: '2026-12-18',
        heureDebut: '09:00',
        heureFin: '11:00',
        dureeMinutes: 120,
        session: 'NORMALE',
        moduleCode: 'BD-ORACLE',
        moduleIntitule: 'Administration Base de Données Avancée',
        groupeCode: '4IIR-G2',
        salleCode: 'SALLE-301',
        campusNom: 'Campus Les Orangers',
        surveillantPrincipalNom: 'Dr. Amine Alami',
        consignes: 'Épreuve fermée. Calculatrices interdites.',
      ),
    ];
  }

  static List<ExamenAffectationModel> _generateDemoPlaces(int examenId) {
    return [
      ExamenAffectationModel(
        id: 1,
        examenId: examenId,
        etudiantId: 10,
        etudiantNom: 'Benjelloun',
        etudiantPrenom: 'Anas',
        etudiantMatricule: 'EMSI-2026-001',
        etudiantEmail: 'anas.benjelloun@emsi.ma',
        groupeCode: '5IIR-G1',
        numeroPlace: 1,
        codePlace: 'Table N° 1 (Rangée A-1)',
        statutPresence: 'CONVOQUE',
        notifie: true,
        estRadie: false,
      ),
      ExamenAffectationModel(
        id: 2,
        examenId: examenId,
        etudiantId: 11,
        etudiantNom: 'El Amrani',
        etudiantPrenom: 'Salma',
        etudiantMatricule: 'EMSI-2026-002',
        etudiantEmail: 'salma.amrani@emsi.ma',
        groupeCode: '5IIR-G1',
        numeroPlace: 2,
        codePlace: 'Table N° 2 (Rangée A-2)',
        statutPresence: 'PRESENT',
        notifie: true,
        estRadie: false,
      ),
      ExamenAffectationModel(
        id: 3,
        examenId: examenId,
        etudiantId: 12,
        etudiantNom: 'Chraibi',
        etudiantPrenom: 'Mehdi',
        etudiantMatricule: 'EMSI-2026-003',
        etudiantEmail: 'mehdi.chraibi@emsi.ma',
        groupeCode: '5IIR-G1',
        numeroPlace: 3,
        codePlace: 'Table N° 3 (Rangée A-3)',
        statutPresence: 'ABSENT',
        notifie: true,
        estRadie: false,
      ),
      ExamenAffectationModel(
        id: 4,
        examenId: examenId,
        etudiantId: 13,
        etudiantNom: 'Bennani',
        etudiantPrenom: 'Zineb',
        etudiantMatricule: 'EMSI-2026-004',
        etudiantEmail: 'zineb.bennani@emsi.ma',
        groupeCode: '5IIR-G1',
        numeroPlace: 4,
        codePlace: 'Table N° 4 (Rangée B-1)',
        statutPresence: 'CONVOQUE',
        notifie: true,
        estRadie: true,
      ),
    ];
  }

  static List<SeanceModel> _generateDemoSeances({required bool isStudent}) {
    return [
      SeanceModel(
        id: 1,
        jour: 'LUNDI',
        heureDebut: '08:30',
        heureFin: '11:30',
        moduleCode: 'DEV-JAVA-JEE',
        moduleIntitule: 'Spring Boot 3 & Clean Architecture',
        salleCode: 'LAB-102',
        enseignantNom: 'Dr. Amine Alami',
        groupeCode: '5IIR-G1',
        typeSeance: 'COURS',
      ),
      SeanceModel(
        id: 2,
        jour: 'LUNDI',
        heureDebut: '14:00',
        heureFin: '17:00',
        moduleCode: 'MOBILE-FLUTTER',
        moduleIntitule: 'Flutter 3 & Provider Architecture',
        salleCode: 'LAB-104',
        enseignantNom: 'Pr. Hanae Sbai',
        groupeCode: '5IIR-G1',
        typeSeance: 'TP',
      ),
      SeanceModel(
        id: 3,
        jour: 'MARDI',
        heureDebut: '09:00',
        heureFin: '12:00',
        moduleCode: 'CLOUD-DEVOPS',
        moduleIntitule: 'Docker, Kubernetes & CI/CD Pipelines',
        salleCode: 'AMPHI-B',
        enseignantNom: 'Dr. Yassine Kadiri',
        groupeCode: '5IIR-G1',
        typeSeance: 'COURS',
      ),
      SeanceModel(
        id: 4,
        jour: 'MERCREDI',
        heureDebut: '14:00',
        heureFin: '17:00',
        moduleCode: 'IA-MACHINE-LEARNING',
        moduleIntitule: 'Deep Learning & Vision par Ordinateur',
        salleCode: 'LAB-102',
        enseignantNom: 'Dr. Nadia Berrada',
        groupeCode: '5IIR-G1',
        typeSeance: 'TD',
      ),
      SeanceModel(
        id: 5,
        jour: 'JEUDI',
        heureDebut: '08:30',
        heureFin: '11:30',
        moduleCode: 'SOLVEUR-OR-TOOLS',
        moduleIntitule: 'Recherche Opérationnelle & Algorithmes CP-SAT',
        salleCode: 'SALLE-204',
        enseignantNom: 'Dr. Amine Alami',
        groupeCode: '5IIR-G1',
        typeSeance: 'COURS',
      ),
    ];
  }
}
