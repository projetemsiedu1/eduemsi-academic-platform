param(
    [string]$BaseUrl = 'http://localhost:8085/api/v1',
    [System.Management.Automation.PSCredential]$Credential,
    [string]$ReportPath
)
# Authenticated read-only smoke test. No fixed credentials, no database mutations.
$ErrorActionPreference = 'Stop'
if (-not $Credential) { $Credential = Get-Credential -Message 'Compte EMSI de test (responsable planning ou administrateur)' }
$body = @{ username = $Credential.UserName; password = $Credential.GetNetworkCredential().Password } | ConvertTo-Json
try {
    $session = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 20
} finally { $body = $null }
if (-not $session.accessToken) { throw 'La connexion ne retourne aucun jeton.' }
$headers = @{ Authorization = "Bearer $($session.accessToken)" }
$checks = @('/auth/me', '/filieres/all', '/salles', '/enseignants', '/groupes', '/planning/workspace')
$results = foreach ($endpoint in $checks) {
    try {
        $null = Invoke-RestMethod -Uri "$BaseUrl$endpoint" -Headers $headers -TimeoutSec 20
        Write-Host "[OK] GET $endpoint" -ForegroundColor Green
        [PSCustomObject]@{ Endpoint = $endpoint; Success = $true }
    } catch {
        Write-Host "[ECHEC] GET $endpoint : $($_.Exception.Message)" -ForegroundColor Red
        [PSCustomObject]@{ Endpoint = $endpoint; Success = $false }
    }
}
$headers.Clear()
$session = $null
if ($ReportPath) { $results | ConvertTo-Json | Set-Content -LiteralPath $ReportPath -Encoding UTF8 }
if ($results.Where({ -not $_.Success }).Count -gt 0) { exit 1 }
Write-Host 'Tous les contrôles de lecture ont réussi.' -ForegroundColor Green
