'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar, { AnnouncementBar } from "@/components/Navbar";
import { GOLD, NAVY } from "@/app/data/products";
import { login, isLoggedIn } from "@/utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const [barHidden, setBarHidden] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn()) router.replace("/account");
  }, []);

  useEffect(() => {
    const handleScroll = () => setBarHidden(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 700));
    login(email.trim(), password);
    // Dispatch storage event so Navbar updates
    window.dispatchEvent(new Event("storage"));
    setPageLoading?.(true);
router.push("/account");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Barlow Condensed', sans-serif; background: #fff; }
        .group:hover .group-hover\\:w-full { width: 100% !important; }
        .auth-input {
          width: 100%;
          height: 52px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 0 44px 0 16px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 16px;
          letter-spacing: 0.04em;
          color: #111;
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .auth-input:focus {
          border-color: #0a2a66;
          background: #fff;
        }
        .auth-input::placeholder { color: #aaa; }
      `}</style>

      <AnnouncementBar hidden={barHidden} />
      <Navbar
  barHidden={barHidden}
  setCartOpen={() => {}}
  cartItems={[]}
/>

      <div
        style={{
          paddingTop: barHidden ? 56 : 92,
          minHeight: "100vh",
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `${barHidden ? 56 : 92}px 20px 60px`,
          transition: "padding-top 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "#fff",
            border: "1px solid #e8e8e8",
            padding: "48px 40px 44px",
          }}
        >
          {/* HEADER */}
          <div style={{ marginBottom: 36, textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div style={{ width: 28, height: 1, background: GOLD }} />
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.3em",
                  color: "#888",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Welcome Back
              </span>
              <div style={{ width: 28, height: 1, background: GOLD }} />
            </div>
            <h1
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 44,
                letterSpacing: "0.06em",
                color: NAVY,
                lineHeight: 1,
              }}
            >
              SIGN IN
            </h1>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 12,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#555",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Email
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 18,
                    color: "#ccc",
                    pointerEvents: "none",
                  }}
                >
                  mail
                </span>
              </div>
            </div>

            {/* PASSWORD */}
            <div style={{ marginBottom: 10 }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 12,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#555",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#ccc" }}>
                    {showPass ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* FORGOT */}
            <div style={{ textAlign: "right", marginBottom: 24 }}>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 13,
                  letterSpacing: "0.06em",
                  color: NAVY,
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div
                style={{
                  background: "#fff5f5",
                  border: "1px solid #fecaca",
                  borderRadius: 4,
                  padding: "10px 14px",
                  marginBottom: 20,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 14,
                  color: "#c0392b",
                  letterSpacing: "0.03em",
                }}
              >
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: 52,
                background: loading ? "#555" : NAVY,
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
              }}
            >
              {loading ? "SIGNING IN..." : "SIGN IN →"}
            </button>
          </form>

          {/* DIVIDER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "28px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#ececec" }} />
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12,
                letterSpacing: "0.15em",
                color: "#bbb",
                textTransform: "uppercase",
              }}
            >
              New here?
            </span>
            <div style={{ flex: 1, height: 1, background: "#ececec" }} />
          </div>

          {/* REGISTER LINK */}
          <button
            onClick={() => router.push("/register")}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = NAVY;
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = NAVY;
            }}
          >
            CREATE ACCOUNT
          </button>
        </div>
      </div>
    </>
  );
}