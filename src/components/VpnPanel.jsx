// ✅ src/components/VpnPanel.jsx

import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import wireguardImg from "../assets/Logo_VPN2.png";

const VpnPanel = () => {
  const [connected, setConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleConnection = async () => {
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
          connected ? "text-green-400" : "text-red-500"
        }`}
      >
        {connected ? "Conectado a la VPN" : "Desconectado"}
      </div>

      <button
        onClick={handleConnection}
        className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white shadow-md transition-all duration-300 ${
          connected
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {connected ? "🔓 Desconectar VPN" : "🔒 Conectar VPN"}
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
