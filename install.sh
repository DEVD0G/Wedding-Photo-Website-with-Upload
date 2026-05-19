#!/usr/bin/env bash
# ============================================================
#  Petersen Memories – Installations-Skript für Ubuntu 24.04
# ------------------------------------------------------------
#  Installiert alle erforderlichen Komponenten und richtet die
#  Hochzeits-Webseite betriebsbereit ein.
#
#  Aufruf:
#     chmod +x install.sh
#     ./install.sh                 (interaktiv)
#     ./install.sh --yes           (ohne Rückfragen, Standardwerte)
#
#  Optionale Umgebungsvariablen für den nicht-interaktiven Modus:
#     PM_ADMIN_PASSWORD   Admin-Passwort (sonst zufällig erzeugt)
#     PM_SITE_URL         öffentliche URL (Standard: http://localhost:3000)
#     PM_INSTALL_SERVICE  "yes" / "no" – systemd-Dienst einrichten
# ============================================================

set -euo pipefail

# ---- Einstellungen -----------------------------------------
NODE_MAJOR=20
SERVICE_NAME="petersen-memories"
APP_PORT=3000

# ---- Farben / Ausgabe --------------------------------------
C_INFO="\033[1;34m"; C_OK="\033[1;32m"; C_WARN="\033[1;33m"; C_ERR="\033[1;31m"; C_RST="\033[0m"
info()  { echo -e "${C_INFO}==>${C_RST} $*"; }
ok()    { echo -e "${C_OK}  ✔${C_RST} $*"; }
warn()  { echo -e "${C_WARN}  !${C_RST} $*"; }
die()   { echo -e "${C_ERR}  x${C_RST} $*" >&2; exit 1; }

# ---- Parameter ---------------------------------------------
ASSUME_YES="no"
case "${1:-}" in
  -y|--yes) ASSUME_YES="yes" ;;
esac

ask() {  # ask "Frage" "standard"  -> Antwort auf stdout
  local prompt="$1" default="$2" reply
  if [ "$ASSUME_YES" = "yes" ]; then echo "$default"; return; fi
  read -r -p "$prompt [$default]: " reply </dev/tty || true
  echo "${reply:-$default}"
}

# ---- Vorbedingungen ----------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
[ -f package.json ] || die "package.json nicht gefunden – Skript im Projektordner ausführen."

if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo"; fi
command -v sudo >/dev/null 2>&1 || [ "$(id -u)" -eq 0 ] || die "sudo wird benötigt (oder als root ausführen)."

RUN_USER="${SUDO_USER:-$(whoami)}"
SERVER_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"

echo
info "Petersen Memories – Einrichtung wird gestartet"
echo

# ---- 1. System-Pakete -------------------------------------
info "System-Pakete werden aktualisiert und installiert …"
$SUDO apt-get update -y
$SUDO apt-get install -y --no-install-recommends \
  ca-certificates curl gnupg git openssl build-essential
ok "Grundpakete installiert (git, curl, openssl, build-essential …)"

# ---- 2. Node.js -------------------------------------------
NEED_NODE="yes"
if command -v node >/dev/null 2>&1; then
  CURRENT_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if [ "$CURRENT_MAJOR" -ge 20 ]; then
    NEED_NODE="no"
    ok "Node.js ist bereits vorhanden ($(node -v))"
  else
    info "Vorhandene Node.js-Version ($(node -v 2>/dev/null || echo unbekannt)) ist zu alt – Node ${NODE_MAJOR} wird installiert."
  fi
fi

if [ "$NEED_NODE" = "yes" ]; then
  info "Node.js ${NODE_MAJOR}.x wird über NodeSource installiert …"
  if [ -n "$SUDO" ]; then
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | $SUDO -E bash -
  else
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  fi
  $SUDO apt-get install -y nodejs
  ok "Node.js installiert ($(node -v), npm $(npm -v))"
fi

# ---- 3. .env-Konfiguration --------------------------------
if [ -f .env ]; then
  ok ".env ist bereits vorhanden – wird nicht überschrieben"
