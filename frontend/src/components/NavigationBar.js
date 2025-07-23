import React, { useState } from 'react'; // Import useState to manage the mobile menu state
import { Clock, BarChart3, Settings, Menu, X } from 'lucide-react'; // Import Menu and X icons for hamburger

const NavigationBar = ({ currentPage, setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to control mobile menu visibility

  const navItems = [
    { id: 'dashboard', label: 'Timers', icon: Clock },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8"> {/* Added responsive padding */}
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <Clock className="h-8 w-8 text-purple-400" />
            <h1 className="text-xl font-bold text-white">PowerTimer</h1>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="md:hidden"> {/* Only visible on screens smaller than 'md' (768px) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-label="Close menu" /> // 'X' icon when menu is open
              ) : (
                <Menu className="h-6 w-6" aria-label="Open menu" /> // Hamburger icon when menu is closed
              )}
            </button>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center space-x-1"> {/* Hidden on small screens, flex on 'md' and up */}
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentPage(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Menu (collapsible) */}
        {isMenuOpen && ( // Only render if isMenuOpen is true
          <div className="md:hidden pb-4"> {/* Only visible on screens smaller than 'md' */}
            <div className="flex flex-col items-center space-y-2 mt-4"> {/* Stack items vertically */}
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentPage(id);
                    setIsMenuOpen(false); // Close menu after selection
                  }}
                  className={`flex items-center justify-center w-full space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;