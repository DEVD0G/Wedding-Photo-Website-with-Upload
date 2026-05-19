import { NextRequest, NextResponse } from "next/server";

/**
 * Edge-Middleware:
 *  1. vergibt jedem Besucher eine anonyme ID (fuer Herzen/Likes)
 *  2. schuetzt den /admin-Bereich (Weiterleitung zum Login)
 *  3. optionaler Gaeste-Code-Schutz fuer die gesamte Seite
 *
 * Hinweis: Die Middleware prueft hier nur das VORHANDENSEIN der Cookies
 * (schnell, Edge-tauglich). Die kryptografische Pruefung der Signatur
 * passiert serverseitig in den Route-Handlern bzw. Server-Komponenten.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // 1) anonyme Besucher-ID setzen, falls noch nicht vorhanden
  if (!req.cookies.get("pm_visitor")) {
    res.cookies.set("pm_visitor", crypto.randomUUID(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  // 2) Admin-Bereich schuetzen
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!req.cookies.get("pm_admin")) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // 3) optionaler Gaeste-Code
  const guestCode = process.env.GUEST_CODE || "";
  if (guestCode) {
    const exempt =
      pathname.startsWith("/willkommen") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api");
    if (!exempt && !req.cookies.get("pm_guest")) {
      const url = req.nextUrl.clone();
      url.pathname = "/willkommen";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  // alles ausser Next.js-Interna und statischen Assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
