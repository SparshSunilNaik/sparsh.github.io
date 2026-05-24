$ErrorActionPreference = "SilentlyContinue"

$ports = @(3000, 3001)
foreach ($port in $ports) {
  $listeners = Get-NetTCPConnection -LocalPort $port -State Listen
  foreach ($listener in $listeners) {
    $proc = Get-Process -Id $listener.OwningProcess
    if ($proc -and ($proc.ProcessName -match "node|next" -or $proc.Path -match "node")) {
      Write-Host "Stopping stale dev server on port $port (PID $($proc.Id))"
      Stop-Process -Id $proc.Id -Force
    }
  }
}

$lock = Join-Path (Get-Location) ".next\dev\lock"
if (Test-Path $lock) {
  Remove-Item $lock -Force
  Write-Host "Removed stale Next dev lock"
}
