# APP WireGuard - Gestión de VPN Departamental

## 🎯 Objetivo Principal
Crear una aplicación multiplataforma (Tauri + Rust + React) para configurar automáticamente equipos con WireGuard y conectarse al servidor VPN del departamento.

## 🔧 Funcionalidades Requeridas

### ✅ Implementado Actualmente
- [x] Interfaz gráfica con React + Tailwind CSS
- [x] Backend Rust con comandos Tauri
- [x] Generación automática de claves WireGuard (privada/pública)
- [x] Lectura/escritura de configuración `/etc/wireguard/wg0.conf`
- [x] Conexión/desconexión VPN (`wg-quick up/down wg0`)
- [x] Información del sistema (usuario, hostname, IP, OS, DNS)
- [x] Verificación de instalación WireGuard

### 🚧 Pendiente de Implementar
- [ ] **Configuración automática del servidor**: Formulario para introducir credenciales del servidor VPN departamental
- [ ] **Generación de instrucciones MikroTik**: Output con comandos específicos para añadir el equipo al router
- [ ] **Gestión multi-distro**: Detección automática del gestor de paquetes y comandos según la distribución
- [ ] **Validación de configuración**: Verificar conectividad antes de guardar
- [ ] **Backup de configuraciones**: Guardar múltiples perfiles VPN
- [ ] **Auto-instalación de dependencias**: Instalar WireGuard automáticamente si no está presente

## 🖥️ Compatibilidad Cross-Platform

### Distribuciones Linux Soportadas
- **Fedora**: `dnf install wireguard-tools`
- **Arch Linux**: `pacman -S wireguard-tools`
- **Ubuntu/Debian**: `apt install wireguard`
- **openSUSE**: `zypper install wireguard-tools`

### Comandos Sistema por Distro
```rust
// Detectar distribución
match detect_distro() {
    "fedora" => "dnf install wireguard-tools",
    "arch" => "pacman -S wireguard-tools", 
    "ubuntu" | "debian" => "apt install wireguard",
    "opensuse" => "zypper install wireguard-tools",
    _ => "Consulta la documentación de tu distro"
}
```

## 📋 Flujo de Trabajo Objetivo

1. **Instalación de dependencias** (si no están presentes)
2. **Configuración del servidor**: El usuario introduce datos del servidor VPN departamental
3. **Generación automática**: La app genera claves y configura el cliente
4. **Output MikroTik**: Se muestran los comandos exactos para añadir el peer al router
5. **Conexión**: El usuario puede conectar/desconectar desde la interfaz

## 🛠️ Requisitos Técnicos

### Dependencias del Sistema
- `wireguard-tools` (wg, wg-quick)
- `pkexec` o `sudo` para operaciones administrativas
- Acceso a `/etc/wireguard/`

### Estructura de Datos
```rust
struct ServerConfig {
    public_key: String,
    endpoint: String,    // IP:puerto del servidor
    allowed_ips: String, // Redes permitidas
    dns_servers: String,
    persistent_keepalive: u32,
}

struct ClientConfig {
    private_key: String,
    public_key: String,
    address: String,     // IP asignada al cliente
    server: ServerConfig,
}
```

## 🔒 Consideraciones de Seguridad
- Almacenamiento seguro de claves privadas
- Validación de entrada para evitar inyección de comandos
- Verificación de permisos antes de ejecutar comandos administrativos
- Backup automático de configuraciones existentes

## 📝 Notas de Desarrollo
- La aplicación está desarrollada con Tauri 2.x
- Frontend: React 18 + Tailwind CSS 4.x
- Backend: Rust con comandos async/await
- Distribución: Binario multiplataforma mediante Tauri

## 🐛 Issues Conocidos
- En Arch Linux: Requiere instalación manual de `wireguard-tools`
- Comandos administrativos requieren autenticación (`pkexec` o `sudo`)
- Configuración hardcodeada para interfaz `wg0`

## 🎯 Próximos Pasos
1. Implementar detección automática de distribución Linux
2. Añadir formulario de configuración del servidor
3. Generar instrucciones específicas para MikroTik
4. Mejorar gestión de errores y feedback al usuario
5. Añadir tests automatizados