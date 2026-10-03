import "./App.css";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default App;