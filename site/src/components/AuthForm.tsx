"use client";

import { useState } from "react";
import { CloseIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, SnooAvatarIcon, UserIcon } from "@/components/Icons";
import { toast } from "@/components/Toast";
import { apiRequest } from "@/lib/api";
import { USER_STORAGE_KEY } from "@/components/UserIdentity";

export const AUTH_CHANGED_EVENT = "getit-auth-changed";

export function notifyAuthChanged(user: { id: number; username: string; role: string } | null) {
  if (typeof window !== "undefined") {
    if (user) {
      window.localStorage.setItem(USER_STORAGE_KEY, user.username);
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
    window.dispatchEvent(new StorageEvent("storage", { key: USER_STORAGE_KEY }));
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: user }));
  }
}

interface AuthFormProps {
  initialMode?: "login" | "register";
  onSuccess?: (user: { id: number; username: string; role: string }) => void;
  onCancel?: () => void;
  standalone?: boolean;
}

export function AuthForm({
  initialMode = "login",
  onSuccess,
  onCancel,
  standalone = false,
}: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(targetUsername?: string, targetPassword?: string) {
    const userToLogin = targetUsername ?? username.trim();
    const passToLogin = targetPassword ?? password;

    if (!userToLogin) {
      setError("Please enter your username");
      return;
    }
    if (!passToLogin) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await apiRequest<{ id: number; username: string; role: string }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ username: userToLogin, password: passToLogin }),
        }
      );
      notifyAuthChanged(user);
      toast(`Logged in as u/${user.username}`);
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to log in";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const u = username.trim();
    const em = email.trim();
    const p = password;

    if (u.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!em.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (p.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await apiRequest<{ id: number; username: string; role: string }>(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({ username: u, email: em, password: p }),
        }
      );
      notifyAuthChanged(user);
      toast(`Account created! Welcome, u/${user.username}`);
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function quickFill(user: string) {
    setUsername(user);
    setPassword("demo-password");
    setError(null);
    void handleLogin(user, "demo-password");
  }

  return (
    <div
      className={`w-full ${
        standalone
          ? "max-w-md mx-auto p-6 sm:p-8 rounded-2xl border border-line bg-surface shadow-xl"
          : ""
      }`}
    >
      {/* Header with Snoo */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <SnooAvatarIcon size={38} />
          <div>
            <h2 className="text-xl font-bold text-ink">
              {mode === "login" ? "Log In to getit" : "Join getit"}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {mode === "login"
                ? "Enter your credentials to continue"
                : "Create an account in MariaDB to vote and post"}
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="icon-btn !w-8 !h-8 rounded-full text-muted hover:text-ink"
            aria-label="Close"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line mb-5">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`flex-1 py-2.5 text-center font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${
            mode === "login"
              ? "border-[#d93a00] text-ink"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
          }}
          className={`flex-1 py-2.5 text-center font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${
            mode === "register"
              ? "border-[#d93a00] text-ink"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2"
        >
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {/* Form Body */}
      {mode === "login" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleLogin();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wide">
              Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted">
                <UserIcon size={16} />
              </span>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. getit_demo"
                required
                className="input !pl-9 w-full text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted">
                <LockIcon size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                className="input !pl-9 !pr-9 w-full text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 text-muted hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#d93a00] hover:bg-[#b83100] text-white font-bold py-2.5 px-4 rounded-full text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-md"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          {/* Quick Demo Accounts */}
          <div className="mt-5 pt-4 border-t border-line">
            <p className="text-[0.72rem] font-bold text-muted uppercase tracking-wider mb-2">
              Quick 1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickFill("getit_demo")}
                className="px-2 py-1.5 text-left rounded-lg border border-line hover:bg-paper text-ink transition-colors text-xs font-semibold"
                title="Moderator account (pass: demo-password)"
              >
                <div className="font-bold truncate">getit_demo</div>
                <div className="text-[0.65rem] text-[#d93a00] font-mono">Moderator</div>
              </button>
              <button
                type="button"
                onClick={() => quickFill("alice_dml")}
                className="px-2 py-1.5 text-left rounded-lg border border-line hover:bg-paper text-ink transition-colors text-xs font-semibold"
                title="User account (pass: demo-password)"
              >
                <div className="font-bold truncate">alice_dml</div>
                <div className="text-[0.65rem] text-muted font-mono">User (100k)</div>
              </button>
              <button
                type="button"
                onClick={() => quickFill("bob_dml")}
                className="px-2 py-1.5 text-left rounded-lg border border-line hover:bg-paper text-ink transition-colors text-xs font-semibold"
                title="User account (pass: demo-password)"
              >
                <div className="font-bold truncate">bob_dml</div>
                <div className="text-[0.65rem] text-muted font-mono">User (50k)</div>
              </button>
            </div>
          </div>

          {/* Footer toggle */}
          <div className="text-center mt-4 pt-3 border-t border-line text-xs text-muted">
            New to getit?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className="text-[#d93a00] font-bold hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted">
                <MailIcon size={16} />
              </span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input !pl-9 w-full text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wide">
              Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted">
                <UserIcon size={16} />
              </span>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username (min 3 chars)"
                required
                minLength={3}
                className="input !pl-9 w-full text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted">
                <LockIcon size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password (min 8 chars)"
                required
                minLength={8}
                className="input !pl-9 !pr-9 w-full text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 text-muted hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          <p className="text-[0.7rem] text-muted leading-tight">
            Passwords are encrypted in MariaDB via SHA-256 and emails are stored hashed per the DBMS project schema.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#d93a00] hover:bg-[#b83100] text-white font-bold py-2.5 px-4 rounded-full text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-md"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {/* Footer toggle */}
          <div className="text-center mt-4 pt-3 border-t border-line text-xs text-muted">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className="text-[#d93a00] font-bold hover:underline cursor-pointer"
            >
              Log In
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
