#!/bin/bash

# Script para crear nueva release
set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "❌ Uso: ./scripts/release.sh v1.0.0"
    exit 1
fi

echo "🚀 Creando release $VERSION..."

# Actualizar version en package.json
npm version $VERSION --no-git-tag-version

# Actualizar version en Cargo.toml
sed -i "s/version = \".*\"/version = \"${VERSION#v}\"/" src-tauri/Cargo.toml

# Actualizar version en tauri.conf.json
sed -i "s/\"version\": \".*\"/\"version\": \"${VERSION#v}\"/" src-tauri/tauri.conf.json

# Actualizar PKGBUILD
sed -i "s/pkgver=.*/pkgver=${VERSION#v}/" PKGBUILD

echo "✅ Archivos actualizados"

# Crear commit y tag
git add .
git commit -m "chore: release $VERSION"
git tag $VERSION

echo "✅ Tag $VERSION creado"

echo "🔄 Para publicar ejecuta:"
echo "   git push origin main --tags"
echo ""
echo "🎉 GitHub Actions creará automáticamente:"
echo "   - appwireguard_${VERSION#v}_amd64.deb"
echo "   - appwireguard-${VERSION#v}-1.x86_64.rpm"  
echo "   - appwireguard_${VERSION#v}_amd64.AppImage"