import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if credentials are set and are not the placeholder strings
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your_api_key_here" &&
  firebaseConfig.apiKey !== "" &&
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== "your_project_id_here" &&
  firebaseConfig.projectId !== "";

let app;
let auth;
let db;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Forzar long-polling: evita el error de WebChannel/CORS de Firestore
    // en redes/extensiones que bloquean el streaming.
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
    console.log("Firebase inicializado con éxito.");
  } catch (error) {
    console.error("Error al inicializar Firebase. Se usará el modo simulado (Mock Mode).", error);
  }
} else {
  console.log("Credenciales de Firebase no detectadas. Iniciando en Modo Demo (Mock Mode).");
}

export { auth, db, firebaseConfig, isFirebaseConfigured };
