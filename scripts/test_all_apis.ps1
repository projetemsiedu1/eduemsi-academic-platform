# Test script for all EMSI Academic APIs including new CRUDs
$baseUrl = "http://localhost:8085/api/v1"

Write-Host "================================================="
Write-Host "DEBUT DU TEST INTEGRAL DES CRUDs BACKEND"
Write-Host "================================================="

$results = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
        }
        if ($Headers.Count -gt 0) { $params.Headers = $Headers }
        if ($Body -ne $null) { $params.Body = ($Body | ConvertTo-Json -Depth 10) }

        $res = Invoke-RestMethod @params
        $sw.Stop()
        Write-Host "[PASS] $Name ($($sw.ElapsedMilliseconds) ms)" -ForegroundColor Green
        return [PSCustomObject]@{
            Nom = $Name
            Status = "SUCCES"
            TempsMs = $sw.ElapsedMilliseconds
            Details = "OK"
            Data = $res
        }
    } catch {
        $sw.Stop()
        Write-Host "[FAIL] $Name - $($_.Exception.Message)" -ForegroundColor Red
        return [PSCustomObject]@{
            Nom = $Name
            Status = "ECHEC"
            TempsMs = $sw.ElapsedMilliseconds
            Details = $_.Exception.Message
            Data = $null
        }
    }
}

# 1. Login
$loginRes = Test-Endpoint -Name "Auth - Login (admin)" -Url "$baseUrl/auth/login" -Method "POST" -Body @{
    username = "admin"
    password = "Admin@2026!"
}
$token = $loginRes.Data.accessToken
$authHeader = @{ Authorization = "Bearer $token" }
$results += $loginRes

# 2. CRUD Filières
$filCreate = Test-Endpoint -Name "Filières - POST Create" -Url "$baseUrl/filieres" -Method "POST" -Headers $authHeader -Body @{
    code = "5A-TEST"
    libelle = "Filière Test Ingénierie"
}
$results += $filCreate
$filId = $filCreate.Data.id

$results += (Test-Endpoint -Name "Filières - GET by ID" -Url "$baseUrl/filieres/$filId" -Headers $authHeader)

$results += (Test-Endpoint -Name "Filières - PUT Update" -Url "$baseUrl/filieres/$filId" -Method "PUT" -Headers $authHeader -Body @{
    code = "5A-TEST2"
    libelle = "Filière Test Mise à Jour"
})

$results += (Test-Endpoint -Name "Filières - DELETE" -Url "$baseUrl/filieres/$filId" -Method "DELETE" -Headers $authHeader)

# 3. CRUD Enseignants
$ensCreate = Test-Endpoint -Name "Enseignants - POST Create (Vacataire)" -Url "$baseUrl/enseignants" -Method "POST" -Headers $authHeader -Body @{
    matricule = "ENS-TEST-99"
    nom = "Mansouri"
    prenom = "Youssef"
    email = "youssef.mansouri.test@emsi-edu.ma"
    telephone = "0677889900"
    specialite = "DevOps & Cloud Native"
    typeContrat = "VACATAIRE"
    heuresContractuellesSemaine = 12
}
$results += $ensCreate
$ensId = $ensCreate.Data.id

$results += (Test-Endpoint -Name "Enseignants - GET by ID" -Url "$baseUrl/enseignants/$ensId" -Headers $authHeader)

$results += (Test-Endpoint -Name "Enseignants - PUT Update" -Url "$baseUrl/enseignants/$ensId" -Method "PUT" -Headers $authHeader -Body @{
    matricule = "ENS-TEST-99"
    nom = "Mansouri"
    prenom = "Youssef"
    email = "youssef.mansouri.test@emsi-edu.ma"
    telephone = "0677889911"
    specialite = "DevOps & SRE"
    typeContrat = "PERMANENT"
    heuresContractuellesSemaine = 18
})

$results += (Test-Endpoint -Name "Enseignants - DELETE" -Url "$baseUrl/enseignants/$ensId" -Method "DELETE" -Headers $authHeader)

# 4. CRUD Étudiants
$etuCreate = Test-Endpoint -Name "Étudiants - POST Create" -Url "$baseUrl/etudiants" -Method "POST" -Headers $authHeader -Body @{
    matricule = "ETU-TEST-999"
    nom = "Benjelloun"
    prenom = "Tariq"
    email = "tariq.benjelloun.test@emsi-edu.ma"
    telephone = "0655443322"
    groupeId = 1
    totalHeuresModuleSemestre = 90.00
}
$results += $etuCreate
$etuId = $etuCreate.Data.id

