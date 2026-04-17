@echo off
REM One-shot setup for Windows. Run from inside pandora-charm-tracker\:
REM   setup.bat
setlocal

where python >nul 2>nul
if errorlevel 1 (
    echo Python not found. Install from https://python.org/downloads then rerun.
    exit /b 1
)

echo -^> creating virtual environment (.venv)
python -m venv .venv
call .venv\Scripts\activate.bat

echo -^> installing dependencies
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

if not exist config.yaml (
    echo -^> creating config.yaml from example
    copy /Y config.example.yaml config.yaml >nul
) else (
    echo -^> config.yaml already exists, leaving it alone
)

echo.
echo Setup complete. To run:
echo    .venv\Scripts\activate.bat
echo    python main.py -c config.yaml --once -v
echo    python main.py -c config.yaml --open
endlocal
