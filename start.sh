#!/usr/bin/env bash
# ============================================================
#  ServiceHub — Run without Docker
#  Usage:  bash start.sh
#  Requires: Python 3.10+, Node 18+
# ============================================================
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
VENV="$BACKEND/.venv"

GREEN="\033[0;32m"; CYAN="\033[0;36m"; YELLOW="\033[1;33m"; RED="\033[0;31m"; RESET="\033[0m"
info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[ OK ]${RESET}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERR ]${RESET}  $*"; exit 1; }

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║       ServiceHub — Local Dev Server       ║${RESET}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${RESET}"
echo ""

# ── Checks ───────────────────────────────────────────────────
command -v python3 >/dev/null 2>&1 || error "python3 not found. Please install Python 3.10+."
command -v node    >/dev/null 2>&1 || error "node not found. Please install Node.js 18+."
command -v npm     >/dev/null 2>&1 || error "npm not found."

info "Python $(python3 --version) · Node $(node --version)"

# ── Backend venv ─────────────────────────────────────────────
if [ ! -d "$VENV" ]; then
    info "Creating Python virtual environment..."
    python3 -m venv "$VENV"
    success "Virtual environment created"
fi

PY="$VENV/bin/python"
PIP="$VENV/bin/pip"

info "Installing Python packages..."
"$PIP" install --quiet --upgrade pip
"$PIP" install --quiet -r "$BACKEND/requirements.txt"
success "Python packages ready"

# ── Database + seed ──────────────────────────────────────────
cd "$BACKEND"
DB_FILE="$BACKEND/servicehub.db"

if [ ! -f "$DB_FILE" ]; then
    info "First run — creating database and seeding demo data..."
    "$PY" seed.py
    success "Database ready at $DB_FILE"
else
    success "Database already exists — skipping seed"
fi

# ── Frontend deps ────────────────────────────────────────────
cd "$FRONTEND"
if [ ! -d "node_modules" ]; then
    info "Installing npm packages (first run, may take ~30s)..."
    npm install --silent
    success "npm packages installed"
else
    success "node_modules already present"
fi

# ── Print access info ────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  🔧  Backend  →  ${CYAN}http://localhost:5000${RESET}"
echo -e "  🌐  Frontend →  ${CYAN}http://localhost:5173${RESET}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  Demo accounts:"
echo -e "    ${YELLOW}Admin:${RESET}    admin@servicehub.com  / Admin@123"
echo -e "    ${YELLOW}Customer:${RESET} customer1@example.com / Customer@123"
echo -e "    ${YELLOW}Provider:${RESET} rajesh@provider.com   / Provider@123"
echo ""
echo -e "  Press ${RED}Ctrl+C${RESET} to stop."
echo ""

# ── Start servers ────────────────────────────────────────────
cleanup() {
    echo ""
    info "Shutting down servers..."
    [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
    wait 2>/dev/null || true
    success "Stopped. Goodbye!"
}
trap cleanup INT TERM EXIT

# Start Flask
cd "$BACKEND"
FLASK_ENV=development "$PY" run.py &
BACKEND_PID=$!

# Wait for Flask to be ready
for i in $(seq 1 10); do
    sleep 1
    curl -sf http://localhost:5000/api/health >/dev/null 2>&1 && break
    [ $i -eq 10 ] && warn "Backend health check timed out — check for errors above"
done
success "Backend is up at http://localhost:5000"

# Start Vite
cd "$FRONTEND"
npm run dev &
FRONTEND_PID=$!

wait "$BACKEND_PID" "$FRONTEND_PID"
