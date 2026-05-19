import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { FloralDivider } from "@/components/FloralDivider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin-Login",
};

export default function AdminLoginPage() {
  if (isAdmin()) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-12">
      <div className="card w-full p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-ivory text-gold shadow-soft">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="4" y="10" width="16" height="11" rx="2.5" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <p className="mt-5 eyebrow">Geschützter Bereich</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Admin-Anmeldung</h1>
        <p className="mt-2 text-sm text-cocoa">
          Dieser Bereich ist dem Brautpaar vorbehalten.
        </p>
        <FloralDivider className="mt-5" />
        <AdminLoginForm />
      </div>
    </div>
  );
}
