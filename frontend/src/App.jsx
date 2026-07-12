import "./App.css";
import { Outlet } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default App;