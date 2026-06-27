import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAhS2Szuf2g72QkohEvbmuJ-7R7e0KaGHk",
  authDomain: "restaurant-saas-menu-automaion.firebaseapp.com",
  projectId: "restaurant-saas-menu-automaion",
  storageBucket: "restaurant-saas-menu-automaion.firebasestorage.app",
  messagingSenderId: "736535863795",
  appId: "1:736535863795:web:c5fb97324b736fad3e3286",
  measurementId: "G-V32FKBP21W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
