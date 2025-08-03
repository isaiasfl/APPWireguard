import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import "./App.css";

// Componente de Loading moderno
const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        {/* Logo animado */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl">
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.74s9-4.19 9-9.74V7l-10-5z" />
            </svg>
          </div>
          {/* Anillos animados */}
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-blue-400 animate-ping opacity-30"></div>
          <div
            className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-cyan-400 animate-ping opacity-20"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">APPWireguard</h1>
        <div className="flex items-center justify-center space-x-2 text-blue-300">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <span className="ml-2">Cargando...</span>
        </div>
      </div>
    </div>
  );
};

// Componente de VPN item en la lista
const VPNItem = ({ name, status, isSelected, onClick, onEdit }) => {
  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "text-green-400 bg-green-400/10";
      case "disconnected":
        return "text-gray-400 bg-gray-400/10";
      case "connecting":
        return "text-blue-400 bg-blue-400/10";
      case "disconnecting":
        return "text-orange-400 bg-orange-400/10";
      default:
        return "text-yellow-400 bg-yellow-400/10";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return "●";
      case "disconnected":
        return "○";
      case "connecting":
        return "⟳";
      case "disconnecting":
        return "⟲";
      default:
        return "◐";
    }
  };

  return (
    <div
      className={`p-4 rounded-xl transition-all duration-300 border relative group transform hover:scale-[1.02] hover:-translate-y-1 ${
        isSelected
          ? "bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/20"
          : "bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-500/10"
      }`}
    >
      <div
        onClick={onClick}
        className="cursor-pointer flex items-center justify-between pr-12"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.74s9-4.19 9-9.74V7l-10-5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">{name}</h3>
            <p className="text-sm text-gray-400">WireGuard Connection</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
          >
            <span className="mr-1">{getStatusIcon()}</span>
            {status}
          </div>
        </div>
      </div>

      {/* Botón editar que aparece al hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(name);
        }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 bg-slate-700/80 hover:bg-slate-600 rounded-lg backdrop-blur-sm transform hover:scale-110 hover:rotate-12 active:scale-95"
        title="Editar conexión"
      >
        <svg
          className="w-4 h-4 text-gray-300 hover:text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
    </div>
  );
};

// Modal de información del usuario
const UserInfoModal = ({ isOpen, onClose }) => {
  const [info, setInfo] = useState({});
  const [github, setGithub] = useState(null);
  const [keys, setKeys] = useState({ privateKey: "", publicKey: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchInfo = async () => {
      try {
        setLoading(true);
        console.log("Cargando información del sistema...");
        
        // Cargar datos uno por uno para mejor manejo de errores
        const systemInfo = {};
        
        try {
          systemInfo.username = await invoke("get_username");
          console.log("✅ Username obtenido");
        } catch (e) {
          console.log("❌ Error username:", e);
          systemInfo.username = "No disponible";
        }

        try {
          systemInfo.hostname = await invoke("get_hostname");
          console.log("✅ Hostname obtenido");
        } catch (e) {
          console.log("❌ Error hostname:", e);
          systemInfo.hostname = "No disponible";
        }

        try {
          systemInfo.ip = await invoke("get_ip_address");
          console.log("✅ IP obtenida");
        } catch (e) {
          console.log("❌ Error IP:", e);
          systemInfo.ip = "No disponible";
        }

        try {
          systemInfo.os = await invoke("get_os_info");
          console.log("✅ OS obtenido");
        } catch (e) {
          console.log("❌ Error OS:", e);
          systemInfo.os = "No disponible";
        }

        try {
          systemInfo.dns = await invoke("get_dns_servers");
          console.log("✅ DNS obtenido");
        } catch (e) {
          console.log("❌ Error DNS:", e);
          systemInfo.dns = "No disponible";
        }

        try {
          systemInfo.vpnIp = await invoke("get_vpn_ip");
          console.log("✅ VPN IP obtenida");
        } catch (e) {
          console.log("❌ Error VPN IP:", e);
          systemInfo.vpnIp = "No disponible";
        }

        try {
          const githubInfo = await invoke("get_github_info");
          setGithub(githubInfo);
          console.log("✅ GitHub info obtenida");
        } catch (e) {
          console.log("❌ Error GitHub:", e);
          setGithub(null);
        }

        try {
          const keysPair = await invoke("generate_keys");
          setKeys({ privateKey: keysPair[0], publicKey: keysPair[1] });
          console.log("✅ Keys generadas");
        } catch (e) {
          console.log("❌ Error keys:", e);
          setKeys({ privateKey: "", publicKey: "" });
        }

        setInfo(systemInfo);
        console.log("✅ Información del sistema cargada completamente");
      } catch (err) {
        console.error("Error general obteniendo datos del sistema:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-600 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Información del Sistema
                </h2>
                <p className="text-sm text-gray-400">
                  Datos del usuario y sistema
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">
                Cargando información del sistema...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* GitHub Info */}
              {github && (
                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                  <div className="flex items-center space-x-4">
                    <img
                      src={github.avatar_url}
                      alt="GitHub Avatar"
                      className="w-12 h-12 rounded-full border-2 border-cyan-400"
                    />
                    <div>
                      <p className="font-semibold text-white">
                        {github.name || github.login}
                      </p>
                      <a
                        href={github.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        @{github.login}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* System Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                  Información del Sistema
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">👤</span>
                      <div>
                        <p className="text-sm text-gray-400">Usuario local</p>
                        <p className="font-mono text-white">{info.username}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">💻</span>
                      <div>
                        <p className="text-sm text-gray-400">Hostname</p>
                        <p className="font-mono text-white">{info.hostname}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">🌐</span>
                        <div>
                          <p className="text-xs text-gray-400">IP Local</p>
                          <p className="font-mono text-sm text-white">
                            {info.ip}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">🔒</span>
                        <div>
                          <p className="text-xs text-gray-400">IP VPN</p>
                          <p className="font-mono text-sm text-white">
                            {info.vpnIp}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🧠</span>
                      <div>
                        <p className="text-sm text-gray-400">
                          Sistema Operativo
                        </p>
                        <p className="font-mono text-white">{info.os}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">📡</span>
                      <div>
                        <p className="text-sm text-gray-400">Servidores DNS</p>
                        <p className="font-mono text-white">{info.dns}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* WireGuard Keys */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Claves WireGuard
                </h3>

                <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-green-300 mb-2">
                        🔑 Clave Pública
                      </p>
                      <div className="flex">
                        <input
                          type="text"
                          value={keys.publicKey}
                          readOnly
                          className="flex-1 font-mono text-xs px-3 py-2 bg-slate-700/50 border border-green-400/30 rounded-l text-white"
                        />
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(keys.publicKey)
                          }
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-r"
                          title="Copiar clave pública"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-600">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de formulario para nueva/editar conexión VPN
const VPNFormModal = ({ isOpen, onClose, editingVPN = null, checkRealVPNStatus }) => {
  const [formData, setFormData] = useState({
    name: "",
    // DATOS LOCALES (tu equipo)
    clientPublicKey: "",
    clientPrivateKey: "",
    clientAddress: "10.0.0.2/24",
    // DATOS DEL SERVIDOR REMOTO
    serverPublicKey: "",
    serverEndpoint: "",
    allowedIPs: "0.0.0.0/0",
    dns: "1.1.1.1",
    keepalive: "25",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = editingVPN !== null;

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        if (isEditing && editingVPN) {
          // editingVPN ahora es el nombre de la VPN
          const config = await invoke("read_wg_config", {
            vpnName: editingVPN,
          });
          const parsedConfig = parseWireguardConfig(config, editingVPN);
          setFormData(parsedConfig);
        } else {
          // Reset form para nueva VPN
          setFormData({
            name: "",
            clientPublicKey: "",
            clientPrivateKey: "",
            clientAddress: "10.0.0.2/24",
            serverPublicKey: "",
            serverEndpoint: "",
            allowedIPs: "0.0.0.0/0",
            dns: "1.1.1.1",
            keepalive: "25",
          });

          // Cargar claves existentes de ~/.wireguard o generar nuevas
          try {
            const [privateKey, publicKey] = await invoke("generate_keys");
            setFormData((prev) => ({
              ...prev,
              clientPrivateKey: privateKey,
              clientPublicKey: publicKey,
            }));
          } catch (err) {
            console.log("No se encontraron claves existentes");
          }
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };

    loadData();
  }, [isOpen, isEditing, editingVPN]);

  const parseWireguardConfig = (config, vpnName) => {
    const lines = config.split("\n");
    const data = {
      name: vpnName, // Establecer el nombre correcto
      clientPublicKey: "",
      clientPrivateKey: "",
      clientAddress: "10.0.0.2/24",
      serverPublicKey: "",
      serverEndpoint: "",
      allowedIPs: "0.0.0.0/0",
      dns: "1.1.1.1",
      keepalive: "25",
    };

    let inInterface = false;
    let inPeer = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed === "[Interface]") {
        inInterface = true;
        inPeer = false;
      } else if (trimmed === "[Peer]") {
        inInterface = false;
        inPeer = true;
      } else if (trimmed.includes("=")) {
        const [key, ...valueParts] = trimmed.split("=");
        const cleanKey = key.trim();
        const value = valueParts.join("=").trim();

        if (inInterface) {
          if (cleanKey === "PrivateKey") data.clientPrivateKey = value;
          if (cleanKey === "Address") data.clientAddress = value;
          if (cleanKey === "DNS") data.dns = value;
        } else if (inPeer) {
          if (cleanKey === "PublicKey") data.serverPublicKey = value;
          if (cleanKey === "Endpoint") data.serverEndpoint = value;
          if (cleanKey === "AllowedIPs") data.allowedIPs = value;
          if (cleanKey === "PersistentKeepalive") data.keepalive = value;
        }
      }
    });

    // Obtener clave pública del cliente desde la privada
    if (data.clientPrivateKey) {
      invoke("get_public_key_from_private", {
        privateKey: data.clientPrivateKey,
      })
        .then((pubKey) => {
          setFormData((prev) => ({ ...prev, clientPublicKey: pubKey }));
        })
        .catch((err) => console.error("Error obteniendo clave pública:", err));
    }

    return data;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error al empezar a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Nombre requerido";
    if (!formData.serverPublicKey.trim())
      newErrors.serverPublicKey = "Clave pública del servidor requerida";
    if (!formData.serverEndpoint.trim())
      newErrors.serverEndpoint = "Endpoint del servidor requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const config = generateWireguardConfig();
      let wasConnected = false;

      if (isEditing) {
        console.log(`📝 Editando VPN: ${editingVPN} -> ${formData.name}`);
        
        // Verificar si la VPN estaba conectada antes de editarla
        const vpnStatus = await checkRealVPNStatus(editingVPN);
        wasConnected = vpnStatus === "connected";
        
        if (wasConnected) {
          console.log(`🔌 VPN ${editingVPN} estaba conectada, desconectando...`);
          await invoke("disconnect_vpn", { vpnName: editingVPN });
          // Esperar un poco para que se desconecte completamente
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // PRIMERO: Guardar la nueva configuración
        console.log(`💾 Guardando nueva configuración: ${formData.name}`);
        await invoke("save_wg_config", {
          vpn_name: formData.name,
          config: config,
        });

        // DESPUÉS: Si cambió el nombre Y la nueva configuración se guardó correctamente, eliminar la antigua
        if (editingVPN !== formData.name) {
          console.log(`🗑️ Eliminando configuración antigua: ${editingVPN}`);
          try {
            // Verificar que la nueva configuración existe antes de eliminar la antigua
            const newConfigExists = await invoke("read_wg_config", { vpnName: formData.name });
            if (newConfigExists) {
              await invoke("delete_wg_config", { vpnName: editingVPN });
              console.log(`✅ Configuración antigua eliminada correctamente`);
            } else {
              console.error("❌ NO SE ELIMINA LA ANTIGUA: La nueva configuración no existe");
            }
          } catch (err) {
            console.warn("No se pudo eliminar la configuración antigua (MEJOR ASÍ):", err);
          }
        }

        // Si estaba conectada, reconectar con el nuevo nombre
        if (wasConnected) {
          console.log(`🔄 Reconectando con nueva configuración: ${formData.name}`);
          setTimeout(async () => {
            try {
              await invoke("connect_vpn", { vpnName: formData.name });
              console.log(`✅ Reconectado a ${formData.name}`);
            } catch (err) {
              console.error("Error reconectando:", err);
            }
          }, 1000);
        }
      } else {
        // Crear nueva VPN
        console.log(`➕ Creando nueva VPN: ${formData.name}`);
        await invoke("create_wg_config", {
          vpn_name: formData.name,
          config: config,
        });
      }

      // Cerrar modal y recargar lista
      onClose(true); // Pasar true para indicar que se guardó
    } catch (err) {
      console.error("Error guardando configuración:", err);
      setErrors({ submit: `Error: ${err}` });
    } finally {
      setIsLoading(false);
    }
  };

  const generateClientKeys = async () => {
    setLoadingKeys(true);
    try {
      const [privateKey, publicKey] = await invoke("generate_new_keys");
      setFormData((prev) => ({
        ...prev,
        clientPrivateKey: privateKey,
        clientPublicKey: publicKey,
      }));
    } catch (err) {
      console.error("Error generando claves:", err);
    } finally {
      setLoadingKeys(false);
    }
  };

  const generateWireguardConfig = () => {
    return `[Interface]
PrivateKey = ${formData.clientPrivateKey}
Address = ${formData.clientAddress}
DNS = ${formData.dns}

[Peer]
PublicKey = ${formData.serverPublicKey}
Endpoint = ${formData.serverEndpoint}
AllowedIPs = ${formData.allowedIPs}
PersistentKeepalive = ${formData.keepalive}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías añadir una notificación de "copiado"
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop con blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-600 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm p-6 border-b border-slate-600 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isEditing
                        ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                    }
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEditing ? `Editar "${editingVPN}"` : "Nueva Conexión VPN"}
                </h2>
                <p className="text-sm text-gray-400">
                  Configuración de WireGuard
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* NOMBRE DE LA CONEXIÓN */}
          <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
              📛 NOMBRE DE LA CONEXIÓN *
            </h3>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-4 py-3 bg-slate-700/50 border ${
                errors.name ? "border-red-400" : "border-purple-400/30"
              } rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all`}
              placeholder="Ej: Trabajo, Casa, Servidor-EU..."
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
            <p className="text-sm text-purple-400 mt-2">
              Se creará:{" "}
              <code>/etc/wireguard/wg0-{formData.name || "NOMBRE"}.conf</code>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SECCIÓN 1: DATOS DE TU EQUIPO */}
            <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center">
                📱 DATOS DE TU EQUIPO
                <span className="ml-2 text-sm font-normal text-green-400">
                  (Copia estos datos al servidor)
                </span>
              </h3>

              <div className="space-y-4">
                {/* Clave pública TU equipo */}
                <div>
                  <label className="block text-sm font-medium text-green-300 mb-2">
                    🔑 Tu Clave Pública (para añadir al servidor):
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={formData.clientPublicKey}
                      readOnly
                      className="flex-1 font-mono text-sm px-3 py-2 bg-slate-700/50 border border-green-400/30 rounded-l text-white"
                      placeholder="Se generará automáticamente..."
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(formData.clientPublicKey)}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-r border border-green-600"
                      title="Copiar al portapapeles"
                    >
                      📋
                    </button>
                  </div>
                </div>

                {/* Dirección IP de TU equipo */}
                <div>
                  <label className="block text-sm font-medium text-green-300 mb-2">
                    🌐 Tu Dirección IP Local:
                  </label>
                  <input
                    type="text"
                    value={formData.clientAddress}
                    onChange={(e) =>
                      handleInputChange("clientAddress", e.target.value)
                    }
                    className="w-full font-mono text-sm px-3 py-2 bg-slate-700/50 border border-green-400/30 rounded text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all"
                    placeholder="10.0.0.2/24"
                  />
                </div>

                {/* Botón generar claves */}
                <button
                  type="button"
                  onClick={generateClientKeys}
                  disabled={loadingKeys}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 disabled:from-gray-500 disabled:to-gray-400 text-white font-medium rounded-lg transition-all shadow-lg shadow-green-500/20 flex items-center justify-center space-x-2"
                >
                  {loadingKeys && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  <span>
                    {loadingKeys
                      ? "Generando..."
                      : "🔑 Generar Claves de Cliente"}
                  </span>
                </button>

                {/* Instrucciones para servidor */}
                <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-3">
                  <h4 className="font-semibold text-green-300 text-sm mb-2">
                    📋 COMANDOS PARA EL SERVIDOR:
                  </h4>
                  <div className="font-mono text-xs text-green-400 space-y-1 bg-slate-800/50 p-2 rounded">
                    <div>/interface/wireguard/peers/add</div>
                    <div>interface=wireguard1</div>
                    <div>public-key="{formData.clientPublicKey}"</div>
                    <div>allowed-address={formData.clientAddress}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `/interface/wireguard/peers/add interface=wireguard1 public-key="${formData.clientPublicKey}" allowed-address=${formData.clientAddress}`
                      )
                    }
                    className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                  >
                    📋 Copiar comandos MikroTik
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: CONFIGURACIÓN DEL SERVIDOR */}
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
                🏢 CONFIGURACIÓN DEL SERVIDOR
                <span className="ml-2 text-sm font-normal text-blue-400">
                  (Datos del servidor remoto)
                </span>
              </h3>

              <div className="space-y-4">
                {/* Clave pública del SERVIDOR */}
                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    🔑 Clave Pública del Servidor *:
                  </label>
                  <textarea
                    value={formData.serverPublicKey}
                    onChange={(e) =>
                      handleInputChange("serverPublicKey", e.target.value)
                    }
                    className={`w-full font-mono text-sm px-3 py-2 bg-slate-700/50 border ${
                      errors.serverPublicKey
                        ? "border-red-400"
                        : "border-blue-400/30"
                    } rounded text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all`}
                    rows="3"
                    placeholder="Pega aquí la clave pública del servidor MikroTik..."
                  />
                  {errors.serverPublicKey && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.serverPublicKey}
                    </p>
                  )}
                </div>

                {/* Endpoint del servidor */}
                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    🌐 Endpoint del Servidor *:
                  </label>
                  <input
                    type="text"
                    value={formData.serverEndpoint}
                    onChange={(e) =>
                      handleInputChange("serverEndpoint", e.target.value)
                    }
                    className={`w-full font-mono text-sm px-3 py-2 bg-slate-700/50 border ${
                      errors.serverEndpoint
                        ? "border-red-400"
                        : "border-blue-400/30"
                    } rounded text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all`}
                    placeholder="IP_DEL_SERVIDOR:51820"
                  />
                  {errors.serverEndpoint && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.serverEndpoint}
                    </p>
                  )}
                </div>

                {/* DNS */}
                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    📡 DNS:
                  </label>
                  <input
                    type="text"
                    value={formData.dns}
                    onChange={(e) => handleInputChange("dns", e.target.value)}
                    className="w-full font-mono text-sm px-3 py-2 bg-slate-700/50 border border-blue-400/30 rounded text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                    placeholder="1.1.1.1"
                  />
                </div>

                {/* Allowed IPs */}
                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    🛣️ Allowed IPs:
                  </label>
                  <input
                    type="text"
                    value={formData.allowedIPs}
                    onChange={(e) =>
                      handleInputChange("allowedIPs", e.target.value)
                    }
                    className="w-full font-mono text-sm px-3 py-2 bg-slate-700/50 border border-blue-400/30 rounded text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                    placeholder="0.0.0.0/0"
                  />
                </div>

                {/* Keep Alive */}
                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">
                    ⏱️ Keep Alive:
                  </label>
                  <input
                    type="text"
                    value={formData.keepalive}
                    onChange={(e) =>
                      handleInputChange("keepalive", e.target.value)
                    }
                    className="w-full font-mono text-sm px-3 py-2 bg-slate-700/50 border border-blue-400/30 rounded text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                    placeholder="25"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* VISTA PREVIA DE LA CONFIGURACIÓN */}
          <div className="bg-slate-700/30 border border-slate-600 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              📄 Vista previa de la configuración:
            </h3>
            <pre className="bg-slate-900/50 border border-slate-600 rounded p-3 text-sm font-mono text-gray-200 overflow-x-auto">
              {`[Interface]
PrivateKey = ${formData.clientPrivateKey || "CLAVE_PRIVADA_GENERADA"}
Address = ${formData.clientAddress}
DNS = ${formData.dns}

[Peer]
PublicKey = ${formData.serverPublicKey || "CLAVE_PUBLICA_DEL_SERVIDOR"}
Endpoint = ${formData.serverEndpoint || "IP_SERVIDOR:PUERTO"}
AllowedIPs = ${formData.allowedIPs}
PersistentKeepalive = ${formData.keepalive}`}
            </pre>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-600">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              ← Volver
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3 bg-gradient-to-r text-white font-bold rounded-lg transition-all shadow-lg flex items-center space-x-2 ${
                isLoading 
                  ? "from-gray-500 to-gray-400 cursor-not-allowed" 
                  : isEditing
                  ? "from-orange-500 to-red-400 hover:from-orange-600 hover:to-red-500 shadow-orange-500/30"
                  : "from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 shadow-blue-500/30"
              }`}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              <span>
                {isLoading
                  ? isEditing 
                    ? "Actualizando..."
                    : "Creando..."
                  : isEditing
                  ? "🔄 Actualizar VPN"
                  : "➕ Crear VPN"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Panel de control principal
const ControlPanel = ({
  selectedVPN,
  selectedVPNData,
  onConnect,
  onDisconnect,
  onCreateNew,
  loading: externalLoading,
}) => {
  const [vpnInfo, setVpnInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Función helper para extraer valores de la configuración
  const extractFromConfig = (config, key) => {
    if (!config) return null;
    const lines = config.split("\n");
    for (const line of lines) {
      if (line.trim().startsWith(key + " =")) {
        return line.split("=")[1].trim();
      }
    }
    return null;
  };

  // Cargar información detallada de la VPN seleccionada
  useEffect(() => {
    if (!selectedVPN || !selectedVPNData) {
      setVpnInfo(null);
      return;
    }

    const loadVPNInfo = async () => {
      setLoading(true);
      try {
        // Obtener IP actual del equipo (sin VPN) y tiempo de conexión
        const [currentIP, connectionTime] = await Promise.all([
          invoke("get_current_ip").catch(() => "No disponible"),
          invoke("get_connection_time", { vpnName: selectedVPN }).catch(
            () => "00:00:00"
          ),
        ]);

        // Parsear configuración para obtener la IP que tendría con VPN
        const config = selectedVPNData.config || "";
        const clientVPNAddress =
          extractFromConfig(config, "Address") || "No configurada";
        // Quitar la máscara de red si existe (/24, /32, etc.)
        const vpnIP = clientVPNAddress.includes("/")
          ? clientVPNAddress.split("/")[0]
          : clientVPNAddress;

        setVpnInfo({
          name: selectedVPN,
          status: selectedVPNData.status,
          currentIP,
          vpnIP,
          connectionTime,
          isConnected: selectedVPNData.status === "connected",
        });
      } catch (err) {
        console.error("Error cargando info de VPN:", err);
        setVpnInfo({
          name: selectedVPN,
          status: selectedVPNData.status,
          currentIP: "Error cargando",
          vpnIP: "Error cargando",
          connectionTime: "00:00:00",
          isConnected: selectedVPNData.status === "connected",
        });
      } finally {
        setLoading(false);
      }
    };

    loadVPNInfo();
  }, [selectedVPN, selectedVPNData]);

  return (
    <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
      {selectedVPN ? (
        <div className="text-center">
          {loading ? (
            <div className="py-16">
              <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">
                Cargando información de {selectedVPN}...
              </p>
            </div>
          ) : vpnInfo ? (
            <>
              {/* Estado visual grande */}
              <div className="mb-8">
                <div
                  className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-500 transform hover:scale-110 relative ${
                    vpnInfo.isConnected
                      ? "bg-gradient-to-r from-green-500 to-emerald-400 shadow-lg shadow-green-500/30 animate-pulse"
                      : "bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400"
                  }`}
                >
                  <svg
                    className={`w-16 h-16 text-white transition-all duration-300 ${
                      vpnInfo.isConnected ? 'animate-pulse' : ''
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.74s9-4.19 9-9.74V7l-10-5z" />
                  </svg>
                  {vpnInfo.isConnected && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full bg-green-400/10 animate-ping animation-delay-75"></div>
                      <div className="absolute inset-0 rounded-full bg-green-400/5 animate-ping animation-delay-150"></div>
                    </>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 transition-all duration-300 hover:text-cyan-400">
                  {vpnInfo.name}
                </h2>
                <p
                  className={`text-lg font-medium transition-all duration-500 ${
                    vpnInfo.isConnected ? "text-green-400 animate-pulse" : "text-gray-400"
                  }`}
                >
                  {vpnInfo.isConnected ? "🟢 Conectado" : "⚫ Desconectado"}
                </p>
              </div>

              {/* Botón principal */}
              <button
                onClick={() => {
                  if (vpnInfo.isConnected) {
                    onDisconnect(selectedVPN);
                  } else {
                    onConnect(selectedVPN);
                  }
                }}
                disabled={externalLoading}
                className={`group w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-500 flex items-center justify-center space-x-2 mb-4 transform hover:scale-105 active:scale-95 ${
                  vpnInfo.isConnected
                    ? "bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
                    : "bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 disabled:from-gray-500 disabled:to-gray-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:shadow-2xl"
                } ${externalLoading ? 'animate-pulse' : ''}`}
              >
                {externalLoading && (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                <span className="group-hover:animate-bounce">
                  {externalLoading
                    ? vpnInfo.isConnected
                      ? "Desconectando..."
                      : "Conectando..."
                    : vpnInfo.isConnected
                    ? "🔌 Desconectar VPN"
                    : "🚀 Conectar VPN"}
                </span>
                {!externalLoading && !vpnInfo.isConnected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>
                )}
              </button>

              {/* Información detallada */}
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-gray-400">IP Actual</p>
                  <p className="text-white font-mono">{vpnInfo.currentIP}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-gray-400">IP con VPN</p>
                  <p className="text-white font-mono">{vpnInfo.vpnIP}</p>
                </div>
                {vpnInfo.isConnected && (
                  <>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <p className="text-gray-400">Tiempo Activo</p>
                      <p className="text-white font-mono">
                        {vpnInfo.connectionTime}
                      </p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <p className="text-gray-400">Estado</p>
                      <p className="text-green-400 font-medium">Activa</p>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Selecciona una VPN
          </h3>
          <p className="text-gray-400 mb-6">
            Elige una conexión de la lista o crea una nueva
          </p>
          <button
            onClick={onCreateNew}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg shadow-purple-500/30"
          >
            + Crear Nueva VPN
          </button>
        </div>
      )}
    </div>
  );
};

// Componente principal App2
function App2() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVPN, setSelectedVPN] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [editingVPN, setEditingVPN] = useState(null);
  const [vpnList, setVpnList] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [globalVPNState, setGlobalVPNState] = useState({});

  // Verificar estado REAL de una VPN específica
  const checkRealVPNStatus = async (vpnName) => {
    try {
      console.log(`🔍 Verificando estado REAL de ${vpnName}`);
      
      // Método 1: Verificar con comando wg show
      try {
        const result = await invoke("run_shell_command", { 
          command: `wg show wg0-${vpnName}` 
        });
        if (result && result.includes("interface:")) {
          console.log(`✅ ${vpnName} está CONECTADA (wg show)`);
          return "connected";
        }
      } catch (err) {
        console.log(`❌ wg show falló para ${vpnName}:`, err);
      }

      // Método 2: Verificar si existe la interfaz
      try {
        const result = await invoke("run_shell_command", { 
          command: `ip link show wg0-${vpnName}` 
        });
        if (result && result.includes("wg0-")) {
          console.log(`✅ ${vpnName} interfaz existe`);
          return "connected";
        }
      } catch (err) {
        console.log(`❌ ip link falló para ${vpnName}:`, err);
      }

      // Método 3: Verificar procesos wg-quick
      try {
        const result = await invoke("run_shell_command", { 
          command: `pgrep -f "wg-quick.*${vpnName}"` 
        });
        if (result && result.trim()) {
          console.log(`✅ ${vpnName} proceso wg-quick activo`);
          return "connected";
        }
      } catch (err) {
        console.log(`❌ pgrep falló para ${vpnName}:`, err);
      }

      console.log(`❌ ${vpnName} está DESCONECTADA`);
      return "disconnected";
    } catch (err) {
      console.error(`Error verificando estado de ${vpnName}:`, err);
      return "disconnected";
    }
  };

  // Cargar VPNs reales de /etc/wireguard
  const loadVPNs = async () => {
    try {
      console.log("🔄 Cargando VPNs y verificando estados REALES...");
      const availableVpns = await invoke("list_available_vpns");
      const vpnData = [];
      const newGlobalState = {};

      for (const vpnName of availableVpns) {
        try {
          const config = await invoke("read_wg_config", { vpnName });
          
          // Verificar estado REAL usando múltiples métodos
          const realStatus = await checkRealVPNStatus(vpnName);
          
          // Actualizar estado global
          newGlobalState[vpnName] = realStatus;

          console.log(`🔗 VPN ${vpnName}: ${realStatus}`);
          vpnData.push({
            name: vpnName,
            status: realStatus,
            config: config,
          });
        } catch (err) {
          console.error(`❌ Error cargando VPN ${vpnName}:`, err);
          newGlobalState[vpnName] = "disconnected";
          vpnData.push({
            name: vpnName,
            status: "disconnected",
            config: "",
          });
        }
      }

      // Actualizar estados
      setGlobalVPNState(newGlobalState);
      setVpnList(vpnData);
      
      // Buscar y seleccionar automáticamente la VPN conectada
      const connectedVPN = vpnData.find(vpn => vpn.status === "connected");
      if (connectedVPN && !selectedVPN) {
        console.log(`🎯 Auto-seleccionando VPN conectada: ${connectedVPN.name}`);
        setSelectedVPN(connectedVPN.name);
      }
    } catch (err) {
      console.error("❌ Error cargando lista de VPNs:", err);
      setVpnList([]);
    }
  };

  // Simular loading inicial y cargar VPNs
  useEffect(() => {
    const init = async () => {
      console.log("🚀 INICIANDO APP - Verificación inicial de estado VPN");
      
      // Cargar VPNs con verificación REAL del estado
      await loadVPNs();
      
      // Esperar a que termine la verificación inicial
      console.log("✅ Verificación inicial completada");
      
      // Simular tiempo de carga para la animación
      setTimeout(() => {
        setIsLoading(false);
        console.log("🎯 App lista para usar");
      }, 800);
    };

    init();

    // Polling del estado VPN cada 10 segundos (menos frecuente)
    const interval = setInterval(async () => {
      if (!isLoading && !connecting) {
        console.log("🔄 Polling estado VPN automático...");
        await loadVPNs();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Hook para refrescar cuando cambie el estado global
  useEffect(() => {
    console.log("🔄 Estado global VPN actualizado:", globalVPNState);
  }, [globalVPNState]);

  const handleConnect = async (vpnName = selectedVPN) => {
    setConnecting(true);
    try {
      console.log(`🚀 Conectando a ${vpnName}...`);
      
      // ACTUALIZAR INMEDIATAMENTE EL ESTADO GLOBAL
      setGlobalVPNState(prev => ({
        ...prev,
        [vpnName]: "connecting"
      }));
      
      // Actualizar también la lista local
      setVpnList(prev => prev.map(vpn => 
        vpn.name === vpnName 
          ? { ...vpn, status: "connecting" }
          : vpn
      ));

      await invoke("connect_vpn", { vpnName });
      console.log(`✅ Conectado a ${vpnName}`);
      
      // VERIFICAR ESTADO REAL DESPUÉS DE CONECTAR
      let attempts = 0;
      const maxAttempts = 10;
      
      const verifyConnection = async () => {
        attempts++;
        const realStatus = await checkRealVPNStatus(vpnName);
        
        if (realStatus === "connected") {
          console.log(`✅ Conexión verificada para ${vpnName}`);
          
          // Actualizar estado global
          setGlobalVPNState(prev => ({
            ...prev,
            [vpnName]: "connected"
          }));
          
          // Actualizar lista
          setVpnList(prev => prev.map(vpn => 
            vpn.name === vpnName 
              ? { ...vpn, status: "connected" }
              : vpn
          ));
          
          return true;
        } else if (attempts < maxAttempts) {
          console.log(`⏳ Reintentando verificación ${attempts}/${maxAttempts}...`);
          setTimeout(verifyConnection, 1000);
          return false;
        } else {
          console.log(`❌ No se pudo verificar conexión después de ${maxAttempts} intentos`);
          await loadVPNs(); // Recargar todo
          return false;
        }
      };
      
      await verifyConnection();
      
    } catch (err) {
      console.error(`❌ Error conectando a ${vpnName}:`, err);
      // Revertir estado en caso de error
      setGlobalVPNState(prev => ({
        ...prev,
        [vpnName]: "disconnected"
      }));
      setVpnList(prev => prev.map(vpn => 
        vpn.name === vpnName 
          ? { ...vpn, status: "disconnected" }
          : vpn
      ));
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (vpnName = selectedVPN) => {
    setConnecting(true);
    try {
      console.log(`🔌 Desconectando de ${vpnName}...`);
      
      // ACTUALIZAR INMEDIATAMENTE EL ESTADO GLOBAL
      setGlobalVPNState(prev => ({
        ...prev,
        [vpnName]: "disconnecting"
      }));
      
      // Actualizar también la lista local
      setVpnList(prev => prev.map(vpn => 
        vpn.name === vpnName 
          ? { ...vpn, status: "disconnecting" }
          : vpn
      ));

      await invoke("disconnect_vpn", { vpnName });
      console.log(`✅ Desconectado de ${vpnName}`);
      
      // VERIFICAR ESTADO REAL DESPUÉS DE DESCONECTAR
      let attempts = 0;
      const maxAttempts = 5;
      
      const verifyDisconnection = async () => {
        attempts++;
        const realStatus = await checkRealVPNStatus(vpnName);
        
        if (realStatus === "disconnected") {
          console.log(`✅ Desconexión verificada para ${vpnName}`);
          
          // Actualizar estado global
          setGlobalVPNState(prev => ({
            ...prev,
            [vpnName]: "disconnected"
          }));
          
          // Actualizar lista
          setVpnList(prev => prev.map(vpn => 
            vpn.name === vpnName 
              ? { ...vpn, status: "disconnected" }
              : vpn
          ));
          
          return true;
        } else if (attempts < maxAttempts) {
          console.log(`⏳ Reintentando verificación ${attempts}/${maxAttempts}...`);
          setTimeout(verifyDisconnection, 500);
          return false;
        } else {
          console.log(`❌ No se pudo verificar desconexión después de ${maxAttempts} intentos`);
          await loadVPNs(); // Recargar todo
          return false;
        }
      };
      
      await verifyDisconnection();
      
    } catch (err) {
      console.error(`❌ Error desconectando de ${vpnName}:`, err);
      // En caso de error, recargar para obtener estado real
      await loadVPNs();
    } finally {
      setConnecting(false);
    }
  };

  const handleCreateNew = () => {
    setEditingVPN(null);
    setShowModal(true);
  };

  const handleEditVPN = (vpnName) => {
    setEditingVPN(vpnName);
    setShowModal(true);
  };

  const handleCloseModal = async (saved = false) => {
    setShowModal(false);
    const oldEditingVPN = editingVPN;
    setEditingVPN(null);

    // Si se guardó, recargar la lista
    if (saved) {
      console.log("🔄 Recargando lista de VPNs después de guardar...");
      await loadVPNs();
      
      // Si se editó una VPN y el nombre no cambió, mantener la selección
      // Si cambió el nombre, la nueva lógica de auto-selección se encargará
      if (oldEditingVPN && selectedVPN === oldEditingVPN) {
        console.log("🎯 Manteniendo selección actualizada");
      }
    }
  };

  const handleOpenUserInfo = () => {
    setShowUserInfo(true);
  };

  const handleCloseUserInfo = () => {
    setShowUserInfo(false);
  };

  // Calcular estadísticas
  const connectedCount = vpnList.filter(
    (vpn) => vpn.status === "connected"
  ).length;
  const totalCount = vpnList.length;

  // Obtener datos de la VPN seleccionada
  const selectedVPNData = vpnList.find((vpn) => vpn.name === selectedVPN);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header minimalista */}
      <header className="p-6 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.74s9-4.19 9-9.74V7l-10-5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">VPNinja</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleOpenUserInfo}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Información del usuario"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
            <button
              onClick={() => loadVPNs()}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Recargar conexiones"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal - Layout dividido */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
          {/* Panel izquierdo - Lista de VPNs */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Conexiones VPN</h2>
              <button
                onClick={handleCreateNew}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Nueva
              </button>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto">
              {vpnList.map((vpn, index) => (
                <VPNItem
                  key={index}
                  name={vpn.name}
                  status={vpn.status}
                  isSelected={selectedVPN === vpn.name}
                  onClick={() => setSelectedVPN(vpn.name)}
                  onEdit={handleEditVPN}
                />
              ))}
            </div>

            {/* Stats rápidas */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="text-white font-semibold mb-3">Estado General</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {connectedCount}
                  </p>
                  <p className="text-xs text-gray-400">Conectadas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">
                    {totalCount}
                  </p>
                  <p className="text-xs text-gray-400">Configuradas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-400">
                    {connectedCount > 0 ? "Activo" : "Inactivo"}
                  </p>
                  <p className="text-xs text-gray-400">Estado VPN</p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Control */}
          <div>
            <ControlPanel
              selectedVPN={selectedVPN}
              selectedVPNData={selectedVPNData}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onCreateNew={handleCreateNew}
              loading={connecting}
            />
          </div>
        </div>
      </main>

      {/* Modal de formulario */}
      <VPNFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        editingVPN={editingVPN}
        checkRealVPNStatus={checkRealVPNStatus}
      />

      {/* Modal de información del usuario */}
      <UserInfoModal isOpen={showUserInfo} onClose={handleCloseUserInfo} />
    </div>
  );
}

export default App2;
