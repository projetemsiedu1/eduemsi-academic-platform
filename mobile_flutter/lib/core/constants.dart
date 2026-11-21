import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class AppConstants {
  static const String appName = 'EMSI Univora';
  static const String appSubtitle = 'Espace Académique & Examens';

  // Base URL backend Spring Boot (10.0.2.2 pour émulateur Android, localhost pour desktop/web)
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:8085/api/v1';
    }
    return defaultTargetPlatform == TargetPlatform.android
        ? 'http://10.0.2.2:8085/api/v1'
        : 'http://localhost:8085/api/v1';
  }

  // Couleurs de la charte graphique EMSI Univora
  static const Color primaryGreen = Color(0xFF059669); // Emerald 600
  static const Color primaryDark = Color(0xFF064E3B);  // Emerald 900
  static const Color accentGold = Color(0xFFD97706);   // Amber 600
  static const Color slateDark = Color(0xFF0F172A);    // Slate 900
  static const Color slateLight = Color(0xFFF8FAFC);   // Slate 50
  static const Color borderGrey = Color(0xFFE2E8F0);   // Slate 200
  static const Color dangerRed = Color(0xFFDC2626);    // Red 600
  static const Color warningYellow = Color(0xFFCA8A04);// Yellow 600

  // Seuil d'absence éliminatoire EMSI
  static const double absenceThresholdPercent = 20.0;
}
