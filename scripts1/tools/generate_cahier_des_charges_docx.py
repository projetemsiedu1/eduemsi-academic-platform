# -*- coding: utf-8 -*-
"""
Générateur de Cahier des Charges officiel Word (.docx) pour EMSI Campus ERP
Conforme au modèle EMSI D2SI/IIR 2025-2026
"""

import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_docx():
    doc = Document()

    # Configuration des marges A4
    for section in doc.sections:
        section.top_margin = Inches(0.9)
        section.bottom_margin = Inches(0.9)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)

    # Styles généraux
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(17, 24, 39)
    normal_style.paragraph_format.line_spacing = 1.25
    normal_style.paragraph_format.space_after = Pt(6)

    # =========================================================================
    # PAGE 1 : PAGE DE GARDE OFFICIELLE
    # =========================================================================
    header_table = doc.add_table(rows=1, cols=2)
    header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    header_table.autofit = False
    header_table.columns[0].width = Inches(4.5)
    header_table.columns[1].width = Inches(2.0)

    logo_path = os.path.abspath("assets/emsi_logo.png")
    cell_l = header_table.cell(0, 0)
    cell_r = header_table.cell(0, 1)

    if os.path.exists(logo_path):
        p_logo = cell_l.paragraphs[0]
        p_logo.add_run().add_picture(logo_path, width=Inches(1.8))
    else:
        p_logo = cell_l.paragraphs[0]
        p_logo.add_run("EMSI MARRAKECH").bold = True

    p_proj = cell_r.paragraphs[0]
    p_proj.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_tag = p_proj.add_run("EMSI Campus ERP\n")
    r_tag.bold = True
    r_tag.font.size = Pt(14)
    r_tag.font.color.rgb = RGBColor(5, 150, 105)
    r_sub = p_proj.add_run("Projet PFA 2025–2026")
    r_sub.font.size = Pt(9.5)
    r_sub.font.color.rgb = RGBColor(107, 114, 128)

    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_before = Pt(28)
    r = p_dept.add_run("ÉCOLE MAROCAINE DES SCIENCES DE L’INGÉNIEUR\n")
    r.bold = True
    r.font.size = Pt(13)
    r.font.color.rgb = RGBColor(31, 41, 55)
    r2 = p_dept.add_run("FILIÈRE : INGÉNIERIE INFORMATIQUE ET RÉSEAUX (IIR)\nOPTION : DÉVELOPPEMENT DIGITAL & SYSTÈMES D’INFORMATION (D2SI)")
    r2.font.size = Pt(11)
    r2.bold = True
    r2.font.color.rgb = RGBColor(5, 150, 105)

    p_hr1 = doc.add_paragraph()
    p_hr1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_hr1.paragraph_format.space_before = Pt(12)
    p_hr1.add_run("―" * 45).font.color.rgb = RGBColor(209, 213, 219)

    p_titre = doc.add_paragraph()
    p_titre.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_titre.paragraph_format.space_before = Pt(14)
    p_titre.paragraph_format.space_after = Pt(8)
    r_main = p_titre.add_run("CAHIER DES CHARGES DE PROJET\n")
    r_main.bold = True
    r_main.font.size = Pt(18)
    r_main.font.color.rgb = RGBColor(17, 24, 39)

    r_nom = p_titre.add_run("Système Intégré de Gestion Académique, Logistique et Planification Multi-Sites Assistée par IA (EMSI Campus ERP)\n")
    r_nom.bold = True
    r_nom.font.size = Pt(14)
    r_nom.font.color.rgb = RGBColor(5, 150, 105)

    r_desc = p_titre.add_run("Automatisation des emplois du temps (Gueliz & Targa), saisie directe des notes (Zéro Excel), émargement QR rotatif et matching intelligent des soutenances PFE")
    r_desc.italic = True
    r_desc.font.size = Pt(10.5)
    r_desc.font.color.rgb = RGBColor(75, 85, 99)

    p_hr2 = doc.add_paragraph()
    p_hr2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_hr2.paragraph_format.space_after = Pt(28)
    p_hr2.add_run("―" * 45).font.color.rgb = RGBColor(209, 213, 219)

    # Tableau Encadrants et Membres
    info_table = doc.add_table(rows=1, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_table.autofit = False
    info_table.columns[0].width = Inches(3.3)
    info_table.columns[1].width = Inches(3.3)

    c_gauche = info_table.cell(0, 0)
    c_droite = info_table.cell(0, 1)

    p_equipe = c_gauche.paragraphs[0]
    p_equipe.add_run("Réalisé par l'équipe d'ingénieurs :\n").bold = True
    membres = [
        "• Élève-Ingénieur 1 (Lead Architecture & DB)",
        "• Élève-Ingénieur 2 (Lead Frontend Web)",
        "• Élève-Ingénieur 3 (Lead Mobile Flutter)",
        "• Élève-Ingénieur 4 (Backend Core & Règles)",
        "• Élève-Ingénieur 5 (Moteur OR-Tools & IA)",
        "• Élève-Ingénieur 6 (DevOps & Sécurité CNDP)"
    ]
    for m in membres:
        r_m = p_equipe.add_run(f"{m}\n")
        r_m.font.size = Pt(9.5)

    p_encadre = c_droite.paragraphs[0]
    p_encadre.add_run("Sous la direction pédagogique de :\n").bold = True
    r_enc1 = p_encadre.add_run("• Pr. ZGANDRI (Encadrante Académique)\n")
    r_enc1.bold = True
    r_enc1.font.size = Pt(10)
    r_enc2 = p_encadre.add_run("• Pr. AIT OUNEJJAR Lahoussaine (Président de Jury)\n")
    r_enc2.bold = True
    r_enc2.font.size = Pt(10)
    r_univ = p_encadre.add_run("\nAnnée Universitaire : 2025–2026\nCentre : EMSI Marrakech (Gueliz & Targa)")
    r_univ.font.size = Pt(9.5)
    r_univ.font.color.rgb = RGBColor(107, 114, 128)

    doc.add_page_break()

    # =========================================================================
    # PAGE i : SIGNATURES
    # =========================================================================
    h_sig = doc.add_heading("Page des Signatures Officielles", level=1)
    h_sig.paragraph_format.space_before = Pt(10)
    h_sig.paragraph_format.space_after = Pt(14)
    h_sig.runs[0].font.color.rgb = RGBColor(5, 150, 105)

    p_sig_intro = doc.add_paragraph(
        "Le présent cahier des charges formalise l'engagement mutuel entre l'équipe de réalisation "
        "et le corps professoral encadrant pour la conception et l'implémentation du système EMSI Campus ERP."
    )
    p_sig_intro.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    sig_table = doc.add_table(rows=8, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_table.autofit = False
    sig_table.columns[0].width = Inches(3.5)
    sig_table.columns[1].width = Inches(3.0)
    set_table_borders(sig_table, color="E5E7EB")

    noms = [
        ("Élève-Ingénieur 1 (Chef de Projet)", "Signature : _______________________"),
        ("Élève-Ingénieur 2 (Frontend Lead)", "Signature : _______________________"),
        ("Élève-Ingénieur 3 (Mobile Lead)", "Signature : _______________________"),
        ("Élève-Ingénieur 4 (Backend Lead)", "Signature : _______________________"),
        ("Élève-Ingénieur 5 (IA & Optimisation)", "Signature : _______________________"),
        ("Élève-Ingénieur 6 (DevOps & QA)", "Signature : _______________________"),
        ("Pr. ZGANDRI (Encadrante)", "Signature : _______________________"),
        ("Pr. AIT OUNEJJAR Lahoussaine (Jury)", "Signature : _______________________")
    ]

    for i, (nom, sig) in enumerate(noms):
        c0 = sig_table.cell(i, 0)
        c1 = sig_table.cell(i, 1)
        c0.text = nom
        c1.text = sig
        c0.paragraphs[0].runs[0].font.size = Pt(9.5)
        c0.paragraphs[0].runs[0].bold = True
        c1.paragraphs[0].runs[0].font.size = Pt(9.5)
        set_cell_margins(c0, 60, 60, 100, 100)
        set_cell_margins(c1, 60, 60, 100, 100)
        if i >= 6:
            set_cell_background(c0, "F3F4F6")
            set_cell_background(c1, "F3F4F6")

    p_date = doc.add_paragraph()
    p_date.paragraph_format.space_before = Pt(24)
    p_date.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_date = p_date.add_run("Fait à Marrakech, le 16 octobre 2026")
    r_date.bold = True
    r_date.font.size = Pt(10)

    doc.add_page_break()

    # =========================================================================
    # PAGE ii : ABREVIATIONS
    # =========================================================================
    h_abr = doc.add_heading("Liste des Abréviations", level=1)
    h_abr.runs[0].font.color.rgb = RGBColor(5, 150, 105)

    abr_table = doc.add_table(rows=1, cols=2)
    abr_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    abr_table.autofit = False
    abr_table.columns[0].width = Inches(1.8)
    abr_table.columns[1].width = Inches(4.8)
    set_table_borders(abr_table, color="D1D5DB")

    hdr_c0 = abr_table.cell(0, 0)
    hdr_c1 = abr_table.cell(0, 1)
    hdr_c0.text = "Acronyme"
    hdr_c1.text = "Définition & Signification Complète"
    hdr_c0.paragraphs[0].runs[0].bold = True
    hdr_c1.paragraphs[0].runs[0].bold = True
    set_cell_background(hdr_c0, "E5E7EB")
    set_cell_background(hdr_c1, "E5E7EB")

    abrevs = [
        ("ERP", "Enterprise Resource Planning (Progiciel de Gestion Intégré)"),
        ("EMSI", "École Marocaine des Sciences de l’Ingénieur"),
        ("D2SI", "Développement Digital et Systèmes d’Information"),
        ("IIR", "Ingénierie Informatique et Réseaux"),
        ("EDT", "Emploi du Temps"),
        ("OR-Tools", "Google Operations Research Tools (Solveur Combinatoire CP-SAT)"),
        ("LLM", "Large Language Model (Modèle de Langage pour l'IA)"),
        ("JWT", "JSON Web Token (Jeton d'authentification chiffré)"),
        ("RBAC", "Role-Based Access Control (Contrôle d'accès basé sur les rôles)"),
        ("CNDP", "Commission Nationale de contrôle de la protection des Données à caractère Personnel (Loi 09-08)"),
        ("SLA", "Service Level Agreement (Contrat de Niveau de Service)"),
        ("TDD", "Test-Driven Development (Développement Piloté par les Tests)"),
        ("PFE / PFA", "Projet de Fin d’Études / Projet de Fin d’Année"),
        ("FCM", "Firebase Cloud Messaging (Notifications Push Mobiles)")
    ]

    for a, d in abrevs:
        row = abr_table.add_row()
        c0, c1 = row.cells
        c0.text = a
        c1.text = d
        c0.paragraphs[0].runs[0].bold = True
        c0.paragraphs[0].runs[0].font.size = Pt(9.5)
        c1.paragraphs[0].runs[0].font.size = Pt(9.5)
        set_cell_margins(c0, 40, 40, 80, 80)
        set_cell_margins(c1, 40, 40, 80, 80)

    doc.add_page_break()

    # =========================================================================
    # TABLE DES FIGURES ET LISTE DES TABLEAUX (Pages iii et iv)
    # =========================================================================
    h_fig = doc.add_heading("Table des Figures", level=1)
    h_fig.runs[0].font.color.rgb = RGBColor(5, 150, 105)
    figs = [
        ("Figure 1", "Logo officiel de l’application EMSI Campus ERP", "Page 1"),
        ("Figure 2", "Schéma fonctionnel détaillé du système intégré", "Page 5"),
        ("Figure 3", "Architecture système globale en 5 couches logiques", "Page 7"),
        ("Figure 4", "Modèle conceptuel et relations des données clés", "Page 8"),
        ("Figure 5", "Workflow opérationnel de déroulement et clôture d'une séance", "Page 10")
    ]
    for num, desc, p in figs:
        p_f = doc.add_paragraph()
        p_f.add_run(f"• {num} : {desc} ").font.size = Pt(10)
        p_f.add_run(f"........................................................... {p}").font.color.rgb = RGBColor(156, 163, 175)

    doc.add_heading("Liste des Tableaux", level=1).runs[0].font.color.rgb = RGBColor(5, 150, 105)
    tabs = [
        ("Tableau 1", "Matrice croisée entre les acteurs et les fonctionnalités", "Page 3"),
        ("Tableau 2", "Matrice d'analyse des risques et plans de mitigation", "Page 15")
    ]
    for num, desc, p in tabs:
        p_t = doc.add_paragraph()
        p_t.add_run(f"• {num} : {desc} ").font.size = Pt(10)
        p_t.add_run(f"........................................................... {p}").font.color.rgb = RGBColor(156, 163, 175)

    doc.add_page_break()

    # =========================================================================
    # TABLE DES MATIERES (Pages v et vi)
    # =========================================================================
    h_toc = doc.add_heading("Table des Matières", level=1)
    h_toc.runs[0].font.color.rgb = RGBColor(5, 150, 105)
    
    sommaire_items = [
        ("Page des Signatures", "i"),
        ("Liste des abréviations", "ii"),
        ("Table des figures", "iii"),
        ("Liste des tableaux", "iv"),
        ("1 Introduction", "1"),
        ("  1.1 Contexte et présentation du projet", "1"),
        ("  1.2 Problématique", "1"),
        ("  1.3 Objectifs du projet", "2"),
        ("  1.4 Portée du projet", "2"),
        ("2 Parties prenantes et acteurs", "2"),
        ("  2.1 Parties prenantes", "2"),
        ("  2.2 Acteurs du système", "2"),
        ("3 Besoins fonctionnels", "3"),
        ("  3.1 Description des fonctionnalités", "3"),
        ("  3.2 Matrice Acteurs et fonctionnalités (Tableau 1)", "3"),
        ("  3.3 Planification multi-sites (Transit 45 min Gueliz/Targa)", "4"),
        ("  3.4 Fonctionnalités destinées aux utilisateurs (Étudiants / Profs)", "4"),
        ("  3.5 Gestion et Administration (Zéro Excel & Délibérations)", "4"),
        ("  3.6 Suivi de scolarité et verrou administratif", "5"),
        ("  3.7 Soutenances PFE et matching intelligent par IA", "5"),
        ("  3.8 Exigences Fonctionnelles Détaillées (EF-01 à EF-10)", "5"),
        ("4 Besoins non fonctionnels", "6"),
        ("  4.1 Performance et capacité", "6"),
        ("  4.2 Sécurité et protection des données", "6"),
        ("  4.3 Accessibilité et compatibilité multi-plateforme", "6"),
        ("  4.4 Maintenance et évolutivité multi-tenant", "6"),
        ("5 Architecture technique", "6"),
        ("  5.1 Vue d'ensemble du système", "6"),
        ("  5.2 Architecture logique en 5 couches", "8"),
        ("  5.3 Flux de données du système", "10"),
        ("  5.4 Technologies et outils (Spring Boot 3, React, Flutter, PostgreSQL)", "10"),
        ("  5.5 Scénarios de fonctionnement", "10"),
        ("  5.6 Contraintes techniques", "11"),
        ("6 Planification du projet (Agile Scrum + XP)", "12"),
        ("  6.1 Phases du projet et Sprints", "12"),
        ("  6.2 Planning prévisionnel", "12"),
        ("  6.3 Pénalité contractuelle en cas de retard", "12"),
        ("7 Tests et validation", "13"),
        ("  7.1 Stratégie de test TDD", "13"),
        ("  7.2 Scénarios de validation", "13"),
        ("  7.3 Critères d'acceptation", "13"),
        ("  7.4 Modalités de livraison et livrables contractuels (7.4.1 à 7.4.6)", "14"),
        ("8 Analyse des risques", "15"),
        ("  8.1 Risques techniques et cyber", "15"),
        ("  8.2 Risques opérationnels et de rejet utilisateur", "15"),
        ("  8.3 Matrice de criticité et mitigation (Tableau 2)", "15"),
        ("9 Contraintes Légales et Réglementaires (Loi 09-08 CNDP)", "16"),
        ("10 Conclusion générale et perspectives", "17")
    ]

    for item, p in sommaire_items:
        p_s = doc.add_paragraph()
        p_s.paragraph_format.line_spacing = 1.15
        p_s.paragraph_format.space_after = Pt(2)
        r_item = p_s.add_run(item)
        r_item.font.size = Pt(10)
        if not item.startswith("  "):
            r_item.bold = True
        p_s.add_run(f" {'·' * max(5, 55 - len(item))} {p}").font.color.rgb = RGBColor(156, 163, 175)

    doc.add_page_break()

    # =========================================================================
    # CORPS DU CAHIER DES CHARGES (SECTIONS 1 A 10)
    # =========================================================================

    def add_sec_heading(title, level=1):
        h = doc.add_heading(title, level=level)
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(6)
        if level == 1:
            h.runs[0].font.color.rgb = RGBColor(5, 150, 105)
            h.runs[0].font.size = Pt(14)
        elif level == 2:
            h.runs[0].font.color.rgb = RGBColor(31, 41, 55)
            h.runs[0].font.size = Pt(12)
        elif level == 3:
            h.runs[0].font.color.rgb = RGBColor(75, 85, 99)
            h.runs[0].font.size = Pt(11)
        return h

    # SECTION 1
    add_sec_heading("1 Introduction", level=1)
    
    add_sec_heading("1.1 Contexte et présentation du projet", level=2)
    doc.add_paragraph(
        "Dans les grandes institutions d’enseignement supérieur d’ingénierie, la gestion intégrée des activités académiques, "
        "logistiques et administratives représente un défi organisationnel majeur. L’augmentation continue du nombre d’étudiants "
        "et l’expansion multi-sites entraînent une complexification des emplois du temps, une saturation des laboratoires "
        "informatiques spécialisés, ainsi que des difficultés de suivi de l’assiduité et des évaluations."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    doc.add_paragraph(
        "Les systèmes traditionnels de gestion reposent généralement sur des saisies manuelles ou sur des outils bureautiques "
        "dispersés (tableurs Excel, échanges d’emails non sécurisés), incapables d’assurer une supervision en temps réel et une "
        "exploitation optimale des ressources. Le projet EMSI Campus ERP propose la mise en place d'une solution moderne, "
        "hautement disponible et pérenne."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    add_sec_heading("1.2 Problématique", level=2)
    doc.add_paragraph(
        "À l'EMSI Marrakech en particulier, la coexistence de deux campus géographiquement distants (Gueliz et Targa) génère des "
        "contraintes de déplacement majeures pour les enseignants permanents et vacataires. L’absence de temps de battement calculé "
        "automatiquement provoque des retards chroniques et une sous-exploitation des salles. Parallèlement, la saisie des notes "
        "sur des fichiers Excel isolés engendre des risques élevés d’erreurs de calcul, l’absence de traçabilité des modifications "
        "et une lourdeur extrême lors des délibérations semestrielles."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    add_sec_heading("1.3 Objectifs du projet", level=2)
    objectifs = [
        "Garantir une planification sans aucun conflit physique avec respect d’un délai minimal de 45 minutes de transit entre toute séance à Gueliz et à Targa.",
        "Garantir un temps de réponse inférieur à 2 secondes pour toute requête utilisateur sur le Web et sur mobile.",
        "Permettre la gestion simultanée d’au moins 1 000 connexions utilisateurs sans dégradation notable des performances.",
        "Supprimer à 100 % l’usage des fichiers Excel pour la saisie des notes et automatiser l’application des seuils éliminatoires (< 7.00/20.00).",
        "Fournir un tableau de bord interactif pour le suivi pédagogique en temps réel (cahier de texte, assiduité, délibérations)."
    ]
    for o in objectifs:
        doc.add_paragraph(f"• {o}", style='List Bullet')

    add_sec_heading("1.4 Portée du projet", level=2)
    doc.add_paragraph(
        "Le projet englobe le portail Web administratif (React/Next.js 14), l'application mobile native (Flutter 3.x), "
        "l'API backend d'entreprise (Spring Boot 3.3 / Java 21), le moteur de contraintes (Google OR-Tools CP-SAT) et le service "
        "d'intelligence artificielle locale (Ollama Llama 3.2). Sont explicitement exclus de la première version : le paiement bancaire "
        "direct par carte en ligne (conservé par virement/chèque avec reçu) et la gestion de la flotte automobile."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # SECTION 2
    add_sec_heading("2 Parties prenantes et acteurs", level=1)
    doc.add_paragraph(
        "Les principales parties prenantes comprennent la Direction Générale et Pédagogique de l’EMSI, les responsables "
        "des filières (D2SI, IIR, 2IA, Génie Industriel, Génie Civil), les enseignants (permanents et vacataires), les "
        "élèves-ingénieurs, les services de scolarité et de comptabilité."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    acteurs = [
        ("Super Administrateur", "Gestion globale, création des comptes de direction, paramétrage multi-tenant."),
        ("Responsable de Filière", "Gestion des maquettes pédagogiques, validation des EDT, jurys de délibérations et PFE."),
        ("Responsable de Planification", "Définition des contraintes matérielles des salles et lancement du solveur OR-Tools."),
        ("Enseignant", "Consultation EDT, émargement QR rotatif, remplissage cahier de texte mobile, saisie notes."),
        ("Étudiant", "Scan de présence, consultation emploi du temps, notes, téléchargement templates PFE."),
        ("Service Scolarité", "Gestion des inscriptions, justificatifs d'absence, délivrance d'attestations sécurisées."),
        ("Service Financier", "Suivi des encaissements, reliquats de scolarité, activation du verrou administratif.")
    ]
    for a, desc in acteurs:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(f"{a} : ").bold = True
        p.add_run(desc)

    # SECTION 3
    add_sec_heading("3 Besoins fonctionnels", level=1)
    doc.add_paragraph(
        "Les interactions entre les différents acteurs et les fonctionnalités du système sont synthétisées dans la matrice suivante :"
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # TABLEAU 1
    t1 = doc.add_table(rows=11, cols=8)
    t1.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t1, color="9CA3AF")

    t1_headers = ["Fonctionnalités", "Admin", "Resp. Fil.", "Planif.", "Prof", "Étudiant", "Scolarité", "Finance"]
    for j, h in enumerate(t1_headers):
        cell = t1.cell(0, j)
        cell.text = h
        cell.paragraphs[0].runs[0].bold = True
        cell.paragraphs[0].runs[0].font.size = Pt(8.5)
        set_cell_background(cell, "E5E7EB")

    t1_rows = [
        ("Gestion comptes et rôles", ["X", "", "", "", "", "", ""]),
        ("Configuration filières/modules", ["X", "X", "", "", "", "", ""]),
        ("Génération automatique EDT", ["", "X", "X", "", "", "", ""]),
        ("Consultation emploi du temps", ["", "X", "X", "X", "X", "", ""]),
        ("Émargement par QR Code 15s", ["", "", "", "X", "X", "", ""]),
        ("Cahier de texte via Push", ["", "X", "", "X", "", "", ""]),
        ("Saisie notes (Zéro Excel)", ["", "X", "", "X", "", "", ""]),
        ("Délibérations & PV officiel", ["", "X", "", "", "", "X", ""]),
        ("Matching IA des jurys PFE", ["", "X", "", "X", "X", "", ""]),
        ("Scolarité & Verrou administratif", ["", "", "", "", "", "X", "X"])
    ]

    for i, (fn, checks) in enumerate(t1_rows, start=1):
        row = t1.rows[i]
        c0 = row.cells[0]
        c0.text = fn
        c0.paragraphs[0].runs[0].font.size = Pt(8)
        c0.paragraphs[0].runs[0].bold = True
        for j, ch in enumerate(checks, start=1):
            cj = row.cells[j]
            cj.text = ch
            cj.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            if ch == "X":
                cj.paragraphs[0].runs[0].bold = True
                cj.paragraphs[0].runs[0].font.color.rgb = RGBColor(5, 150, 105)

    p_cap1 = doc.add_paragraph()
    p_cap1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_c1 = p_cap1.add_run("Tableau 1 : Matrice croisée Acteurs / Fonctionnalités du système EMSI Campus ERP")
    r_c1.font.size = Pt(9)
    r_c1.italic = True

    add_sec_heading("3.3 Planification multi-sites et contrainte de transit", level=2)
    doc.add_paragraph(
        "Le moteur de planification intègre la contrainte de transit géographique : un battement obligatoire de 45 minutes "
        "est réservé automatiquement entre toute séance consécutive dispensée par le même enseignant ou suivie par le même groupe "
        "d'étudiants entre les campus de Gueliz et Targa. De même, les salles de TP sont allouées en fonction de l'inventaire matériel "
        "réel (PC disponibles et cartes GPU pour les filières informatiques)."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    add_sec_heading("3.4 Clôture de séance & Cahier de texte obligatoire", level=2)
    doc.add_paragraph(
        "À la fin exacte de chaque séance officielle, le système expédie une notification push sur le smartphone de l'enseignant. "
        "Celui-ci doit renseigner en 30 secondes le chapitre traité, l'état d'avancement et les devoirs assignés. Cette rigueur "
        "garantit à la direction une supervision temps réel de la progression du programme pédagogique."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    add_sec_heading("3.5 Saisie des notes Zéro Excel & Délibérations", level=2)
    doc.add_paragraph(
        "La saisie des notes d'examen et de contrôle continu s'effectue exclusivement en ligne avec contrôles de bornes (0.00 à 20.00). "
        "Le système applique automatiquement la règle de la note éliminatoire : toute note à l'examen final strictement inférieure "
        "à 7.00/20.00 invalide automatiquement le module, quelle que soit la moyenne de contrôle continu. Le procès-verbal officiel "
        "de délibération est généré en PDF infalsifiable avec signature numérique."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    add_sec_heading("3.6 Soutenances PFE & Matching IA (Ollama)", level=2)
    doc.add_paragraph(
        "Les étudiants téléchargent directement les gabarits officiels EMSI (rapport Word/LaTeX, diapositives PowerPoint). "
        "Lors du dépôt du sujet, le modèle de langage local Ollama analyse le résumé technique et associe automatiquement un jury "
        "expert de la même spécialité technologique (similarité cosinus > 0.70)."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # SECTION 4
    add_sec_heading("4 Besoins non fonctionnels", level=1)
    doc.add_paragraph(
        "• Performance : Temps de réponse < 2s par requête, < 300ms pour l'EDT via cache Redis, génération d'emploi du temps < 3 min.\n"
        "• Disponibilité : 99.5 % sur l'année académique, clustering Docker et redémarrage automatique des conteneurs.\n"
        "• Sécurité : Authentification JWT, hachage BCrypt, communications chiffrées HTTPS TLS 1.3, isolation multi-tenant par tenant_id.\n"
        "• Accessibilité : Interface Web responsive (Chrome, Edge, Firefox, Safari) et mobile native (Android API 26+, iOS 15+)."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # SECTION 5
    add_sec_heading("5 Architecture technique", level=1)
    doc.add_paragraph(
        "L'architecture repose sur un découpage strict en 5 couches logiques :\n"
        "1. Couche Présentation : Portail Web Next.js 14 / Tailwind CSS et Application Mobile native Flutter 3.x.\n"
        "2. Couche Sécurité & Passerelle : Reverse Proxy Nginx, Spring Security 6, filtres JWT et contrôle de débit.\n"
        "3. Couche Métier : Services d'entreprise Spring Boot 3.3 (Java 21 LTS) orchestrant les transactions.\n"
        "4. Couche Calcul & IA : Solveur de contraintes Google OR-Tools CP-SAT et moteur IA local souverain Ollama.\n"
        "5. Couche Données & Stockage : Base PostgreSQL 16 (40 tables Flyway), cache Redis 7 et MinIO S3 pour les rapports."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # SECTION 6
    add_sec_heading("6 Planification du projet (Agile Scrum + XP)", level=1)
    doc.add_paragraph(
        "Le développement s'organise sur 10 semaines découpées en 5 Sprints bimensuels :\n"
        "• Sprint 0 (Semaines 1–2) : Socle technique, Docker, migrations Flyway V1 (40 tables), pipeline CI/CD.\n"
        "• Sprint 1 (Semaines 3–4) : Authentification JWT, gestion des campus Gueliz/Targa, solveur OR-Tools (45 min).\n"
        "• Sprint 2 (Semaines 5–6) : Émargement QR rotatif 15s et notification push mobile cahier de texte.\n"
        "• Sprint 3 (Semaines 7–8) : Zéro Excel, calculs des délibérations, seuil éliminatoire et verrou de scolarité.\n"
        "• Sprint 4 (Semaines 9–10) : Soutenances PFE, matching IA Ollama, tests E2E Playwright et recette finale."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    doc.add_paragraph(
        "Clause de pénalité de retard : Conformément aux clauses contractuelles, tout retard imputable à l'équipe de réalisation "
        "entraîne une pénalité de 1 % de retenue par jour ouvré de retard, plafonnée à 10 % de la valeur contractuelle du projet."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # SECTION 7
    add_sec_heading("7 Tests et validation", level=1)
    doc.add_paragraph(
        "La politique qualité impose le Test-Driven Development (TDD) avec un seuil de couverture de code minimal de 80 %. "
        "Les livrables formels exigibles à la recette sont :\n"
        "1. Code source complet documenté sur le dépôt Git officiel.\n"
        "2. Scripts de base de données Flyway V1 et jeux de données de test.\n"
        "3. Documentation complète des APIs au format OpenAPI / Swagger.\n"
        "4. Guide d'installation et de déploiement conteneurisé Docker.\n"
        "5. Manuels d'utilisation pour les profils Administrateur, Enseignant et Étudiant.\n"
        "6. Procès-verbal formel de recette fonctionnelle signé par les encadrants."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # SECTION 8
    add_sec_heading("8 Analyse des risques", level=1)
    doc.add_paragraph(
        "Les principaux risques identifiés et leurs mesures de contournement sont synthétisés ci-dessous :"
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    r_tab = doc.add_table(rows=4, cols=4)
    r_tab.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(r_tab, color="D1D5DB")
    r_headers = ["Catégorie", "Description du Risque", "Impact", "Mesure de Mitigation"]
    for j, h in enumerate(r_headers):
        c = r_tab.cell(0, j)
        c.text = h
        c.paragraphs[0].runs[0].bold = True
        set_cell_background(c, "E5E7EB")

    risks = [
        ("Technique", "Panne ou indisponibilité du serveur", "Élevé", "Clustering Docker Swarm, cache Redis et sauvegardes automatisées."),
        ("Humain", "Résistance des professeurs à lâcher Excel", "Moyen", "Formation express, UX simplifiée en 3 clics et import Excel initial one-click."),
        ("Opérationnel", "Pic de charge lors des délibérations", "Élevé", "Optimisation des requêtes SQL et indexation stricte de la base.")
    ]
    for i, row_data in enumerate(risks, start=1):
        for j, val in enumerate(row_data):
            cell = r_tab.cell(i, j)
            cell.text = val
            cell.paragraphs[0].runs[0].font.size = Pt(8.5)

    p_cap2 = doc.add_paragraph()
    p_cap2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_c2 = p_cap2.add_run("Tableau 2 : Matrice de criticité des risques et mesures de mitigation")
    r_c2.font.size = Pt(9)
    r_c2.italic = True

    # SECTION 9
    add_sec_heading("9 Contraintes Légales et Réglementaires (Loi 09-08 CNDP)", level=1)
    doc.add_paragraph(
        "Le projet s'inscrit en conformité absolue avec la législation marocaine régissant le traitement des données à caractère personnel "
        "(Loi n° 09-08 régie par la CNDP). L'ensemble des données étudiantes, notes et états financiers sont hébergés sur le sol marocain. "
        "Les modèles d'intelligence artificielle (Ollama) s'exécutent en local sur les serveurs de l'EMSI sans aucun appel vers des APIs "
        "cloud tierces à l'étranger. Toute modification de note ou de planning génère un enregistrement horodaté et inaltérable dans la "
        "table d'audit (audit_logs)."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # SECTION 10
    add_sec_heading("10 Conclusion générale et perspectives", level=1)
    doc.add_paragraph(
        "Le présent cahier des charges établit les fondations solides du système EMSI Campus ERP. En associant rigueur mathématique "
        "(résolution de planning sous contraintes OR-Tools), innovation technologique (émargement mobile réactif et IA souveraine) et "
        "sécurité juridique conforme à la CNDP, ce projet dote l'EMSI d'un levier d'excellence opérationnelle pérenne et déployable "
        "à terme sur l'ensemble des campus du Royaume (Casablanca, Rabat, Fès, Tanger)."
    ).alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # Sauvegarde finale du fichier docx
    output_path = "Cahier_des_charges_EMSI_Campus_Officiel.docx"
    doc.save(output_path)
    print(f"SUCCESS: {output_path} generated successfully.")

if __name__ == "__main__":
    build_docx()
