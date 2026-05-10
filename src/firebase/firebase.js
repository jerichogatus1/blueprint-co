import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZbkC7gufuCJO_ls0NiAg4U9FyQTRKVAA",
  authDomain: "blueprint-co-6ac48.firebaseapp.com",
  projectId: "blueprint-co-6ac48",
  storageBucket: "blueprint-co-6ac48.firebasestorage.app",
  messagingSenderId: "1644406644",
  appId: "1:1644406644:web:87ca46a38d1812d8f2ae21",
  measurementId: "G-MJW0BKRGLE"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
