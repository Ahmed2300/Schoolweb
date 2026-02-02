/**
 * Firebase Configuration and Initialization
 * @module services/firebaseConfig
 * 
 * Initializes Firebase app with Remote Config for maintenance mode toggle.
 * Security: API keys are safe in client-side code for Firebase; rules protect data.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getRemoteConfig, type RemoteConfig } from 'firebase/remote-config';

// Firebase configuration from environment
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase app
let app: FirebaseApp;

try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    // Check if app is already initialized
    console.warn('Firebase initialization warning:', error);
    try {
        app = initializeApp(firebaseConfig, 'maintenance-app');
    } catch (e) {
        console.error('Critical: Failed to initialize Firebase App', e);
        throw e; // Crash if we can't initialize, it's safer than a broken mock
    }
}

// Initialize Remote Config with settings
let remoteConfig: RemoteConfig;

try {
    remoteConfig = getRemoteConfig(app);

    // Set minimum fetch interval (for development: 0, production: 3600000 = 1 hour)
    remoteConfig.settings = {
        minimumFetchIntervalMillis: import.meta.env.DEV ? 0 : 3600000,
        fetchTimeoutMillis: 30000,
    };

    // Default values - isLive defaults to true for safety (app stays accessible)
    remoteConfig.defaultConfig = {
        isLive: true,
    };
} catch (error) {
    console.error('Error initializing Remote Config:', error);
    // Do NOT return a mock object that crashes SDK methods.
    // Instead, throw or let the consumer handle the failure.
    // For now, we allow the app to run but with limited functionality.

    // We leave remoteConfig undefined here to force errors if used improperly, 
    // BUT since we export it, we must assign something safe or signal error.
    // However, the safest fallback for "isLive" logic is to just let the maintenance service catch the error.

    // Assigning a proxy or minimal object is risky.
    // Let's re-throw or rely on maintenanceService to catch the crash.
    // BUT to satisfy the type:
    // We will assign the real instance if possible. If getRemoteConfig fails, something is very wrong.
    throw error;
}

export { app, remoteConfig };
