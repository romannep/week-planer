import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { api, setAuthFailure } from "./api";
import type { User } from "./types";
import { App } from "./App";
import { LoginPage } from "./components/LoginPage";
import "./index.css";

function Root() {
  const [user, setUser] = useState<User | null>(null);
  const [authCheckDone, setAuthCheckDone] = useState(false);

  useEffect(() => {
    setAuthFailure(() => setUser(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 8000)
    );
    Promise.race([api.auth.getMe(), timeout])
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setAuthCheckDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!authCheckDone) {
    return (
      <p style={{ padding: 24, color: "var(--text-muted)", textAlign: "center" }}>
        Загрузка…
      </p>
    );
  }
  if (!user) {
    return <LoginPage onSuccess={setUser} />;
  }
  return (
    <App
      user={user}
      onLogout={async () => {
        await api.auth.logout();
        setUser(null);
      }}
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
