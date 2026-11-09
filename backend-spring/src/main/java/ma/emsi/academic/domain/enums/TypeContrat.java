package ma.emsi.academic.domain.enums;

public enum TypeContrat {
    PERMANENT("Enseignant Permanent soumis au quota obligatoire de 18 heures hebdomadaires"),
    VACATAIRE("Enseignant Vacataire industriel avec créneaux rigides sanctuarisés en Priorité 1");

    private final String description;

    TypeContrat(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
