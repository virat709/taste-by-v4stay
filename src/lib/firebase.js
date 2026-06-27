import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAhS2Szuf2g72QkohEvbmuJ-7R7e0KaGHk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "restaurant-saas-menu-automaion.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "restaurant-saas-menu-automaion",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "restaurant-saas-menu-automaion.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "736535863795",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:736535863795:web:c5fb97324b736fad3e3286",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-V32FKBP21W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
