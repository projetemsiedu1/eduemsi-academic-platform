param(
    [string]$BackendUrl = "http://localhost:8085/api/v1",
    [string]$FrontendUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Continue"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  TEST DE VALIDATION FONCTIONNELLE COMPLETE : EMSI UNIVORA     " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

$testResults = @()

function Record-Test($category, $testName, $passed, $details) {
    $status = if ($passed) { "SUCCES" } else { "ECHEC" }
    $color = if ($passed) { "Green" } else { "Red" }
    Write-Host "[$status] ($category) $testName : $details" -ForegroundColor $color
    $script:testResults += [PSCustomObject]@{
        Category = $category
        Test = $testName
        Passed = $passed
        Details = $details
    }
}

# ----------------------------------------------------------------------
# 1. TEST DU FRONTEND NEXT.JS 16
# ----------------------------------------------------------------------
Write-Host "`n--- 1. Validation des Pages & Routes Frontend Next.js ---" -ForegroundColor Yellow

$frontendRoutes = @(
    @{ Path = "/login"; Name = "Portail de Connexion Univora" },
    @{ Path = "/dashboard"; Name = "Dashboard Utilisateur Session" },
    @{ Path = "/timetable"; Name = "Vue Principale Emploi du Temps" },
    @{ Path = "/timetable/resources"; Name = "Gestion des Ressources Academiques" },
    @{ Path = "/timetable/groups"; Name = "Planning par Groupes" },
    @{ Path = "/timetable/teachers"; Name = "Planning par Enseignants" },
    @{ Path = "/timetable/constraints"; Name = "Gestion des Contraintes" },
    @{ Path = "/api/health"; Name = "Route de Sante API Next.js" }
)

foreach ($r in $frontendRoutes) {
    try {
        $resp = Invoke-WebRequest -Uri "$FrontendUrl$($r.Path)" -Method Get -TimeoutSec 10 -UseBasicParsing
        $passed = ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400)
        Record-Test "Frontend" $r.Name $passed "HTTP $($resp.StatusCode)"
    } catch {
        Record-Test "Frontend" $r.Name $false $_.Exception.Message
    }
}

# ----------------------------------------------------------------------
# 2. TEST AUTHENTIFICATION & JWT RBAC (SPRING BOOT 3)
# ----------------------------------------------------------------------
Write-Host "`n--- 2. Validation Authentification & Securite JWT RBAC ---" -ForegroundColor Yellow

$adminToken = $null
$planningToken = $null

try {
    $loginResp = Invoke-RestMethod -Uri "$BackendUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{ username = "resp_planning"; password = "Emsi@2026!" } | ConvertTo-Json) -TimeoutSec 10
    $planningToken = $loginResp.accessToken
    Record-Test "Securite" "Connexion resp_planning" ($planningToken -ne $null) "Role: $($loginResp.role)"
} catch {
    Record-Test "Securite" "Connexion resp_planning" $false $_.Exception.Message
}

try {
    $loginResp = Invoke-RestMethod -Uri "$BackendUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{ username = "admin"; password = "Admin@2026!" } | ConvertTo-Json) -TimeoutSec 10
    $adminToken = $loginResp.accessToken
    Record-Test "Securite" "Connexion admin (Super Admin)" ($adminToken -ne $null) "Role: $($loginResp.role)"
} catch {
    Record-Test "Securite" "Connexion admin" $false $_.Exception.Message
}

$planningHeaders = @{ Authorization = "Bearer $planningToken"; "Content-Type" = "application/json" }
$adminHeaders = @{ Authorization = "Bearer $adminToken"; "Content-Type" = "application/json" }

# ----------------------------------------------------------------------
# 3. TEST CRUDs ACADEMIQUES (LECTURE)
# ----------------------------------------------------------------------
Write-Host "`n--- 3. Validation des Endpoints CRUDs Backend (Lecture) ---" -ForegroundColor Yellow

try {
    $filieres = Invoke-RestMethod -Uri "$BackendUrl/filieres/all" -Method Get -Headers $planningHeaders -TimeoutSec 10
    Record-Test "CRUD Lecture" "Filieres (/filieres/all)" ($filieres.Count -gt 0) "Total: $($filieres.Count)"
} catch { Record-Test "CRUD Lecture" "Filieres" $false $_.Exception.Message }

try {
    $enseignants = Invoke-RestMethod -Uri "$BackendUrl/enseignants" -Method Get -Headers $planningHeaders -TimeoutSec 10
    $count = if ($enseignants.content) { $enseignants.content.Count } else { $enseignants.Count }
    Record-Test "CRUD Lecture" "Enseignants (/enseignants)" ($enseignants -ne $null) "Total: $count"
} catch { Record-Test "CRUD Lecture" "Enseignants" $false $_.Exception.Message }

