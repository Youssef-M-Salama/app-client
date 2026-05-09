"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/admin/adminNavbar.module.css";
import { useAuth } from "@/context/AuthContext";

import { useAlert } from "@/context/AlertContext";
import adminUsersService from "@/services/adminUsersService";
import apiClient from "@/services/apiClient";
import { useState, useEffect } from "react";

// ── Helpers ─────────────────────────────────────────────────────
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e8e0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E%3F%3C/text%3E%3C/svg%3E";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = apiClient.defaults.baseURL;
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

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
    { label: "احتياجات الجمعيات المعلقة", href: "/admin/needs",   badge: stats.pendingNeeds },
  ];

  const displayName = user?.userName || user?.name || "أدمن";
  const initial = displayName.charAt(0).toUpperCase();
  const rawImg = user?.imageUrl || user?.ImageUrl || user?.profilePicture || user?.avatar || user?.image;
  const userImage = getImageUrl(rawImg);

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
                  <span className={styles.badge}>{item.badge.toLocaleString("ar-EG")}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* ── User Controls ── */}
      <div className={styles.userControls}>
        <div className={styles.userChip}>
          <div className={styles.userAvatar}>
            {userImage ? (
              <img 
                src={userImage} 
                alt="" 
                className={styles.avatarImg} 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML = initial;
                }} 
              />
            ) : initial}
          </div>
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
            <span className={styles.logoutIcon}><i className="fa-solid fa-arrow-right-from-bracket"></i></span>
            <span className={styles.logoutText}>خروج</span>
          </button>
        </div>
      </div>

    </nav>
  );
}
