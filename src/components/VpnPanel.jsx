// ✅ src/components/VpnPanel.jsx

import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import wireguardImg from "../assets/Logo_VPN2.png";

const VpnPanel = ({ onConfigClick, key }) => {
  const [connected, setConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [configComplete, setConfigComplete] = useState(false);

  useEffect(() => {
    checkConfigStatus();
    checkVpnStatus();
  }, [key]); // Refrescar cuando cambie la key

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
      const isConnected = await invoke("check_vpn_status");
      setConnected(isConnected);
      if (isConnected) {
        setStatusMessage("VPN ya está conectada ✅");
      }
    } catch (error) {
      console.error("Error verificando estado VPN:", error);
      setConnected(false);
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
        const result = await invoke("connect_vpn");
        setConnected(true);
        setStatusMessage("VPN conectada con éxito ✅");
        console.log(result);
      } else {
        const result = await invoke("disconnect_vpn");
        setConnected(false);
        setStatusMessage("VPN desconectada con éxito ❌");
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

      <div
        className={`text-xl font-medium mb-4 transition-colors duration-300 ${
          !configComplete ? "text-orange-500" : connected ? "text-green-400" : "text-red-500"
        }`}
      >
        {!configComplete ? "VPN sin configurar" : connected ? "Conectado a la VPN" : "Desconectado"}
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

      <button
        onClick={() => {
          checkConfigStatus();
          checkVpnStatus();
        }}
        className="mt-4 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm rounded"
      >
        🔄 Verificar estado
      </button>
    </section>
  );
};

export default VpnPanel;
