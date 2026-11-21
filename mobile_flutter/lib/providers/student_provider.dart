import 'package:flutter/foundation.dart';
import '../core/api_client.dart';
import '../models/convocation_model.dart';
import '../models/seance_model.dart';

class StudentProvider extends ChangeNotifier {
  List<SeanceModel> _seances = [];
  List<ConvocationModel> _convocations = [];
  List<AbsenceModel> _absences = [];
  bool _isLoading = false;

  List<SeanceModel> get seances => _seances;
  List<ConvocationModel> get convocations => _convocations;
  List<AbsenceModel> get absences => _absences;
  bool get isLoading => _isLoading;

  List<SeanceModel> getSeancesByDay(String jour) {
    return _seances.where((s) => s.jour.toUpperCase() == jour.toUpperCase()).toList();
  }

  Future<void> loadData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final results = await Future.wait([
        ApiClient.getEmploiDuTempsEtudiant(),
        ApiClient.getConvocationsEtudiant(),
        ApiClient.getAbsencesEtudiant(),
      ]);

      _seances = results[0] as List<SeanceModel>;
      _convocations = results[1] as List<ConvocationModel>;
      _absences = results[2] as List<AbsenceModel>;
    } catch (e) {
      debugPrint('Erreur StudentProvider: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
