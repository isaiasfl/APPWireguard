# 🛠️ Guía de Desarrollo

## 📋 Protocolo de Desarrollo para Cambios en la Interfaz

### 1. Configuración del Entorno

```bash
# Clonar el repositorio
git clone https://github.com/isaiasfl/APPWireguard.git
cd APPWireguard

# Instalar dependencias
npm install

# Instalar dependencias de Rust/Tauri
cd src-tauri && cargo check && cd ..
```

### 2. Desarrollo en Modo Hot-Reload

```bash
# Iniciar modo desarrollo con hot-reload
npm run tauri dev
```

**Beneficios del modo desarrollo:**

- ✅ **Hot-reload automático**: Los cambios en React se reflejan inmediatamente
- ✅ **DevTools habilitadas**: Herramientas de desarrollo del navegador
- ✅ **Logs detallados**: Debug completo de frontend y backend
- ✅ **Recarga rápida**: No necesitas recompilar toda la aplicación

### 3. Estructura de Archivos para UI

```
src/
├── components/           # Componentes React reutilizables
│   ├── Header.jsx       # Barra superior de navegación
│   ├── VpnPanel.jsx     # Panel principal de gestión VPN
│   ├── VPNConfigForm.jsx # Formulario de configuración
│   └── SystemInfoModal.jsx # Modal de información del sistema
├── context/
│   └── VPNContext.jsx   # Estado global de la aplicación
├── assets/              # Recursos estáticos
│   ├── Logo_VPN.png
│   └── Logo_VPN2.png
├── App.jsx              # Componente principal
├── App.css              # Estilos principales
├── index.css            # Estilos globales con Tailwind
└── main.jsx             # Punto de entrada
```

### 4. Flujo de Trabajo Recomendado

#### Paso 1: Planificación

```bash
# Crear una nueva rama para tu feature
git checkout -b feature/nueva-interfaz

# O para bugs
git checkout -b fix/problema-ui
```

#### Paso 2: Desarrollo

```bash
# Iniciar desarrollo con hot-reload
npm run tauri dev

# Hacer cambios en src/components/ o src/
# Los cambios se reflejan automáticamente en la ventana de desarrollo
```

#### Paso 3: Testing Local

```bash
# Testear la aplicación en modo desarrollo
# Verificar que todas las funcionalidades funcionan

# Construir para verificar que la compilación es exitosa
npm run tauri build
```

#### Paso 4: Verificar Instalación

```bash
# Testear el instalador (solo si cambias lógica de backend)
sudo ./install.sh

# O simplemente copiar el nuevo binario
sudo cp src-tauri/target/release/appwireguard /usr/bin/
```

### 5. Tecnologías y Patrones

#### Frontend (React + Tailwind)

- **React 18** con componentes funcionales y hooks
- **Tailwind CSS 4** para estilos utilitarios
- **Context API** para gestión de estado global
- **Tauri API** para comunicación con el backend Rust

#### Backend (Rust + Tauri)

- **Tauri v2** para la ventana nativa y APIs del sistema
- **Comandos Tauri** para operaciones privilegiadas (sudo)
- **Async/await** para operaciones de red y archivos

### 6. Comandos Útiles

```bash
# Desarrollo con hot-reload
npm run tauri dev

# Build completo de producción
npm run tauri build

# Solo frontend (para testing rápido de UI)
npm run dev

# Linting de código
npm run lint

# Formatear código
npm run format

# Limpiar cache y dependencias
npm run clean
```

### 7. Debugging y Herramientas

#### DevTools en Desarrollo

- **F12**: Abrir DevTools del navegador
- **Console**: Ver logs de JavaScript y errores
- **Network**: Monitorear llamadas a APIs
- **Elements**: Inspeccionar y modificar DOM en tiempo real

#### Logs de Rust

```bash
# Ver logs detallados del backend
RUST_LOG=debug npm run tauri dev
```

#### Hot-Reload Troubleshooting

```bash
# Si el hot-reload no funciona
rm -rf node_modules package-lock.json
npm install
npm run tauri dev
```

### 8. Consideraciones de UI/UX

#### Diseño Responsivo

- Usar clases Tailwind responsive: `sm:`, `md:`, `lg:`
- Testear en diferentes tamaños de ventana
- La aplicación debe funcionar desde 800x600 hasta fullscreen

#### Accesibilidad

- Usar etiquetas semánticas HTML
- Añadir `aria-label` a botones sin texto
- Mantener contraste adecuado de colores

#### Performance

- Lazy loading para componentes pesados
- Memoización con `React.memo()` si es necesario
- Evitar re-renders innecesarios

### 9. Antes de Hacer Commit

```bash
# Verificar que todo funciona
npm run tauri dev    # Test en modo desarrollo
npm run tauri build  # Test de build de producción

# Verificar que no hay errores de lint
npm run lint

# Commit siguiendo conventional commits
git add .
git commit -m "feat(ui): añadir nuevo panel de configuración avanzada"
```

### 10. Deployment y Distribución

#### Para cambios solo de UI

```bash
# Build de producción
npm run tauri build

# El binario estará en:
# src-tauri/target/release/appwireguard

# Actualizar en el sistema (si ya está instalado)
sudo cp src-tauri/target/release/appwireguard /usr/bin/
```

#### Para releases oficiales

- Los GitHub Actions se encargan automáticamente
- Solo necesitas hacer push a `main` o crear un tag

## 🎯 Tips de Desarrollo

1. **Usa el modo dev**: `npm run tauri dev` es tu mejor amigo
2. **Hot-reload**: Los cambios en React se ven inmediatamente
3. **DevTools**: F12 para debugging completo del frontend
4. **Componentes pequeños**: Mantén los componentes React simples y reutilizables
5. **Estado mínimo**: Usa Context solo para estado que necesitan múltiples componentes
6. **Tailwind first**: Prefiere clases Tailwind sobre CSS custom
7. **Test en build**: Siempre verifica que `npm run tauri build` funciona antes de commit

## 🚀 Próximos Pasos Sugeridos

- [ ] Implementar tema dark/light
- [ ] Añadir animaciones con Framer Motion
- [ ] Mejorar feedback visual para operaciones async
- [ ] Implementar shortcuts de teclado
- [ ] Añadir notificaciones toast
- [ ] Mejorar responsive design para pantallas pequeñas
