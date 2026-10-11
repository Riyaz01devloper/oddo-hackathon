import "./App.css";
import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Sidebar from "./components/layout/Sidebar";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <div className="content">
          <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default App;