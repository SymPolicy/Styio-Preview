import 'package:flutter/material.dart';

class StyioTheme {
  static ThemeData light() {
    const canvas = Color(0xFFF4F1EA);
    const panel = Color(0xFFF9F6EF);
    const ink = Color(0xFF2B2624);
    const accent = Color(0xFF5668A6);
    const muted = Color(0xFF8B847B);

    final colorScheme = ColorScheme.fromSeed(
      seedColor: accent,
      brightness: Brightness.light,
    ).copyWith(
      surface: panel,
      onSurface: ink,
      secondary: const Color(0xFFD4CDC1),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: canvas,
      cardColor: panel,
      dividerColor: const Color(0xFFE1D9CA),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          color: ink,
        ),
        titleMedium: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: ink,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          height: 1.45,
          color: ink,
        ),
        bodySmall: TextStyle(
          fontSize: 12,
          height: 1.4,
          color: muted,
        ),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(999),
        ),
        side: BorderSide.none,
        selectedColor: const Color(0xFFE6E1D7),
        backgroundColor: const Color(0xFFF1ECE3),
        labelStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: ink,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.68),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
}
