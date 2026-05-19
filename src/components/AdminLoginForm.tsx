"use client";

import { useState } from "react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.assign("/admin");
      } else {
        setError(data.error || "Anmeldung fehlgeschlagen.");
        setLoading(false);
      }
    } catch {
      setError("Netzwerkfehler – bitte erneut versuchen.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-7 space-y-3">
      <div>
        <label className="label" htmlFor="admin-pw">
          Passwort
        </label>
        <input
          id="admin-pw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          autoComplete="current-password"
          autoFocus
        />
      </div>
      {error && <p className="text-sm text-rosedeep">{error}</p>}
      <button
        type="submit"
        disabled={loading || password.length === 0}
        className="btn-gold w-full"
      >
        {loading ? "Wird angemeldet …" : "Anmelden"}
      </button>
    </form>
  );
}
