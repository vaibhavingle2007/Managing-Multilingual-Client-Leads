/**
 * Firebase Configuration
 *
 * Initialize Firebase app and export auth service.
 * Replace placeholder values with your actual Firebase project config.
 *
 * To get your config:
 * 1. Go to Firebase Console → Project Settings
 * 2. Under "Your apps", select the web app
 * 3. Copy the firebaseConfig object
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase — prevent re-initialization in dev (hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth instance
const auth = getAuth(app);

export { app, auth };
