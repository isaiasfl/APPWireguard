import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

const VPNConfigForm = ({ onClose, onConfigSaved }) => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // Datos del equipo local (generados aquí)
  const [clientData, setClientData] = useState({
    privateKey: "",
    publicKey: "",
    address: "10.0.0.2/24"
  });

  // Nombre de la conexión VPN
  const [vpnName, setVpnName] = useState("");
  
  // Configuración del servidor (debe rellenar el usuario)
  const [serverConfig, setServerConfig] = useState({
    publicKey: "",
    endpoint: "",
    allowedIPs: "0.0.0.0/0",
    dns: "1.1.1.1",
    keepalive: "25"
  });

  useEffect(() => {
    const load = async () => {
      try {
        const installed = await invoke("check_wireguard_installed");
        if (!installed) {
          setMessage(
            "❌ WireGuard no está instalado. Instálalo antes de continuar."
          );
          setLoading(false);
          return;
        }

        // Buscar VPNs disponibles
        const availableVpns = await invoke("list_available_vpns");
        let configLoaded = false;
        
        if (availableVpns.length > 0) {
          // Si hay VPNs disponibles, cargar la primera (o la activa si hay)
          const activeVpn = await invoke("find_active_vpn");
          const vpnToLoad = activeVpn || availableVpns[0];
          
          setVpnName(vpnToLoad);
          const existingConfig = await invoke("read_wg_config", { vpnName: vpnToLoad });
          if (existingConfig.trim() !== "") {
            await parseExistingConfig(existingConfig);
            configLoaded = true;
          }
        }
        
        if (!configLoaded) {
          // Generar nuevas claves para nueva configuración
          const [privateKey, publicKey] = await invoke("generate_keys");
          setClientData(prev => ({
            ...prev,
            privateKey,
            publicKey
          }));
        }
      } catch (err) {
        console.error("Error cargando configuración:", err);
        setMessage(`❌ ${err}`);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const parseExistingConfig = async (config) => {
    const lines = config.split('\n');
    const newClientData = { ...clientData };
    const newServerConfig = { ...serverConfig };
    
    let inInterface = false;
    let inPeer = false;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed === '[Interface]') {
        inInterface = true;
        inPeer = false;
      } else if (trimmed === '[Peer]') {
        inInterface = false;
        inPeer = true;
      } else if (trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const cleanKey = key.trim();
        const value = valueParts.join('=').trim();
        
        if (inInterface) {
          if (cleanKey === 'PrivateKey') newClientData.privateKey = value;
          if (cleanKey === 'Address') newClientData.address = value;
          if (cleanKey === 'DNS') newServerConfig.dns = value;
        } else if (inPeer) {
          if (cleanKey === 'PublicKey') newServerConfig.publicKey = value;
          if (cleanKey === 'Endpoint') newServerConfig.endpoint = value;
          if (cleanKey === 'AllowedIPs') newServerConfig.allowedIPs = value;
          if (cleanKey === 'PersistentKeepalive') newServerConfig.keepalive = value;
        }
      }
    });
    
    // Ahora cargar las claves desde ~/.wireguard/ usando generate_keys 
    // (que ya lee las existentes si están disponibles)
    try {
      const [privateKey, publicKey] = await invoke("generate_keys");
      newClientData.privateKey = privateKey;
      newClientData.publicKey = publicKey;
    } catch (err) {
      console.error("Error cargando claves existentes:", err);
    }
    
    setClientData(newClientData);
    setServerConfig(newServerConfig);
  };

  const generateConfig = () => {
    return `[Interface]
PrivateKey = ${clientData.privateKey}
Address = ${clientData.address}
DNS = ${serverConfig.dns}

[Peer]
PublicKey = ${serverConfig.publicKey}
Endpoint = ${serverConfig.endpoint}
AllowedIPs = ${serverConfig.allowedIPs}
PersistentKeepalive = ${serverConfig.keepalive}`;
  };

  const save = async () => {
    try {
      setMessage("🔄 Guardando configuración...");
      
      // Validar que los campos obligatorios estén completos
      if (!vpnName.trim()) {
        setMessage("❌ Debes poner un nombre a la conexión");
        return;
      }
      if (!serverConfig.publicKey || !serverConfig.endpoint) {
        setMessage("❌ Debes completar la configuración del servidor (Clave Pública y Endpoint)");
        return;
      }
      
      const config = generateConfig();
      console.log("🐛 DEBUG: Configuración a guardar:", config);
      console.log("🐛 DEBUG: Llamando a save_wg_config...");
      
      const result = await invoke("save_wg_config", { content: config, vpnName: vpnName.trim() });
      console.log("🐛 DEBUG: Resultado:", result);
      
      setMessage(`✅ ${result}`);
      
      // Notificar al componente padre que se guardó la configuración
      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (err) {
      console.error("🐛 DEBUG: Error completo:", err);
      setMessage(`❌ Error: ${err}`);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("✅ Copiado al portapapeles");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setMessage("❌ Error al copiar");
    }
  };

  const handleBackClick = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-300">
        Cargando configuración...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Configuración de WireGuard
      </h2>

      {/* NOMBRE DE LA CONEXIÓN */}
      <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3">
          📛 NOMBRE DE LA CONEXIÓN *
        </h3>
        <input
          type="text"
          value={vpnName}
          onChange={(e) => setVpnName(e.target.value)}
          className="w-full p-3 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-600 rounded text-gray-900 dark:text-white"
          placeholder="Ejemplo: casa, trabajo, dpto, oficina..."
        />
        <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
          Se creará el archivo: <code>/etc/wireguard/wg0-{vpnName || "NOMBRE"}.conf</code>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECCIÓN 1: DATOS DE TU EQUIPO */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
            📱 DATOS DE TU EQUIPO
            <span className="ml-2 text-sm font-normal text-green-600 dark:text-green-400">
              (Copia estos datos al MikroTik)
            </span>
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                🔑 Clave Pública (para añadir al MikroTik):
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={clientData.publicKey}
                  readOnly
                  className="flex-1 font-mono text-sm p-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-600 rounded-l text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => copyToClipboard(clientData.publicKey)}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-r border border-green-600"
                  title="Copiar al portapapeles"
                >
                  📋
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                🌐 Dirección IP del equipo:
              </label>
              <input
                type="text"
                value={clientData.address}
                onChange={(e) => setClientData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full font-mono text-sm p-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-600 rounded text-gray-900 dark:text-white"
                placeholder="10.0.0.2/24"
              />
            </div>

            <div className="bg-green-100 dark:bg-green-800/30 p-3 rounded border border-green-300 dark:border-green-600">
              <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2">
                📋 INSTRUCCIONES PARA EL MIKROTIK:
              </h4>
              <div className="font-mono text-xs text-green-700 dark:text-green-400 space-y-1">
                <div>/interface/wireguard/peers/add</div>
                <div>interface=wireguard1</div>
                <div>public-key="{clientData.publicKey}"</div>
                <div>allowed-address={clientData.address}</div>
              </div>
              <button
                onClick={() => copyToClipboard(`/interface/wireguard/peers/add interface=wireguard1 public-key="${clientData.publicKey}" allowed-address=${clientData.address}`)}
                className="mt-2 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
              >
                📋 Copiar comandos MikroTik
              </button>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: CONFIGURACIÓN DEL SERVIDOR */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
            🏢 CONFIGURACIÓN DEL SERVIDOR
            <span className="ml-2 text-sm font-normal text-blue-600 dark:text-blue-400">
              (Datos del MikroTik departamental)
            </span>
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                🔑 Clave Pública del Servidor *:
              </label>
              <input
                type="text"
                value={serverConfig.publicKey}
                onChange={(e) => setServerConfig(prev => ({ ...prev, publicKey: e.target.value }))}
                className="w-full font-mono text-sm p-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded text-gray-900 dark:text-white"
                placeholder="Pega aquí la clave pública del servidor MikroTik"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                🌐 Endpoint del Servidor *:
              </label>
              <input
                type="text"
                value={serverConfig.endpoint}
                onChange={(e) => setServerConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                className="w-full font-mono text-sm p-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded text-gray-900 dark:text-white"
                placeholder="IP_DEL_SERVIDOR:51820"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                📡 DNS:
              </label>
              <input
                type="text"
                value={serverConfig.dns}
                onChange={(e) => setServerConfig(prev => ({ ...prev, dns: e.target.value }))}
                className="w-full font-mono text-sm p-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded text-gray-900 dark:text-white"
                placeholder="1.1.1.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                🛣️ Allowed IPs:
              </label>
              <input
                type="text"
                value={serverConfig.allowedIPs}
                onChange={(e) => setServerConfig(prev => ({ ...prev, allowedIPs: e.target.value }))}
                className="w-full font-mono text-sm p-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded text-gray-900 dark:text-white"
                placeholder="0.0.0.0/0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                ⏱️ Keep Alive:
              </label>
              <input
                type="text"
                value={serverConfig.keepalive}
                onChange={(e) => setServerConfig(prev => ({ ...prev, keepalive: e.target.value }))}
                className="w-full font-mono text-sm p-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded text-gray-900 dark:text-white"
                placeholder="25"
              />
            </div>
          </div>
        </div>
      </div>

      {/* VISTA PREVIA DE LA CONFIGURACIÓN */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          📄 Vista previa de la configuración:
        </h3>
        <pre className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded p-3 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
          {generateConfig()}
        </pre>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={handleBackClick}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded"
        >
          ← Volver
        </button>

        <button
          onClick={save}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!vpnName.trim() || !serverConfig.publicKey || !serverConfig.endpoint}
        >
          💾 Guardar configuración
        </button>
      </div>

      {/* MENSAJES */}
      {message && (
        <div className="mt-4 p-3 rounded-lg text-center">
          <p className={`text-sm font-medium ${
            message.includes('❌') 
              ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700' 
              : 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
          }`}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default VPNConfigForm;
