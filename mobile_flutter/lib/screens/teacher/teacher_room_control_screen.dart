import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: AppConstants.dangerRed),
            SizedBox(width: 8),
            Text('Signalement de Fraude', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          'Confirmez-vous le constat d\'une tentative de triche ou non-respect du plan de table pour l\'étudiant :\n\n'
          '${place.etudiantFullName} (${place.codePlace}) ?\n\n'
          'Cette action sera enregistrée officiellement dans le système académique EMSI.',
          style: const TextStyle(fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Annuler', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppConstants.dangerRed,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () async {
              Navigator.of(ctx).pop();
              final teacher = Provider.of<TeacherProvider>(context, listen: false);
              await teacher.updateStudentPresence(place.id, 'FRAUDE_SUSPECTEE');
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('⚠️ Fraude signalée et transmise à l\'administration avec succès.'),
                    backgroundColor: AppConstants.dangerRed,
                  ),
                );
              }
            },
            child: const Text('Confirmer Fraude', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final teacher = Provider.of<TeacherProvider>(context);
    final places = teacher.currentRoomPlaces;

    final presentsCount = places.where((p) => p.statutPresence == 'PRESENT').length;
    final absentsCount = places.where((p) => p.statutPresence == 'ABSENT').length;
    final fraudesCount = places.where((p) => p.statutPresence == 'FRAUDE_SUSPECTEE').length;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Salle ${widget.examen.salleCode} · Émargement & Contrôle',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppConstants.slateDark,
              ),
            ),
            Text(
              '${widget.examen.moduleCode} (${widget.examen.groupeCode})',
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF64748B),
                fontWeight: FontWeight.normal,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppConstants.slateDark),
            tooltip: 'Actualiser la liste',
            onPressed: () => teacher.loadRoomPlaces(widget.examen.id),
          ),
        ],
      ),
      body: Column(
        children: [
          // BANNIÈRE PROTOCOLE SÉCURITÉ & ANIMATION LOTTIE
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFECFDF5),
              border: Border(bottom: BorderSide(color: Color(0xFFA7F3D0))),
            ),
            child: Row(
              children: [
                SizedBox(
                  height: 44,
                  width: 44,
                  child: Lottie.network(
                    'https://assets1.lottiefiles.com/packages/lf20_jbrwutsd.json',
                    errorBuilder: (_, __, ___) => Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: Color(0xFF059669),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.security_rounded, color: Colors.white, size: 20),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Protocole Anti-Fraude EMSI en Rigueur',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF065F46),
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Vérifiez la carte d\'étudiant et exigez l\'occupation stricte de la table assignée (1 siège d\'écart).',
                        style: TextStyle(fontSize: 11, color: Color(0xFF047857)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // COMPTEURS RAPIDES EN PILULES
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: Colors.white,
            child: Row(
              children: [
                _buildStatPill('Total : ${places.length}', const Color(0xFFF1F5F9), const Color(0xFF334155)),
                const SizedBox(width: 8),
                _buildStatPill('$presentsCount Présents', const Color(0xFFECFDF5), const Color(0xFF047857)),
                const SizedBox(width: 8),
                _buildStatPill('$absentsCount Absents', const Color(0xFFFEF2F2), const Color(0xFFDC2626)),
                const SizedBox(width: 8),
                if (fraudesCount > 0)
                  _buildStatPill('$fraudesCount Fraude(s)', const Color(0xFFFEF3C7), const Color(0xFFB45309)),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          // LISTE DES ÉTUDIANTS ET TABLES
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

  Widget _buildStatPill(String label, Color bg, Color text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: text),
      ),
    );
  }

  Widget _buildStudentCard(TeacherProvider teacher, ExamenAffectationModel p) {
    Color statusColor = const Color(0xFF64748B);
    Color statusBg = const Color(0xFFF1F5F9);

    if (p.statutPresence == 'PRESENT') {
      statusColor = const Color(0xFF047857);
      statusBg = const Color(0xFFECFDF5);
    } else if (p.statutPresence == 'ABSENT') {
      statusColor = const Color(0xFFDC2626);
      statusBg = const Color(0xFFFEF2F2);
    } else if (p.statutPresence == 'FRAUDE_SUSPECTEE') {
      statusColor = const Color(0xFFB45309);
      statusBg = const Color(0xFFFEF3C7);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: p.statutPresence == 'FRAUDE_SUSPECTEE'
              ? const Color(0xFFFCA5A5)
              : const Color(0xFFE2E8F0),
          width: p.statutPresence == 'FRAUDE_SUSPECTEE' ? 1.5 : 1,
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
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Row(
              children: [
                // Badge Table
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: p.estRadie ? const Color(0xFFFEF2F2) : const Color(0xFFF0FDF4),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: p.estRadie ? const Color(0xFFFECACA) : const Color(0xFFA7F3D0),
                    ),
                  ),
                  child: Text(
                    p.estRadie ? 'RADIÉ (>20%)' : p.codePlace,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: p.estRadie ? const Color(0xFFDC2626) : const Color(0xFF065F46),
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
                        style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
                // Statut Actuel
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusBg,
                    borderRadius: BorderRadius.circular(20),
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
            const Divider(height: 1, color: Color(0xFFF1F5F9)),
            const SizedBox(height: 8),

            // Boutons d'émargement rapides
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                _buildActionButton(
                  label: 'Présent',
                  color: const Color(0xFF059669),
                  isSelected: p.statutPresence == 'PRESENT',
                  onTap: () => teacher.updateStudentPresence(p.id, 'PRESENT'),
                ),
                const SizedBox(width: 8),
                _buildActionButton(
                  label: 'Absent',
                  color: const Color(0xFFDC2626),
                  isSelected: p.statutPresence == 'ABSENT',
                  onTap: () => teacher.updateStudentPresence(p.id, 'ABSENT'),
                ),
                const SizedBox(width: 8),
                _buildActionButton(
                  label: 'Fraude !',
                  color: const Color(0xFFD97706),
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
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? color : color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withValues(alpha: isSelected ? 1.0 : 0.4)),
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
