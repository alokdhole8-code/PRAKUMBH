'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar, { AnnouncementBar } from "@/components/Navbar";
import { GOLD, NAVY } from "@/app/data/products";
import CryptoJS from "crypto-js";
// ─── AUTH HELPERS (inline for self-containment) ───────────────────────────────
function getUsers() {
  try {
    const raw = localStorage.getItem("prakumbh_users");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem("prakumbh_users", JSON.stringify(users));
  } catch {}
}

function setCurrentUser(user) {
  try {
    const { password: _pw, ...safe } = user;
    localStorage.setItem("prakumbh_current", JSON.stringify(safe));
  } catch {}
}

function isLoggedIn() {
  try {
    const raw = localStorage.getItem("prakumbh_current");
    if (!raw) return false;
    const u = JSON.parse(raw);
    return !!(u && u.id && u.email);
  } catch {
    return false;
  }
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [barHidden, setBarHidden] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (isLoggedIn()) {
        router.replace("/account");
      }
    } catch {}
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setBarHidden(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const set = useCallback((key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setGlobalError("");
  }, []);

  const validate = () => {
    const newErrors = {};
    const { name, email, password, confirm } = form;

    if (!name.trim()) newErrors.name = "Full name is required.";
    else if (name.trim().length < 2) newErrors.name = "Name must be at least 2 characters.";

    if (!email.trim()) newErrors.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = "Enter a valid email address.";

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(password) && !/[0-9]/.test(password)) {
      newErrors.password = "Include at least one uppercase letter or number.";
    }

    if (!confirm) newErrors.confirm = "Please confirm your password.";
    else if (confirm !== password) newErrors.confirm = "Passwords do not match.";

    return newErrors;
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, label: "", color: "transparent" };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: "#dc2626" };
    if (score <= 2) return { level: 2, label: "Fair", color: "#d97706" };
    if (score <= 3) return { level: 3, label: "Good", color: "#2563eb" };
    return { level: 4, label: "Strong", color: "#16a34a" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));

      const users = getUsers();
      const emailLower = form.email.trim().toLowerCase();

      const hashedPassword =
  CryptoJS.SHA256(form.password).toString();

      const exists = users.some((u) => u.email.toLowerCase() === emailLower);

      if (exists) {
        setGlobalError("An account with this email already exists. Please sign in.");
        setLoading(false);
        return;
      }

      const newUser = {
        id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: form.name.trim(),
        email: emailLower,
password: form.password,
        createdAt: new Date().toISOString(),
        orders: [],
      };

      saveUsers([...users, newUser]);
      setCurrentUser(newUser);
      window.dispatchEvent(new Event("storage"));

      setSuccess(true);
      await new Promise((r) => setTimeout(r, 900));
      setPageLoading?.(true);
