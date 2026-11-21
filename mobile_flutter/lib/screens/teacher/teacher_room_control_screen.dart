import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../models/examen_model.dart';
import '../../providers/teacher_provider.dart';

class TeacherRoomControlScreen extends StatefulWidget {
  final ExamenModel examen;

  const TeacherRoomControlScreen({super.key, required this.examen});

  @override
  State<TeacherRoomControlScreen> createState() => _TeacherRoomControlScreenState();
}

class _TeacherRoomControlScreenState extends State<TeacherRoomControlScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<TeacherProvider>(context, listen: false).loadRoomPlaces(widget.examen.id);
    });
  }

  void _showFraudeDialog(ExamenAffectationModel place) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: AppConstants.dangerRed),
            SizedBox(width: 8),
            Text('Signalement de Fraude', style: TextStyle(fontSize: 16)),
          ],
        ),
        content: Text(
          'Confirmez-vous le constat d\'une tentative de triche ou non-respect du plan de table pour l\'étudiant :\n\n'
          '${place.etudiantFullName} (${place.codePlace}) ?',
          style: const TextStyle(fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppConstants.dangerRed),
            onPressed: () async {
              Navigator.of(ctx).pop();
              final teacher = Provider.of<TeacherProvider>(context, listen: false);
              await teacher.updateStudentPresence(place.id, 'FRAUDE_SUSPECTEE');
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Fraude signalée et enregistrée avec succès.'),
                    backgroundColor: AppConstants.dangerRed,
                  ),
                );
              }
            },
            child: const Text('Confirmer Fraude', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final teacher = Provider.of<TeacherProvider>(context);
    final places = teacher.currentRoomPlaces;

    return Scaffold(
      backgroundColor: AppConstants.slateLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Salle ${widget.examen.salleCode} · Contrôle Anti-Triche',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppConstants.slateDark,
              ),
            ),
            Text(
              '${widget.examen.moduleCode} (${widget.examen.groupeCode})',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
                fontWeight: FontWeight.normal,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppConstants.slateDark),
            tooltip: 'Actualiser',
            onPressed: () => teacher.loadRoomPlaces(widget.examen.id),
          ),
        ],
      ),
      body: Column(
        children: [
          // Bannière de consignes anti-triche
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: Colors.green.shade50,
            child: Row(
              children: [
                const Icon(Icons.security_rounded, color: AppConstants.primaryGreen, size: 24),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Protocole Anti-Fraude EMSI',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppConstants.primaryDark,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Contrôlez l\'identité et exigez que chaque étudiant occupe strictement sa table assignée.',
                        style: TextStyle(fontSize: 11, color: Colors.green.shade900),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Liste des étudiants et tables
          Expanded(
            child: teacher.isLoadingPlaces
                ? const Center(child: CircularProgressIndicator(color: AppConstants.primaryGreen))
                : places.isEmpty
                    ? const Center(
                        child: Text(
                          'Aucune place attribuée pour cette épreuve.',
                          style: TextStyle(color: Colors.grey),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(14),
                        itemCount: places.length,
                        itemBuilder: (context, index) {
                          final p = places[index];
                          return _buildStudentCard(teacher, p);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildStudentCard(TeacherProvider teacher, ExamenAffectationModel p) {
    Color statusColor = Colors.grey.shade600;
    if (p.statutPresence == 'PRESENT') statusColor = AppConstants.primaryGreen;
    if (p.statutPresence == 'ABSENT') statusColor = AppConstants.dangerRed;
    if (p.statutPresence == 'FRAUDE_SUSPECTEE') statusColor = AppConstants.warningYellow;

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: p.statutPresence == 'FRAUDE_SUSPECTEE'
              ? AppConstants.dangerRed.withValues(alpha: 0.5)
              : AppConstants.borderGrey,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Row(
              children: [
                // Badge Table
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: p.estRadie ? Colors.red.shade50 : AppConstants.primaryGreen.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    p.estRadie ? 'RADIÉ' : p.codePlace,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: p.estRadie ? AppConstants.dangerRed : AppConstants.primaryDark,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        p.etudiantFullName,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppConstants.slateDark,
                        ),
                      ),
                      Text(
                        'Matricule : ${p.etudiantMatricule}',
                        style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ),
                // Statut Actuel
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    p.statutPresence,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: statusColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            const Divider(height: 1),
            const SizedBox(height: 8),

            // Boutons d'émargement rapides
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                _buildActionButton(
                  label: 'Présent',
                  color: AppConstants.primaryGreen,
                  isSelected: p.statutPresence == 'PRESENT',
                  onTap: () => teacher.updateStudentPresence(p.id, 'PRESENT'),
                ),
                const SizedBox(width: 8),
                _buildActionButton(
                  label: 'Absent',
                  color: AppConstants.dangerRed,
                  isSelected: p.statutPresence == 'ABSENT',
                  onTap: () => teacher.updateStudentPresence(p.id, 'ABSENT'),
                ),
                const SizedBox(width: 8),
                _buildActionButton(
                  label: 'Fraude !',
                  color: AppConstants.warningYellow,
                  isSelected: p.statutPresence == 'FRAUDE_SUSPECTEE',
                  onTap: () => _showFraudeDialog(p),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required String label,
    required Color color,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? color : color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: color.withValues(alpha: 0.4)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : color,
          ),
        ),
      ),
    );
  }
}
