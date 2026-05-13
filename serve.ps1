# Статический сервер без Python и Node (только PowerShell / .NET).
# Запуск:  powershell -ExecutionPolicy Bypass -File .\serve.ps1
# Браузер: http://localhost:8080/standalone.html

param(
    [int]$Port = 8080,
    [string]$Root = $PSScriptRoot
)

$ErrorActionPreference = "Stop"
$Root = [System.IO.Path]::GetFullPath($Root)

# UTF-8 console output (reduces mojibake for Cyrillic; English lines below always read OK)
try {
    if ($PSVersionTable.PSVersion.Major -ge 6) {
        [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    } else {
        chcp 65001 | Out-Null
        [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    }
} catch { }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
try {
    $listener.Start()
} catch {
    Write-Host "ERROR: Could not bind port $Port. Try another port, e.g.:" -ForegroundColor Red
    Write-Host "  powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 9090" -ForegroundColor Yellow
    throw
}

$url = "http://127.0.0.1:$Port/standalone.html"
Write-Host ""
Write-Host "Serving folder: $Root" -ForegroundColor Cyan
Write-Host "Open in browser (standalone demo):" -ForegroundColor Green
Write-Host "  $url" -ForegroundColor White
Write-Host ""
Write-Host "Note: full UI is the React app -> npm run dev" -ForegroundColor DarkGray
Write-Host "Stop server: Ctrl+C" -ForegroundColor DarkGray
Write-Host ""

function Get-ContentType {
    param([string]$Path)
    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        ".html" { return "text/html; charset=utf-8" }
        ".htm" { return "text/html; charset=utf-8" }
        ".js" { return "application/javascript; charset=utf-8" }
        ".css" { return "text/css; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".svg" { return "image/svg+xml" }
        ".ico" { return "image/x-icon" }
        ".png" { return "image/png" }
        default { return "application/octet-stream" }
    }
}

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $req = $ctx.Request
        $res = $ctx.Response

        $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart("/"))
        if ([string]::IsNullOrWhiteSpace($rel) -or $rel -eq "/") {
            $rel = "standalone.html"
        }
        $rel = $rel -replace "/", [System.IO.Path]::DirectorySeparatorChar

        $candidate = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($Root, $rel))
        if (-not $candidate.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
            $res.StatusCode = 403
            $res.Close()
            continue
        }

        if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
            $res.StatusCode = 404
            $enc = [System.Text.Encoding]::UTF8
            $msg = $enc.GetBytes("404 Not Found")
            $res.ContentType = "text/plain; charset=utf-8"
            $res.ContentLength64 = $msg.Length
            $res.OutputStream.Write($msg, 0, $msg.Length)
            $res.OutputStream.Close()
            continue
        }

        $bytes = [System.IO.File]::ReadAllBytes($candidate)
        $res.StatusCode = 200
        $res.ContentType = Get-ContentType -Path $candidate
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        $res.OutputStream.Close()
    }
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
