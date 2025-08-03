// ✅ src/components/SystemInfoModal.jsx

import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import VPNConfigForm from "./VPNConfigForm.jsx";

const SystemInfoModal = ({ onClose }) => {
  const [info, setInfo] = useState({});
  const [github, setGithub] = useState(null);
  const [keys, setKeys] = useState({ privateKey: "", publicKey: "" });
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const [username, hostname, ip, os, dns, githubInfo, keysPair] = await Promise.all(
          [
            invoke("get_username"),
            invoke("get_hostname"),
            invoke("get_ip_address"),
            invoke("get_os_info"),
            invoke("get_dns_servers"),
            invoke("get_github_info"),
            invoke("generate_keys"),
          ]
        );

        setInfo({ username, hostname, ip, os, dns });
        setGithub(githubInfo);
        setKeys({ privateKey: keysPair[0], publicKey: keysPair[1] });
      } catch (err) {
        console.error("Error obteniendo datos del sistema:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  if (showConfig) return <VPNConfigForm onClose={() => setShowConfig(false)} />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Información del sistema
        </h2>

        {loading ? (
          <p className="text-center py-4 text-gray-600 dark:text-gray-400">
            Cargando información...
          </p>
        ) : (
          <>
            {github && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={github.avatar_url}
                  alt="avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div className="text-gray-700 dark:text-gray-200">
                  <p className="font-semibold">{github.name || github.login}</p>
                  <a
                    href={github.html_url}
                    target="_blank"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    @{github.login}
                  </a>
                </div>
              </div>
            )}

            <ul className="text-left text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>👤 Usuario local:</strong> {info.username}
              </li>
              <li>
                <strong>💻 Hostname:</strong> {info.hostname}
              </li>
              <li>
                <strong>🌐 IP local:</strong> {info.ip}
              </li>
              <li>
                <strong>🧠 Sistema:</strong> {info.os}
              </li>
              <li>
                <strong>📡 DNS:</strong> {info.dns}
              </li>
              <li>
                <strong>🔑 Clave pública WireGuard:</strong> 
                <span className="font-mono text-xs break-all ml-1">{keys.publicKey}</span>
              </li>
            </ul>
          </>
        )}

        <div className="mt-6 flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded"
          >
            Cerrar
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
          >
            Configurar VPN ⚙️
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemInfoModal;
