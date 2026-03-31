@echo off
echo ============================================
echo HUMUS CSV Cleaner - Easy Run
echo ============================================
echo.
echo This will clean your CSV file for Supabase import.
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed!
    echo.
    echo Please install Python from: https://python.org
    echo During installation, CHECK "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo ✅ Python found
echo.

:: Run the cleaner
python clean_csv.py

:: Check if it succeeded
if errorlevel 1 (
    echo.
    echo ❌ Something went wrong. Check the error above.
) else (
    echo.
    echo ✅ Done! Look for the file ending in _CLEANED_FOR_SUPABASE.csv
)

pause
