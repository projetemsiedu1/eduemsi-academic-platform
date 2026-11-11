package ma.emsi.academic.domain.enums;

import lombok.Getter;

@Getter
public enum CreneauHoraire {
    S1_08H30("08:30", "10:00", "Séance 1 (08h30 à 10h00)"),
    S2_10H15("10:15", "11:45", "Séance 2 (10h15 à 11h45)"),
    S3_12H00("12:00", "13:30", "Séance 3 (12h00 à 13h30)"),
    S4_13H45("13:45", "15:15", "Séance 4 (13h45 à 15h15)"),
    S5_15H30("15:30", "17:00", "Séance 5 (15h30 à 17h00)"),
    S6_17H15("17:15", "18:45", "Séance 6 (17h15 à 18h45)");

    private final String heureDebut;
    private final String heureFin;
    private final String libelle;

    CreneauHoraire(String heureDebut, String heureFin, String libelle) {
        this.heureDebut = heureDebut;
        this.heureFin = heureFin;
        this.libelle = libelle;
    }
}
