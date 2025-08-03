# Maintainer: isaiasfl <tu-email@dominio.com>
pkgname=appwireguard
pkgver=0.1.0
pkgrel=1
pkgdesc="Aplicación multiplataforma para gestión de VPN WireGuard departamental"
arch=('x86_64')
url="https://github.com/isaiasfl/APPWireguard"
license=('MIT')
depends=('wireguard-tools' 'sudo')
makedepends=('rust' 'npm' 'webkit2gtk' 'openssl' 'appmenu-gtk-module' 'gtk3' 'libappindicator-gtk3' 'librsvg')
optdepends=('polkit: para autenticación gráfica')
source=("$pkgname-$pkgver.tar.gz::$url/archive/v$pkgver.tar.gz")
sha256sums=('SKIP')  # Actualizar con el hash real

prepare() {
    cd "$srcdir/APPWireguard-$pkgver"
    npm install
}

build() {
    cd "$srcdir/APPWireguard-$pkgver"
    npm run tauri build
}

package() {
    cd "$srcdir/APPWireguard-$pkgver"
    
    # Instalar binario
    install -Dm755 "src-tauri/target/release/$pkgname" "$pkgdir/usr/bin/$pkgname"
    
    # Instalar desktop file
    install -Dm644 "src-tauri/icons/128x128.png" "$pkgdir/usr/share/pixmaps/$pkgname.png"
    
    # Crear archivo .desktop
    install -Dm644 /dev/stdin "$pkgdir/usr/share/applications/$pkgname.desktop" << EOF
[Desktop Entry]
Type=Application
Name=APP WireGuard
Comment=Gestión de VPN WireGuard departamental
Exec=$pkgname
Icon=$pkgname
Categories=Network;Security;
Terminal=false
EOF

    # Instalar documentación
    install -Dm644 "README.md" "$pkgdir/usr/share/doc/$pkgname/README.md"
    install -Dm644 "CLAUDE.md" "$pkgdir/usr/share/doc/$pkgname/CLAUDE.md"
}