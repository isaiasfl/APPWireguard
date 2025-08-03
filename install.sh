#!/bin/bash
# Script de instalación profesional para APP WireGuard en Arch Linux

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que se ejecuta como root
if [[ $EUID -ne 0 ]]; then
   print_error "Este script debe ejecutarse como root (use sudo)"
   exit 1
fi

print_info "=== Instalador de APP WireGuard para Arch Linux ==="
echo

# Verificar dependencias del sistema
print_info "Verificando dependencias del sistema..."
DEPS=("wireguard-tools" "sudo" "webkit2gtk" "polkit" "gtk3" "libayatana-appindicator")
MISSING_DEPS=()

for dep in "${DEPS[@]}"; do
    if ! pacman -Qi "$dep" &> /dev/null; then
        MISSING_DEPS+=("$dep")
    fi
done

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    print_warning "Faltan las siguientes dependencias:"
    printf ' - %s\n' "${MISSING_DEPS[@]}"
    print_info "Instalando dependencias..."
    pacman -S --noconfirm "${MISSING_DEPS[@]}"
fi

print_success "Todas las dependencias están instaladas"

# Directorios de instalación
BIN_DIR="/usr/bin"
APPLICATIONS_DIR="/usr/share/applications"
ICONS_DIR="/usr/share/icons/hicolor"
PIXMAPS_DIR="/usr/share/pixmaps"
DOC_DIR="/usr/share/doc/appwireguard"
POLKIT_DIR="/etc/polkit-1/rules.d"

# Crear directorios si no existen
print_info "Creando estructura de directorios..."
mkdir -p "$DOC_DIR" "$ICONS_DIR/32x32/apps" "$ICONS_DIR/128x128/apps"

# Copiar binario principal
print_info "Instalando binario principal..."
if [ -f "src-tauri/target/release/appwireguard" ]; then
    cp "src-tauri/target/release/appwireguard" "$BIN_DIR/"
    chmod 755 "$BIN_DIR/appwireguard"
    print_success "Binario instalado en $BIN_DIR/appwireguard"
else
    print_error "No se encontró el binario compilado. Ejecute 'npm run tauri build' primero."
    exit 1
fi

# Instalar archivo .desktop
print_info "Instalando archivo de aplicación..."
if [ -f "appwireguard.desktop" ]; then
    cp "appwireguard.desktop" "$APPLICATIONS_DIR/"
    chmod 644 "$APPLICATIONS_DIR/appwireguard.desktop"
    print_success "Archivo .desktop instalado"
else
    print_warning "No se encontró appwireguard.desktop, creando uno..."
    cat > "$APPLICATIONS_DIR/appwireguard.desktop" << 'EOF'
[Desktop Entry]
Type=Application
Name=APP WireGuard
Comment=Gestión profesional de VPN WireGuard departamental
Comment[es]=Gestión profesional de VPN WireGuard departamental
Comment[en]=Professional departmental WireGuard VPN management
Exec=/usr/bin/appwireguard
Icon=appwireguard
Categories=Network;Security;System;
Keywords=VPN;WireGuard;Network;Security;Tunneling;
StartupNotify=true
Terminal=false
MimeType=application/x-wireguard-config;
StartupWMClass=appwireguard
EOF
    chmod 644 "$APPLICATIONS_DIR/appwireguard.desktop"
fi

# Instalar iconos
print_info "Instalando iconos..."
if [ -f "src-tauri/icons/32x32.png" ]; then
    cp "src-tauri/icons/32x32.png" "$ICONS_DIR/32x32/apps/appwireguard.png"
fi

if [ -f "src-tauri/icons/128x128.png" ]; then
    cp "src-tauri/icons/128x128.png" "$ICONS_DIR/128x128/apps/appwireguard.png"
    cp "src-tauri/icons/128x128.png" "$PIXMAPS_DIR/appwireguard.png"
    print_success "Iconos instalados"
fi

# Instalar reglas de polkit
print_info "Instalando reglas de polkit..."
if [ -f "99-appwireguard.rules" ]; then
    cp "99-appwireguard.rules" "$POLKIT_DIR/"
    chmod 644 "$POLKIT_DIR/99-appwireguard.rules"
    print_success "Reglas de polkit instaladas"
fi

# Instalar documentación
print_info "Instalando documentación..."
[ -f "README.md" ] && cp "README.md" "$DOC_DIR/"
[ -f "LICENSE" ] && cp "LICENSE" "$DOC_DIR/"
[ -f "CLAUDE.md" ] && cp "CLAUDE.md" "$DOC_DIR/"

# Actualizar caches del sistema
print_info "Actualizando caches del sistema..."

# Cache de iconos
if command -v gtk-update-icon-cache > /dev/null 2>&1; then
    gtk-update-icon-cache -q -t -f "$ICONS_DIR" 2>/dev/null || true
    print_success "Cache de iconos actualizado"
fi

# Base de datos de aplicaciones
if command -v update-desktop-database > /dev/null 2>&1; then
    update-desktop-database -q "$APPLICATIONS_DIR" 2>/dev/null || true
    print_success "Base de datos de aplicaciones actualizada"
fi

# Recargar polkit
if systemctl is-active polkit.service > /dev/null 2>&1; then
    systemctl reload polkit.service 2>/dev/null || true
    print_success "Polkit recargado"
fi

echo
print_success "=== APP WireGuard instalado correctamente ==="
echo
print_info "Información de la instalación:"
echo "  • Ejecutable: $BIN_DIR/appwireguard"
echo "  • Aplicación de escritorio: $APPLICATIONS_DIR/appwireguard.desktop"
echo "  • Documentación: $DOC_DIR/"
echo "  • Puede encontrar la aplicación en: Menú de aplicaciones > Red/Seguridad"
echo
print_info "Para ejecutar desde terminal: appwireguard"
print_info "Para desinstalar ejecute: sudo ./uninstall.sh"
echo
