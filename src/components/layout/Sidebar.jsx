"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import sidebarStyle from "@/styles/dashboard/sidebar.module.css";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import dashboardService from "@/services/dashboardService";

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const { logout, role } = useAuth();
  const [stats, setStats] = useState({
    received: 0,
    sent: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        let res;
        if (role === "Charity") {
          res = await dashboardService.getCharityDashboard();
        } else if (role === "DonorOrganization") {
          res = await dashboardService.getDonorDashboard();
        } else {
          return;
        }

        const data = res.data || res;
        // Map based on role specific keys or common ones
        setStats({
          received: data.pendingApplicationsReceived || data.PendingApplicationsReceived || data.applicationsReceivedCount || 0,
          sent: data.pendingApplicationsSent || data.PendingApplicationsSent || data.applicationsSentCount || 0
        });
      } catch (err) {
        console.error("Sidebar stats error:", err);
      }
    }
    fetchStats();
    // Refresh every 5 min
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [role]);

  return (
    <nav className={sidebarStyle.sidebar}>
      {/* Mobile close button */}
      <button
        id="sidebar-close-btn"
        className={sidebarStyle.closeBtn}
        onClick={onClose}
        aria-label="إغلاق القائمة"
      >
        ✕
      </button>

      <div className={sidebarStyle.logo}>
        <img src="/logo-black.png" alt="logo" />
      </div>

      <ul className={`${sidebarStyle.navLinks} ${sidebarStyle.navLinksTop}`}>

        <li className={pathname === "/profile" ? sidebarStyle.active : ""}>
          <Link href="/profile" onClick={onClose}>
            <img src="/icons/personIconBlack.png" alt="user" />
            <span>البيانات الشخصية</span>
          </Link>
        </li>

        <li className={pathname === "/posts" ? sidebarStyle.active : ""}>
          <Link href="/posts" onClick={onClose}>
            <img src="/icons/postsIcon.png" alt="posts" />
            <span>المنشورات</span>
          </Link>
        </li>

        <li className={pathname === "/browse" ? sidebarStyle.active : ""}>
          <Link href="/browse" onClick={onClose}>
            <img src="/icons/offers-icon.png" alt="offers" />
            <span>{role === "DonorOrganization" ? "احتياجات الجمعيات" : "العروض المتاحة"}</span>
          </Link>
        </li>

        <li className={pathname === "/requests" ? sidebarStyle.active : ""}>
          <Link href="/requests" onClick={onClose}>
            <img src="/icons/requests-icon.png" alt="needs" />
            <span>الطلبات الوارده</span>
            {stats.received > 0 && (
              <span className={sidebarStyle.badge}>{stats.received}</span>
            )}
          </Link>
        </li>

        <li className={pathname === "/sent-requests" ? sidebarStyle.active : ""}>
          <Link href="/sent-requests" onClick={onClose}>
            <img src="/icons/requests-icon.png" alt="sent-needs" />
            <span>طلباتي المرسلة</span>
            {stats.sent > 0 && (
              <span className={sidebarStyle.badge}>{stats.sent}</span>
            )}
          </Link>
        </li>

      </ul>

      <div className={`${sidebarStyle.navLinksTail} ${sidebarStyle.navLinks}`}>

        <li>
          <Link href="/help" onClick={onClose}>
            <img src="/icons/helpIcon.png" alt="help" />
            <span>المساعده</span>
          </Link>
        </li>

        <li>
          <button 
            className={sidebarStyle.logoutBtn} 
            onClick={() => {
              logout();
              if (onClose) onClose();
            }}
            aria-label="تسجيل الخروج"
          >
            <img src="/icons/logoutIconpng.png" alt="logout" />
            <span>تسجيل الخروج</span>
          </button>
        </li>

      </div>
    </nav>
  );
}