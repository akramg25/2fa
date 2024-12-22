@echo off

if not exist .\backend\venv\Scripts\activate.bat (
    python3 -m venv .\backend\venv
)

call .\backend\venv\Scripts\activate
pip3 install -r .\backend\requirements.txt

start cmd /b /k "python .\backend\app.py"

if errorlevel 1 (
    echo Error
    exit 1
)

if not exist .\frontend\node_modules (
    pnpm --version > nul 2>&1 || npm install -g pnpm
    if errorlevel 1 (
        echo Error
        exit 1
    )
    cd frontend && pnpm install
)

if errorlevel 1 (
    echo Error
    exit 1
)

start cmd /b /k "cd frontend && pnpm run dev"