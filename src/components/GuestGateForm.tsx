"use client";

import { useState } from "react";

export function GuestGateForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/guest-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.assign("/");
      } else {
        setError(data.error || "Der Code stimmt nicht.");
        setLoading(false);
      }
    } catch {
      setError("Netzwerkfehler – bitte erneut versuchen.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-7 space-y-3">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Gäste-Code eingeben"
        className="field text-center text-lg tracking-widish"
        autoComplete="off"
        autoFocus
      />
      {error && <p className="text-sm text-rosedeep">{error}</p>}
      <button
        type="submit"
        disabled={loading || code.trim().length === 0}
        className="btn-gold w-full"
      >
        {loading ? "Wird geprüft …" : "Eintreten"}
      </button>
    </form>
  );
}
