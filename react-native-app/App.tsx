import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ToastProvider } from 'react-native-toast-notifications';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </ToastProvider>
    </AuthProvider>
  );
}
