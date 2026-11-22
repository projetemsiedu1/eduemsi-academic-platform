import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../models/pfe_model.dart';
import '../../providers/teacher_provider.dart';

class TeacherJurysTab extends StatelessWidget {
  const TeacherJurysTab({super.key});

  @override
  Widget build(BuildContext context) {
    final teacher = Provider.of<TeacherProvider>(context);

    if (teacher.isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppConstants.primaryGreen),
      );
    }

    if (teacher.mesJurys.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.workspace_premium_outlined, size: 54, color: Colors.grey.shade400),
              const SizedBox(height: 12),
              const Text(
                'Aucun jury PFE assigné',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppConstants.slateDark),
              ),
              const SizedBox(height: 6),
              Text(
                'Vos prochaines soutenances PFE (Président HDR, Rapporteur, Examinateur ou Encadrant) apparaîtront ici.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: teacher.mesJurys.length,
      itemBuilder: (context, index) => _buildJuryCard(teacher.mesJurys[index]),
    );
  }

  Widget _buildJuryCard(PfeModel p) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: AppConstants.borderGrey),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.deepPurple.shade50,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    p.monRoleJury ?? 'Membre du Jury',
                    style: TextStyle(color: Colors.deepPurple.shade700, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: p.pvVerrouille ? const Color(0xFFECFDF5) : Colors.amber.shade50,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    p.pvVerrouille
                        ? 'PV Verrouillé · ${p.noteFinale?.toStringAsFixed(2) ?? "-"}/20'
                        : 'Évals : ${p.nbEvaluations}/4',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: p.pvVerrouille ? AppConstants.primaryGreen : Colors.amber.shade900,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              p.titre,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppConstants.slateDark),
            ),
            const SizedBox(height: 4),
            Text(
              'Candidat(s) : ${p.binomeEtudiants} · ${p.filiereCode ?? ""}',
              style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(Icons.calendar_today_rounded, size: 14, color: AppConstants.primaryGreen),
                const SizedBox(width: 6),
                Text(
                  p.dateSoutenance != null
                      ? p.dateSoutenance!.replaceAll('T', ' ').substring(0, p.dateSoutenance!.length >= 16 ? 16 : p.dateSoutenance!.length)
                      : 'Date à confirmer',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
                const SizedBox(width: 14),
                const Icon(Icons.location_on_outlined, size: 14, color: AppConstants.primaryGreen),
                const SizedBox(width: 4),
                Text(
                  p.salleSoutenanceCode ?? 'Salle à définir',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
