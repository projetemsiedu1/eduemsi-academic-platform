import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
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
              SizedBox(
                height: 120,
                width: 120,
                child: Lottie.network(
                  'https://assets2.lottiefiles.com/packages/lf20_ndj9wbwq.json',
                  errorBuilder: (_, __, ___) => const Icon(
                    Icons.assignment_turned_in_outlined,
                    size: 54,
                    color: Colors.grey,
                  ),
                ),
              ),
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
        return _buildConvocationCard(context, conv, index);
      },
    );
  }

  Widget _buildConvocationCard(BuildContext context, ConvocationModel conv, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: conv.estRadie ? const Color(0xFFFECACA) : const Color(0xFFE2E8F0),
          width: conv.estRadie ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // En-tête de convocation
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: conv.estRadie ? const Color(0xFFFFF1F2) : const Color(0xFFF8FAFC),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              border: Border(
                bottom: BorderSide(
                  color: conv.estRadie ? const Color(0xFFFECACA) : const Color(0xFFE2E8F0),
                ),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.event_available_rounded,
                      size: 18,
                      color: conv.estRadie ? AppConstants.dangerRed : AppConstants.primaryGreen,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      conv.dateExamen,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppConstants.slateDark),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: conv.session == 'NORMALE'
                        ? const Color(0xFFECFDF5)
                        : const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: conv.session == 'NORMALE'
                          ? const Color(0xFFA7F3D0)
                          : const Color(0xFFFDE68A),
                    ),
                  ),
                  child: Text(
                    'Session ${conv.session}',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: conv.session == 'NORMALE'
                          ? const Color(0xFF047857)
                          : const Color(0xFFB45309),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Corps de convocation
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  conv.moduleNom,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppConstants.slateDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Code module : ${conv.moduleCode}',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 14),

                // BADGE NUMÉRO DE TABLE ASSIGNÉE (AVEC PULSE & CONTRÔLE ANTI-TRICHE)
                if (conv.estRadie)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFFCA5A5)),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.warning_amber_rounded, color: AppConstants.dangerRed, size: 22),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'NON CONVOQUÉ(E) — Radié(e) pour dépassement du seuil de 20% d\'absences.',
                            style: TextStyle(
                              color: Color(0xFF991B1B),
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
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFECFDF5), Color(0xFFF0FDF4)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF6EE7B7)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF059669),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.event_seat_rounded, color: Colors.white, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Text(
                                    'NUMÉRO DE TABLE (ANTI-TRICHE)',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFF065F46),
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  SizedBox(width: 6),
                                  Icon(Icons.verified_rounded, size: 14, color: Color(0xFF059669)),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                conv.codePlace,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 14),

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
                  const SizedBox(height: 10),
                  _buildDetailItem(
                    icon: Icons.person_pin_circle_outlined,
                    label: 'Surveillant responsable',
                    value: conv.surveillantPrincipalNom!,
                  ),
                ],

                if (conv.consignes != null && conv.consignes!.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Text(
                      'ℹ️ Consignes : ${conv.consignes}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontStyle: FontStyle.italic,
                        color: Color(0xFF475569),
                      ),
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
            Icon(icon, size: 14, color: const Color(0xFF64748B)),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          ],
        ),
        const SizedBox(height: 3),
        Text(
          value,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppConstants.slateDark),
        ),
      ],
    );
  }
}
