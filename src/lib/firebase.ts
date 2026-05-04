import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7b9hmwXeJdKQUeaRoDlmJafymUyiagro",
  authDomain: "prodigy-task-1.firebaseapp.com",
  projectId: "prodigy-task-1",
  storageBucket: "prodigy-task-1.firebasestorage.app",
  messagingSenderId: "660032754498",
  appId: "1:660032754498:web:acc94b7d7c6a26a4e6eedb",
  measurementId: "G-T9Q979GDFX",
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
