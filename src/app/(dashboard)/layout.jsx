"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import dashBoardStyle from "@/styles/dashboard/dashboard.module.css";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar  = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={dashBoardStyle.container}>

      {/* Dark overlay — tapping it closes the sidebar on mobile */}
      {sidebarOpen && (
        <div
          id="sidebar-overlay"
          className={`${dashBoardStyle.mobileOverlay} ${dashBoardStyle.visible}`}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${dashBoardStyle.sidebarWrapper} ${sidebarOpen ? dashBoardStyle.sidebarOpen : ""}`}
      >
        <Sidebar onClose={closeSidebar} />
      </aside>

      {/* Main content */}
      <main className={dashBoardStyle.mainContent}>
        <Header onMenuToggle={openSidebar} />
        {children}
      </main>

    </div>
  );
}