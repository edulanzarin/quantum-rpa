import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import "../components/Sidebar/styles.css";

export function DefaultLayout() {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
}
