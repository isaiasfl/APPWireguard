// ✅ src/components/VpnPanel.jsx

import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import wireguardImg from "../assets/Logo_VPN2.png";

// Componente para mostrar información y controles de la VPN seleccionada
const ControlPanel = ({
  selectedVPNData,
  onConnect,
  onDisconnect,
  loading,
}) => {
  const [vpnInfo, setVpnInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Helper para extraer valores de configuración WireGuard
  const extractFromConfig = (config, key) => {
    if (!config) return null;
    const regex = new RegExp(`${key}\\s*=\\s*(.+)`, "i");
    const match = config.match(regex);
    return match ? match[1].trim() : null;
  };

  // Cargar información detallada de la VPN seleccionada
  useEffect(() => {
    if (!selectedVPNData) {
      setVpnInfo(null);
      return;
    }

    const loadVPNInfo = async () => {
      setLoadingInfo(true);
      try {
        // Obtener información de conexión real
        const [vpnIP, connectionTime] = await Promise.all([
          invoke("get_vpn_ip", { vpnName: selectedVPNData.name }).catch(
            () => "No disponible"
          ),
          invoke("get_connection_time", {
            vpnName: selectedVPNData.name,
          }).catch(() => "00:00:00"),
        ]);

        // Parsear configuración para obtener datos
        const config = selectedVPNData.config || "";
        const clientAddress =
          extractFromConfig(config, "Address") || "No configurada";

        setVpnInfo({
          name: selectedVPNData.name,
          status: selectedVPNData.status,
          clientAddress,
          vpnIP,
          connectionTime,
          isConnected: selectedVPNData.status === "connected",
        });
      } catch (err) {
        console.error("Error cargando info de VPN:", err);
        setVpnInfo({
          name: selectedVPNData.name,
          status: selectedVPNData.status,
          clientAddress: "Error cargando",
          vpnIP: "Error cargando",
          connectionTime: "00:00:00",
          isConnected: selectedVPNData.status === "connected",
        });
      } finally {
        setLoadingInfo(false);
      }
    };

    loadVPNInfo();
  }, [selectedVPNData]);

  if (!selectedVPNData) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400 text-lg">
          Selecciona una VPN para ver los detalles
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30 shadow-xl p-6">
      <div className="text-center mb-6">
        <img
          src={wireguardImg}
          alt="WireGuard VPN"
          className="w-32 h-32 mx-auto rounded-lg shadow-lg mb-4"
        />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {selectedVPNData.name}
        </h2>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            selectedVPNData.status === "connected"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {selectedVPNData.status === "connected"
            ? "🟢 Conectado"
            : "⚫ Desconectado"}
        </div>
      </div>

      {/* Información de conexión */}
      {loadingInfo || loading ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-500 mt-2">Cargando información...</p>
        </div>
      ) : (
        vpnInfo && (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                IP Cliente:
              </span>
              <span className="text-sm text-gray-800 dark:text-white font-mono">
                {vpnInfo.clientAddress}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                IP VPN:
              </span>
              <span className="text-sm text-gray-800 dark:text-white font-mono">
                {vpnInfo.vpnIP}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tiempo conectado:
              </span>
              <span className="text-sm text-gray-800 dark:text-white font-mono">
                {vpnInfo.connectionTime}
              </span>
            </div>
          </div>
        )
      )}

      {/* Botones de control */}
      <div className="flex gap-3">
        {selectedVPNData.status === "connected" ? (
          <button
            onClick={() => onDisconnect(selectedVPNData.name)}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Desconectando...
              </>
            ) : (
              <>🔓 Desconectar</>
            )}
          </button>
        ) : (
          <button
            onClick={() => onConnect(selectedVPNData.name)}
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Conectando...
              </>
            ) : (
              <>🔒 Conectar</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Componente original VpnPanel mantenido para compatibilidad
const VpnPanel = ({ onConfigClick, key }) => {
  const [connected, setConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [configComplete, setConfigComplete] = useState(false);
  const [activeVpnName, setActiveVpnName] = useState(null);
  const [availableVpns, setAvailableVpns] = useState([]);
  const [selectedVpn, setSelectedVpn] = useState("");

  useEffect(() => {
    loadAvailableVpns();
    checkConfigStatus();
    checkVpnStatus();
  }, [key]); // Refrescar cuando cambie la key

  const loadAvailableVpns = async () => {
    try {
      const vpns = await invoke("list_available_vpns");
      setAvailableVpns(vpns);

      // Si hay una VPN activa, seleccionarla
      const activeVpn = await invoke("find_active_vpn");
      if (activeVpn) {
        setActiveVpnName(activeVpn);
        setSelectedVpn(activeVpn);
      } else if (vpns.length > 0) {
        // Si no hay activa pero hay disponibles, seleccionar la primera
        setSelectedVpn(vpns[0]);
      }
    } catch (error) {
      console.error("Error cargando VPNs:", error);
    }
  };

  const checkConfigStatus = async () => {
    try {
      const isComplete = await invoke("check_config_complete");
      setConfigComplete(isComplete);
    } catch (error) {
      console.error("Error verificando configuración:", error);
      setConfigComplete(false);
    }
  };

  const checkVpnStatus = async () => {
    try {
      // Buscar VPN activa
      const activeVpn = await invoke("find_active_vpn");
      if (activeVpn) {
        setConnected(true);
        setActiveVpnName(activeVpn);
        setStatusMessage(`✅ Conectado a wg0-${activeVpn}`);
      } else {
        setConnected(false);
        setActiveVpnName(null);
        setStatusMessage("❌ No hay VPN conectada");
      }
    } catch (error) {
      console.error("Error verificando estado VPN:", error);
      setStatusMessage("❌ Error verificando estado");
    }
  };

  const handleButtonClick = async () => {
    if (!configComplete) {
      // Si no está configurado, abrir configuración
      if (onConfigClick) {
        onConfigClick();
      }
      return;
    }

    // Si está configurado, manejar conexión
    try {
      if (!connected) {
        if (!selectedVpn) {
          setStatusMessage("❌ Selecciona una VPN para conectar");
          return;
        }
        const result = await invoke("connect_vpn", { vpnName: selectedVpn });
        setConnected(true);
        setActiveVpnName(selectedVpn);
        setStatusMessage(`✅ Conectado a wg0-${selectedVpn}`);
        console.log(result);
      } else {
        const result = await invoke("disconnect_vpn", {
          vpnName: activeVpnName,
        });
        setConnected(false);
        setActiveVpnName(null);
        setStatusMessage("❌ VPN desconectada");
        console.log(result);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error}`);
      console.error(error);
    }
  };

  return (
    <section className="mt-12 flex flex-col items-center text-center">
      <img
        src={wireguardImg}
        alt="WireGuard VPN"
        className="w-[250px] sm:w-[300px] md:w-[450px] rounded-xl shadow-xl mb-6 border border-gray-300 dark:border-gray-700"
      />

      {/* Selector de VPN */}
      {availableVpns.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Seleccionar VPN:
          </label>
          <select
            value={connected ? activeVpnName : selectedVpn}
            onChange={(e) => setSelectedVpn(e.target.value)}
            disabled={connected}
            className={`px-4 py-2 border-2 border-blue-400 dark:border-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-200 ${
              connected
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-blue-500"
            }`}
          >
            {availableVpns.map((vpn) => (
              <option
                key={vpn}
                value={vpn}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                wg0-{vpn}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        className={`text-xl font-medium mb-4 transition-colors duration-300 ${
          !configComplete
            ? "text-orange-500"
            : connected
            ? "text-green-400"
            : "text-red-500"
        }`}
      >
        {!configComplete
          ? "VPN sin configurar"
          : connected
          ? `Conectado a wg0-${activeVpnName}`
          : availableVpns.length > 0
          ? "Selecciona VPN para conectar"
          : "No hay VPNs configuradas"}
      </div>

      <button
        onClick={handleButtonClick}
        className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white shadow-md transition-all duration-300 ${
          !configComplete
            ? "bg-orange-600 hover:bg-orange-700"
            : connected
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {!configComplete
          ? "⚙️ Configurar VPN"
          : connected
          ? "🔓 Desconectar VPN"
          : "🔒 Conectar VPN"}
      </button>

      {statusMessage && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {statusMessage}
        </p>
      )}
    </section>
  );
};

export default VpnPanel;
export { ControlPanel };
