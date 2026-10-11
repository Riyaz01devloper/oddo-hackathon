import { useState, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "./App.css";

import Sidebar from "./components/layout/Sidebar";
import MobileHeader from "./components/layout/MobileHeader";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import PwaInstallPrompt from "./components/common/PwaInstallPrompt/PwaInstallPrompt";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const [prevPathname, setPrevPathname] = useState(location.pathname);

  // Close mobile drawer on route transition during render
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setMobileMenuOpen(false);
  }

  const handleToggleMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app">
      {/* Mobile Top Header (<= 768px) */}
      <MobileHeader
        onToggleMenu={handleToggleMenu}
        isMenuOpen={mobileMenuOpen}
      />

      {/* Responsive Sidebar & Mobile Drawer */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={handleCloseMenu}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content">
          <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* Mobile Bottom Navigation (<= 768px) */}
      <MobileBottomNav
        onToggleMenu={handleToggleMenu}
        isMenuOpen={mobileMenuOpen}
      />

      {/* PWA Mobile Installation Prompt & iOS Guide */}
      <PwaInstallPrompt />
    </div>
  );
}

export default App;