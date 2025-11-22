import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

// Global error handler for unhandled errors
if (__DEV__) {
  const originalError = console.error;
  console.error = (...args) => {
    originalError.apply(console, args);
    // Log all errors to terminal with full details
    if (args && args.length > 0) {
      args.forEach((arg) => {
        if (arg instanceof Error) {
          console.error('===========================================');
          console.error('[UNHANDLED ERROR]', arg.message);
          console.error('[UNHANDLED ERROR] Stack:', arg.stack);
          console.error('[UNHANDLED ERROR] Full error:', JSON.stringify(arg, Object.getOwnPropertyNames(arg), 2));
          console.error('===========================================');
        }
      });
    }
  };
}

function AppContent() {
  console.log('[APP] AppContent rendering...');
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  console.log('[APP] Dark mode:', isDarkMode);

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  console.log('===========================================');
  console.log('[APP] App starting...');
  console.log('[APP] Redux store initialized');
  console.log('===========================================');
  
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
