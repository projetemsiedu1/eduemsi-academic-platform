import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../models/pfe_model.dart';
import '../../providers/student_provider.dart';

class StudentPfeTab extends StatelessWidget {
  const StudentPfeTab({super.key});

  String _statutLabel(String statut) {
    switch (statut) {
      case 'SOUMIS':
        return 'Soumis (En attente de validation)';
      case 'EN_ATTENTE_JURY':
        return 'Validé · Attente du jury IA';
      case 'JURY_AFFECTE':
        return 'Jury affecté · Convocation prête';
      case 'SOUTENU':
        return 'Soutenu (Admis)';
      case 'AJOURNE':
        return 'Ajourné';
      case 'REJETE':
        return 'Refusé / À corriger';
      default:
        return statut;
    }
  }

  Color _statutColor(String statut) {
    switch (statut) {
      case 'SOUTENU':
        return AppConstants.primaryGreen;
      case 'JURY_AFFECTE':
        return Colors.deepPurple;
      case 'EN_ATTENTE_JURY':
        return Colors.blue.shade700;
      case 'REJETE':
      case 'AJOURNE':
        return AppConstants.dangerRed;
      default:
        return AppConstants.accentGold;
    }
  }

  @override
  Widget build(BuildContext context) {
    final student = Provider.of<StudentProvider>(context);

    if (student.isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppConstants.primaryGreen),
      );
    }

    final PfeModel? pfe = student.monPfe;
    if (pfe == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.workspace_premium_outlined, size: 58, color: Colors.grey.shade400),
              const SizedBox(height: 14),
              const Text(
                'Aucun projet PFE enregistré',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppConstants.slateDark),
              ),
              const SizedBox(height: 8),
              Text(
                'Soumettez votre sujet de stage ou choisissez un sujet du catalogue depuis le portail web EMSI Univora.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
              ),
            ],
          ),
        ),
      );
    }

    final statusColor = _statutColor(pfe.statut);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
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
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _statutLabel(pfe.statut),
                    style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  pfe.titre,
                  style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppConstants.slateDark),
                ),
                const SizedBox(height: 6),
                Text(
                  'Équipe : ${pfe.binomeEtudiants}',
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade700, fontWeight: FontWeight.w500),
                ),
                if (pfe.entrepriseAccueil != null && pfe.entrepriseAccueil!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Organisme : ${pfe.entrepriseAccueil}',
                    style: const TextStyle(fontSize: 13, color: AppConstants.primaryGreen, fontWeight: FontWeight.w600),
                  ),
                ],
                const SizedBox(height: 10),
                Text(
                  pfe.resume,
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade800, height: 1.4),
                ),
                if (pfe.technologiesCles != null && pfe.technologiesCles!.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Text(
                    'Technologies : ${pfe.technologiesCles}',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                ],
                if (pfe.statut == 'REJETE' && pfe.commentaireValidation != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFFECACA)),
                    ),
                    child: Text(
                      'Motif : ${pfe.commentaireValidation}',
                      style: const TextStyle(color: AppConstants.dangerRed, fontSize: 12),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),

        if (pfe.pvVerrouille && pfe.noteFinale != null) ...[
          const SizedBox(height: 12),
          Card(
            elevation: 0,
            color: const Color(0xFFECFDF5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: const BorderSide(color: AppConstants.primaryGreen, width: 1.5),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'RÉSULTAT DE SOUTENANCE',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppConstants.primaryDark),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        pfe.mention ?? 'Validé',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppConstants.slateDark),
                      ),
                    ],
                  ),
                  Text(
                    '${pfe.noteFinale!.toStringAsFixed(2)} / 20',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppConstants.primaryGreen),
                  ),
                ],
              ),
            ),
          ),
        ],

        if (pfe.juryMembers.isNotEmpty) ...[
          const SizedBox(height: 12),
          Card(
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
                  const Text(
                    'Convocation & Jury Officiel',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppConstants.slateDark),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const Icon(Icons.calendar_today_rounded, size: 15, color: AppConstants.primaryGreen),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          pfe.dateSoutenance != null
                              ? pfe.dateSoutenance!.replaceAll('T', ' à ').substring(0, pfe.dateSoutenance!.length >= 16 ? 16 : pfe.dateSoutenance!.length)
                              : 'Date à confirmer',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 15, color: AppConstants.primaryGreen),
                      const SizedBox(width: 6),
                      Text(
                        'Salle : ${pfe.salleSoutenanceCode ?? "À définir"}',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const Divider(height: 22),
                  ...pfe.juryMembers.map(
                    (m) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(m.role, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppConstants.primaryGreen)),
                          Text(m.nom, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }
}
