import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import { getTasks, addTask, updateTask, deleteTask } from "./services/firestoreTasks.js";
import ParentTaskList from "./pages/tasks/ParentTaskList";
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
  const { currentUser, logout, registerChild, getChildren, isFirebaseConfigured } = useAuth();

  // Estado para el alta de hijos
  const [children, setChildren] = useState([]);
  const [showChildForm, setShowChildForm] = useState(false);
  const [childForm, setChildForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [childError, setChildError] = useState("");
  const [childSubmitting, setChildSubmitting] = useState(false);

  const handleAddChild = async (e) => {
    e.preventDefault();
    setChildError("");

    const { firstName, lastName, email, password } = childForm;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setChildError("Completá todos los campos.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setChildError("Formato de correo inválido.");
      return;
    }
    if (password.length < 6) {
      setChildError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setChildSubmitting(true);
    try {
      const newChild = await registerChild(currentUser.uid, email.trim(), password, firstName.trim(), lastName.trim());
      setChildren(prev => [...prev, newChild]);
      setChildForm({ firstName: "", lastName: "", email: "", password: "" });
      setShowChildForm(false);
    } catch (err) {
      setChildError(err.message || "No se pudo dar de alta al hijo.");
    } finally {
      setChildSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  // Tasks state fetched from Firestore (fallback to mock if not configured)
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (currentUser) {
      // El padre lee sus tareas; el hijo lee las tareas de su padre.
      const tasksOwnerUid = currentUser.role === "Hijo"
        ? currentUser.parentUid
        : currentUser.uid;

      if (tasksOwnerUid) {
        getTasks(tasksOwnerUid)
          .then(data => setTasks(data))
          .catch(err => console.error("Error loading tasks:", err));
      }

      // Cargar los hijos del padre logueado
      if (currentUser.role === "Padre") {
        getChildren(currentUser.uid)
          .then(data => setChildren(data))
          .catch(err => console.error("Error loading children:", err));
      }
    }
  }, [currentUser]);

  // Dueño de las tareas: el padre. Si el usuario es hijo, sus tareas viven en la cuenta del padre.
  const tasksOwnerUid = currentUser.role === "Hijo" ? currentUser.parentUid : currentUser.uid;

  // Handlers for task actions
  const handleStatusToggle = async (task) => {
    const newStatus = task.status === "Completada" ? "Pendiente" : "Completada";
    try {
      await updateTask(tasksOwnerUid, task.id, { status: newStatus });
      // Refresh tasks after update
      const refreshed = await getTasks(tasksOwnerUid);
      setTasks(refreshed);
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask(tasksOwnerUid, taskId, updates);
      const refreshed = await getTasks(tasksOwnerUid);
      setTasks(refreshed);
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(tasksOwnerUid, taskId);
      const refreshed = await getTasks(tasksOwnerUid);
      setTasks(refreshed);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };
  const handleAddTask = async (newTask) => {
    try {
      await addTask(tasksOwnerUid, newTask);
      const refreshed = await getTasks(tasksOwnerUid);
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
            {!isFirebaseConfigured && (
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
                  <h1 className="display-5 fw-bold mb-2">¡Hola, {currentUser.displayName}!</h1>
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
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h3 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                      <span className="material-symbols-outlined text-primary">child_care</span>
                      Hijos Registrados
                    </h3>
                    <button
                      onClick={() => { setShowChildForm(true); setChildError(""); }}
                      className="btn btn-fc-primary btn-sm rounded-3 py-2 px-3 d-flex align-items-center gap-1"
                    >
                      <span className="material-symbols-outlined fs-6">person_add</span>
                      Agregar Hijo
                    </button>
                  </div>

                  {children.length === 0 ? (
                    <div className="card border-0 p-4 rounded-4 card-shadow bg-white text-center text-secondary">
                      <span className="material-symbols-outlined fs-1 text-primary mb-2">group_add</span>
                      <p className="mb-0">Todavía no agregaste ningún hijo. Tocá <strong>"Agregar Hijo"</strong> para crear su cuenta.</p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {children.map(child => (
                        <div key={child.uid} className="col-md-6">
                          <div className="card border-0 p-4 rounded-4 card-shadow h-100 bg-white">
                            <div className="d-flex align-items-center gap-3">
                              <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                                <span className="material-symbols-outlined">face</span>
                              </div>
                              <div>
                                <h5 className="mb-0 fw-bold">{child.displayName}</h5>
                                <span className="small text-secondary">{child.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Parent Section: Tareas */}
                <TaskForm onAdd={handleAddTask} children={children} />
                <ParentTaskList
                  tasks={tasks}
                  onStatusToggle={handleStatusToggle}
                  onDelete={handleDelete}
                  onUpdateTask={handleUpdateTask}
                />
              </>
            ) : (
              <>
                {(() => {
                  // Tareas del hijo, separadas por estado y ordenadas por fecha.
                  const byDate = (a, b) => (a.fecha || "").localeCompare(b.fecha || "");
                  const myTasks = tasks.filter(t => t.assignedTo === currentUser.displayName);
                  const pendientes = myTasks.filter(t => t.status !== "Completada").sort(byDate);
                  const completadas = myTasks.filter(t => t.status === "Completada").sort(byDate);

                  const TaskCard = (task) => (
                    <div key={task.id} className="col-12">
                      <div className="card border-0 p-4 rounded-4 card-shadow bg-white d-flex flex-row align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center gap-3">
                          <span
                            className={`material-symbols-outlined fs-2 ${task.status === "Completada" ? "text-success" : "text-secondary opacity-50"}`}
                            style={{ cursor: "pointer", fontVariationSettings: task.status === "Completada" ? "'FILL' 1" : "'FILL' 0" }}
                            onClick={() => handleStatusToggle(task)}
                            title={task.status === "Completada" ? "Marcar como pendiente" : "Marcar como completada"}
                          >
                            {task.status === "Completada" ? "check_circle" : "radio_button_unchecked"}
                          </span>
                          <div>
                            <h5 className={`mb-0 fw-bold ${task.status === "Completada" ? "text-decoration-line-through text-secondary" : ""}`}>
                              {task.title}
                            </h5>
                            <span className="small text-secondary d-flex align-items-center gap-2 flex-wrap">
                              {task.fecha && (
                                <span className="d-inline-flex align-items-center gap-1">
                                  <span className="material-symbols-outlined fs-6">calendar_today</span>
                                  {task.fecha}
                                </span>
                              )}
                              {task.time && (
                                <span className="d-inline-flex align-items-center gap-1">
                                  <span className="material-symbols-outlined fs-6">schedule</span>
                                  {task.time}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(task)}
                          className={`btn btn-sm rounded-3 py-2 px-3 d-flex align-items-center gap-1 ${task.status === "Completada" ? "btn-outline-secondary" : "btn-success"}`}
                        >
                          <span className="material-symbols-outlined fs-6">
                            {task.status === "Completada" ? "undo" : "check"}
                          </span>
                          {task.status === "Completada" ? "Marcar pendiente" : "Completar"}
                        </button>
                      </div>
                    </div>
                  );

                  return (
                    <>
                      {/* Pendientes */}
                      <div className="mb-4">
                        <h3 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                          <span className="material-symbols-outlined text-warning">pending_actions</span>
                          Tareas Pendientes
                          <span className="badge bg-warning-subtle text-warning rounded-pill">{pendientes.length}</span>
                        </h3>
                        <div className="row g-3">
                          {pendientes.length === 0 ? (
                            <div className="col-12">
                              <div className="card border-0 p-4 rounded-4 card-shadow bg-white text-center text-secondary">
                                <span className="material-symbols-outlined fs-1 text-success mb-2">task_alt</span>
                                <p className="mb-0">¡No tenés tareas pendientes! 🎉</p>
                              </div>
                            </div>
                          ) : (
                            pendientes.map(TaskCard)
                          )}
                        </div>
                      </div>

                      {/* Completadas */}
                      <div>
                        <h3 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                          <span className="material-symbols-outlined text-success">check_circle</span>
                          Tareas Completadas
                          <span className="badge bg-success-subtle text-success rounded-pill">{completadas.length}</span>
                        </h3>
                        <div className="row g-3">
                          {completadas.length === 0 ? (
                            <div className="col-12">
                              <div className="card border-0 p-4 rounded-4 card-shadow bg-white text-center text-secondary">
                                <p className="mb-0">Todavía no completaste ninguna tarea.</p>
                              </div>
                            </div>
                          ) : (
                            completadas.map(TaskCard)
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </>
            )}

          </div>

          {/* Sidebar Info & Configuration Column */}
          <div className="col-lg-4">

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
            <span className="text-secondary small">© 2026 FamilyCare. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      {/* Modal pop-up: alta de hijo */}
      {showChildForm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
          onClick={() => { if (!childSubmitting) { setShowChildForm(false); setChildError(""); } }}
        >
          <div
            className="card border-0 p-4 p-md-5 rounded-4 card-shadow bg-white w-100"
            style={{ maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_add</span>
                Dar de alta un hijo
              </h5>
              <button
                type="button"
                className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "32px", height: "32px" }}
                onClick={() => { setShowChildForm(false); setChildError(""); }}
                disabled={childSubmitting}
              >
                <span className="material-symbols-outlined fs-6">close</span>
              </button>
            </div>

            {childError && (
              <div className="alert alert-danger border-0 py-2 px-3 mb-3 small d-flex align-items-center gap-2">
                <span className="material-symbols-outlined fs-5">error</span>
                <div>{childError}</div>
              </div>
            )}

            <form onSubmit={handleAddChild} className="d-flex flex-column gap-3">
              <div className="row g-3">
                <div className="col-md-6 d-flex flex-column gap-1">
                  <label className="fw-semibold text-secondary small">Nombre</label>
                  <input
                    className="form-control form-input-focus rounded-3 py-2-5 fs-6"
                    type="text"
                    placeholder="Ej: Lucas"
                    value={childForm.firstName}
                    onChange={(e) => setChildForm(f => ({ ...f, firstName: e.target.value }))}
                    disabled={childSubmitting}
                  />
                </div>
                <div className="col-md-6 d-flex flex-column gap-1">
                  <label className="fw-semibold text-secondary small">Apellido</label>
                  <input
                    className="form-control form-input-focus rounded-3 py-2-5 fs-6"
                    type="text"
                    placeholder="Ej: García"
                    value={childForm.lastName}
                    onChange={(e) => setChildForm(f => ({ ...f, lastName: e.target.value }))}
                    disabled={childSubmitting}
                  />
                </div>
              </div>
              <div className="d-flex flex-column gap-1">
                <label className="fw-semibold text-secondary small">Correo electrónico</label>
                <input
                  className="form-control form-input-focus rounded-3 py-2-5 fs-6"
                  type="email"
                  placeholder="hijo@email.com"
                  value={childForm.email}
                  onChange={(e) => setChildForm(f => ({ ...f, email: e.target.value }))}
                  disabled={childSubmitting}
                />
              </div>
              <div className="d-flex flex-column gap-1">
                <label className="fw-semibold text-secondary small">Contraseña</label>
                <input
                  className="form-control form-input-focus rounded-3 py-2-5 fs-6"
                  type="password"
                  placeholder="••••••••"
                  value={childForm.password}
                  onChange={(e) => setChildForm(f => ({ ...f, password: e.target.value }))}
                  disabled={childSubmitting}
                />
              </div>
              <div className="d-flex gap-2 mt-2">
                <button
                  type="submit"
                  className="btn btn-fc-primary rounded-3 py-2-5 px-4 d-flex align-items-center gap-2 flex-grow-1 justify-content-center"
                  disabled={childSubmitting}
                >
                  {childSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin fs-5">progress_activity</span>
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined fs-5">check</span>
                      <span>Crear hijo</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-3 py-2-5 px-4"
                  onClick={() => { setShowChildForm(false); setChildError(""); }}
                  disabled={childSubmitting}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
