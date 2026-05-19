"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export function TeamInviteForm({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);

  const accept = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Willkommen im Team!");
        window.location.assign("/admin");
      } else {
        toast.error(data.error || "Die Einladung konnte nicht angenommen werden.");
        setLoading(false);
      }
    } catch {
      toast.error("Netzwerkfehler – bitte erneut versuchen.");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={accept}
      disabled={loading}
      className="btn-gold mt-7 w-full"
    >
      <UserPlus size={17} />
      {loading ? "Einen Moment …" : "Dem Team beitreten"}
    </button>
  );
}
