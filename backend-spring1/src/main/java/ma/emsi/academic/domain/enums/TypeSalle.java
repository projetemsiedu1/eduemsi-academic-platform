package ma.emsi.academic.domain.enums;

public enum TypeSalle {
    LI_PC("Laboratoire Informatique (PC Dell/HP, GPU RTX pour Dev, BD et IA)"),
    LR_RESEAUX("Laboratoire Réseaux (Baies physiques Cisco Switch 2960 et Routeurs)"),
    STANDARD("Salle de Cours Standard (Vidéoprojection, acoustique)"),
    AMPHI("Grand Amphithéâtre de Conférence");

    private final String description;

    TypeSalle(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