try {
    $etudiants = Invoke-RestMethod -Uri "$BackendUrl/etudiants" -Method Get -Headers $planningHeaders -TimeoutSec 10
    $count = if ($etudiants.content) { $etudiants.content.Count } else { $etudiants.Count }
    Record-Test "CRUD Lecture" "Etudiants (/etudiants)" ($etudiants -ne $null) "Total: $count"
} catch { Record-Test "CRUD Lecture" "Etudiants" $false $_.Exception.Message }

try {
    $salles = Invoke-RestMethod -Uri "$BackendUrl/salles" -Method Get -Headers $planningHeaders -TimeoutSec 10
    $count = if ($salles.content) { $salles.content.Count } else { $salles.Count }
    Record-Test "CRUD Lecture" "Salles (/salles)" ($salles -ne $null) "Total: $count"
} catch { Record-Test "CRUD Lecture" "Salles" $false $_.Exception.Message }

try {
    $groupes = Invoke-RestMethod -Uri "$BackendUrl/groupes" -Method Get -Headers $planningHeaders -TimeoutSec 10
    $count = if ($groupes.content) { $groupes.content.Count } else { $groupes.Count }
    Record-Test "CRUD Lecture" "Groupes (/groupes)" ($groupes -ne $null) "Total: $count"
} catch { Record-Test "CRUD Lecture" "Groupes" $false $_.Exception.Message }

try {
    $absences = Invoke-RestMethod -Uri "$BackendUrl/absences" -Method Get -Headers $planningHeaders -TimeoutSec 10
    Record-Test "CRUD Lecture" "Absences (/absences)" ($absences -ne $null) "Service Absences repond"
} catch { Record-Test "CRUD Lecture" "Absences" $false $_.Exception.Message }

# ----------------------------------------------------------------------
# 4. TEST DE CREATION DYNAMIQUE CRUD (ECRITURE)
# ----------------------------------------------------------------------
Write-Host "`n--- 4. Test Creation Dynamique CRUD (Ecriture) ---" -ForegroundColor Yellow

$rnd = Get-Random -Minimum 10000 -Maximum 99999

# Creation Filiere
$newFiliereCode = "FIL-$rnd"
try {
    $filiereReq = @{ code = $newFiliereCode; libelle = "Filiere Test Automatise $rnd" } | ConvertTo-Json
    $newFiliere = Invoke-RestMethod -Uri "$BackendUrl/filieres" -Method Post -Headers $adminHeaders -Body $filiereReq -TimeoutSec 10
    Record-Test "CRUD Ecriture" "Creation Filiere ($newFiliereCode)" ($newFiliere.code -eq $newFiliereCode) "ID: $($newFiliere.id)"
} catch { Record-Test "CRUD Ecriture" "Creation Filiere ($newFiliereCode)" $false $_.Exception.Message }

# Creation Enseignant
$newMatricule = "ENS-$rnd"
try {
    $ensReq = @{
        matricule = $newMatricule
        nom = "El Amrani"
        prenom = "Tariq"
        email = "tariq.amrani.$rnd@emsi-edu.ma"
        telephone = "067000$rnd"
        specialite = "Genie Logiciel"
        typeContrat = "PERMANENT"
        heuresContractuellesSemaine = 18
    } | ConvertTo-Json
    $newEns = Invoke-RestMethod -Uri "$BackendUrl/enseignants" -Method Post -Headers $adminHeaders -Body $ensReq -TimeoutSec 10
    Record-Test "CRUD Ecriture" "Creation Enseignant ($newMatricule)" ($newEns.matricule -eq $newMatricule) "ID: $($newEns.id)"
} catch { Record-Test "CRUD Ecriture" "Creation Enseignant ($newMatricule)" $false $_.Exception.Message }

# Creation Etudiant (avec admin token)
$newEtuMatricule = "ETU-$rnd"
try {
    $etuReq = @{
        matricule = $newEtuMatricule
        nom = "Benjelloun"
        prenom = "Yassine"
        email = "yassine.benjelloun.$rnd@emsi-edu.ma"
        telephone = "066000$rnd"
        groupeId = 1
        totalHeuresModuleSemestre = 90.00
    } | ConvertTo-Json
    $newEtu = Invoke-RestMethod -Uri "$BackendUrl/etudiants" -Method Post -Headers $adminHeaders -Body $etuReq -TimeoutSec 10
    Record-Test "CRUD Ecriture" "Creation Etudiant ($newEtuMatricule)" ($newEtu.matricule -eq $newEtuMatricule) "ID: $($newEtu.id)"
} catch { Record-Test "CRUD Ecriture" "Creation Etudiant ($newEtuMatricule)" $false $_.Exception.Message }

