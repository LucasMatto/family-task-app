import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../services/supabase";
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
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, role')
          .eq('id', session.user.id)
          .single();
        
        setCurrentUser({
          uid: session.user.id,
          email: session.user.email,
          displayName: profile ? `${profile.first_name} ${profile.last_name}` : "Usuario",
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          role: profile?.role
        });
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  // Register function
  async function register(email, password, firstName, lastName, role) {
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
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
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName, role } }
      });
      if (signUpError) throw signUpError;
      
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
  }

  // Login function
  async function login(email, password) {
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
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
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      
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
  }

  // Logout function
  async function logout() {
    setError(null);
    setLoading(true);

    try {
      await supabase.auth.signOut();
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
