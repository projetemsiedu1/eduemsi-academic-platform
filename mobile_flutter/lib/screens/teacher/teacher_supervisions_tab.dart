import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../models/examen_model.dart';
import '../../providers/teacher_provider.dart';
import 'teacher_room_control_screen.dart';

class TeacherSupervisionsTab extends StatelessWidget {
  const TeacherSupervisionsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final teacher = Provider.of<TeacherProvider>(context);

    if (teacher.isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppConstants.primaryGreen));
    }

    if (teacher.supervisions.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.shield_outlined, size: 54, color: Colors.grey.shade400),
              const SizedBox(height: 12),
              const Text(
                'Aucune surveillance assignée',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppConstants.slateDark),
              ),
              const SizedBox(height: 6),
              Text(
                'Les épreuves sous votre responsabilité apparaîtront ici avec la feuille de contrôle.',
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
      itemCount: teacher.supervisions.length,
      itemBuilder: (context, index) {
        final ex = teacher.supervisions[index];
        return _buildSupervisionCard(context, ex);
      },
    );
  }

  Widget _buildSupervisionCard(BuildContext context, ExamenModel ex) {
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
                Row(
                  children: [
                    const Icon(Icons.calendar_today_rounded, size: 14, color: AppConstants.primaryGreen),
                    const SizedBox(width: 6),
                    Text(
                      ex.dateExamen,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'Salle ${ex.salleCode}',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blue.shade800),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              ex.moduleIntitule,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: AppConstants.slateDark,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Groupe : ${ex.groupeCode} · Horaire : ${ex.heureDebut} - ${ex.heureFin}',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 14),

            // Bouton vers feuille de contrôle
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.fact_check_outlined, size: 18),
                label: const Text('Contrôler la salle & émarger', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryGreen,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => TeacherRoomControlScreen(examen: ex),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
