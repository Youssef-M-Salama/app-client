"use client";

import { useState, useRef, useEffect } from "react";
import styles from "@/styles/admin/users.module.css";
import { useAlert } from "@/context/AlertContext";
import adminUsersService from "@/services/adminUsersService";

// ── Mock Data for Charts ───────────────────────────────────────
const MONTHLY_BARS = [25, 40, 55, 70, 90, 75, 60, 80, 95, 65, 50, 40];
const BAR_LABELS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Row Action Dropdown ──────────────────────────────────────────
function ActionDropdown({ user, onView, onToggle, onVerify, onReject, onDelete }) {
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
            className={`${styles.dropdownItem} ${styles.danger}`}
            onClick={() => { onReject(userId); setOpen(false); }}
          >
            رفض الحساب ✖
          </button>
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

  const avatar = user.avatar || user.profilePicture || user.imageUrl || "https://placehold.co/100x100/e8e0f0/6F2DBD?text=م";
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
            <img src={avatar} alt={user.name} className={styles.largeAvatar} />
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

  async function handleReject(id) {
    showConfirm(
      "رفض الحساب",
      "هل أنت متأكد من رغبتك في رفض هذا الحساب؟",
      async () => {
        try {
          await adminUsersService.rejectUser(id);
          showToast("تم رفض الحساب بنجاح", "success");
          fetchData(); // Refresh list
        } catch (error) {
          showAlert("خطأ", error.appMessage || "حدث خطأ أثناء رفض الحساب");
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

  const maxBar = Math.max(...MONTHLY_BARS);

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
          <button className={styles.btnOutline}>⬇ تحميل التقرير</button>
          <button className={styles.btnOutline}>⬆ تصدير كملف CSV</button>
        </div>
        <div className={styles.actionBarRight}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
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

        {/* Charts card */}
        <div className={styles.chartsCard}>
          <div className={styles.chartsRow}>

            {/* Bar chart */}
            <div className={styles.barChartArea}>
              <div className={styles.barChartHeader}>
                <span className={styles.barChartTitle}>معدل نمو المستخدمين</span>
                <div className={styles.periodTabs}>
                  {["يومي", "شهري", "سنوي"].map((p) => (
                    <button
                      key={p}
                      className={`${styles.periodTab} ${activePeriod === p ? styles.activePeriod : ""}`}
                      onClick={() => setActivePeriod(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.barChart}>
                {MONTHLY_BARS.map((h, i) => (
                  <div
                    key={i}
                    className={styles.bar}
                    style={{ height: `${(h / maxBar) * 100}%` }}
                    title={`${BAR_LABELS[i]}: ${h}`}
                  />
                ))}
              </div>
              <div className={styles.barLabels}>
                {BAR_LABELS.map((l) => (
                  <span key={l} className={styles.barLabel}>{l}</span>
                ))}
              </div>
            </div>

            {/* Donut chart */}
            <div className={styles.donutArea}>
              <div className={styles.donutWrapper}>
                <svg className={styles.donutSvg} width="100" height="100" viewBox="0 0 100 100">
                  <circle className={styles.donutTrack} cx="50" cy="50" r="40" />
                  <circle className={styles.donutFill}  cx="50" cy="50" r="40" />
                </svg>
                <div className={styles.donutLabel}>
                  <span className={styles.donutPercent}>12%</span>
                  <span className={styles.donutSub}>نمو<br/>شهري</span>
                </div>
              </div>
              <div className={styles.periodTabs}>
                <button className={`${styles.periodTab} ${styles.activePeriod}`}>شهر ▼</button>
              </div>
            </div>

          </div>
        </div>

        {/* Stats card */}
        <div className={styles.statsCard}>
          <p className={styles.statsCardTitle}>تفاصيل المستخدمين</p>
          <p className={styles.statsCardSubTitle}>كل تفاصيل مجتمع المستخدمين و أعدادهم و معدل النمو الداخل لرزمة مميزة</p>

          <div className={styles.totalStat}>
            <p className={styles.totalLabel}>إجمالي المستخدمين</p>
            <p className={styles.totalValue}>89,922</p>
          </div>

          <div className={styles.subStats}>
            <div className={styles.subStat}>
              <div className={styles.subStatDot} style={{ background: "#FFC107" }} />
              <span className={styles.subStatLabel}>كسيرو</span>
              <span className={styles.subStatValue}>41,954</span>
            </div>
            <div className={styles.subStat}>
              <div className={styles.subStatDot} style={{ background: "#E91E63" }} />
              <span className={styles.subStatLabel}>إناث</span>
              <span className={styles.subStatValue}>21,642</span>
            </div>
            <div className={styles.subStat}>
              <div className={styles.subStatDot} style={{ background: "#9C27B0" }} />
              <span className={styles.subStatLabel}>موبايل</span>
              <span className={styles.subStatValue}>26,344</span>
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
                  const avatar = user.avatar || user.profilePicture || user.imageUrl || "https://placehold.co/36x36/e8e0f0/6F2DBD?text=م";
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
                            alt={user.name}
                            className={styles.userAvatar}
                            onError={(e) => (e.currentTarget.src = "https://placehold.co/36x36/e8e0f0/6F2DBD?text=م")}
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
                          onReject={handleReject}
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
