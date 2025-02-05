import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: "quizzital-v2.firebaseapp.com",
  projectId: "quizzital-v2",
  storageBucket: "quizzital-v2.firebasestorage.app",
  messagingSenderId: "554270051416",
  appId: "1:554270051416:web:5aaa7120874cb17a714e2d",
  measurementId: "G-0VBYSP4EQ7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider()