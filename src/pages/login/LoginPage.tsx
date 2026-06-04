import { useState } from "react";
import "./LoginPage.scss";
import { getErrorMessage } from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function PenIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 6.5l3 3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="12"
          r="3"
          stroke="currentColor"
          strokeWidth="1.75"
        />
      </svg>
    );
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-6.5 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 1l22 22"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const loginPayload = {
      email: email,
      password: password,
      isRememberMe: keepSignedIn,
    };

    try {
      await login(loginPayload);

      navigate("/dashboard");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      const errorMsg = getErrorMessage(
        error,
        "Email hoặc mật khẩu không chính xác!",
      );

      alert("Đăng nhập thất bại: " + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-page">
        <aside className="login-brand">
          <div className="login-brand__decor" aria-hidden="true">
            <div className="login-brand__diamond login-brand__diamond--1" />
            <div className="login-brand__diamond login-brand__diamond--2" />
          </div>

          <div className="login-brand__content">
            <div className="login-brand__logo">
              <PenIcon />
              <span>Manga Kousei</span>
            </div>

            <div className="login-brand__hero">
              <h1>Master the flow of professional editorial production.</h1>
              <p>
                A dedicated digital workspace built for high-energy manga
                studios and editorial excellence.
              </p>
            </div>
          </div>

          <footer className="login-brand__footer">
            © 2026 MANGA KOUSEI EDITORIAL SYSTEMS
          </footer>
        </aside>

        <main className="login-form-panel">
          <div className="login-form-panel__inner">
            <header className="login-form-panel__header">
              <h2>Welcome Back</h2>
              <p>
                Log in to your editorial workspace to continue your projects.
              </p>
            </header>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="email">Email</label>
                <div className="login-input">
                  <span className="login-input__icon">
                    <UserIcon />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    autoComplete="username"
                    placeholder="e.g. k.miura@kousei.studio"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="login-field">
                <div className="login-field__label-row">
                  <label htmlFor="password">Password</label>
                  <a href="#" className="login-field__link">
                    Forgot Password?
                  </a>
                </div>
                <div className="login-input">
                  <span className="login-input__icon">
                    <LockIcon />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="login-input__toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              <label className="login-checkbox">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(event) => setKeepSignedIn(event.target.checked)}
                />
                <span>Keep me signed in for 30 days</span>
              </label>

              <button
                type="submit"
                className="login-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="login-submit__spinner" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login to Studio
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </form>

            <footer className="login-form-panel__footer">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Support</a>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
