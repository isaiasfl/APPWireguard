#!/bin/bash
# Script de desinstalación para APP WireGuard en Arch Linux

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

print_info "=== Desinstalador de APP WireGuard ==="
echo

# Preguntar confirmación
read -p "¿Está seguro de que desea desinstalar APP WireGuard? [y/N]: " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    print_info "Desinstalación cancelada"
    exit 0
fi

# Archivos y directorios a eliminar
FILES_TO_REMOVE=(
    "/usr/bin/appwireguard"
    "/usr/share/applications/appwireguard.desktop"
    "/usr/share/icons/hicolor/32x32/apps/appwireguard.png"
    "/usr/share/icons/hicolor/128x128/apps/appwireguard.png"
    "/usr/share/pixmaps/appwireguard.png"
    "/etc/polkit-1/rules.d/99-appwireguard.rules"
)

DIRS_TO_REMOVE=(
    "/usr/share/doc/appwireguard"
)

# Eliminar archivos
print_info "Eliminando archivos..."
for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        print_success "Eliminado: $file"
    fi
done

# Eliminar directorios
print_info "Eliminando directorios..."
for dir in "${DIRS_TO_REMOVE[@]}"; do
    if [ -d "$dir" ]; then
        rm -rf "$dir"
        print_success "Eliminado: $dir"
    fi
done

# Actualizar caches del sistema
print_info "Actualizando caches del sistema..."

# Cache de iconos
if command -v gtk-update-icon-cache > /dev/null 2>&1; then
    gtk-update-icon-cache -q -t -f "/usr/share/icons/hicolor" 2>/dev/null || true
    print_success "Cache de iconos actualizado"
fi

# Base de datos de aplicaciones
if command -v update-desktop-database > /dev/null 2>&1; then
    update-desktop-database -q "/usr/share/applications" 2>/dev/null || true
    print_success "Base de datos de aplicaciones actualizada"
fi

echo
print_success "=== APP WireGuard desinstalado correctamente ==="
print_info "Los archivos de configuración del usuario se mantienen en ~/.config/appwireguard/"
echo
