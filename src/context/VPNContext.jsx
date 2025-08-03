import { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

const VPNContext = createContext();

export const useVPN = () => {
  const context = useContext(VPNContext);
  if (!context) {
    throw new Error('useVPN must be used within a VPNProvider');
  }
  return context;
};

export const VPNProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vpnName, setVpnName] = useState('dpto'); // Por defecto 'dpto'
  const [statusMessage, setStatusMessage] = useState('');

  // Función para verificar estado real
  const checkVPNStatus = async () => {
    try {
      const isConnected = await invoke('check_vpn_status', { vpnName });
      setConnected(isConnected);
      return isConnected;
    } catch (error) {
      console.error('Error verificando estado VPN:', error);
      setConnected(false);
      return false;
    }
  };

  // Test inicial al arrancar la app
  useEffect(() => {
    const initializeVPN = async () => {
      setLoading(true);
      try {
        // Verificar estado actual
        await checkVPNStatus();
        setStatusMessage('Estado VPN verificado');
      } catch (error) {
        console.error('Error inicializando VPN:', error);
        setStatusMessage('Error verificando estado');
      } finally {
        setLoading(false);
      }
    };

    initializeVPN();
  }, [vpnName]);

  // Función para conectar
  const connectVPN = async () => {
    try {
      setStatusMessage('🔄 Conectando...');
      const result = await invoke('connect_vpn', { vpnName });
      setConnected(true);
      setStatusMessage('✅ VPN conectada con éxito');
      return result;
    } catch (error) {
      setStatusMessage(`❌ Error: ${error}`);
      throw error;
    }
  };

  // Función para desconectar
  const disconnectVPN = async () => {
    try {
      setStatusMessage('🔄 Desconectando...');
      const result = await invoke('disconnect_vpn', { vpnName });
      setConnected(false);
      setStatusMessage('❌ VPN desconectada');
      return result;
    } catch (error) {
      setStatusMessage(`❌ Error: ${error}`);
      throw error;
    }
  };

  const value = {
    connected,
    loading,
    vpnName,
    statusMessage,
    setVpnName,
    setStatusMessage,
    checkVPNStatus,
    connectVPN,
    disconnectVPN
  };

  return (
    <VPNContext.Provider value={value}>
      {children}
    </VPNContext.Provider>
  );
};