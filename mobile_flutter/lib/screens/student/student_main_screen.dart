import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants.dart';
import '../../providers/auth_provider.dart';
import '../../providers/student_provider.dart';
import '../auth/login_screen.dart';
import 'student_timetable_tab.dart';
import 'student_convocations_tab.dart';
import 'student_absences_tab.dart';
import 'student_pfe_tab.dart';

class StudentMainScreen extends StatefulWidget {
  const StudentMainScreen({super.key});

  @override
  State<StudentMainScreen> createState() => _StudentMainScreenState();
}

class _StudentMainScreenState extends State<StudentMainScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<StudentProvider>(context, listen: false).loadData();
    });
  }

  final List<Widget> _tabs = const [
    StudentTimetableTab(),
    StudentConvocationsTab(),
    StudentAbsencesTab(),
    StudentPfeTab(),
  ];

  final List<String> _titles = const [
    'Emploi du Temps',
    'Convocations & Tables',
    'Suivi des Absences (20%)',
    'Mon PFE & Soutenance',
  ];

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.currentUser;

    return Scaffold(
      backgroundColor: AppConstants.slateLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _titles[_currentIndex],
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: AppConstants.slateDark,
              ),
            ),
            Text(
              user?.fullName ?? 'Espace Étudiant',
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
            tooltip: 'Actualiser les données',
            onPressed: () {
              Provider.of<StudentProvider>(context, listen: false).loadData();
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppConstants.dangerRed),
            tooltip: 'Se déconnecter',
            onPressed: () async {
              await auth.logout();
              if (!context.mounted) return;
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: _tabs[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedItemColor: AppConstants.primaryGreen,
        unselectedItemColor: Colors.grey.shade500,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today_outlined),
            activeIcon: Icon(Icons.calendar_today_rounded),
            label: 'Planning',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.event_seat_outlined),
            activeIcon: Icon(Icons.event_seat_rounded),
            label: 'Examens',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.hourglass_bottom_outlined),
            activeIcon: Icon(Icons.hourglass_bottom_rounded),
            label: 'Absences',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.workspace_premium_outlined),
            activeIcon: Icon(Icons.workspace_premium_rounded),
            label: 'PFE',
          ),
        ],
      ),
    );
  }
}
