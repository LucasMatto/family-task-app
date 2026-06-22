import React, { createContext, useContext, useState, useEffect } from "react";
import { initializeApp, deleteApp } from "firebase/app";
import { auth, db, firebaseConfig, isFirebaseConfigured } from "../services/firebase";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Initial default users for Mock Mode
const MOCK_DEMO_USERS = [
  {
    uid: "mock-parent-123",
    email: "padre@demo.com",
    password: "password123",
    firstName: "Ana",
    lastName: "García",
    displayName: "Ana García",
    role: "Padre"
  },
  {
    uid: "mock-child-456",
    email: "hijo@demo.com",
    password: "password123",
    firstName: "Lucas",
    lastName: "García",
    displayName: "Lucas García",
    role: "Hijo"
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Auth
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let profile = {};
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) profile = snap.data();
        } catch (err) {
          console.error("Error leyendo perfil:", err);
        }
        const firstName = profile.first_name;
        const lastName = profile.last_name;
        const displayName = `${firstName || ""} ${lastName || ""}`.trim() || user.email;
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName,
          firstName,
          lastName,
          parentUid: profile.parentUid || null,
          role: profile.role || "Padre"
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register function (solo email + password). Quien se registra es Padre.
  async function register(email, password) {
    setError(null);
    setLoading(true);

    if (!isFirebaseConfigured) {
      // Mock Register
      const newUser = {
        uid: `mock-user-${Date.now()}`,
        email,
        password,
        displayName: email,
        role: "Padre"
      };
      MOCK_DEMO_USERS.push(newUser);
      setCurrentUser(newUser);
      setLoading(false);
      return newUser;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar perfil en Firestore sin bloquear el registro si falla.
      try {
        await setDoc(doc(db, 'users', user.uid), { email, role: "Padre" });
      } catch (firestoreErr) {
        console.error("No se pudo guardar el perfil en Firestore:", firestoreErr);
      }

      const userData = {
        uid: user.uid,
        email,
        displayName: email,
        role: "Padre"
      };
      setCurrentUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }

  // Registrar un Hijo desde la sesión del Padre, SIN perder la sesión actual.
  // Usa una app secundaria de Firebase para no cambiar el usuario logueado.
  // parentUid: a qué padre pertenece el hijo.
  async function registerChild(parentUid, email, password, firstName, lastName) {
    setError(null);

    if (!isFirebaseConfigured) {
      // Mock: agregar hijo a la lista en memoria, ligado a su padre.
      const newChild = {
        uid: `mock-child-${Date.now()}`,
        email,
        password,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`.trim(),
        role: "Hijo",
        parentUid
      };
      MOCK_DEMO_USERS.push(newChild);
      return newChild;
    }

    // App secundaria: crea el usuario sin afectar la sesión del padre.
    const secondaryApp = initializeApp(firebaseConfig, `child-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);
    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const childUid = cred.user.uid;

      // Guardar el perfil del hijo en Firestore (con la sesión del padre/db principal).
      try {
        await setDoc(doc(db, 'users', childUid), {
          email,
          first_name: firstName,
          last_name: lastName,
          role: "Hijo",
          parentUid
        });
      } catch (firestoreErr) {
        console.error("No se pudo guardar el perfil del hijo en Firestore:", firestoreErr);
      }

      await signOut(secondaryAuth);
      return {
        uid: childUid,
        email,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`.trim(),
        role: "Hijo",
        parentUid
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      await deleteApp(secondaryApp);
    }
  }

  // Obtener los hijos de un padre.
  async function getChildren(parentUid) {
    if (!isFirebaseConfigured) {
      return MOCK_DEMO_USERS
        .filter(u => u.role === "Hijo" && u.parentUid === parentUid)
        .map(u => ({
          uid: u.uid,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          displayName: u.displayName || `${u.firstName || ""} ${u.lastName || ""}`.trim(),
          role: "Hijo"
        }));
    }

    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", "Hijo"),
        where("parentUid", "==", parentUid)
      );
      const snap = await getDocs(q);
      const list = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        list.push({
          uid: docSnap.id,
          email: d.email,
          firstName: d.first_name,
          lastName: d.last_name,
          displayName: `${d.first_name || ""} ${d.last_name || ""}`.trim() || d.email,
          role: "Hijo"
        });
      });
      return list;
    } catch (err) {
      console.error("Error obteniendo hijos:", err);
      return [];
    }
  }

  // Login function
  async function login(email, password) {
    setError(null);
    setLoading(true);

    if (!isFirebaseConfigured) {
      // Mock Login lookup
      const found = MOCK_DEMO_USERS.find(u => u.email === email && u.password === password);
      if (found) {
        setCurrentUser(found);
        setLoading(false);
        return found;
      } else {
        setLoading(false);
        const errMsg = "Correo o contraseña incorrectos (Modo Demo)";
        setError(errMsg);
        throw new Error(errMsg);
      }
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let profile = {};
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) profile = snap.data();
      } catch (err) {
        console.error("Error leyendo perfil:", err);
      }

      const firstName = profile.first_name;
      const lastName = profile.last_name;
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: `${firstName || ""} ${lastName || ""}`.trim() || user.email,
        firstName,
        lastName,
        parentUid: profile.parentUid || null,
        role: profile.role || "Padre"
      };
      setCurrentUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      const friendlyMessage = err.message || "Error de autenticación";
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  }

  // Logout function
  async function logout() {
    setError(null);
    setLoading(true);

    if (!isFirebaseConfigured) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      await signOut(auth);
      setCurrentUser(null);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  }

  const value = {
    currentUser,
    loading,
    error,
    isFirebaseConfigured,
    register,
    registerChild,
    getChildren,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
