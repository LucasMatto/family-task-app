import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db, isFirebaseConfigured } from "../services/firebase";
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          const profile = docSnap.exists() ? docSnap.data() : null;
          
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: profile ? `${profile.first_name} ${profile.last_name}` : "Usuario",
            firstName: profile?.first_name,
            lastName: profile?.last_name,
            role: profile?.role
          });
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register function
  async function register(email, password, firstName, lastName, role) {
    setError(null);
    setLoading(true);

    if (!isFirebaseConfigured) {
      // Mock Register
      const newUser = {
        uid: `mock-user-${Date.now()}`,
        email,
        password,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        role
      };
      MOCK_DEMO_USERS.push(newUser);
      setCurrentUser(newUser);
      setLoading(false);
      return newUser;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        first_name: firstName,
        last_name: lastName,
        email,
        role
      });
      
      const userData = {
        uid: user.uid,
        email,
        displayName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        role
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
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      const profile = docSnap.exists() ? docSnap.data() : null;
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Usuario",
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        role: profile?.role
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
    isSupabaseConfigured: isFirebaseConfigured, // fallback para componentes antiguos
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