else
  info "Konfigurationsdatei .env wird erstellt …"
  cp .env.example .env

  SESSION_SECRET="$(openssl rand -hex 32)"
  ADMIN_PASSWORD="${PM_ADMIN_PASSWORD:-$(openssl rand -base64 12)}"

  # Primäre IP-Adresse des Servers als Vorschlag verwenden.
  DEFAULT_URL="http://${SERVER_IP:-localhost}:${APP_PORT}"
  SITE_URL="${PM_SITE_URL:-$(ask 'Öffentliche URL der Seite' "$DEFAULT_URL")}"

  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=\"${SESSION_SECRET}\"|" .env
  sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=\"${ADMIN_PASSWORD}\"|" .env
  sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=\"${SITE_URL}\"|" .env

  ok ".env erstellt – SESSION_SECRET wurde automatisch erzeugt"
  echo -e "${C_WARN}  ┌──────────────────────────────────────────────┐${C_RST}"
  echo -e "${C_WARN}  │  Admin-Passwort: ${ADMIN_PASSWORD}${C_RST}"
  echo -e "${C_WARN}  │  Bitte sicher notieren! (steht auch in .env)   │${C_RST}"
  echo -e "${C_WARN}  └──────────────────────────────────────────────┘${C_RST}"
fi

# ---- 4. Abhängigkeiten ------------------------------------
info "npm-Abhängigkeiten werden installiert (dies kann etwas dauern) …"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
ok "Abhängigkeiten installiert"

# ---- 5. Datenbank -----------------------------------------
info "Datenbank wird eingerichtet (Prisma) …"
npm run db:push
ok "Datenbank ist bereit"

# ---- 6. Produktions-Build ---------------------------------
info "Produktions-Build wird erstellt …"
npm run build
ok "Build erfolgreich"

# ---- 7. Firewall (Port freigeben) -------------------------
if command -v ufw >/dev/null 2>&1; then
  info "Firewall: Port ${APP_PORT} wird freigegeben (ufw) …"
  $SUDO ufw allow "${APP_PORT}/tcp" >/dev/null 2>&1 || true
  ok "Port ${APP_PORT} in der Firewall freigegeben"
fi

# ---- 8. Optionaler systemd-Dienst -------------------------
INSTALL_SERVICE="${PM_INSTALL_SERVICE:-$(ask 'systemd-Dienst einrichten (Autostart)?' 'yes')}"

if [ "$INSTALL_SERVICE" = "yes" ] || [ "$INSTALL_SERVICE" = "y" ]; then
  info "systemd-Dienst „${SERVICE_NAME}“ wird eingerichtet …"
  NPM_BIN="$(command -v npm)"
  SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

  $SUDO tee "$SERVICE_FILE" >/dev/null <<EOF
[Unit]
Description=Petersen Memories – Hochzeits-Webseite
After=network.target

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${SCRIPT_DIR}
Environment=NODE_ENV=production
Environment=PORT=${APP_PORT}
ExecStart=${NPM_BIN} run start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

  $SUDO systemctl daemon-reload
  $SUDO systemctl enable "${SERVICE_NAME}" >/dev/null 2>&1 || true
  $SUDO systemctl restart "${SERVICE_NAME}"
  ok "Dienst läuft – Status: sudo systemctl status ${SERVICE_NAME}"
else
  warn "Kein systemd-Dienst eingerichtet."
fi

# ---- Abschluss --------------------------------------------
echo
ok "Installation abgeschlossen!"
echo
echo -e "${C_INFO}Die Webseite ist erreichbar unter:${C_RST} http://${SERVER_IP:-localhost}:${APP_PORT}"
echo
echo "Nützliche Befehle:"
echo "  npm run dev                    Entwicklungsserver starten"
echo "  npm run start                  Produktionsserver manuell starten"
if [ "$INSTALL_SERVICE" = "yes" ] || [ "$INSTALL_SERVICE" = "y" ]; then
  echo "  sudo systemctl status ${SERVICE_NAME}    Dienststatus anzeigen"
  echo "  sudo systemctl restart ${SERVICE_NAME}   Dienst neu starten"
  echo "  sudo journalctl -u ${SERVICE_NAME} -f    Live-Logs ansehen"
fi
echo
echo "Tipp: Für den öffentlichen Betrieb empfiehlt sich ein Reverse-Proxy"
echo "      (z. B. nginx) mit HTTPS vor Port ${APP_PORT}."
echo