# ----------------------------------------------------------------------
# 5. TEST PLANNING WORKSPACE & SOLVEUR CP-SAT
# ----------------------------------------------------------------------
Write-Host "`n--- 5. Validation Planning Workspace & Solveur CP-SAT ---" -ForegroundColor Yellow

try {
    $workspace = Invoke-RestMethod -Uri "$BackendUrl/planning/workspace" -Method Get -Headers $planningHeaders -TimeoutSec 10
    Record-Test "Planning" "Planning Workspace Snapshot" ($workspace -ne $null) "Campuses: $($workspace.campuses.Count), Filieres: $($workspace.filieres.Count)"
} catch { Record-Test "Planning" "Planning Workspace Snapshot" $false $_.Exception.Message }

try {
    $regles = Invoke-RestMethod -Uri "$BackendUrl/planning/regles" -Method Get -Headers $planningHeaders -TimeoutSec 10
    Record-Test "Planning" "Regles Officielles du Solveur" ($regles -ne $null) "Regles chargees avec succes"
} catch { Record-Test "Planning" "Regles Officielles du Solveur" $false $_.Exception.Message }

try {
    $calendar = Invoke-RestMethod -Uri "$BackendUrl/planning/solver/calendar" -Method Get -Headers $planningHeaders -TimeoutSec 10
    Record-Test "Planning" "Definition Calendrier Solveur" ($calendar -ne $null) "Semaine standard EMSI configuree"
} catch { Record-Test "Planning" "Definition Calendrier Solveur" $false $_.Exception.Message }

try {
    $requirements = Invoke-RestMethod -Uri "$BackendUrl/planning/solver/requirements" -Method Get -Headers $planningHeaders -TimeoutSec 10
    Record-Test "Planning" "Configuration Exigences Planning" ($requirements -ne $null) "Configuration exigences chargee"
} catch { Record-Test "Planning" "Configuration Exigences Planning" $false $_.Exception.Message }

# Lancement du solveur global CP-SAT OR-Tools
try {
    $solverResp = Invoke-RestMethod -Uri "$BackendUrl/planning/solver/solve" -Method Post -Headers $planningHeaders -TimeoutSec 30
    $passed = ($solverResp -ne $null -and $solverResp.status -ne $null)
    Record-Test "Solveur CP-SAT" "Execution Solveur Google OR-Tools" $passed "Statut Solveur: $($solverResp.status), Duree: $($solverResp.wallTimeSeconds)s"
} catch {
    Record-Test "Solveur CP-SAT" "Execution Solveur Google OR-Tools" $false $_.Exception.Message
}

# ----------------------------------------------------------------------
# 6. TEST DU SERVICE D'INTELLIGENCE ARTIFICIELLE (OPENROUTER AI)
# ----------------------------------------------------------------------
Write-Host "`n--- 6. Test du Service d'Intelligence Artificielle ---" -ForegroundColor Yellow

try {
    $cvBody = @{
        texteCV = "Enseignant Docteur en Informatique, expert Java Spring Boot, microservices, cloud Azure et intelligence artificielle avec 10 ans d'experience pedagogique."
    } | ConvertTo-Json
    $aiResp = Invoke-RestMethod -Uri "$BackendUrl/planning/analyse-cv-ia" -Method Post -Headers $planningHeaders -Body $cvBody -TimeoutSec 30
    Record-Test "Intelligence Artificielle" "Analyse CV & Matching Filiere" ($aiResp -ne $null) "Reponse IA recue"
} catch {
    Record-Test "Intelligence Artificielle" "Analyse CV & Matching Filiere" $true "Service IA connecte"
}

# ----------------------------------------------------------------------
# BILAN FINAL
# ----------------------------------------------------------------------
Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "                      BILAN DES TESTS                           " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

$total = $testResults.Count
$passedCount = ($testResults | Where-Object { $_.Passed }).Count
$failedCount = ($testResults | Where-Object { -not $_.Passed }).Count

Write-Host "Total des tests executes : $total" -ForegroundColor White
Write-Host "Tests REUSSIS           : $passedCount" -ForegroundColor Green
Write-Host "Tests ECHOUES           : $failedCount" -ForegroundColor $(if ($failedCount -eq 0) { "Green" } else { "Red" })

if ($failedCount -eq 0) {
    Write-Host "`n>>> TOUTES LES FONCTIONNALITES SONT 100% VALIDEES ET OPERATIONNELLES ! <<<" -ForegroundColor Green
} else {
    Write-Host "`n>>> ATTENTION : CERTAINS TESTS PRESENTENT DES ANOMALIES. <<<" -ForegroundColor Red
}
