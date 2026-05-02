"use client";

import { useState, useRef, useEffect } from "react";
import styles from "@/styles/admin/users.module.css";

// ── Mock Data ──────────────────────────────────────────────────
const MONTHLY_BARS = [25, 40, 55, 70, 90, 75, 60, 80, 95, 65, 50, 40];
const BAR_LABELS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const INITIAL_USERS = [
  {
    id: 1,
    name: "جمعية مصر الخير",
    avatar: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=80&q=80",
    email: "misrelkair@gmail.com",
    role: "جمعية خيرية",
    isActive: true,
    isVerified: true,
    createdAt: "12/5/2025",
  },
  {
    id: 2,
    name: "مصنع حديد عز",
    avatar: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=80&q=80",
    email: "ezzsteel@gmail.com",
    role: "مؤسسة إنتاجية",
    isActive: true,
    isVerified: true,
    createdAt: "10/5/2025",
  },
  {
    id: 3,
    name: "مؤسسة غيث",
    avatar: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&q=80",
    email: "gaithcharity@gmail.com",
    role: "مؤسسة إنتاجية",
    isActive: false,
    isVerified: false,
    createdAt: "8/5/2025",
  },
  {
    id: 4,
    name: "مؤسسة ميجا خير",
    avatar: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=80&q=80",
    email: "megaelkair@gmail.com",
    role: "مؤسسة إنتاجية",
    isActive: false,
    isVerified: false,
    createdAt: "6/5/2025",
  },
  {
    id: 5,
    name: "مؤسسة فرصة حياة",
    avatar: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=80&q=80",
    email: "forsathayah@gmail.com",
    role: "جمعية خيرية",
    isActive: true,
    isVerified: true,
    createdAt: "10/4/2025",
  },
  {
    id: 6,
    name: "شركة جلوبال فروتس",
    avatar: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=80&q=80",
    email: "globalfruits@gmail.com",
    role: "مؤسسة إنتاجية",
    isActive: true,
    isVerified: true,
    createdAt: "10/1/2025",
  },
  {
    id: 7,
    name: "مؤسسة كريمة العلا",
    avatar: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=80&q=80",
    email: "karematalola@gmail.com",
    role: "جمعية خيرية",
    isActive: false,
    isVerified: false,
    createdAt: "4/7/2025",
  },
];

// ── Row Action Dropdown ──────────────────────────────────────────
function ActionDropdown({ userId, onView, onToggle, onDelete, isActive }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
          <button
            className={styles.dropdownItem}
            onClick={() => { onView(userId); setOpen(false); }}
          >
            عرض التفاصيل 📄
          </button>
          <button
            className={styles.dropdownItem}
            onClick={() => { onToggle(userId); setOpen(false); }}
          >
            {isActive ? "إيقاف 🚫" : "تفعيل ✅"}
          </button>
          <button
            className={`${styles.dropdownItem} ${styles.danger}`}
            onClick={() => { onDelete(userId); setOpen(false); }}
          >
            حذف 🗑
          </button>
        </div>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [activePeriod, setActivePeriod] = useState("شهري");

  const filtered = users.filter(
    (u) => u.name.includes(search) || u.email.includes(search)
  );

  function handleToggle(id) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  }

  function handleDelete(id) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function handleView(id) {
    // Placeholder — wire to router in API phase
    console.log("View user", id);
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
        <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "flex-start" }}>
          <button className={styles.btnOutline}>عرض الكل ▼</button>
        </div>

        <div className={styles.tableWrapper}>
          {filtered.length === 0 ? (
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
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input type="checkbox" className={styles.checkbox} aria-label={`تحديد ${user.name}`} />
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className={styles.userAvatar}
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/36x36/e8e0f0/6F2DBD?text=م")}
                        />
                        <span className={styles.userName}>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`${styles.badge} ${user.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                        <span className={styles.badgeDot} />
                        {user.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${user.isVerified ? styles.badgeVerified : styles.badgeUnverified}`}>
                        <span className={styles.badgeDot} />
                        {user.isVerified ? "موثق" : "غير موثق"}
                      </span>
                    </td>
                    <td>{user.createdAt}</td>
                    <td>
                      <ActionDropdown
                        userId={user.id}
                        isActive={user.isActive}
                        onView={handleView}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
