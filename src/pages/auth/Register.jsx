import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import confetti from "canvas-confetti";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, isFirebaseConfigured, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setIsSubmitting(true);

    // Validación: solo email y contraseña
    const errors = {};
    if (!email.trim()) errors.email = "Correo es obligatorio";
    else if (!emailRegex.test(email)) errors.email = "Formato de correo inválido";
    if (!password) errors.password = "Contraseña es obligatoria";
    else if (password.length < 6) errors.password = "Mínimo 6 caracteres";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await register(email, password);

      setFieldErrors({});
      setIsSuccess(true);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        navigate("/login");
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
            {!isFirebaseConfigured && (
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
                      className={`form-control form-input-focus rounded-3 py-2-5 ps-5 fs-6 ${fieldErrors.email ? 'is-invalid' : ''}`}
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
                    {fieldErrors.email && (
                      <div className="invalid-feedback d-block small" style={{ color: 'red' }}>{fieldErrors.email}</div>
                    )}
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
                      className={`form-control form-input-focus rounded-3 py-2-5 ps-5 fs-6 ${fieldErrors.password ? 'is-invalid' : ''}`}
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
                    {fieldErrors.password && (
                      <div className="invalid-feedback d-block small" style={{ color: 'red' }}>{fieldErrors.password}</div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  className={`btn w-100 rounded-3 py-2-5 d-flex align-items-center justify-content-center gap-2 mt-3 ${isSuccess ? "btn-success" : "btn-fc-primary"
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
            <span className="text-secondary small">© 2026 FamilyCare. Todos los derechos reservados.</span>
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
