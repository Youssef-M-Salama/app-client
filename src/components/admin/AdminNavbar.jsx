"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/admin/adminNavbar.module.css";
import { useAuth } from "@/context/AuthContext";

import { useAlert } from "@/context/AlertContext";
import adminUsersService from "@/services/adminUsersService";
import { useState, useEffect } from "react";

export default function AdminNavbar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { showConfirm } = useAlert();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    pendingNeeds: 0,
    pendingOffers: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await adminUsersService.getDashboardStats();
        // Envelope check: { success, data: { totalUsers, ... } }
        const data = res.data || res;
        setStats({
          totalUsers: data.totalUsers ?? data.TotalUsers ?? data.totalUsersCount ?? data.TotalUsersCount ?? 0,
          pendingVerifications: data.pendingVerifications ?? data.PendingVerifications ?? data.pendingVerificationsCount ?? data.PendingVerificationsCount ?? 0,
          pendingNeeds: data.pendingCharityNeeds ?? data.PendingCharityNeeds ?? data.pendingCharityNeedsCount ?? data.PendingCharityNeedsCount ?? 0,
          pendingOffers: data.pendingOffers ?? data.PendingOffers ?? data.pendingOffersCount ?? data.PendingOffersCount ?? 0
        });
      } catch (error) {
        console.error("Failed to fetch nav stats", error);
      }
    }
    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: "إدارة المستخدمين",           href: "/admin/users",   badge: stats.totalUsers },
    { label: "العروض المعلقة",             href: "/admin/offers",  badge: stats.pendingOffers },
    { label: "اختيارات الجمعيات المعلقة", href: "/admin/needs",   badge: stats.pendingNeeds },
    { label: "طلبات التحقق المعلقة",      href: "/admin/pending", badge: stats.pendingVerifications },
  ];

  const displayName = user?.userName || user?.name || "أدمن";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <nav className={styles.navbar}>

      {/* ── Logo ── */}
      <div className={styles.logo}>
        <img src="/logo-black.png" alt="وافر" />
      </div>

      {/* ── Nav Links ── */}
      <ul className={styles.navLinks}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
              >
                {item.label}
                {item.badge > 0 && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* ── User Controls ── */}
      <div className={styles.userControls}>
        <div className={styles.userChip}>
          <div className={styles.userAvatar}>{initial}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userRole}>أدمن</span>
          </div>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={`${styles.iconBtn} ${styles.logoutBtn}`} 
            aria-label="تسجيل الخروج" 
            title="تسجيل الخروج"
            onClick={() => {
              showConfirm(
                "تسجيل الخروج",
                "هل أنت متأكد من رغبتك في تسجيل الخروج؟",
                logout
              );
            }}
          >
            <span className={styles.logoutIcon}>🚪</span>
            <span className={styles.logoutText}>خروج</span>
          </button>
        </div>
      </div>

    </nav>
  );
}
