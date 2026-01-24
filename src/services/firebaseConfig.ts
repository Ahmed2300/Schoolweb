/**
 * Firebase Configuration and Initialization
 * @module services/firebaseConfig
 * 
 * Initializes Firebase app with Remote Config for maintenance mode toggle.
 * Security: API keys are safe in client-side code for Firebase; rules protect data.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getRemoteConfig, type RemoteConfig } from 'firebase/remote-config';

// Firebase configuration from user's project
const firebaseConfig = {
    apiKey: "AIzaSyD9vlvw5BMeC90FKD6Tis23qky4fgo3q6o",
    authDomain: "storedate-208cb.firebaseapp.com",
    databaseURL: "https://storedate-208cb-default-rtdb.firebaseio.com",
    projectId: "storedate-208cb",
    storageBucket: "storedate-208cb.firebasestorage.app",
    messagingSenderId: "406581434676",
    appId: "1:406581434676:web:1e9228d208855ce559ad61",
    measurementId: "G-LT13GV7C0Q"
};

// Initialize Firebase app
let app: FirebaseApp;

try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    // App might already be initialized
    console.warn('Firebase already initialized or error:', error);
    app = initializeApp(firebaseConfig, 'maintenance-app');
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
    // Create a minimal fallback
    remoteConfig = {
        defaultConfig: { isLive: true },
        settings: { minimumFetchIntervalMillis: 0, fetchTimeoutMillis: 30000 },
    } as unknown as RemoteConfig;
}

export { app, remoteConfig };
