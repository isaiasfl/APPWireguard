import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

const VPNConfigForm = ({ onClose }) => {
  const [config, setConfig] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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

        const existingConfig = await invoke("read_wg_config");
        if (existingConfig.trim() !== "") {
          setConfig(existingConfig);
        } else {
          const [privateKey, publicKey] = await invoke("generate_keys");
          setConfig(`\
[Interface]
PrivateKey = ${privateKey}
Address = 10.0.0.2/24
DNS = 1.1.1.1

[Peer]
PublicKey = ${publicKey}
Endpoint = x.x.x.x:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`);
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

  const save = async () => {
    try {
      setMessage("");
      await invoke("save_wg_config", { content: config });
      setMessage("✅ Configuración guardada en /etc/wireguard/wg0.conf");
    } catch (err) {
      console.error("Error guardando:", err);
      setMessage(`❌ ${err}`);
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
    <div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Configuración de WireGuard
      </h2>

      <textarea
        rows={14}
        className="w-full font-mono text-sm p-4 border rounded-md text-gray-900 dark:text-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
        value={config}
        onChange={(e) => setConfig(e.target.value)}
      ></textarea>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handleBackClick}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded"
        >
          Volver
        </button>

        <button
          onClick={save}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
        >
          Guardar configuración
        </button>
      </div>

      {message && (
        <p className="mt-4 text-sm text-center text-gray-700 dark:text-gray-300">
          {message}
        </p>
      )}
    </div>
  );
};

export default VPNConfigForm;
