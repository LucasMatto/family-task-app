import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import { getTasks } from "./services/firestoreTasks.js";
import ParentTaskList from "./pages/tasks/ParentTaskList";
import { addTask, updateTask, deleteTask } from "./services/firestoreTasks.js";
import TaskForm from "./pages/tasks/TaskForm.jsx";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-h-screen bg-mesh">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-primary fs-1 mb-3">progress_activity</span>
          <p className="text-secondary fw-semibold">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Simple Beautiful Dashboard Component
function Dashboard() {
  const { currentUser, logout, isFirebaseConfigured } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  // Mock data to demonstrate guidelines layout in Dashboard
  const mockChildren = [
    { id: 1, name: "Lucas García", email: "hijo@demo.com", tasksCount: 3, pendingCount: 1 },
    { id: 2, name: "Sofía García", email: "sofia@demo.com", tasksCount: 2, pendingCount: 2 }
  ];

  // Tasks state fetched from Firestore (fallback to mock if not configured)
  const [tasks, setTasks] = useState([]);
  // Handlers for task actions (parent view)
  const handleStatusToggle = async (task) => {
    const newStatus = task.status === "Completada" ? "Pendiente" : "Completada";
    try {
      await updateTask(currentUser.uid, task.id, { status: newStatus });
      // Refresh tasks after update
      const refreshed = await getTasks(currentUser.uid);
      setTasks(refreshed);
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(currentUser.uid, taskId);
      const refreshed = await getTasks(currentUser.uid);
      setTasks(refreshed);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };
  const handleAddTask = async (newTask) => {
    try {
      await addTask(currentUser.uid, newTask);
      const refreshed = await getTasks(currentUser.uid);
      setTasks(refreshed);
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };


  return (
    <div className="bg-mesh min-h-screen d-flex flex-column justify-content-between">
      {/* Header */}
      <header className="bg-white border-bottom py-3 sticky-top z-3">
        <div className="container px-3 px-md-5 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span 
              className="material-symbols-outlined text-primary fs-3" 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              family_restroom
            </span>
            <span className="fs-4 fw-bold text-primary">FamilyCare</span>
          </div>

          <div className="d-flex align-items-center gap-3">
            {isFirebaseConfigured ? (
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill d-none d-sm-inline-flex align-items-center gap-1">
                <span className="material-symbols-outlined fs-6">cloud_done</span>
                Firebase Conectado
              </span>
            ) : (
              <span className="badge demo-mode-badge px-3 py-2 rounded-pill d-none d-sm-inline-flex align-items-center gap-1">
                <span className="material-symbols-outlined fs-6">sports_esports</span>
                Modo Demo
              </span>
            )}
            
            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-3 py-2 px-3 d-flex align-items-center gap-1">
              <span className="material-symbols-outlined fs-6">logout</span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-5 flex-grow-1">
        
        {/* Welcome Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 p-4 p-md-5 rounded-4 card-shadow" style={{ background: "linear-gradient(135deg, #004ac6 0%, #2563eb 100%)", color: "white" }}>
              <div className="row align-items-center">
                <div className="col-md-8">
                  <span className="badge bg-white-50 text-white border border-white-50 px-3 py-1-5 rounded-pill mb-3">
                    Rol: {currentUser.role}
                  </span>
                  <h1 className="display-5 fw-bold mb-2">¡Hola, {currentUser.displayName || currentUser.firstName}!</h1>
                  <p className="fs-5 mb-0 opacity-75">
                    Bienvenido a tu panel familiar. La sincronización y supervisión de las tareas de tus hijos está lista.
                  </p>
                </div>
                <div className="col-md-4 text-md-end mt-4 mt-md-0">
                  <span className="material-symbols-outlined text-white-50" style={{ fontSize: "96px" }}>
                    sentiment_satisfied
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          
          {/* Main Controls & Details Column */}
          <div className="col-lg-8 d-flex flex-column gap-4">
            
            {/* Conditional Views by User Role */}
            {currentUser.role === "Padre" ? (
              <>
                {/* Parent Section: Hijos */}
                <div>
                  <h3 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary">child_care</span>
                    Hijos Registrados
                  </h3>
                  <div className="row g-3">
                    {mockChildren.map(child => (
                      <div key={child.id} className="col-md-6">
                        <div className="card border-0 p-4 rounded-4 card-shadow h-100 bg-white">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center gap-3">
                              <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                                <span className="material-symbols-outlined">face</span>
                              </div>
                              <div>
                                <h5 className="mb-0 fw-bold">{child.name}</h5>
                                <span className="small text-secondary">{child.email}</span>
                              </div>
                            </div>
                          </div>
                          <div className="row g-2 border-top pt-3 text-center small text-secondary">
                            <div className="col-6 border-end">
                              <div className="fw-bold text-dark fs-5">{child.tasksCount}</div>
                              <div>Tareas</div>
                            </div>
                            <div className="col-6">
                              <div className="fw-bold text-warning fs-5">{child.pendingCount}</div>
                              <div>Pendientes</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parent Section: Tareas */}
                <TaskForm onAdd={handleAddTask} />
                <ParentTaskList tasks={tasks} onStatusToggle={handleStatusToggle} onDelete={handleDelete} />
              </>
            ) : (
              <>
                {/* Child Section: Mis Tareas */}
                <div>
                  <h3 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary">checklist</span>
                    Mis Tareas para Hoy
                  </h3>
                  <div className="row g-3">
                    {tasks
                        .filter(t => t.assignedTo.startsWith(currentUser.firstName))
                      .map(task => (
                        <div key={task.id} className="col-12">
                          <div className="card border-0 p-4 rounded-4 card-shadow bg-white d-flex flex-row align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <span className={`material-symbols-outlined fs-2 ${
                                task.status === "Completada" ? "text-success" : "text-secondary opacity-50"
                              }`} style={{ cursor: "pointer", fontVariationSettings: task.status === "Completada" ? "'FILL' 1" : "'FILL' 0" }}>
                                {task.status === "Completada" ? "check_circle" : "radio_button_unchecked"}
                              </span>
                              <div>
                                <h5 className={`mb-0 fw-bold ${task.status === "Completada" ? "text-decoration-line-through text-secondary" : ""}`}>
                                  {task.title}
                                </h5>
                                <span className="small text-secondary">Hora sugerida: {task.time}</span>
                              </div>
                            </div>
                            <span className={`badge px-3 py-1-5 rounded-pill ${
                              task.status === "Completada" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Sidebar Info & Configuration Column */}
          <div className="col-lg-4">
            
            {/* Connection instructions card */}
            <div className="card border-0 p-4 rounded-4 card-shadow bg-white d-flex flex-column gap-3 mb-4">
              <h4 className="fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                <span className="material-symbols-outlined text-warning">key</span>
                Credenciales Firebase
              </h4>
              
              {isFirebaseConfigured ? (
                <div className="text-success small d-flex flex-column gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>¡Tu aplicación está usando una conexión de Firebase en tiempo real!</span>
                  </div>
                  <p className="mb-0 text-muted">
                    Los usuarios se registran y autentican mediante Firebase Auth, y sus roles se almacenan de forma segura en Cloud Firestore.
                  </p>
                </div>
              ) : (
                <div className="text-secondary small d-flex flex-column gap-2">
                  <div className="d-flex align-items-center gap-2 text-warning mb-1">
                    <span className="material-symbols-outlined">warning</span>
                    <span className="fw-semibold">Ejecutando en Modo Demo Local</span>
                  </div>
                  <p className="mb-2 text-muted">
                    Para conectar tu proyecto a tu propia base de datos Firebase:
                  </p>
                  <ol className="ps-3 mb-2 text-muted">
                    <li className="mb-1">Crea un proyecto en <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-primary text-decoration-none fw-semibold">Firebase Console</a></li>
                    <li className="mb-1">Habilita <strong>Email/Password</strong> en Firebase Authentication</li>
                    <li className="mb-1">Crea una base de datos <strong>Cloud Firestore</strong></li>
                    <li className="mb-1">Copia las credenciales en el archivo <code className="bg-light px-1 rounded text-danger">.env</code> de la raíz del proyecto.</li>
                    <li className="mb-1">Reinicia el servidor dev.</li>
                  </ol>
                  <p className="mb-0 text-muted">
                    El proyecto detectará automáticamente las credenciales y cambiará a modo Firebase.
                  </p>
                </div>
              )}
            </div>

            {/* Profile Overview */}
            <div className="card border-0 p-4 rounded-4 card-shadow bg-white d-flex flex-column gap-3">
              <h4 className="fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                <span className="material-symbols-outlined text-primary">account_circle</span>
                Tu Perfil
              </h4>
              <div className="d-flex flex-column gap-2 small text-secondary">
                <div className="d-flex justify-content-between border-bottom pb-2">
                  <span className="fw-semibold">Nombre:</span>
                  <span>{currentUser.displayName}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom pb-2">
                  <span className="fw-semibold">Email:</span>
                  <span>{currentUser.email}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="fw-semibold">Rol asignado:</span>
                  <span className="badge bg-primary-subtle text-primary">{currentUser.role}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-light border-top py-3 mt-4">
        <div className="container px-3 px-md-5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-primary small">FamilyCare</span>
            <span className="text-secondary small">© 2024 FamilyCare. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
