
@echo off
where npm >nul 2>nul
if errorlevel 1 (
  echo npm not found. Install Node.js first.
  exit /b 1
)

if not exist android (
  echo Android platform missing. Adding Android platform...
  call npx cap add android
)

echo Installing dependencies...
call npm install
if errorlevel 1 exit /b 1

echo Syncing Capacitor project...
call npx cap sync android
if errorlevel 1 exit /b 1

echo Building debug APK...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 exit /b 1

echo Done. APK path: android\app\build\outputs\apk\debug\app-debug.apk
