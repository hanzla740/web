# SitiNet ISP Portal - Start Script
Write-Host "Starting SitiNet ISP Portal..." -ForegroundColor Cyan

# Activate virtual environment
if (Test-Path ".\.venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Green
    & .\.venv\Scripts\Activate.ps1
    
    Write-Host ""
    Write-Host "Access Points:" -ForegroundColor Cyan
    Write-Host "  Customer Portal: http://127.0.0.1:5000/" -ForegroundColor White
    Write-Host "  Admin Dashboard: http://127.0.0.1:5000/admin" -ForegroundColor White
    Write-Host ""
    Write-Host "Default Admin: admin / admin123" -ForegroundColor Yellow
    Write-Host ""
    
    # Start Flask
    python app.py
} else {
    Write-Host "Virtual environment not found!" -ForegroundColor Red
    Write-Host "Run: python -m venv .venv" -ForegroundColor Yellow
}
