"use client";

import { usePathname } from "next/navigation";
import headerStyle from "@/styles/dashboard/header.module.css";

const PAGE_TITLES = {
  "/profile":               "البيانات الشخصية",
  "/posts":                 "المنشورات !",
  "/browse":                "العروض والطلبات المتاحة",
  "/requests":              "الطلبات الواردة",
  "/notifications":         "الإشعارات",
};

const SEARCH_PLACEHOLDERS = {
  "/posts":                "ابحث عن المنشورات...",
  "/browse":               "ابحث في العروض والطلبات...",
};

export default function Header({ onMenuToggle }) {
  const pathname = usePathname();
  const title       = PAGE_TITLES[pathname]       || "مرحباً بك !";
  const placeholder = SEARCH_PLACEHOLDERS[pathname] || "بحث...";

  return (
    <header className={headerStyle.header}>

      {/* Title + hamburger (hamburger only visible on tablet/mobile) */}
      <div className={headerStyle.titleGroup}>
        <button
          id="sidebar-toggle-btn"
          className={headerStyle.menuToggle}
          onClick={onMenuToggle}
          aria-label="فتح القائمة"
        >
          ☰
        </button>
        <h1>{title}</h1>
      </div>

      {/* Search + notification */}
      <div className={headerStyle.actions}>
        <div className={headerStyle.searchWrapper}>
          <i className={`fa-brands fa-sistrix ${headerStyle.searchIcon}`}></i>
          <input
            className={headerStyle.search}
            placeholder={placeholder}
          />
        </div>
        <button className={headerStyle.notification}>🔔</button>
      </div>

    </header>
  );
}