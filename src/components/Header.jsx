import { useEffect, useState } from "react";
import { FaCog, FaMoon, FaSun, FaUserCircle } from "react-icons/fa";

const Header = ({ onConfigClick, onLogoClick, onProfileClick }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const html = document.documentElement;
    darkMode ? html.classList.add("dark") : html.classList.remove("dark");
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    localStorage.setItem("theme", newMode ? "dark" : "light");
    setDarkMode(newMode);
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow">
      <h1
        onClick={onLogoClick}
        className="text-2xl font-bold text-gray-800 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        APPWireguard
      </h1>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          title="Cambiar tema"
          className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
        <button
          onClick={onConfigClick}
          title="Configuración"
          className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
        >
          <FaCog />
        </button>
        <button
          onClick={onProfileClick}
          title="Perfil"
          className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
        >
          <FaUserCircle />
        </button>
      </div>
    </header>
  );
};

export default Header;
