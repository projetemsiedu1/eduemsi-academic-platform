import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../models/seance_model.dart';
import '../../providers/student_provider.dart';

class StudentAbsencesTab extends StatelessWidget {
  const StudentAbsencesTab({super.key});

  @override
  Widget build(BuildContext context) {
    final student = Provider.of<StudentProvider>(context);

    if (student.isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppConstants.primaryGreen));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Bannière explicative règle 20% EMSI
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.blue.shade200),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline_rounded, color: Colors.blue.shade800, size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Règlement des Absences EMSI',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue.shade900,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Tout étudiant dépassant 20% d\'absences non justifiées dans un module est automatiquement radié de la session d\'examen correspondante.',
                        style: TextStyle(fontSize: 11, color: Colors.blue.shade900),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Liste des modules
          ...student.absences.map((abs) => _buildAbsenceCard(abs)),
        ],
      ),
    );
  }

  Widget _buildAbsenceCard(AbsenceModel abs) {
    final taux = abs.tauxAbsence;
    final isElim = abs.estEliminatoire;
    final isWarning = abs.estAvertissement;

    Color progressColor = AppConstants.primaryGreen;
    if (isWarning) progressColor = AppConstants.warningYellow;
    if (isElim) progressColor = AppConstants.dangerRed;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: isElim ? AppConstants.dangerRed.withValues(alpha: 0.4) : AppConstants.borderGrey,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    abs.moduleNom,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppConstants.slateDark,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: progressColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${taux.toStringAsFixed(1)}%',
                    style: TextStyle(
                      color: progressColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              '${abs.heuresAbsence}h manquées sur un volume de ${abs.totalHeuresModule}h (${abs.nombreAbsences} séances)',
              style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 10),

            // Barre de progression vers le seuil des 20%
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: (taux / 100).clamp(0.0, 1.0),
                backgroundColor: Colors.grey.shade200,
                color: progressColor,
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 8),

            // Statut réglementaire
            if (isElim)
              Row(
                children: [
                  const Icon(Icons.cancel_outlined, color: AppConstants.dangerRed, size: 14),
                  const SizedBox(width: 4),
                  const Expanded(
                    child: Text(
                      'Seuil des 20% dépassé : Statut RADIÉ de l\'épreuve d\'examen.',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppConstants.dangerRed,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              )
            else if (isWarning)
              Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: AppConstants.warningYellow, size: 14),
                  const SizedBox(width: 4),
                  const Expanded(
                    child: Text(
                      'Attention : taux critique, risque imminent de radiation d\'examen.',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppConstants.warningYellow,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              )
            else
              Row(
                children: [
                  const Icon(Icons.check_circle_outline_rounded, color: AppConstants.primaryGreen, size: 14),
                  const SizedBox(width: 4),
                  const Expanded(
                    child: Text(
                      'Assiduité conforme aux exigences académiques.',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppConstants.primaryGreen,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
