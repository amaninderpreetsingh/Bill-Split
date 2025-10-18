import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.billsplitAman.app',
  appName: 'Bill Split',
  webDir: 'dist',
  server: {
    hostname: 'bill-split-lemon.vercel.app',
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
  },
};

export default config;
