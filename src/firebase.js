import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDapH5SiFZAd9SVIrIgo_X9mLSV3iJ-Gw",
  authDomain: "budgeti-ffaa8.firebaseapp.com",
  projectId: "budgeti-ffaa8",
  storageBucket: "budgeti-ffaa8.firebasestorage.app",
  messagingSenderId: "705782887285",
  appId: "1:705782887285:web:caa5c99b3e85b62016193c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
