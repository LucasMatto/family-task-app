import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import confetti from "canvas-confetti";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, isFirebaseConfigured, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setIsSubmitting(true);

    if (!role) {
      setLocalError("Por favor, selecciona tu rol.");
      setIsSubmitting(false);
      return;
    }

    try {
      await register(email, password, firstName, lastName, role);
      
      // Success micro-interaction
      setIsSuccess(true);
      
      // Trigger canvas-confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Redirect after showing success state
      setTimeout(() => {
        navigate("/");
      }, 1800);

    } catch (err) {
      setLocalError(err.message || "Error al registrar la cuenta.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen d-flex flex-column justify-content-between">
      {/* TopAppBar */}
      <header className="bg-white border-bottom py-3 sticky-top z-3">
        <div className="container-fluid px-3 px-md-5 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span 
              className="material-symbols-outlined text-primary fs-3" 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              family_restroom
            </span>
            <span className="fs-4 fw-bold text-primary">FamilyCare</span>
          </div>
          
          {/* Connection status indicator */}
          <div>
            {isFirebaseConfigured ? (
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                <span className="material-symbols-outlined fs-6">cloud_done</span>
                Firebase Conectado
              </span>
            ) : (
              <span className="badge demo-mode-badge px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                <span className="material-symbols-outlined fs-6">sports_esports</span>
                Modo Demo Local
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="container d-flex justify-content-center">
          <div 
            className="card border-0 rounded-4 card-shadow w-100 overflow-hidden" 
            style={{ maxWidth: "480px", backgroundColor: "var(--fc-surface-lowest)" }}
          >
            {/* Card Header with Image Overlay */}
            <div className="position-relative overflow-hidden" style={{ height: "128px" }}>
              <div 
                className="position-absolute top-0 start-0 w-100 h-100" 
                style={{ 
                  background: "linear-gradient(to right, rgba(0, 74, 198, 0.85), rgba(37, 99, 235, 0.85))",
                  zIndex: 1
                }}
              />
              <img 
                alt="Family connection" 
                className="w-100 h-100 object-fit-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIuU2FOK4twg93XKS7v4nukPGuxp0WTwCpK04MBTEobM12-IkHsNVo-GZLqSsrSZoLDxbAQzYWfNDhSDmOuNGFNQu1qcg5a0qKPUKCV_G0N5LTGjwH3j1egMD1BAh9zoOQN0Ud4OkBXII-hIIeciu9Uq1xkskql-2wwqzM-a6L-3IL_BqcqWbaA-SDRLk1iojluoitbkHOf1WV6fSU-QgVmsHOL9jbWuiv7Yhmy2h2M_4b32ovod1OC_xThYf8Bli-WLxcEVzDKaD5"
              />
              <div className="position-absolute bottom-0 start-0 p-3 p-md-4 w-100" style={{ zIndex: 2 }}>
                <h1 className="fs-4 fw-bold text-white mb-0">Crea tu cuenta</h1>
                <p className="text-white-50 small mb-0">Empieza a cuidar de los que más quieres</p>
              </div>
            </div>

            {/* Registration Form */}
            <div className="card-body p-4 p-md-5">
              
              {/* Display Errors */}
              {(localError || authError) && (
                <div className="alert alert-danger border-0 py-2 px-3 mb-4 small d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined fs-5">error</span>
                  <div>{localError || authError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                
                {/* Name Row */}
                <div className="row g-3">
                  <div className="col-12 col-md-6 d-flex flex-column gap-1">
                    <label className="fw-semibold text-secondary small" htmlFor="firstName">
                      Nombre
                    </label>
                    <input 
                      className="form-control form-input-focus rounded-3 py-2-5 fs-6" 
                      id="firstName" 
                      name="firstName" 
                      placeholder="Ej: Ana" 
                      required 
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isSubmitting || isSuccess}
                    />
                  </div>
                  <div className="col-12 col-md-6 d-flex flex-column gap-1">
                    <label className="fw-semibold text-secondary small" htmlFor="lastName">
                      Apellidos
                    </label>
                    <input 
                      className="form-control form-input-focus rounded-3 py-2-5 fs-6" 
                      id="lastName" 
                      name="lastName" 
                      placeholder="Ej: García" 
                      required 
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isSubmitting || isSuccess}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="d-flex flex-column gap-1">
                  <label className="fw-semibold text-secondary small" htmlFor="email">
                    Correo electrónico
                  </label>
                  <div className="position-relative">
                    <span 
                      className="material-symbols-outlined position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary"
                      style={{ fontSize: "20px", opacity: 0.6 }}
                    >
                      mail
                    </span>
                    <input 
                      className="form-control form-input-focus rounded-3 py-2-5 ps-5 fs-6" 
                      style={{ paddingLeft: "42px" }}
                      id="email" 
                      name="email" 
                      placeholder="tu@email.com" 
                      required 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting || isSuccess}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="d-flex flex-column gap-1">
                  <label className="fw-semibold text-secondary small" htmlFor="password">
                    Contraseña
                  </label>
                  <div className="position-relative">
                    <span 
                      className="material-symbols-outlined position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary"
                      style={{ fontSize: "20px", opacity: 0.6 }}
                    >
                      lock
                    </span>
                    <input 
                      className="form-control form-input-focus rounded-3 py-2-5 ps-5 fs-6" 
                      style={{ paddingLeft: "42px" }}
                      id="password" 
                      name="password" 
                      placeholder="••••••••" 
                      required 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting || isSuccess}
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div className="d-flex flex-column gap-1">
                  <label className="fw-semibold text-secondary small" htmlFor="role">
                    ¿Quién eres?
                  </label>
                  <div className="position-relative">
                    <span 
                      className="material-symbols-outlined position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary"
                      style={{ fontSize: "20px", opacity: 0.6, zIndex: 3 }}
                    >
                      groups
                    </span>
                    <select 
                      className="form-select form-input-focus rounded-3 py-2-5 ps-5 fs-6" 
                      style={{ paddingLeft: "42px" }}
                      id="role" 
                      name="role" 
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={isSubmitting || isSuccess}
                    >
                      <option value="" disabled>Selecciona tu rol</option>
                      <option value="Padre">Padre / Madre</option>
                      <option value="Hijo">Hijo / Hija</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  className={`btn w-100 rounded-3 py-2-5 d-flex align-items-center justify-content-center gap-2 mt-3 ${
                    isSuccess ? "btn-success" : "btn-fc-primary"
                  }`}
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                >
                  {isSuccess ? (
                    <>
                      <span className="material-symbols-outlined fs-5">check_circle</span>
                      <span>Registrado con éxito</span>
                    </>
                  ) : isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin fs-5">progress_activity</span>
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <span>Registrar</span>
                      <span className="material-symbols-outlined fs-5">arrow_forward</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="position-relative py-2 my-1">
                  <div className="position-absolute top-50 start-0 w-100 border-top border-secondary-subtle"></div>
                  <div className="position-relative d-flex justify-content-center">
                    <span className="px-3 text-secondary small text-uppercase fw-semibold" style={{ backgroundColor: "var(--fc-surface-lowest)", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                      o
                    </span>
                  </div>
                </div>

                {/* Google Sign-in Mock Button */}
                <button 
                  type="button" 
                  className="btn btn-fc-sso rounded-3 py-2-5 px-3 w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={isSubmitting || isSuccess}
                >
                  <svg className="flex-shrink-0" style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span>Registrarse con Google</span>
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-4 text-center">
                <p className="text-secondary small mb-0">
                  ¿Ya tienes cuenta? 
                  <Link to="/login" className="text-primary fw-semibold text-decoration-none ms-1">
                    Inicia sesión
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Trust Badges */}
      <div className="d-flex justify-content-center gap-4 py-2 opacity-50 small mt-2">
        <div className="d-flex align-items-center gap-1">
          <span className="material-symbols-outlined fs-6">verified_user</span>
          <span className="small fw-semibold">Privacidad 256-bit</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <span className="material-symbols-outlined fs-6">cloud_done</span>
          <span className="small fw-semibold">Backup Seguro</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-light border-top py-3 mt-4">
        <div className="container-fluid px-3 px-md-5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-primary small">FamilyCare</span>
            <span className="text-secondary small">© 2024 FamilyCare. Todos los derechos reservados.</span>
          </div>
          <nav className="d-flex gap-4">
            <a href="#" className="text-secondary small text-decoration-none hover-primary">Política de Privacidad</a>
            <a href="#" className="text-secondary small text-decoration-none hover-primary">Términos de Servicio</a>
            <a href="#" className="text-secondary small text-decoration-none hover-primary">Centro de Ayuda</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
