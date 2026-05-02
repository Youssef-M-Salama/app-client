"use client";

import { useState } from "react";
import styles from "@/styles/admin/pending.module.css";

// ── Mock Data ──────────────────────────────────────────────────
const CHARITIES = [
  {
    id: 1,
    name: "بنك الطعام المصري",
    email: "bankelfamasry@gmail.com",
    city: "المحادة",
    district: "الجيزة",
    governorate: "القاهرة",
    createdAt: "15/2/2000",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80",
  },
  {
    id: 2,
    name: "مؤسسة كريمة العلا",
    email: "karematakia@gmail.com",
    city: "مرسى مطروح",
    district: "الجيزة",
    governorate: "القاهرة",
    createdAt: "15/2/2000",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&q=80",
  },
  {
    id: 3,
    name: "مؤسسة مصر الخير",
    email: "misrelkair@gmail.com",
    city: "القاهرة",
    district: "الجيزة",
    governorate: "القاهرة",
    createdAt: "15/2/2000",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80",
  },
  {
    id: 4,
    name: "جمعية الوسيم",
    email: "alwaseem@gmail.com",
    city: "أسوان",
    district: "الجيزة",
    governorate: "القاهرة",
    createdAt: "15/2/2000",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80",
  },
  {
    id: 5,
    name: "مؤسسة مصر خير",
    email: "megakhair@gmail.com",
    city: "القاهرة",
    district: "الجيزة",
    governorate: "القاهرة",
    createdAt: "15/2/2015",
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80",
  },
  {
    id: 6,
    name: "جمعية رسالة",
    email: "resala@gmail.com",
    city: "القاهرة",
    district: "الجيزة",
    governorate: "القاهرة",
    createdAt: "15/2/2000",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&q=80",
  },
];

const DONORS = [
  {
    id: 101,
    name: "مصنع حديد عز",
    email: "ezzsteel@gmail.com",
    city: "القاهرة",
    district: "المحادة",
    governorate: "القاهرة",
    createdAt: "15/2/2010",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  },
  {
    id: 102,
    name: "مطعم بازوكا",
    email: "bazooka@gmail.com",
    city: "مرسى مطروح",
    district: "الجيزة",
    governorate: "القاهرة",
    createdAt: "15/2/2008",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  },
  {
    id: 103,
    name: "مطعم بافالو برجر",
    email: "buffaloburger@gmail.com",
    city: "القاهرة",
    district: "الجيزة",
    governorate: "القاهرة",
    createdAt: "15/2/2010",
    image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=600&q=80",
  },
  {
    id: 104,
    name: "شركة جلوبال فروتس",
    email: "globalfruits@gmail.com",
    city: "أسوان",
    district: "الجيزة",
    governorate: "القاهرة",
    createdAt: "15/2/2010",
    image: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=600&q=80",
  },
  {
    id: 105,
    name: "مصنع المغربي للأحذية",
    email: "elmaghreby@gmail.com",
    city: "القاهرة",
    district: "الجيزة",
    governorate: "القاهرة",
    createdAt: "15/2/2015",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  },
  {
    id: 106,
    name: "مؤسسة غيث للتنمية المجتمعية",
    email: "gaith@gmail.com",
    city: "القاهرة",
    district: "الجيزة",
    governorate: "القاهرة",
    createdAt: "15/2/2000",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
];

// ── Org Card ────────────────────────────────────────────────────
function OrgCard({ org, onApprove, onReject }) {
  return (
    <div className={styles.orgCard}>
      <img
        src={org.image}
        alt={org.name}
        className={styles.cardImage}
        onError={(e) => (e.currentTarget.src = "https://placehold.co/600x160/e8e0f0/6F2DBD?text=صورة")}
      />
      <div className={styles.cardBody}>
        <p className={styles.orgName}>{org.name}</p>
        <div className={styles.orgDetail}>
          <span className={styles.detailLabel}>الإيميل:</span>
          <span className={styles.detailValue} dir="ltr">{org.email}</span>
        </div>
        <div className={styles.orgDetail}>
          <span className={styles.detailLabel}>المدينة:</span>
          <span className={styles.detailValue}>{org.governorate} - {org.district} - {org.city}</span>
        </div>
        <div className={styles.orgDetail}>
          <span className={styles.detailLabel}>تاريخ الإنشاء:</span>
          <span className={styles.detailValue}>{org.createdAt}</span>
        </div>
      </div>
      <div className={styles.cardFooter}>
        <button
          className={styles.btnApprove}
          onClick={() => onApprove(org.id)}
          aria-label={`تأكيد ${org.name}`}
        >
          تأكيد
        </button>
        <button
          className={styles.btnReject}
          onClick={() => onReject(org.id)}
          aria-label={`رفض ${org.name}`}
        >
          رفض
        </button>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────
export default function PendingPage() {
  const [activeTab, setActiveTab] = useState("charities");
  const [charities, setCharities] = useState(CHARITIES);
  const [donors, setDonors] = useState(DONORS);
  const [search, setSearch] = useState("");

  const data = activeTab === "charities" ? charities : donors;
  const setData = activeTab === "charities" ? setCharities : setDonors;

  const filtered = data.filter(
    (o) =>
      o.name.includes(search) || o.email.includes(search)
  );

  function handleApprove(id) {
    setData((prev) => prev.filter((o) => o.id !== id));
  }

  function handleReject(id) {
    setData((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <h1>طلبات التحقق المعلقة</h1>
        <p>إدارة جميع اختيارات الجمعيات المعلقة الموجودة و معرفة تفاصيلها</p>
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
              id="pending-search"
              type="text"
              className={styles.searchInput}
              placeholder="ابحث هنا..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Filter + Tabs Row ── */}
      <div className={styles.actionBar}>
        <div className={styles.tabs}>
          <button
            id="tab-donors"
            className={`${styles.tab} ${activeTab === "donors" ? styles.activeTab : ""}`}
            onClick={() => { setActiveTab("donors"); setSearch(""); }}
          >
            الجهات المانحة
          </button>
          <button
            id="tab-charities"
            className={`${styles.tab} ${activeTab === "charities" ? styles.activeTab : ""}`}
            onClick={() => { setActiveTab("charities"); setSearch(""); }}
          >
            الجمعيات
          </button>
        </div>
        <div className={styles.actionBarLeft}>
          <button className={styles.btnOutline}>عرض الكل ▼</button>
          <button className={styles.btnOutline}>☰ تصنيف</button>
        </div>
      </div>

      {/* ── Card Grid ── */}
      <div className={styles.cardGrid}>
        {filtered.length === 0 ? (
          <p className={styles.emptyState}>لا توجد طلبات معلقة</p>
        ) : (
          filtered.map((org) => (
            <OrgCard
              key={org.id}
              org={org}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>

    </div>
  );
}
