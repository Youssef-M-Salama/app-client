"use client";

import { useState, useRef, useEffect } from "react";
import styles from "@/styles/admin/users.module.css";
import { useAlert } from "@/context/AlertContext";
import adminUsersService from "@/services/adminUsersService";
import apiClient from "@/services/apiClient";

// ── Helpers ─────────────────────────────────────────────────────
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e8e0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E%3F%3C/text%3E%3C/svg%3E";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = apiClient.defaults.baseURL;
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

// ── Row Action Dropdown ──────────────────────────────────────────
function ActionDropdown({ user, onView, onToggle, onVerify, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const userId = user.userId || user.id;
  const isActive = user.isActive;
  const isVerified = user.isVerified !== false;

  // Check if we have extra information to show
  const hasExtraInfo = !!(user.phone || user.governorate || user.city || user.description || user.address);

  useEffect(() => {
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className={styles.actionsCell} ref={ref}>
      <button
        className={styles.actionsMenuBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label="خيارات"
      >
        ⋮
      </button>
      {open && (
        <div className={styles.dropdown}>
          {hasExtraInfo && (
            <button
              className={styles.dropdownItem}
              onClick={() => { onView(user); setOpen(false); }}
            >
              عرض التفاصيل 📄
            </button>
          )}
          {!isVerified && (
            <button
              className={styles.dropdownItem}
              onClick={() => { onVerify(userId); setOpen(false); }}
            >
              توثيق الحساب ✅
            </button>
          )}
          <button
            className={styles.dropdownItem}
            onClick={() => { onToggle(userId, isActive); setOpen(false); }}
          >
            {isActive ? "إيقاف الحساب 🚫" : "تفعيل الحساب 🟢"}
          </button>
          <button
            className={`${styles.dropdownItem} ${styles.danger}`}
            onClick={() => { onDelete(userId); setOpen(false); }}
            disabled
            title="الحذف غير متوفر حالياً"
          >
            حذف المستخدم 🗑
          </button>
        </div>
      )}
    </div>
  );
}

// ── User Detail Modal ──────────────────────────────────────────
function UserDetailModal({ user, onClose }) {
  if (!user) return null;

  const rawImg = user.imageUrl || user.ImageUrl || user.profileImage || user.ProfileImage || user.profilePicture || user.avatar || user.image || user.Image;
  const avatar = getImageUrl(rawImg) || FALLBACK_IMAGE;
  const roleStr = user.role === 0 ? "جمعية خيرية" : user.role === 1 ? "جهة مانحة" : user.role === 2 ? "أدمن" : "غير معروف";
  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG") : "غير متوفر";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>تفاصيل المستخدم</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.profileSection}>
            <img src={avatar} alt="" className={styles.largeAvatar} />
            <div className={styles.profileInfo}>
              <h4>{user.name}</h4>
              <span className={styles.profileRole}>{roleStr}</span>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>البريد الإلكتروني</span>
              <span className={styles.infoValue} style={{ direction: "ltr", textAlign: "right" }}>{user.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>تاريخ الانضمام</span>
              <span className={styles.infoValue}>{createdAt}</span>
            </div>

            {user.phone && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>رقم الهاتف</span>
                <span className={styles.infoValue} style={{ direction: "ltr", textAlign: "right" }}>{user.phone}</span>
              </div>
            )}

            {(user.governorate || user.city) && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>الموقع</span>
                <span className={styles.infoValue}>
                  {user.governorate}{user.city ? ` - ${user.city}` : ""}
                </span>
              </div>
            )}

            {user.description && (
              <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                <span className={styles.infoLabel}>عن المستخدم / الجمعية</span>
                <div className={styles.descriptionBox}>
                  {user.description}
                </div>
              </div>
            )}

            {user.address && (
              <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                <span className={styles.infoLabel}>العنوان بالتفصيل</span>
                <span className={styles.infoValue}>{user.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnPrimary} onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}

// ── System Overview Chart ───────────────────────────────────────
function SystemOverviewChart({ stats }) {
  const total = stats.activeCharityNeeds + stats.activeOffers + stats.pendingVerifications;

  // Calculate segments for conic-gradient
  const needPer = total > 0 ? (stats.activeCharityNeeds / total) * 100 : 0;
  const offerPer = total > 0 ? (stats.activeOffers / total) * 100 : 0;

  // Colors
  const needColor = "#FFC107";
  const offerColor = "#E91E63";
  const pendingColor = "#9C27B0";

  const gradient = `conic-gradient(
    ${needColor} 0% ${needPer}%, 
    ${offerColor} ${needPer}% ${needPer + offerPer}%, 
    ${pendingColor} ${needPer + offerPer}% 100%
  )`;

  return (
    <div className={styles.chartsCard}>
      <div className={styles.barChartHeader}>
        <span className={styles.barChartTitle}>توزيع نشاط النظام</span>
      </div>

      <div className={styles.donutArea} style={{ flexDirection: 'row', gap: '30px', justifyContent: 'space-around', padding: '10px 0' }}>
        <div className={styles.donutWrapper} style={{ width: '120px', height: '120px', background: gradient, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '85px', height: '85px', background: 'white', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{total}</span>
            <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>إجمالي النشاط</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: needColor }} />
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>احتياجات: <strong>{needPer.toFixed(0)}%</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: offerColor }} />
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>عروض: <strong>{offerPer.toFixed(0)}%</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: pendingColor }} />
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>معلق: <strong>{(100 - needPer - offerPer).toFixed(0)}%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────
export default function UsersPage() {
  const { showConfirm, showToast, showAlert } = useAlert();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [activePeriod, setActivePeriod] = useState("شهري");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [viewingUser, setViewingUser] = useState(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCharityNeeds: 0,
    activeOffers: 0,
    pendingVerifications: 0,
    pendingCharityNeeds: 0,
    pendingOffers: 0
  });

  const fetchStats = async () => {
    try {
      const res = await adminUsersService.getDashboardStats();
      const data = res.data || res.Data || res;
      setStats({
        totalUsers: data.totalUsers ?? 0,
        activeCharityNeeds: data.activeCharityNeeds ?? 0,
        activeOffers: data.activeOffers ?? 0,
        pendingVerifications: data.pendingVerifications ?? 0,
        pendingCharityNeeds: data.pendingCharityNeeds ?? 0,
        pendingOffers: data.pendingOffers ?? 0
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const params = {
        Page: 1,
        PageSize: 50,
      };
      if (roleFilter !== "all") params.Role = Number(roleFilter);
      if (statusFilter !== "all") params.IsActive = statusFilter === "true";

      const res = await adminUsersService.getUsers(params);
      // Defensive check for PascalCase or camelCase
      const payload = res.data || res.Data || [];
      // Payload could be the array itself or an object with an items/data array
      const items = Array.isArray(payload) ? payload : (payload.items || payload.Items || payload.data || payload.Data || []);
      setUsers(items);
    } catch (error) {
      setErrorMsg(error.appMessage || "حدث خطأ أثناء جلب المستخدمين");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [roleFilter, statusFilter]);

  const filtered = users.filter(
    (u) => (u.name || "").includes(search) || (u.email || "").includes(search)
  );

  async function handleToggle(id, currentStatus) {
    const actionText = currentStatus ? "إيقاف" : "تفعيل";

    showConfirm(
      `${actionText} الحساب`,
      `هل أنت متأكد من رغبتك في ${actionText} هذا المستخدم؟`,
      async () => {
        try {
          if (currentStatus) {
            await adminUsersService.deactivateUser(id);
          } else {
            await adminUsersService.activateUser(id);
          }
          setUsers((prev) =>
            prev.map((u) => ((u.userId || u.id) === id ? { ...u, isActive: !currentStatus } : u))
          );
          showToast(`تم ${actionText} الحساب بنجاح`, "success");
        } catch (error) {
          showAlert("فشل الإجراء", error.appMessage || "تعذر تغيير حالة المستخدم", "error");
        }
      }
    );
  }

  async function handleVerify(id) {
    showConfirm(
      "توثيق الحساب",
      "هل أنت متأكد من توثيق هذا الحساب؟",
      async () => {
        try {
          await adminUsersService.verifyUser(id);
          setUsers((prev) =>
            prev.map((u) => ((u.userId || u.id) === id ? { ...u, isVerified: true } : u))
          );
          showToast("تم توثيق الحساب بنجاح", "success");
        } catch (error) {
          showAlert("فشل الإجراء", error.appMessage || "تعذر توثيق المستخدم", "error");
        }
      }
    );
  }

  async function handleDelete(id) {
    // API doesn't support delete user right now, so this is disabled in UI
    console.log("Delete user", id);
  }

  function handleView(user) {
    setViewingUser(user);
  }

  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <h1>إجمالي المستخدمين</h1>
        <p>إدارة المستخدمين وشبكتهم وتحليلها في مكان واحد</p>
      </div>

      {/* ── Action Bar ── */}
      <div className={styles.actionBar}>
        <div className={styles.actionBarLeft}>
        </div>
        <div className={styles.actionBarRight}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              id="users-search"
              type="text"
              className={styles.searchInput}
              placeholder="ابحث هنا..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Stats Section ── */}
      <div className={styles.statsSection}>
        <SystemOverviewChart stats={stats} />

        {/* Stats card */}
        <div className={styles.statsCard} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <p className={styles.statsCardTitle}>تفاصيل المستخدمين</p>
            <p className={styles.statsCardSubTitle}>نظرة عامة على إحصائيات النظام الحالية</p>
          </div>

          <div className={styles.totalStat} style={{ background: '#f8f9fa', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
            <p className={styles.totalLabel}>إجمالي المستخدمين المسجلين</p>
            <p className={styles.totalValue} style={{ fontSize: '32px', color: 'var(--color-primary)' }}>
              {stats.totalUsers.toLocaleString("ar-EG")}
              <span style={{ fontSize: '14px', fontWeight: 'normal', marginRight: '8px', color: '#666' }}>مستخدم</span>
            </p>
          </div>

          <div className={styles.subStats} style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <div className={styles.subStat} style={{ background: '#fff9e6', padding: '10px', borderRadius: '10px', border: '1px solid #ffeeba' }}>
              <span className={styles.subStatLabel} style={{ fontSize: '10px', color: '#856404' }}>احتياجات نشطة</span>
              <span className={styles.subStatValue} style={{ color: '#856404' }}>{stats.activeCharityNeeds}</span>
            </div>
            <div className={styles.subStat} style={{ background: '#fff0f3', padding: '10px', borderRadius: '10px', border: '1px solid #f8d7da' }}>
              <span className={styles.subStatLabel} style={{ fontSize: '10px', color: '#721c24' }}>عروض نشطة</span>
              <span className={styles.subStatValue} style={{ color: '#721c24' }}>{stats.activeOffers}</span>
            </div>
            <div className={styles.subStat} style={{ background: '#f3e5f5', padding: '10px', borderRadius: '10px', border: '1px solid #e1bee7' }}>
              <span className={styles.subStatLabel} style={{ fontSize: '10px', color: '#4a148c' }}>تحققات معلقة</span>
              <span className={styles.subStatValue} style={{ color: '#4a148c' }}>{stats.pendingVerifications}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Users Table ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h2>المستخدمين الحاليين</h2>
          <p>مراقبة حركة المستخدمين وتحديثات الموقع</p>
        </div>

        {/* Filter row */}
        <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: "10px" }}>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={styles.searchInput} style={{ width: 'auto', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <option value="all">كل الأدوار</option>
            <option value="0">جمعية خيرية</option>
            <option value="1">جهة مانحة</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.searchInput} style={{ width: 'auto', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <option value="all">كل الحالات</option>
            <option value="true">نشط</option>
            <option value="false">غير نشط</option>
          </select>
        </div>

        <div className={styles.tableWrapper}>
          {isLoading ? (
            <p style={{ textAlign: "center", padding: "40px" }}>جاري التحميل...</p>
          ) : errorMsg ? (
            <div style={{ textAlign: "center", color: "red", padding: "20px" }}>
              {errorMsg}
              <br />
              <button onClick={fetchData} className={styles.btnOutline} style={{ marginTop: "10px" }}>إعادة المحاولة</button>
            </div>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
              لا يوجد مستخدمون
            </p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>☐</th>
                  <th>الاسم</th>
                  <th>البريد الإلكتروني</th>
                  <th>الدور</th>
                  <th>حالة النشاط</th>
                  <th>حالة التحقق</th>
                  <th>تاريخ الإنشاء</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const userId = user.userId || user.id;
                  const rawImg = user.imageUrl || user.ImageUrl || user.profileImage || user.ProfileImage || user.profilePicture || user.avatar || user.image || user.Image;
                  const avatar = getImageUrl(rawImg) || FALLBACK_IMAGE;
                  const roleStr = user.role === 0 ? "جمعية خيرية" : user.role === 1 ? "جهة مانحة" : user.role === 2 ? "أدمن" : (user.role || "غير معروف");
                  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG") : "";
                  const isVerified = user.isVerified !== false; // handle nullish

                  return (
                    <tr key={userId}>
                      <td>
                        <input type="checkbox" className={styles.checkbox} aria-label={`تحديد ${user.name}`} />
                      </td>
                      <td>
                        <div className={styles.userCell}>
                          <img
                            src={avatar}
                            alt=""
                            className={styles.userAvatar}
                            onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                          />
                          <span className={styles.userName}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ direction: "ltr", textAlign: "right" }}>{user.email}</td>
                      <td>{roleStr}</td>
                      <td>
                        <span className={`${styles.badge} ${user.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                          <span className={styles.badgeDot} />
                          {user.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${isVerified ? styles.badgeVerified : styles.badgeUnverified}`}>
                          <span className={styles.badgeDot} />
                          {isVerified ? "موثق" : "غير موثق"}
                        </span>
                      </td>
                      <td>{createdAt}</td>
                      <td>
                        <ActionDropdown
                          user={user}
                          onView={handleView}
                          onToggle={handleToggle}
                          onVerify={handleVerify}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      <UserDetailModal
        user={viewingUser}
        onClose={() => setViewingUser(null)}
      />

    </div>
  );
}
