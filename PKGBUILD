# Maintainer: isaiasfl <tu-email@dominio.com>
pkgname=appwireguard
pkgver=0.1.0
pkgrel=1
pkgdesc="Aplicación profesional para gestión de VPN WireGuard departamental"
arch=('x86_64')
url="https://github.com/isaiasfl/APPWireguard"
license=('MIT')
depends=('wireguard-tools' 'sudo' 'webkit2gtk' 'polkit' 'gtk3' 'libayatana-appindicator')
makedepends=('rust' 'npm' 'webkit2gtk' 'openssl' 'libayatana-appindicator' 'gtk3' 'librsvg' 'patchelf' 'clang' 'nasm' 'gcc' 'llvm')
optdepends=('networkmanager: para integración con NetworkManager'
            'systemd-resolved: para resolución DNS automática')
provides=('appwireguard')
conflicts=('appwireguard-git')
source=("$pkgname-$pkgver.tar.gz::$url/archive/v$pkgver.tar.gz")
sha256sums=('SKIP')  # Actualizar con el hash real
install=$pkgname.install

prepare() {
    cd "$srcdir/APPWireguard-$pkgver"
    npm install
}

build() {
    cd "$srcdir/APPWireguard-$pkgver"
    
    # Variables de entorno para Ring
    export CC=gcc
    export CXX=g++
    export RING_BUILD_VERBOSE=1
    
    npm run tauri build
}

package() {
    cd "$srcdir/APPWireguard-$pkgver"
    
    # Instalar binario principal
    install -Dm755 "src-tauri/target/release/$pkgname" "$pkgdir/usr/bin/$pkgname"
    
    # Instalar archivo .desktop
    install -Dm644 "$pkgname.desktop" "$pkgdir/usr/share/applications/$pkgname.desktop"
    
    # Instalar iconos en múltiples tamaños
    for size in 32 128; do
        install -Dm644 "src-tauri/icons/${size}x${size}.png" \
            "$pkgdir/usr/share/icons/hicolor/${size}x${size}/apps/$pkgname.png"
    done
    
    # Icono principal en pixmaps (compatibilidad)
    install -Dm644 "src-tauri/icons/128x128.png" "$pkgdir/usr/share/pixmaps/$pkgname.png"
    
    # Instalar archivos de polkit
    install -Dm644 "99-appwireguard.rules" "$pkgdir/etc/polkit-1/rules.d/99-appwireguard.rules"
    
    # Instalar script post-instalación
    if [ -f "postinst" ]; then
        install -Dm755 "postinst" "$pkgdir/usr/share/$pkgname/postinst"
    fi
    
    # Instalar documentación
    install -Dm644 "README.md" "$pkgdir/usr/share/doc/$pkgname/README.md"
    install -Dm644 "LICENSE" "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
    
    if [ -f "CLAUDE.md" ]; then
        install -Dm644 "CLAUDE.md" "$pkgdir/usr/share/doc/$pkgname/CLAUDE.md"
    fi
    
    # Instalar archivos de configuración de ejemplo
    if [ -d "config" ]; then
        install -Dm644 config/* "$pkgdir/usr/share/$pkgname/config/"
    fi
}