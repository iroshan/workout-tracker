
#!/usr/bin/env bash
set -e

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found. Install Node.js first."
  exit 1
fi

if [ ! -d android ]; then
  echo "Android platform missing. Adding Android platform..."
  npx cap add android
fi

echo "Installing dependencies..."
npm install

echo "Syncing Capacitor project..."
npx cap sync android

echo "Building debug APK..."
cd android
./gradlew assembleDebug

echo "Done. APK path: android/app/build/outputs/apk/debug/app-debug.apk"
