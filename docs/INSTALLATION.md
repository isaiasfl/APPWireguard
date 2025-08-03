# 📦 Guía de Instalación

## Instalación por Distribución

### 🟦 Ubuntu/Debian

```bash
# Descargar desde GitHub Releases
wget https://github.com/isaiasfl/APPWireguard/releases/latest/download/appwireguard_1.0.0_amd64.deb

# Instalar
sudo dpkg -i appwireguard_1.0.0_amd64.deb

# Si faltan dependencias
sudo apt-get install -f
```

### 🔴 Fedora/RHEL/CentOS

```bash
# Descargar desde GitHub Releases
wget https://github.com/isaiasfl/APPWireguard/releases/latest/download/appwireguard-1.0.0-1.x86_64.rpm

# Instalar
sudo rpm -i appwireguard-1.0.0-1.x86_64.rpm
```

### 🔵 Arch Linux

#### Método 1: Instalador Nativo (Recomendado)

```bash
# Descargar el instalador desde GitHub Releases
wget https://github.com/isaiasfl/APPWireguard/releases/latest/download/install.sh

# Dar permisos y ejecutar
chmod +x install.sh
sudo ./install.sh
```

#### Método 2: Desde AUR (cuando esté disponible)

```bash
# Desde AUR (recomendado)
yay -S appwireguard

# O con aurman
aurman -S appwireguard
```

**Nota para Arch Linux**: El instalador nativo detecta automáticamente las dependencias de Arch y las instala usando `pacman`. Es la forma más confiable de instalar la aplicación.

### 🟢 Universal (AppImage)

```bash
# Descargar
wget https://github.com/isaiasfl/APPWireguard/releases/latest/download/appwireguard_1.0.0_amd64.AppImage

# Dar permisos y ejecutar
chmod +x appwireguard_1.0.0_amd64.AppImage
./appwireguard_1.0.0_amd64.AppImage
```

## Dependencias Requeridas

Todas las distribuciones necesitan:

- `wireguard-tools`
- `sudo`

### Instalación manual de dependencias:

**Ubuntu/Debian:**

```bash
sudo apt update && sudo apt install wireguard-tools sudo
```

**Fedora:**

```bash
sudo dnf install wireguard-tools sudo
```

**Arch Linux:**

```bash
sudo pacman -S wireguard-tools sudo
```

## Permisos Sudo

La aplicación necesita permisos sudo para:

- Leer configuraciones en `/etc/wireguard/`
- Ejecutar `wg-quick up/down`
- Instalar WireGuard automáticamente

### Configuración opcional sin contraseña:

```bash
# Editar sudoers
sudo visudo

# Añadir esta línea (reemplaza 'tuusuario' por tu usuario)
tuusuario ALL=(ALL) NOPASSWD: /usr/bin/wg-quick, /usr/bin/wg, /bin/ls
```

## Verificación de Instalación

```bash
# Verificar que WireGuard está instalado
wg --version

# Verificar que la aplicación se instaló
appwireguard --version

# O ejecutar desde el menú de aplicaciones
```

## Desinstalación

**Ubuntu/Debian:**

```bash
sudo apt remove appwireguard
```

**Fedora:**

```bash
sudo rpm -e appwireguard
```

**Arch Linux:**

```bash
sudo pacman -R appwireguard
```

**AppImage:**

```bash
rm appwireguard_*_amd64.AppImage
```
