import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../models/seance_model.dart';
import '../../providers/student_provider.dart';

class StudentTimetableTab extends StatefulWidget {
  const StudentTimetableTab({super.key});

  @override
  State<StudentTimetableTab> createState() => _StudentTimetableTabState();
}

class _StudentTimetableTabState extends State<StudentTimetableTab> {
  final List<String> _jours = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
  String _selectedJour = 'LUNDI';

  @override
  Widget build(BuildContext context) {
    final student = Provider.of<StudentProvider>(context);
    final seances = student.getSeancesByDay(_selectedJour);

    return Column(
      children: [
        // Sélecteur de jour
        Container(
          height: 48,
          margin: const EdgeInsets.symmetric(vertical: 8),
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _jours.length,
            itemBuilder: (context, index) {
              final jour = _jours[index];
              final isSelected = jour == _selectedJour;
              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Text(
                    jour.substring(0, 3),
                    style: TextStyle(
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? Colors.white : AppConstants.slateDark,
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: AppConstants.primaryGreen,
                  backgroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isSelected ? AppConstants.primaryGreen : AppConstants.borderGrey,
                    ),
                  ),
                  onSelected: (selected) {
                    if (selected) setState(() => _selectedJour = jour);
                  },
                ),
              );
            },
          ),
        ),

        // Liste des séances
        Expanded(
          child: student.isLoading
              ? const Center(child: CircularProgressIndicator(color: AppConstants.primaryGreen))
              : seances.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.event_available_outlined, size: 48, color: Colors.grey.shade400),
                          const SizedBox(height: 8),
                          Text(
                            'Aucun cours programmé le $_selectedJour',
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: seances.length,
                      itemBuilder: (context, index) {
                        final s = seances[index];
                        return _buildSeanceCard(s);
                      },
                    ),
        ),
      ],
    );
  }

  Widget _buildSeanceCard(SeanceModel s) {
    Color typeColor = AppConstants.primaryGreen;
    if (s.typeSeance == 'TP') typeColor = Colors.blue.shade600;
    if (s.typeSeance == 'TD') typeColor = Colors.purple.shade600;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppConstants.borderGrey),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.access_time_rounded, size: 16, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      '${s.heureDebut} - ${s.heureFin}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: typeColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    s.typeSeance,
                    style: TextStyle(color: typeColor, fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              s.moduleIntitule,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppConstants.slateDark),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.meeting_room_outlined, size: 13, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(s.salleCode, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Row(
                    children: [
                      const Icon(Icons.person_outline, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          s.enseignantNom,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                        ),
                      ),
                    ],
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
