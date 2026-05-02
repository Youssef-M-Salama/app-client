"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/admin/adminNavbar.module.css";

const NAV_ITEMS = [
  { label: "إدارة المستخدمين",           href: "/admin/users",   badge: 19 },
  { label: "العروض المعلقة",             href: "/admin/offers",  badge: null },
  { label: "اختيارات الجمعيات المعلقة", href: "/admin/needs",   badge: null },
  { label: "طلبات التحقق المعلقة",      href: "/admin/pending", badge: 70 },
];

// Note: AdminNavbar must be a Client Component because it uses usePathname

export default function AdminNavbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>

      {/* ── Logo (right — RTL: first in DOM = visually rightmost) ── */}
      <div className={styles.logo}>
        <img src="/logo-black.png" alt="وافر" />
      </div>

      {/* ── Nav Links (center) ── */}
      <ul className={styles.navLinks}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
              >
                {item.label}
                {item.badge !== null && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* ── User Controls (left — RTL: last in DOM = visually leftmost) ── */}
      <div className={styles.userControls}>
        <div className={styles.userChip}>
          <div className={styles.userAvatar}>J</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>John Smith</span>
            <span className={styles.userRole}>أدمن</span>
          </div>
          <span className={styles.chevron}>▼</span>
        </div>
        <button className={styles.iconBtn} aria-label="الإشعارات" title="الإشعارات">
          🔔
        </button>
        <button className={styles.iconBtn} aria-label="الإعدادات" title="الإعدادات">
          ⚙️
        </button>
      </div>

    </nav>
  );
}
