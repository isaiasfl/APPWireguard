// ✅ src/components/VpnPanel.jsx

import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import wireguardImg from "../assets/Logo_VPN2.png";

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
        const result = await invoke("disconnect_vpn", { vpnName: activeVpnName });
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
            className={`px-4 py-2 border-2 border-blue-400 dark:border-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-200 ${connected ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'}`}
          >
            {availableVpns.map((vpn) => (
              <option key={vpn} value={vpn} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                wg0-{vpn}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        className={`text-xl font-medium mb-4 transition-colors duration-300 ${
          !configComplete ? "text-orange-500" : connected ? "text-green-400" : "text-red-500"
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
