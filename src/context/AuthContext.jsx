import React, { createContext, useContext, useState, useEffect } from "react";
import { auth as firebaseAuth, db as firebaseDb, isFirebaseConfigured } from "../services/firebase";
import { supabase, isSupabaseConfigured } from "../services/supabase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile
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
    if (isFirebaseConfigured) {
      // Firebase auth listener
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          try {
            // Get user role from Firestore
            const docRef = doc(firebaseDb, "users", user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const data = docSnap.data();
              setCurrentUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || `${data.firstName} ${data.lastName}`,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role
              });
            } else {
              // Fallback if no Firestore profile yet
              setCurrentUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || "Usuario",
                role: "Padre" // default fallback
              });
            }
          } catch (err) {
            console.error("Error al obtener perfil de Firestore:", err);
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || "Usuario",
              role: "Padre"
            });
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    } else {
      // Local Mock Auth Logic
      // Seed default users in localStorage if they don't exist
      const localUsers = localStorage.getItem("fc_mock_users");
      if (!localUsers) {
        localStorage.setItem("fc_mock_users", JSON.stringify(MOCK_DEMO_USERS));
      }

      // Check for active session
      const activeUser = localStorage.getItem("fc_mock_current_user");
      if (activeUser) {
        setCurrentUser(JSON.parse(activeUser));
      }
      setLoading(false);
    }
  }, []);

  // Register function
  async function register(email, password, firstName, lastName, role) {
    setError(null);
    setLoading(true);

    if (isSupabaseConfigured) {
      // Supabase registration flow
      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { first_name: firstName, last_name: lastName, role } }
        });
        if (signUpError) throw signUpError;
        // Insert profile into 'profiles' table (or 'users')
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: signUpData.user.id,
            first_name: firstName,
            last_name: lastName,
            email,
            role
          });
        if (insertError) throw insertError;
        const userData = {
          uid: signUpData.user.id,
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
    } else if (isFirebaseConfigured) {
      // Existing Firebase flow (unchanged)
      try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const user = userCredential.user;
        const displayName = `${firstName} ${lastName}`;
        await updateProfile(user, { displayName });
        await setDoc(doc(firebaseDb, "users", user.uid), {
          firstName,
          lastName,
          email,
          role,
          hijos: []
        });
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName,
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
    } else {
      // Mock Register (unchanged)
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const users = JSON.parse(localStorage.getItem("fc_mock_users") || "[]");
            if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
              const err = new Error("El correo electrónico ya está registrado.");
              setError(err.message);
              setLoading(false);
              return reject(err);
            }
            const newUser = {
              uid: `mock-user-${Date.now()}`,
              email,
              password,
              firstName,
              lastName,
              displayName: `${firstName} ${lastName}`,
              role
            };
            users.push(newUser);
            localStorage.setItem("fc_mock_users", JSON.stringify(users));
            const loggedInUser = {
              uid: newUser.uid,
              email: newUser.email,
              displayName: newUser.displayName,
              firstName: newUser.firstName,
              lastName: newUser.lastName,
              role: newUser.role
            };
            localStorage.setItem("fc_mock_current_user", JSON.stringify(loggedInUser));
            setCurrentUser(loggedInUser);
            setLoading(false);
            resolve(loggedInUser);
          } catch (err) {
            setLoading(false);
            setError(err.message);
            reject(err);
          }
        }, 1000);
      });
    }
  }

  // Login function
  async function login(email, password) {
    setError(null);
    setLoading(true);

    if (isSupabaseConfigured) {
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        // Fetch profile from 'profiles' table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, role')
          .eq('id', signInData.user.id)
          .single();
        if (profileError) throw profileError;
        const userData = {
          uid: signInData.user.id,
          email: signInData.user.email,
          displayName: `${profile.first_name} ${profile.last_name}`.trim(),
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.role
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
    } else if (isFirebaseConfigured) {
      // Existing Firebase login (unchanged)
      try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const user = userCredential.user;
        const docRef = doc(firebaseDb, "users", user.uid);
        const docSnap = await getDoc(docRef);
        let role = "Padre";
        let firstName = "";
        let lastName = "";
        if (docSnap.exists()) {
          const data = docSnap.data();
          role = data.role || "Padre";
          firstName = data.firstName || "";
          lastName = data.lastName || "";
        }
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || `${firstName} ${lastName}`.trim() || "Usuario",
          firstName,
          lastName,
          role
        };
        setCurrentUser(userData);
        setLoading(false);
        return userData;
      } catch (err) {
        setLoading(false);
        let friendlyMessage = err.message;
        if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          friendlyMessage = "Correo o contraseña incorrectos.";
        }
        setError(friendlyMessage);
        throw new Error(friendlyMessage);
      }
    } else {
        // Mock Login
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const users = JSON.parse(localStorage.getItem("fc_mock_users") || "[]");
            const user = users.find(
              u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );

            if (user) {
              const loggedInUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
              };
              localStorage.setItem("fc_mock_current_user", JSON.stringify(loggedInUser));
              setCurrentUser(loggedInUser);
              setLoading(false);
              resolve(loggedInUser);
            } else {
              setLoading(false);
              const err = new Error("Correo o contraseña incorrectos (Modo Demo).");
              setError(err.message);
              reject(err);
            }
          }, 1000); // Simulate network delay
        });
    }
    }
  }

  // Logout function
  async function logout() {
    setError(null);
    setLoading(true);

    if (isFirebaseConfigured) {
      try {
        await signOut(firebaseAuth);
        setCurrentUser(null);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.message);
        throw err;
      }
    } else {
      // Mock Logout
      return new Promise((resolve) => {
        setTimeout(() => {
          localStorage.removeItem("fc_mock_current_user");
          setCurrentUser(null);
          setLoading(false);
          resolve();
        }, 500);
      });
    }
  }

  const value = {
    currentUser,
    loading,
    error,
    isFirebaseConfigured,
    isSupabaseConfigured,
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
