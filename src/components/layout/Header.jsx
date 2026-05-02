"use client";

import { usePathname } from "next/navigation";
import headerStyle from "@/styles/dashboard/header.module.css";

import { useAuth } from "@/context/AuthContext";

export default function Header({ onMenuToggle }) {
  const pathname = usePathname();
  const { role } = useAuth();

  const PAGE_TITLES = {
    "/profile":               "البيانات الشخصية",
    "/posts":                 "المنشورات !",
    "/browse":                role === "DonorOrganization" ? "احتياجات الجمعيات" : "العروض المتاحة",
    "/requests":              "الطلبات الواردة",
    "/sent-requests":         "طلباتي المرسلة",
    "/notifications":         "الإشعارات",
  };

  const title = PAGE_TITLES[pathname] || "مرحباً بك !";

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

    </header>
  );
}