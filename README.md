
# Workout Tracker Offline

A GitHub-ready offline Android app project built with Capacitor. The app stores workout data locally on-device and does not require a server connection.

## Features
- Offline local-first workout logging.
- Strength, Zone 2, interval, and recovery day templates.
- Edit and delete sessions.
- Weekly trend charts.
- JSON export and import for backups.
- GitHub Actions workflow to build a debug APK artifact.

## GitHub upload
1. Create a new GitHub repository.
2. Upload all files from this project.
3. Push to `main` or `master`.
4. Open the **Actions** tab.
5. Run **Build Android Debug APK**.
6. Download the APK artifact.

## Local build
### macOS / Linux
```bash
bash scripts/build-debug.sh
```

### Windows
```bat
scripts\build-debug.bat
```

## Package details
- App name: `Workout Tracker Offline`
- Android application ID: `com.workouttrackeroffline.app`

## Notes
- The included GitHub workflow builds a debug APK, not a signed Play Store release.
- For a store release later, you would add signing credentials and a release workflow.
