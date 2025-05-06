import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import SystemInfoModal from "./components/SystemInfoModal";
import VPNConfigForm from "./components/VPNConfigForm";
import VpnPanel from "./components/VpnPanel";

function App() {
  const [showConfig, setShowConfig] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <Header
        onConfigClick={() => setShowConfig(true)}
        onLogoClick={() => setShowConfig(false)}
        onProfileClick={() => setShowProfileModal(true)}
      />
      <main className="p-8 flex flex-col items-center justify-center">
        {showConfig ? (
          <VPNConfigForm onClose={() => setShowConfig(false)} />
        ) : (
          <VpnPanel />
        )}
      </main>

      {showProfileModal && (
        <SystemInfoModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}
export default App;
