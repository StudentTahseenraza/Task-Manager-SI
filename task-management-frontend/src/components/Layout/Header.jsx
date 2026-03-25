import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Search } from 'lucide-react';

const Header = ({ setSidebarOpen }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-dark-200 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-300 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex-1" />

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;