$results += (Test-Endpoint -Name "Étudiants - GET by ID" -Url "$baseUrl/etudiants/$etuId" -Headers $authHeader)

$results += (Test-Endpoint -Name "Étudiants - GET by Groupe" -Url "$baseUrl/etudiants/groupe/1" -Headers $authHeader)

$results += (Test-Endpoint -Name "Étudiants - PUT Update" -Url "$baseUrl/etudiants/$etuId" -Method "PUT" -Headers $authHeader -Body @{
    matricule = "ETU-TEST-999"
    nom = "Benjelloun"
    prenom = "Tariq"
    email = "tariq.benjelloun.test@emsi-edu.ma"
    telephone = "0655443399"
    groupeId = 1
    totalHeuresModuleSemestre = 90.00
})

# 5. CRUD Absences (avec l'étudiant créé)
$absCreate = Test-Endpoint -Name "Absences - POST Enregistrer" -Url "$baseUrl/absences/enregistrer" -Method "POST" -Headers $authHeader -Body @{
    etudiantId = $etuId
    seanceId = 1
    motif = "Absence non justifiée séance TP"
}
$results += $absCreate

if ($absCreate.Data -ne $null -and $absCreate.Data.id) {
    $absId = $absCreate.Data.id
    $results += (Test-Endpoint -Name "Absences - PATCH Justifier" -Url "$baseUrl/absences/$absId/justifier" -Method "PATCH" -Headers $authHeader -Body @{
        motif = "Certificat médical fourni"
        justifiee = $true
    })

    $results += (Test-Endpoint -Name "Absences - DELETE" -Url "$baseUrl/absences/$absId" -Method "DELETE" -Headers $authHeader)
}

# Cleanup étudiant test
$results += (Test-Endpoint -Name "Étudiants - DELETE" -Url "$baseUrl/etudiants/$etuId" -Method "DELETE" -Headers $authHeader)

# 6. Salles CRUD test
$salleCreate = Test-Endpoint -Name "Salles - POST Create" -Url "$baseUrl/salles" -Method "POST" -Headers $authHeader -Body @{
    campusId = 1
    codeSalle = "LAB-TEST-01"
    typeSalle = "LI_PC"
    capacite = 35
    nombrePcOperationnels = 35
    specsEquipements = "PC Dell i7 32GB RAM"
}
$results += $salleCreate
if ($salleCreate.Data -ne $null -and $salleCreate.Data.id) {
    $sId = $salleCreate.Data.id
    $results += (Test-Endpoint -Name "Salles - DELETE" -Url "$baseUrl/salles/$sId" -Method "DELETE" -Headers $authHeader)
}

# 7. IA Matching Jury
$matchReq = @{
    sujet = "Système IA de Détection Prédictive de Pannes IoT"
    resume = "Déploiement d'un modèle TinyML sur microcontrôleurs ESP32 pour prédire l'usure de moteurs industriels"
    technologies = "Python, TensorFlow Lite, ESP32, MQTT, C++"
    encadrant = "Mme. Tazi Kenza"
}
$results += (Test-Endpoint -Name "IA - Matching Jury 4 membres" -Url "$baseUrl/pfe/match-jury" -Method "POST" -Headers $authHeader -Body $matchReq)

# 8. Planning OR-Tools Solver
$results += (Test-Endpoint -Name "Planning - Génération OR-Tools CP-SAT" -Url "$baseUrl/planning/generer" -Method "POST" -Headers $authHeader)

Write-Host "`n================================================="
Write-Host "RESUME GLOBAL DE LA VALIDATION CRUD"
Write-Host "================================================="
$total = $results.Count
$succes = ($results | Where-Object { $_.Status -eq "SUCCES" }).Count
$echecs = ($results | Where-Object { $_.Status -eq "ECHEC" }).Count

Write-Host "Total tests: $total"
Write-Host "Succes: $succes" -ForegroundColor Green
Write-Host "Echecs: $echecs" -ForegroundColor $(if ($echecs -eq 0) { "Green" } else { "Red" })
