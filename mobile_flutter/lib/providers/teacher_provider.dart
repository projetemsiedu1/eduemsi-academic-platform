import 'package:flutter/foundation.dart';
import '../core/api_client.dart';
import '../models/examen_model.dart';
import '../models/seance_model.dart';

class TeacherProvider extends ChangeNotifier {
  List<SeanceModel> _seances = [];
  List<ExamenModel> _supervisions = [];
  List<ExamenAffectationModel> _currentRoomPlaces = [];
  bool _isLoading = false;
  bool _isLoadingPlaces = false;

  List<SeanceModel> get seances => _seances;
  List<ExamenModel> get supervisions => _supervisions;
  List<ExamenAffectationModel> get currentRoomPlaces => _currentRoomPlaces;
  bool get isLoading => _isLoading;
  bool get isLoadingPlaces => _isLoadingPlaces;

  Future<void> loadData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final results = await Future.wait([
        ApiClient.getEmploiDuTempsEnseignant(),
        ApiClient.getSurveillancesEnseignant(),
      ]);

      _seances = results[0] as List<SeanceModel>;
      _supervisions = results[1] as List<ExamenModel>;
    } catch (e) {
      debugPrint('Erreur TeacherProvider: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadRoomPlaces(int examenId) async {
    _isLoadingPlaces = true;
    notifyListeners();

    try {
      _currentRoomPlaces = await ApiClient.getPlacesExamen(examenId);
    } catch (e) {
      debugPrint('Erreur loadRoomPlaces: $e');
    } finally {
      _isLoadingPlaces = false;
      notifyListeners();
    }
  }

  Future<bool> updateStudentPresence(int affectationId, String statut) async {
    final success = await ApiClient.updatePresenceEtudiant(affectationId, statut);
    if (success) {
      final index = _currentRoomPlaces.indexWhere((p) => p.id == affectationId);
      if (index != -1) {
        _currentRoomPlaces[index].statutPresence = statut;
        notifyListeners();
      }
    }
    return success;
  }
}
