"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import dashboardStyle from "@/styles/dashboard/dashboard.module.css";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar  = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={dashboardStyle.container}>

      {/* Dark overlay — tapping it closes the sidebar on mobile */}
      {sidebarOpen && (
        <div
          id="sidebar-overlay"
          className={`${dashboardStyle.mobileOverlay} ${dashboardStyle.visible}`}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${dashboardStyle.sidebarWrapper} ${sidebarOpen ? dashboardStyle.sidebarOpen : ""}`}
      >
        <Sidebar onClose={closeSidebar} />
      </aside>

      {/* Main content */}
      <main className={dashboardStyle.mainContent}>
        <Header onMenuToggle={openSidebar} />
        {children}
      </main>

    </div>
  );
}