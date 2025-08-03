# 🔐 APP WireGuard - Gestión de VPN

[![Release](https://img.shields.io/github/v/release/isaiasfl/APPWireguard)](https://github.com/isaiasfl/APPWireguard/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Linux-blue)](https://github.com/isaiasfl/APPWireguard)
[![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri-24C8DB)](https://tauri.app/)

> 🚀 **Aplicación multiplataforma para configurar automáticamente equipos con WireGuard y conectarse al servidor VPN.**

## ✨ Características

- 🔧 **Configuración automática** de claves WireGuard
- 🌐 **Gestión múltiples VPNs** (casa, trabajo, departamento...)
- 📱 **Interfaz gráfica moderna** con React + Tailwind
- 🐧 **Soporte multiplataforma** Linux (Ubuntu, Fedora, Arch...)
- 🔒 **Conexión/desconexión** con un clic
- 📋 **Generación automática** de comandos para MikroTik
- 💻 **Información del sistema** integrada
- 🎯 **Detección automática** de VPNs activas

## 📦 Instalación Rápida

### Ubuntu/Debian

```bash
wget https://github.com/isaiasfl/APPWireguard/releases/latest/download/appwireguard_1.0.1_amd64.deb
sudo dpkg -i appwireguard_1.0.1_amd64.deb
```

### Fedora/RHEL

```bash
wget https://github.com/isaiasfl/APPWireguard/releases/latest/download/appwireguard-1.0.1-1.x86_64.rpm
sudo rpm -i appwireguard-1.0.1-1.x86_64.rpm
```

### Arch Linux

```bash
# Instalador nativo (recomendado)
wget https://github.com/isaiasfl/APPWireguard/releases/latest/download/install.sh
chmod +x install.sh && sudo ./install.sh

# O desde AUR (cuando esté disponible)
yay -S appwireguard
```

### Universal (AppImage)

```bash
wget https://github.com/isaiasfl/APPWireguard/releases/latest/download/appwireguard_*_amd64.AppImage
chmod +x appwireguard_*_amd64.AppImage && ./appwireguard_*_amd64.AppImage
```

📖 **[Ver guía completa de instalación](docs/INSTALLATION.md)**

## 🚀 Uso Rápido

1. **Instalar dependencias**: La app puede instalar WireGuard automáticamente
2. **Configurar VPN**:
   - Nombre de conexión (ej: `trabajo`)
   - Clave pública del servidor
   - Endpoint (IP:puerto)
3. **Conectar**: Seleccionar VPN y hacer clic en "Conectar"

📚 **[Ver guía detallada de uso](docs/USAGE.md)**

🛠️ **[Guía de desarrollo y cambios en la interfaz](docs/DEVELOPMENT.md)**

## 🖼️ Capturas de Pantalla

### Pantalla Principal

![Pantalla Principal](docs/screenshots/main.png)

### Configuración VPN

![Configuración](docs/screenshots/config.png)

### Información del Sistema

![Sistema](docs/screenshots/system.png)

## 🛠️ Desarrollo

### Prerrequisitos

- Node.js 18+
- Rust 1.70+
- wireguard-tools

### Configuración del entorno

```bash
# Clonar repositorio
git clone https://github.com/isaiasfl/APPWireguard.git
cd APPWireguard

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run tauri dev

# Compilar para producción
npm run tauri build
```

### Stack Tecnológico

- **Frontend**: React 18 + Tailwind CSS 4
- **Backend**: Rust + Tauri 2.x
- **Empaquetado**: .deb, .rpm, .AppImage
- **CI/CD**: GitHub Actions

## 🏗️ Arquitectura

```
├── src/                    # Frontend React
│   ├── components/         # Componentes UI
│   ├── context/           # Estado global
│   └── assets/            # Recursos estáticos
├── src-tauri/             # Backend Rust
│   ├── src/               # Lógica principal
│   ├── icons/             # Iconos de aplicación
│   └── capabilities/      # Permisos Tauri
├── docs/                  # Documentación
├── scripts/               # Scripts de build/release
└── .github/workflows/     # CI/CD GitHub Actions
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -m 'feat: añadir nueva característica'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

## 📋 TODO

- [ ] Soporte para Windows/macOS
- [ ] Configuración de servidor automática via QR
- [ ] Backup/restore de configuraciones
- [ ] Modo daemon sin GUI
- [ ] Integración con LDAP/AD

## 🐛 Reportar Issues

¿Encontraste un bug? [Abre un issue](https://github.com/isaiasfl/APPWireguard/issues/new) con:

- 🐧 Distribución Linux
- 📦 Versión de la app
- 🔧 Pasos para reproducir
- 📝 Logs relevantes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🙏 Reconocimientos

- [Tauri](https://tauri.app/) - Framework multiplataforma
- [WireGuard](https://www.wireguard.com/) - Protocolo VPN moderno
- [React](https://reactjs.org/) - Librería UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS

---

**Desarrollado con ❤️ por [isaiasfl](https://github.com/isaiasfl)**
