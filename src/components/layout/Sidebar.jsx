"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import sidebarStyle from "@/styles/dashboard/sidebar.module.css";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const { logout } = useAuth();

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
            <span>العروض المتاحه</span>
          </Link>
        </li>

        <li className={pathname === "/requests" ? sidebarStyle.active : ""}>
          <Link href="/requests" onClick={onClose}>
            <img src="/icons/requests-icon.png" alt="needs" />
            <span>الطلبات الوارده</span>
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