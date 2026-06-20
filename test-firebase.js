import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

console.log("Iniciando validación con Firebase...");

try {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  async function runTest() {
    try {
      console.log("1. Probando escritura (crear documento)...");
      const tasksCol = collection(db, "users", "test_validation", "tasks");
      const docRef = await addDoc(tasksCol, {
        title: "Tarea de prueba",
        status: "Pendiente",
        timestamp: new Date().toISOString()
      });
      console.log("-> Éxito! Documento creado con ID:", docRef.id);

      console.log("2. Probando lectura (obtener documentos)...");
      const snapshot = await getDocs(tasksCol);
      console.log(`-> Éxito! Se encontraron ${snapshot.size} documentos en esta colección.`);

      console.log("3. Limpiando (borrando documento de prueba)...");
      await deleteDoc(doc(db, "users", "test_validation", "tasks", docRef.id));
      console.log("-> Éxito! Documento borrado.");

      console.log("✅ VALIDACIÓN COMPLETADA: La conexión a Firebase Firestore (Escritura/Lectura) funciona perfectamente.");
      process.exit(0);
    } catch (err) {
      console.error("❌ ERROR en operaciones de Firestore:", err);
      process.exit(1);
    }
  }

  runTest();
} catch (error) {
  console.error("❌ ERROR al inicializar Firebase:", error);
  process.exit(1);
}
