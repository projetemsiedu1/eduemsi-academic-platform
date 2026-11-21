import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../models/convocation_model.dart';
import '../../providers/student_provider.dart';

class StudentConvocationsTab extends StatelessWidget {
  const StudentConvocationsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final student = Provider.of<StudentProvider>(context);

    if (student.isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppConstants.primaryGreen));
    }

    if (student.convocations.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.assignment_turned_in_outlined, size: 54, color: Colors.grey.shade400),
              const SizedBox(height: 12),
              const Text(
                'Aucune convocation d\'examen',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppConstants.slateDark),
              ),
              const SizedBox(height: 6),
              Text(
                'Vos épreuves et numéros de table apparaîtront dès que le calendrier sera publié.',
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
      itemCount: student.convocations.length,
      itemBuilder: (context, index) {
        final conv = student.convocations[index];
        return _buildConvocationCard(context, conv);
      },
    );
  }

  Widget _buildConvocationCard(BuildContext context, ConvocationModel conv) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(
          color: conv.estRadie ? AppConstants.dangerRed.withValues(alpha: 0.4) : AppConstants.borderGrey,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // En-tête de convocation
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: conv.estRadie ? AppConstants.dangerRed.withValues(alpha: 0.06) : Colors.grey.shade50,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
              border: Border(
                bottom: BorderSide(
                  color: conv.estRadie ? AppConstants.dangerRed.withValues(alpha: 0.2) : AppConstants.borderGrey,
                ),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.event_note_rounded,
                      size: 16,
                      color: conv.estRadie ? AppConstants.dangerRed : AppConstants.primaryGreen,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      conv.dateExamen,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: conv.session == 'NORMALE'
                        ? AppConstants.primaryGreen.withValues(alpha: 0.12)
                        : AppConstants.accentGold.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'Session ${conv.session}',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: conv.session == 'NORMALE' ? AppConstants.primaryGreen : AppConstants.accentGold,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Corps de convocation
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  conv.moduleNom,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppConstants.slateDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Code : ${conv.moduleCode}',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
                const SizedBox(height: 12),

                // BADGE NUMÉRO DE PLACE / TABLE ASSIGNÉE
                if (conv.estRadie)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.warning_amber_rounded, color: AppConstants.dangerRed, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'NON CONVOQUÉ(E) — Radié(e) pour dépassement de 20% d\'absences.',
                            style: TextStyle(
                              color: Colors.red.shade900,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppConstants.primaryGreen.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppConstants.primaryGreen.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.event_seat_rounded, color: AppConstants.primaryGreen, size: 22),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'PLACE D\'EXAMEN ASSIGNÉE',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: AppConstants.primaryDark,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                conv.codePlace,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: AppConstants.slateDark,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 12),

                // Détails : Horaires, Salle & Surveillant
                Row(
                  children: [
                    Expanded(
                      child: _buildDetailItem(
                        icon: Icons.access_time_rounded,
                        label: 'Horaire',
                        value: '${conv.heureDebut} - ${conv.heureFin} (${conv.dureeMinutes} min)',
                      ),
                    ),
                    Expanded(
                      child: _buildDetailItem(
                        icon: Icons.meeting_room_outlined,
                        label: 'Salle d\'examen',
                        value: '${conv.salleCode} (${conv.campusNom})',
                      ),
                    ),
                  ],
                ),

                if (conv.surveillantPrincipalNom != null) ...[
                  const SizedBox(height: 8),
                  _buildDetailItem(
                    icon: Icons.person_outline,
                    label: 'Surveillant responsable',
                    value: conv.surveillantPrincipalNom!,
                  ),
                ],

                if (conv.consignes != null && conv.consignes!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Consignes : ${conv.consignes}',
                    style: TextStyle(
                      fontSize: 11,
                      fontStyle: FontStyle.italic,
                      color: Colors.grey.shade700,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailItem({required IconData icon, required String label, required String value}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 13, color: Colors.grey),
            const SizedBox(width: 4),
            Text(label, style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppConstants.slateDark),
        ),
      ],
    );
  }
}
