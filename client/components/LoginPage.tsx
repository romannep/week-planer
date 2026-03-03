import { useState } from "react";
import { api } from "../api";
import type { User } from "../types";

interface LoginPageProps {
  onSuccess: (user: User) => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = login.trim();
    if (!trimmed) {
      setError("Введите логин");
      return;
    }
    if (!password) {
      setError("Введите пароль");
      return;
    }
    setLoading(true);
    try {
      const user = isRegister
        ? await api.auth.register(trimmed, password)
        : await api.auth.login(trimmed, password);
      onSuccess(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка";
      setError(message === "unauthorized" ? "Неверный логин или пароль" : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 320,
          padding: 24,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          background: "var(--bg)",
        }}
      >
        <h1 style={{ margin: "0 0 20px", fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}>
          {isRegister ? "Регистрация" : "Вход"}
        </h1>
        {error && (
          <p
            style={{
              margin: "0 0 12px",
              padding: "8px 12px",
              background: "var(--accent-soft)",
              color: "var(--accent)",
              borderRadius: "var(--radius)",
              fontSize: 14,
            }}
          >
            {error}
          </p>
        )}
        <label htmlFor="login" style={{ display: "block", marginBottom: 4, fontSize: 14 }}>
          Логин
        </label>
        <input
          id="login"
          type="text"
          autoComplete="username"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 12px",
            marginBottom: 12,
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            fontFamily: "inherit",
          }}
        />
        <label htmlFor="password" style={{ display: "block", marginBottom: 4, fontSize: 14 }}>
          Пароль
        </label>
        <input
          id="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 12px",
            marginBottom: 16,
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            fontFamily: "inherit",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: "var(--radius)",
            border: "none",
            background: "var(--accent)",
            color: "white",
            fontFamily: "inherit",
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "…" : isRegister ? "Зарегистрироваться" : "Войти"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegister((v) => !v);
            setError(null);
          }}
          style={{
            marginTop: 12,
            padding: "6px 0",
            border: "none",
            background: "transparent",
            color: "var(--accent)",
            fontFamily: "inherit",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
        </button>
      </form>
    </div>
  );
}
