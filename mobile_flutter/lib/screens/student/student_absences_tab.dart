import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
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

    final totalHeuresManquees = student.absences.fold<int>(0, (sum, a) => sum + a.heuresAbsence);
    final radieCount = student.absences.where((a) => a.estEliminatoire).length;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // BANNIÈRE RÈGLEMENT EMSI AVEC ANIMATION LOTTIE
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFEFF6FF), Color(0xFFDBEAFE)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF93C5FD)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  height: 48,
                  width: 48,
                  child: Lottie.network(
                    'https://assets4.lottiefiles.com/packages/lf20_t24tpvcu.json',
                    errorBuilder: (_, __, ___) => const Icon(Icons.hourglass_top_rounded, color: Color(0xFF1D4ED8), size: 28),
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Règle d\'Assiduité EMSI (Seuil 20%)',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF1E3A8A),
                        ),
                      ),
                      SizedBox(height: 3),
                      Text(
                        'Tout étudiant dépassant 20% d\'absences non justifiées dans un module est automatiquement exclu de la session d\'examen.',
                        style: TextStyle(fontSize: 11, color: Color(0xFF1E40AF), height: 1.3),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // CARTES STATUT RÉCAPITULATIF
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Heures manquées', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                      const SizedBox(height: 2),
                      Text(
                        '${totalHeuresManquees}h',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: radieCount > 0 ? const Color(0xFFFEF2F2) : const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: radieCount > 0 ? const Color(0xFFFECACA) : const Color(0xFFA7F3D0),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Radiations',
                        style: TextStyle(
                          fontSize: 11,
                          color: radieCount > 0 ? const Color(0xFFB91C1C) : const Color(0xFF047857),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$radieCount module(s)',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: radieCount > 0 ? const Color(0xFFDC2626) : const Color(0xFF059669),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // LISTE DES MODULES AVEC GAUGES DE PROGRESSION
          ...student.absences.map((abs) => _buildAbsenceCard(abs)),
        ],
      ),
    );
  }

  Widget _buildAbsenceCard(AbsenceModel abs) {
    final taux = abs.tauxAbsence;
    final isElim = abs.estEliminatoire;
    final isWarning = abs.estAvertissement;

    Color progressColor = const Color(0xFF059669);
    if (isWarning) progressColor = const Color(0xFFD97706);
    if (isElim) progressColor = const Color(0xFFDC2626);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isElim ? const Color(0xFFFECACA) : const Color(0xFFE2E8F0),
          width: isElim ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        abs.moduleCode,
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        abs.moduleNom,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppConstants.slateDark,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: progressColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${taux.toStringAsFixed(1)}%',
                    style: TextStyle(
                      color: progressColor,
                      fontWeight: FontWeight.w800,
                      fontSize: 13,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '${abs.heuresAbsence}h manquées sur ${abs.totalHeuresModule}h (${abs.nombreAbsences} absences comptabilisées)',
              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 10),

            // Barre de progression vers le seuil des 20%
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: (taux / 100).clamp(0.0, 1.0),
                backgroundColor: const Color(0xFFF1F5F9),
                color: progressColor,
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 8),

            // Statut réglementaire
            if (isElim)
              const Row(
                children: [
                  Icon(Icons.cancel_rounded, color: AppConstants.dangerRed, size: 16),
                  SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Seuil dépassé (>20%) : Statut RADIÉ de l\'épreuve d\'examen.',
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
              const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Color(0xFFD97706), size: 16),
                  SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Attention : taux critique, risque imminent de radiation d\'examen.',
                      style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFFD97706),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              )
            else
              const Row(
                children: [
                  Icon(Icons.check_circle_rounded, color: AppConstants.primaryGreen, size: 16),
                  SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Assiduité conforme aux exigences pédagogiques.',
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
