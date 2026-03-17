
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.workouttrackeroffline.app',
  appName: 'Workout Tracker Offline',
  webDir: 'www',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#f6f7f4'
  }
};

export default config;