router.push("/account");
    } catch {
      setGlobalError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Barlow Condensed', sans-serif; background: #fafafa; }
        .group:hover .group-hover\\:w-full { width: 100% !important; }
        .auth-input {
          width: 100%;
          height: 52px;
          border: 1px solid #e0e0e0;
          border-radius: 2px;
          padding: 0 44px 0 16px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 16px;
          letter-spacing: 0.04em;
          color: #111;
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .auth-input:focus { border-color: ${NAVY}; background: #fff; box-shadow: 0 0 0 3px rgba(10,42,102,0.08); }
        .auth-input.error { border-color: #dc2626; background: #fff5f5; }
        .auth-input::placeholder { color: #aaa; }
        .strength-bar {
          height: 3px;
          border-radius: 2px;
          transition: width 0.4s ease, background 0.4s ease;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .register-card { animation: fadeInUp 0.4s ease both; }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
      `}</style>

      <AnnouncementBar hidden={barHidden} />
      <Navbar barHidden={barHidden} setCartOpen={() => {}} cartItems={[]} />

      <div
        style={{
          paddingTop: barHidden ? 56 : 92,
          minHeight: "100vh",
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `${barHidden ? 72 : 110}px 20px 60px`,
          transition: "padding-top 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div
          className="register-card"
          style={{
            width: "100%",
            maxWidth: 460,
            background: "#fff",
            border: "1px solid #e8e8e8",
            padding: "48px 40px 44px",
            boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
          }}
        >
          {/* HEADER */}
          <div style={{ marginBottom: 36, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 28, height: 1, background: GOLD }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: "0.3em", color: "#888", textTransform: "uppercase", fontWeight: 600 }}>
                Join The Legacy
              </span>
              <div style={{ width: 28, height: 1, background: GOLD }} />
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, letterSpacing: "0.06em", color: NAVY, lineHeight: 1 }}>
              {success ? "WELCOME ABOARD" : "CREATE ACCOUNT"}
            </h1>
            {!success && (
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#888", letterSpacing: "0.06em", marginTop: 8 }}>
                Create your account for exclusive access
              </p>
            )}
          </div>

          {success ? (
            <div style={{ textAlign: "center", padding: "20px 0 12px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#16a34a" }}>check_circle</span>
              </div>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, color: "#555", letterSpacing: "0.04em" }}>
                Account created! Redirecting to your dashboard…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {/* FULL NAME */}
              <FieldGroup label="Full Name" error={errors.name}>
                <div style={{ position: "relative" }}>
                  <input
                    className={`auth-input${errors.name ? " error" : ""}`}
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={set("name")}
                    autoComplete="name"
                    disabled={loading}
                  />
                  <span className="material-symbols-outlined" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: errors.name ? "#dc2626" : "#ccc", pointerEvents: "none" }}>
                    badge
                  </span>
                </div>
              </FieldGroup>

              {/* EMAIL */}
              <FieldGroup label="Email Address" error={errors.email}>
                <div style={{ position: "relative" }}>
                  <input
                    className={`auth-input${errors.email ? " error" : ""}`}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set("email")}
                    autoComplete="email"
                    disabled={loading}
                  />
                  <span className="material-symbols-outlined" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: errors.email ? "#dc2626" : "#ccc", pointerEvents: "none" }}>
                    mail
                  </span>
                </div>
              </FieldGroup>

              {/* PASSWORD */}
              <FieldGroup label="Password" error={errors.password}>
                <div style={{ position: "relative" }}>
                  <input
                    className={`auth-input${errors.password ? " error" : ""}`}
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={set("password")}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#bbb" }}>
                      {showPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {/* STRENGTH */}
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="strength-bar"
                          style={{
                            flex: 1,
                            background: i <= strength.level ? strength.color : "#e5e5e5",
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: strength.color, letterSpacing: "0.1em", fontWeight: 600 }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </FieldGroup>

              {/* CONFIRM PASSWORD */}
              <FieldGroup label="Confirm Password" error={errors.confirm}>
                <div style={{ position: "relative" }}>
                  <input
                    className={`auth-input${errors.confirm ? " error" : ""}`}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={form.confirm}
                    onChange={set("confirm")}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#bbb" }}>
                      {showConfirm ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </FieldGroup>

              {/* GLOBAL ERROR */}
              {globalError && (
                <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 2, padding: "11px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#dc2626", flexShrink: 0 }}>error</span>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#c0392b", letterSpacing: "0.03em" }}>{globalError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: 52,
                  background: loading ? "#6b7898" : NAVY,
                  color: "#fff",
                  border: "none",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
                  transition: "background 0.2s",
                  marginTop: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    CREATING...
                  </>
                ) : (
                  "CREATE ACCOUNT →"
                )}
              </button>
            </form>
          )}

          {/* DIVIDER */}
          {!success && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#ececec" }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase" }}>Already a member?</span>
                <div style={{ flex: 1, height: 1, background: "#ececec" }} />
              </div>

              <button
                onClick={() => router.push("/login")}
                style={{
                  width: "100%",
                  height: 52,
                  background: "transparent",
                  color: NAVY,
                  border: `1.5px solid ${NAVY}`,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = NAVY; }}
              >
                SIGN IN
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function FieldGroup({ label, error, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: error ? "#dc2626" : "#555", fontWeight: 600, marginBottom: 8 }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#dc2626", letterSpacing: "0.03em", marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
          {error}
        </p>
      )}
    </div>
  );
}