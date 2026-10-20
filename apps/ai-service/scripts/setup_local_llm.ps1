# Created by Sekar Nagarajan (2026-10-20 20:50)
#
# Set up a fully local LLM for the AI service on Windows (no API key, no quota).
# Checks/installs Ollama, pulls a model, and prints the .env block to use.
#
#   .\scripts\setup_local_llm.ps1
#   .\scripts\setup_local_llm.ps1 qwen2.5:7b
#
# Re-run any time; steps are idempotent.

param(
    [string]$Model = "llama3.2:3b"
)

$ErrorActionPreference = "Stop"
$OllamaHostUrl = "http://localhost:11434"

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host $Message -ForegroundColor White
}

Write-Step "1/4  Checking Ollama"
$ollamaCmd = Get-Command ollama -ErrorAction SilentlyContinue
if ($ollamaCmd) {
    $ver = & ollama --version 2>&1 | Select-Object -First 1
    Write-Host "    already installed: $ver"
} else {
    Write-Host "    not installed - opening the official Windows installer page"
    Write-Host "    Download and install from https://ollama.com/download/windows"
    Write-Host "    then re-run this script."
    Start-Process "https://ollama.com/download/windows"
    exit 1
}

Write-Step "2/4  Starting the Ollama server"
function Test-OllamaReady {
    try {
        $null = Invoke-WebRequest -Uri "$OllamaHostUrl/api/tags" -TimeoutSec 3 -UseBasicParsing
        return $true
    } catch {
        return $false
    }
}

$serving = Test-OllamaReady
if ($serving) {
    Write-Host "    already serving on $OllamaHostUrl"
} else {
    Write-Host "    starting Ollama (Windows app + serve)..."
    $ollamaDir = Split-Path -Parent (Get-Command ollama).Source
    $ollamaApp = Join-Path $ollamaDir "ollama app.exe"
    if (Test-Path $ollamaApp) {
        Start-Process -FilePath $ollamaApp -ErrorAction SilentlyContinue
    }
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden -ErrorAction SilentlyContinue
    for ($i = 0; $i -lt 60; $i++) {
        if (Test-OllamaReady) {
            $serving = $true
            break
        }
        Start-Sleep -Seconds 2
    }
    if ($serving) {
        Write-Host "    serving on $OllamaHostUrl"
    } else {
        Write-Host "    ERROR: Ollama did not become ready on $OllamaHostUrl" -ForegroundColor Red
        Write-Host "    Start the Ollama app from the Start menu, then re-run this script."
        exit 1
    }
}

Write-Step "3/4  Pulling model: $Model"
Write-Host "    A 3B model stays responsive on CPU; use qwen2.5:7b for stronger tool calling."
& ollama pull $Model

Write-Step "4/4  Configure the service"
Write-Host ""
Write-Host "    Put this in apps/ai-service/.env (replacing any other LLM_PROVIDER lines):"
Write-Host ""
Write-Host "      LLM_PROVIDER=openai"
Write-Host "      OPENAI_API_KEY=ollama"
Write-Host "      OPENAI_BASE_URL=$OllamaHostUrl/v1"
Write-Host "      OPENAI_CHAT_MODEL=$Model"
Write-Host "      OPENAI_GUARD_MODEL=$Model"
Write-Host ""
Write-Host "    Then verify tool calling actually works with this model:"
Write-Host ""
Write-Host "      uv run python scripts/check_local_llm.py"
Write-Host ""
