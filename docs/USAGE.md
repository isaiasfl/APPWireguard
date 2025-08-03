# 🚀 Guía de Uso

## Primera Ejecución

1. **Instalar dependencias** (si no están presentes)
2. **Configurar conexión VPN**
3. **Conectar/Desconectar** desde la interfaz

## Configuración de VPN

### 1. Abrir Configuración
- Clic en el ⚙️ icono de configuración
- O en "⚙️ Configurar VPN" si no hay configuraciones

### 2. Datos Requeridos

#### 📛 Nombre de Conexión *
- Ejemplo: `casa`, `trabajo`, `dpto`
- Se creará: `/etc/wireguard/wg0-NOMBRE.conf`

#### 🔑 Clave Pública del Servidor *
- Obtenida del administrador del servidor VPN
- Ejemplo: `qWWQVBR6240fBFnF+LO8d0taM/nToqqypAy6cziilVE=`

#### 🌐 Endpoint del Servidor *
- IP o dominio + puerto
- Ejemplo: `servidor.miempresa.com:51820`

#### 🌐 Dirección IP del Cliente
- IP asignada a tu equipo
- Ejemplo: `192.168.100.105/32`

#### Campos Opcionales:
- **DNS**: Servidores DNS (por defecto: `1.1.1.1`)
- **Allowed IPs**: Redes permitidas (por defecto: `0.0.0.0/0`)
- **Keep Alive**: Intervalo keepalive (por defecto: `25`)

### 3. Claves Automáticas
- La app genera automáticamente tu clave privada/pública
- Tu **clave pública** se muestra para copiar al administrador

## Conexión VPN

### Pantalla Principal
1. **Selector VPN**: Elige qué conexión usar
2. **Estado**: Muestra si estás conectado/desconectado
3. **Botón Conectar/Desconectar**

### Estados Posibles:
- 🟢 **Conectado a wg0-NOMBRE**: VPN activa
- 🔴 **Desconectado**: Sin VPN activa  
- 🟠 **VPN sin configurar**: Necesita configuración
- 🔵 **Selecciona VPN**: Hay configuraciones, elige una

## Gestión de Múltiples VPNs

### Crear Nueva Conexión
1. Configuración → Cambiar nombre → Guardar
2. Se crea nuevo archivo `/etc/wireguard/wg0-NOMBRE.conf`

### Cambiar entre VPNs
1. Desconectar VPN actual
2. Seleccionar otra del dropdown
3. Conectar

### Ejemplo de Configuraciones:
- `wg0-casa.conf` → Para conectar desde casa
- `wg0-trabajo.conf` → Para la oficina
- `wg0-dpto.conf` → Para el departamento

## Información del Sistema

Clic en tu avatar (arriba derecha) para ver:
- 👤 Usuario local
- 💻 Hostname  
- 🌐 IP local
- 🔒 IP VPN (cuando conectado)
- 🧠 Sistema operativo
- 📡 Servidores DNS
- 🔑 Tu clave pública WireGuard

## Comandos para Administradores

### Añadir Cliente al Servidor (MikroTik)
La app genera automáticamente los comandos:

```bash
/interface/wireguard/peers/add 
interface=wireguard1 
public-key="CLAVE_PUBLICA_CLIENTE" 
allowed-address=IP_CLIENTE/32
```

### Verificar Estado (Línea de Comandos)
```bash
# Ver interfaces activas
sudo wg show

# Ver configuración específica  
sudo wg show wg0-dpto

# Estado de la interfaz
ip addr show wg0-dpto
```

## Solución de Problemas

### VPN no conecta
1. Verificar dependencias: `wg --version`
2. Comprobar configuración del servidor
3. Verificar conectividad: `ping SERVIDOR`
4. Revisar logs: `journalctl -u wg-quick@wg0-NOMBRE`

### Problemas de DNS  
- La app comenta automáticamente `#DNS` para evitar errores
- Configurar DNS manualmente si es necesario

### Permisos sudo
- La app necesita permisos para `/etc/wireguard/`
- Configurar sudoers sin contraseña (opcional)

### No aparece en el menú
```bash
# Actualizar cache de aplicaciones
sudo update-desktop-database
```