import 'package:flutter/foundation.dart';
import '../core/api_client.dart';
import '../models/convocation_model.dart';
import '../models/pfe_model.dart';
import '../models/seance_model.dart';

class StudentProvider extends ChangeNotifier {
  List<SeanceModel> _seances = [];
  List<ConvocationModel> _convocations = [];
  List<AbsenceModel> _absences = [];
  List<Map<String, dynamic>> _notifications = [];
  PfeModel? _monPfe;
  bool _isLoading = false;

  List<SeanceModel> get seances => _seances;
  List<ConvocationModel> get convocations => _convocations;
  List<AbsenceModel> get absences => _absences;
  List<Map<String, dynamic>> get notifications => _notifications;
  PfeModel? get monPfe => _monPfe;
  int get unreadNotificationsCount => _notifications.where((n) => n['lu'] == false).length;
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
        ApiClient.getNotifications(),
        ApiClient.getMonPfe(),
      ]);

      _seances = results[0] as List<SeanceModel>;
      _convocations = results[1] as List<ConvocationModel>;
      _absences = results[2] as List<AbsenceModel>;
      _notifications = results[3] as List<Map<String, dynamic>>;
      _monPfe = results[4] as PfeModel?;
    } catch (e) {
      debugPrint('Erreur StudentProvider: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markNotificationAsRead(int id) async {
    final success = await ApiClient.marquerNotificationLue(id);
    if (success) {
      final index = _notifications.indexWhere((n) => n['id'] == id);
      if (index != -1) {
        _notifications[index]['lu'] = true;
        notifyListeners();
      }
    }
  }
}
