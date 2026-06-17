import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { login, isSupabaseConfigured, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setFieldErrors({});
    setIsSubmitting(true);

    // Validation
    const errors = {};
    if (!email.trim()) errors.email = "Correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Formato de correo inválido";
    if (!password) errors.password = "Contraseña es obligatoria";
    else if (password.length < 6) errors.password = "Mínimo 6 caracteres";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setLocalError(err.message || "Error al iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-mesh min-h-screen d-flex flex-column justify-content-between">
      {/* Top Navigation Header */}
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
          
          {/* Badge indicator for connection status */}
          <div>
            {isFirebaseConfigured || isSupabaseConfigured ? (
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                <span className="material-symbols-outlined fs-6">cloud_done</span>
                Supabase Conectado
              </span>
            ) : (
              <span className="badge demo-mode-badge px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                <span className="material-symbols-outlined fs-6 animate-pulse">sports_esports</span>
                Modo Demo Local
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow-1 d-flex align-items-center py-5">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            
            {/* Left Side: Visual Brand Banner (Visible on Desktop) */}
            <div className="col-lg-6 d-none d-lg-flex flex-column gap-3 pe-lg-5">
              <h1 className="display-4 fw-bold text-primary lh-sm">
                Tu familia, siempre <br />conectada y segura.
              </h1>
              <p className="fs-5 text-secondary max-w-md">
                Gestiona las actividades diarias, mantente en contacto y organiza la vida familiar en un solo lugar seguro diseñado para lo que más importa.
              </p>
              
              <div className="mt-3 rounded-4 overflow-hidden card-shadow position-relative" style={{ height: "264px" }}>
                <img 
                  className="w-100 h-100 object-fit-cover" 
                  alt="Family laughing in sunlit modern living room" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOFNk3xM7rr-SxrOQ2EtG4SXV4UlD6xrpt82ePi721L7nXANsZzPVdC_aikziqmBuQQ1Nnz_wIAkL3NpFXPvjZTcK_nfcgnq9Kxmpnvs7GATOqSSuljdy13YiYwY4t7mwJIUBB84j1aQCntyj5BaVs2i8wtZsyCV3HYMxkmJ1QCllOa5ovYt-glnGUxzymq093FnuephCgs77HBOU8AWRNrrvgy7mPW4BfeLCOd6Rc-JEvmiv8TCgcXmick_oTCa3NjnVxQQH3VaPB"
                />
                <div 
                  className="position-absolute top-0 start-0 w-100 h-100" 
                  style={{ background: "linear-gradient(to top, rgba(0, 74, 198, 0.15), transparent)" }}
                />
              </div>
            </div>

            {/* Right Side: Login Card */}
            <div className="col-12 col-md-8 col-lg-6 d-flex justify-content-center justify-content-lg-end">
              <div 
                className="card border-0 p-4 p-md-5 rounded-4 card-shadow w-100" 
                style={{ maxWidth: "440px", backgroundColor: "var(--fc-surface-lowest)" }}
              >
                <div className="mb-4">
                  <h2 className="fs-3 fw-bold text-dark mb-1">Bienvenido de nuevo</h2>
                  <p className="text-secondary small">
                    Ingresa tus credenciales para acceder a tu panel familiar.
                  </p>
                </div>

                {/* Local Demo Credentials Helper Alert */}
                {!isSupabaseConfigured && (
                  <div className="alert alert-info border-0 rounded-3 py-2 px-3 mb-4" style={{ fontSize: "0.85rem" }}>
                    <div className="fw-semibold mb-2 d-flex align-items-center gap-1">
                      <span className="material-symbols-outlined fs-6">info</span>
                      Cuentas de Ejemplo (Modo Demo):
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-primary py-1 px-2"
                        onClick={() => handleQuickLogin("padre@demo.com", "password123")}
                      >
                        Padre: Ana
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-secondary py-1 px-2"
                        onClick={() => handleQuickLogin("hijo@demo.com", "password123")}
                      >
                        Hijo: Lucas
                      </button>
                    </div>
                  </div>
                )}

                {/* Display Errors */}
                {(localError || authError) && (
                  <div className="alert alert-danger border-0 py-2 px-3 mb-3 small d-flex align-items-center gap-2">
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
                        placeholder="ejemplo@correo.com" 
                        required 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                      />
                      {fieldErrors.email && (
                        <div className="invalid-feedback d-block small" style={{ color: 'red' }}>{fieldErrors.email}</div>
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="d-flex flex-column gap-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="fw-semibold text-secondary small" htmlFor="password">
                        Contraseña
                      </label>
                      <a href="#" className="small text-primary text-decoration-none fw-semibold">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
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
  disabled={isSubmitting}
/>
{fieldErrors.password && (
  <div className="invalid-feedback d-block small" style={{ color: 'red' }}>{fieldErrors.password}</div>
)}
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="form-check d-flex align-items-center gap-2 mb-2">
                    <input 
                      className="form-check-input border-secondary-subtle" 
                      id="remember" 
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      disabled={isSubmitting}
                    />
                    <label 
                      className="form-check-label text-secondary small select-none cursor-pointer pt-0-5" 
                      htmlFor="remember"
                    >
                      Recordarme en este dispositivo
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button 
                    className="btn btn-fc-primary rounded-3 py-2-5 d-flex align-items-center justify-content-center gap-2"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin fs-5">progress_activity</span>
                        <span>Iniciando sesión...</span>
                      </>
                    ) : (
                      <>
                        <span>Iniciar Sesión</span>
                      </>
                    )}
                  </button>

                  {/* SSO Options Divider */}
                  <div className="position-relative py-2 my-1">
                    <div className="position-absolute top-50 start-0 w-100 border-top border-secondary-subtle"></div>
                    <div className="position-relative d-flex justify-content-center">
                      <span className="px-3 text-secondary small text-uppercase fw-semibold" style={{ backgroundColor: "var(--fc-surface-lowest)", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                        o continúa con
                      </span>
                    </div>
                  </div>

                  {/* SSO Buttons */}
                  <div className="row g-2">
                    <div className="col-6">
                      <button 
                        type="button" 
                        className="btn btn-fc-sso rounded-3 py-2 px-3 w-100 d-flex align-items-center justify-content-center gap-2 small"
                        disabled={isSubmitting}
                      >
                        <img 
                          alt="Google Logo" 
                          className="flex-shrink-0"
                          style={{ width: "18px", height: "18px" }} 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWhlcGtUiJQ7Wsuphn_Tyh7ZayeBEYjTqUJC0ZOqfoaaLd8XXtXLbxsCVhF2_LhqFx4iLSrd1caiWWZkJ8l979moQbns9pTMsmfbYg_tr5Pb16ILUU7KJCIuAMngVGg6jXe1hxvnkv5kPXNTSB3HdLHxtavk3x_IFQ8GoBtSRYysErWk2QseNdkFJfh3UEV-8fpTyp8Qjus7bsqzxWOo3HRn3lLOIGCu_JoN_p-uEMVnoKOsQx2vyHP3uhdjkBa7L7jeL251Bsyo-Z"
                        />
                        <span className="small">Google</span>
                      </button>
                    </div>
                    <div className="col-6">
                      <button 
                        type="button" 
                        className="btn btn-fc-sso rounded-3 py-2 px-3 w-100 d-flex align-items-center justify-content-center gap-2 small"
                        disabled={isSubmitting}
                      >
                        <span className="material-symbols-outlined fs-5" style={{ fontVariationSettings: "'FILL' 1" }}>
                          apps
                        </span>
                        <span className="small">Apple</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Registration Link */}
                <div className="mt-4 text-center">
                  <p className="text-secondary small mb-0">
                    ¿No tienes una cuenta? 
                    <Link to="/register" className="text-primary fw-semibold text-decoration-none ms-1">
                      Regístrate gratis
                    </Link>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

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
