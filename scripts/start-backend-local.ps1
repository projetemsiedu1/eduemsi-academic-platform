param(
    [string]$DatabaseUser = 'root',
    [string]$JavaHome = $env:JAVA_HOME
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$maven = Get-Command mvn.cmd -ErrorAction Stop | Select-Object -First 1

function Test-Jdk21([string]$Directory) {
    if (-not $Directory) { return $false }
    $release = Join-Path $Directory 'release'
    return (Test-Path -LiteralPath $release) -and
        [bool](Select-String -LiteralPath $release -Pattern '^JAVA_VERSION="21[.\"]' -Quiet)
}

if (-not (Test-Jdk21 $JavaHome)) {
    $jdkRoot = Join-Path $env:ProgramFiles 'Eclipse Adoptium'
    if (Test-Path -LiteralPath $jdkRoot) {
        $JavaHome = Get-ChildItem -LiteralPath $jdkRoot -Directory -Filter 'jdk-21*' |
            Select-Object -First 1 -ExpandProperty FullName
    }
}
if (-not (Test-Jdk21 $JavaHome) -or -not (Test-Path -LiteralPath (Join-Path $JavaHome 'bin\java.exe'))) {
    throw 'Configurez JAVA_HOME vers le JDK 21, ou utilisez -JavaHome <dossier du JDK 21>.'
}

$keys = @('JAVA_HOME', 'PATH', 'SPRING_PROFILES_ACTIVE', 'SPRING_DATASOURCE_USERNAME', 'SPRING_DATASOURCE_PASSWORD')
$previous = @{}
foreach ($key in $keys) { $previous[$key] = [Environment]::GetEnvironmentVariable($key, 'Process') }
$password = $null
$passwordPointer = [IntPtr]::Zero
$locationPushed = $false
try {
    $env:JAVA_HOME = $JavaHome
    $env:PATH = (Join-Path $JavaHome 'bin') + ';' + $env:PATH
    $env:SPRING_PROFILES_ACTIVE = 'local'
    $env:SPRING_DATASOURCE_USERNAME = $DatabaseUser
    if ([string]::IsNullOrEmpty($env:SPRING_DATASOURCE_PASSWORD)) {
        $password = Read-Host "Mot de passe MySQL pour $DatabaseUser (saisie masquée)" -AsSecureString
        $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
        $env:SPRING_DATASOURCE_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    }
    Write-Host 'Lancement du backend-spring actuel sur http://localhost:8085 ; Ctrl+C pour arrêter.'
    Push-Location (Join-Path $projectRoot 'backend-spring')
    $locationPushed = $true
    & $maven.Source "-Dmaven.repo.local=$env:USERPROFILE\.m2\repository" spring-boot:run
    if ($LASTEXITCODE -ne 0) { throw 'Le backend a échoué. Consultez le message Spring Boot dans ce terminal.' }
}
finally {
    if ($locationPushed) { Pop-Location }
    if ($passwordPointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer) }
    if ($password) { $password.Dispose() }
    foreach ($key in $keys) { [Environment]::SetEnvironmentVariable($key, $previous[$key], 'Process') }
}
