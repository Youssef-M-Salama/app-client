"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/admin/dashboard.module.css";
import adminUsersService from "@/services/adminUsersService";
import { useAlert } from "@/context/AlertContext";
import Link from "next/link";

export default function DashboardPage() {
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState("needs"); // needs, funding, users, verification
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Helper function to map standard numbers to Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) and Arabic percent sign (٪)
  const toArabicDigits = (num) => {
    if (num === undefined || num === null) return "٠";
    return num.toString()
      .replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d])
      .replace(/%/g, "٪");
  };

  const fetchStats = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await adminUsersService.getDashboardStats();
      const data = res.data || res.Data || res;
      setStats({
        pendingVerifications: data.pendingVerifications ?? 0,
        pendingCharityNeeds: data.pendingCharityNeeds ?? 0,
        pendingOffers: data.pendingOffers ?? 0,
        totalUsers: data.totalUsers ?? 0,
        activeCharityNeeds: data.activeCharityNeeds ?? 0,
        activeOffers: data.activeOffers ?? 0,
        activeUsers: data.activeUsers ?? 0,
        suspendedUsers: data.suspendedUsers ?? 0,
        totalCharities: data.totalCharities ?? 0,
        totalDonors: data.totalDonors ?? 0,
        totalVerified: data.totalVerified ?? 0,
        totalRejectedVerifications: data.totalRejectedVerifications ?? 0,
        rejectedCharityNeeds: data.rejectedCharityNeeds ?? 0,
        fulfilledCharityNeeds: data.fulfilledCharityNeeds ?? 0,
        rejectedOffers: data.rejectedOffers ?? 0,
        fulfilledOffers: data.fulfilledOffers ?? 0,
        expiredOffers: data.expiredOffers ?? 0,
        totalNeedApplications: data.totalNeedApplications ?? 0,
        fulfilledNeedApplications: data.fulfilledNeedApplications ?? 0,
        totalOfferApplications: data.totalOfferApplications ?? 0,
        fulfilledOfferApplications: data.fulfilledOfferApplications ?? 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard statistics", error);
      setErrorMsg(error.appMessage || "تعذر جلب إحصائيات لوحة التحكم من الخادم");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingSpinner}>
        <i className="fa-solid fa-circle-notch fa-spin fa-2x"></i>
        <span>جاري تحميل إحصائيات لوحة التحكم...</span>
      </div>
    );
  }

  if (errorMsg || !stats) {
    return (
      <div className={styles.errorState}>
        <i className="fa-solid fa-triangle-exclamation fa-3x"></i>
        <p>{errorMsg || "حدث خطأ غير متوقع"}</p>
        <button onClick={fetchStats} className={styles.retryBtn}>إعادة المحاولة</button>
      </div>
    );
  }

  // --- Calculations for Real Need Applications
  const unfulfilledNeedApps = Math.max(0, stats.totalNeedApplications - stats.fulfilledNeedApplications);
  const needCompletionRate = stats.totalNeedApplications > 0 
    ? Math.round((stats.fulfilledNeedApplications / stats.totalNeedApplications) * 100) 
    : 0;

  // --- Calculations for Real Offer Applications
  const unfulfilledOfferApps = Math.max(0, stats.totalOfferApplications - stats.fulfilledOfferApplications);
  const offerCompletionRate = stats.totalOfferApplications > 0 
    ? Math.round((stats.fulfilledOfferApplications / stats.totalOfferApplications) * 100) 
    : 0;

  // --- Calculations for User Roles
  const otherUsersCount = Math.max(0, stats.totalUsers - stats.totalCharities - stats.totalDonors);

  // --- Calculations for Verifications
  const totalVerifications = stats.totalVerified + stats.totalRejectedVerifications + stats.pendingVerifications;
  const verificationApprovalRate = (stats.totalVerified + stats.totalRejectedVerifications) > 0
    ? Math.round((stats.totalVerified / (stats.totalVerified + stats.totalRejectedVerifications)) * 100)
    : 0;

  return (
    <div className={styles.dashboardContainer}>
      
      {/* ── Sidebar (Wafir Premium Light Theme) ── */}
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logoArea}>
          <img src="/logo-black.png" alt="وافر Wafir" className={styles.logoImg} />
        </Link>

        <div className={styles.menuGroup}>
          <span className={styles.menuTitle}>لوحات المتابعة</span>
          
          <button 
            className={`${styles.menuItem} ${activeTab === "needs" ? styles.menuItemActive : ""}`}
            onClick={() => setActiveTab("needs")}
          >
            <i className={`fa-solid fa-clipboard-list ${styles.menuItemIcon}`}></i>
            <span>إحصائيات الاحتياجات</span>
          </button>

          <button 
            className={`${styles.menuItem} ${activeTab === "funding" ? styles.menuItemActive : ""}`}
            onClick={() => setActiveTab("funding")}
          >
            <i className={`fa-solid fa-hand-holding-heart ${styles.menuItemIcon}`}></i>
            <span>إحصائيات المانحين والعروض</span>
          </button>

          <button 
            className={`${styles.menuItem} ${activeTab === "users" ? styles.menuItemActive : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <i className={`fa-solid fa-users-viewfinder ${styles.menuItemIcon}`}></i>
            <span>إحصائيات المستخدمين</span>
          </button>

          <button 
            className={`${styles.menuItem} ${activeTab === "verification" ? styles.menuItemActive : ""}`}
            onClick={() => setActiveTab("verification")}
          >
            <i className={`fa-solid fa-shield-halved ${styles.menuItemIcon}`}></i>
            <span>إحصائيات توثيق الحسابات</span>
          </button>
        </div>
      </aside>

      {/* ── Main Dashboard Content Area ── */}
      <main className={styles.contentArea}>
        
        {/* ==================================================================
            TAB 1: Needs Overview
            ================================================================== */}
        {activeTab === "needs" && (
          <div>
            <div className={styles.contentHeader}>
              <div>
                <h1 className={styles.pageTitle}>إحصائيات الاحتياجات والمساعدات</h1>
                <p className={styles.pageSub}>متابعة حية لاحتياجات الجمعيات المسجلة وتطبيقات الاحتياج المنجزة والمعلقة</p>
              </div>
              <div className={styles.headerActions}>
                <Link href="/admin/needs" className="btn btn-outline btn-sm" style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 16px', background: 'white', color: 'var(--color-text-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <i className="fa-solid fa-list-check"></i> إدارة طلبات الاحتياج المعلقة ({toArabicDigits(stats.pendingCharityNeeds)})
                </Link>
              </div>
            </div>

            {/* Stats Cards (100% Real API Data in Arabic numerals) */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>احتياجات نشطة</span>
                <span className={styles.statValue}>{toArabicDigits(stats.activeCharityNeeds)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>احتياجات معلقة</span>
                <span className={styles.statValue}>{toArabicDigits(stats.pendingCharityNeeds)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>احتياجات تم تلبيتها</span>
                <span className={styles.statValue}>{toArabicDigits(stats.fulfilledCharityNeeds)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>احتياجات مرفوضة</span>
                <span className={styles.statValue}>{toArabicDigits(stats.rejectedCharityNeeds)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>إجمالي التقديمات</span>
                <span className={styles.statValue}>{toArabicDigits(stats.totalNeedApplications)}</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className={styles.chartsGridTwo}>
              {/* Left Chart: Needs Status Breakdown */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h2 className={styles.chartTitle}>توزيع الاحتياجات الخيرية حسب الحالة</h2>
                    <p className={styles.chartSubtitle}>مقارنة إجمالية للحالات المرفوعة من الجمعيات المسجلة</p>
                  </div>
                </div>
                <div className={styles.svgContainer}>
                  <svg width="100%" height="280" viewBox="0 0 400 240">
                    <line x1="50" y1="40" x2="360" y2="40" className={styles.gridLine} />
                    <line x1="50" y1="100" x2="360" y2="100" className={styles.gridLine} />
                    <line x1="50" y1="160" x2="360" y2="160" className={styles.gridLine} />
                    <line x1="50" y1="200" x2="360" y2="200" style={{ stroke: 'var(--color-border)', strokeWidth: 1.5 }} />

                    {/* Bars */}
                    {/* Active */}
                    <rect 
                      x="70" 
                      y={200 - Math.max(10, Math.min(150, stats.activeCharityNeeds * 6))} 
                      width="45" 
                      height={Math.max(10, Math.min(150, stats.activeCharityNeeds * 6))} 
                      fill="var(--color-success)" 
                      rx="4"
                      className={styles.bar}
                      onMouseEnter={() => setHoveredBar({ label: "نشط ومعتمد", value: stats.activeCharityNeeds })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <text x="92.5" y="220" textAnchor="middle" className={styles.axisText}>نشط</text>
                    <text x="92.5" y={190 - Math.max(10, Math.min(150, stats.activeCharityNeeds * 6))} textAnchor="middle" style={{ fontSize: 13, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(stats.activeCharityNeeds)}</text>

                    {/* Pending */}
                    <rect 
                      x="145" 
                      y={200 - Math.max(10, Math.min(150, stats.pendingCharityNeeds * 15))} 
                      width="45" 
                      height={Math.max(10, Math.min(150, stats.pendingCharityNeeds * 15))} 
                      fill="var(--color-warning)" 
                      rx="4"
                      className={styles.bar}
                      onMouseEnter={() => setHoveredBar({ label: "معلق قيد المراجعة", value: stats.pendingCharityNeeds })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <text x="167.5" y="220" textAnchor="middle" className={styles.axisText}>معلق</text>
                    <text x="167.5" y={190 - Math.max(10, Math.min(150, stats.pendingCharityNeeds * 15))} textAnchor="middle" style={{ fontSize: 13, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(stats.pendingCharityNeeds)}</text>

                    {/* Fulfilled */}
                    <rect 
                      x="220" 
                      y={200 - Math.max(10, Math.min(150, stats.fulfilledCharityNeeds * 15))} 
                      width="45" 
                      height={Math.max(10, Math.min(150, stats.fulfilledCharityNeeds * 15))} 
                      fill="var(--color-primary)" 
                      rx="4"
                      className={styles.bar}
                      onMouseEnter={() => setHoveredBar({ label: "تم تلبيتها بالكامل", value: stats.fulfilledCharityNeeds })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <text x="242.5" y="220" textAnchor="middle" className={styles.axisText}>تم التلبية</text>
                    <text x="242.5" y={190 - Math.max(10, Math.min(150, stats.fulfilledCharityNeeds * 15))} textAnchor="middle" style={{ fontSize: 13, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(stats.fulfilledCharityNeeds)}</text>

                    {/* Rejected */}
                    <rect 
                      x="295" 
                      y={200 - Math.max(10, Math.min(150, stats.rejectedCharityNeeds * 15))} 
                      width="45" 
                      height={Math.max(10, Math.min(150, stats.rejectedCharityNeeds * 15))} 
                      fill="var(--color-danger)" 
                      rx="4"
                      className={styles.bar}
                      onMouseEnter={() => setHoveredBar({ label: "مرفوضة من الإدارة", value: stats.rejectedCharityNeeds })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <text x="317.5" y="220" textAnchor="middle" className={styles.axisText}>مرفوض</text>
                    <text x="317.5" y={190 - Math.max(10, Math.min(150, stats.rejectedCharityNeeds * 15))} textAnchor="middle" style={{ fontSize: 13, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(stats.rejectedCharityNeeds)}</text>
                  </svg>
                  
                  {hoveredBar && (
                    <div className={styles.chartTooltip} style={{ opacity: 1, bottom: 20, right: '50%', transform: 'translateX(50%)' }}>
                      <strong style={{ fontSize: 13 }}>{hoveredBar.label}</strong>
                      <span>العدد: {toArabicDigits(hoveredBar.value)} حالة</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Chart: Need Applications Completion Rate */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h2 className={styles.chartTitle}>تحليل معالجة طلبات الاحتياج</h2>
                    <p className={styles.chartSubtitle}>نسبة الطلبات المكتملة والمغلقة من إجمالي طلبات الاحتياج المرفوعة</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1 }}>
                  <svg width="150" height="150" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-primary)" strokeWidth="15" strokeDasharray={`${needCompletionRate} 100`} strokeDashoffset="0" className={styles.donutSlice} onMouseEnter={() => setHoveredSlice({ label: "طلبات مكتملة ومغلقة", per: `${needCompletionRate}%` })} onMouseLeave={() => setHoveredSlice(null)} />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#cbd5e1" strokeWidth="15" strokeDasharray={`${100 - needCompletionRate} 100`} strokeDashoffset={`-${needCompletionRate}`} className={styles.donutSlice} onMouseEnter={() => setHoveredSlice({ label: "طلبات معلقة/تحت التنفيذ", per: `${100 - needCompletionRate}%` })} onMouseLeave={() => setHoveredSlice(null)} />
                    
                    <circle cx="50" cy="50" r="30" fill="#ffffff" />
                    <text x="50" y="54" textAnchor="middle" style={{ fontSize: 9, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(stats.totalNeedApplications)} إجمالي</text>
                  </svg>
                  
                  <div className={styles.donutLegend}>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: 'var(--color-primary)' }} />
                      <span>مكتمل ({toArabicDigits(stats.fulfilledNeedApplications)})</span>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: '#cbd5e1' }} />
                      <span>قيد المعالجة ({toArabicDigits(unfulfilledNeedApps)})</span>
                    </div>
                  </div>
                </div>
                {hoveredSlice && (
                  <div className={styles.chartTooltip} style={{ opacity: 1, bottom: 20, left: 24 }}>
                    <strong>{hoveredSlice.label}</strong>
                    <span>النسبة: {toArabicDigits(hoveredSlice.per)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            TAB 2: Donations & Funding Dashboard
            ================================================================== */}
        {activeTab === "funding" && (
          <div>
            <div className={styles.contentHeader}>
              <div>
                <h1 className={styles.pageTitle}>إحصائيات المانحين وعروض التبرع</h1>
                <p className={styles.pageSub}>رصد عروض التبرعات العينية والمادية المقدمة من المانحين والجهات الشريكة ومعدلات الاستجابة</p>
              </div>
              <div className={styles.headerActions}>
                <Link href="/admin/offers" className="btn btn-outline btn-sm" style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 16px', background: 'white', color: 'var(--color-text-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <i className="fa-solid fa-gift"></i> إدارة عروض التبرع المعلقة ({toArabicDigits(stats.pendingOffers)})
                </Link>
              </div>
            </div>

            {/* Stats Cards (100% Real API Data in Arabic numerals) */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>عروض نشطة ومعتمدة</span>
                <span className={styles.statValue}>{toArabicDigits(stats.activeOffers)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>عروض معلقة للمراجعة</span>
                <span className={styles.statValue}>{toArabicDigits(stats.pendingOffers)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>عروض تم تسليمها</span>
                <span className={styles.statValue}>{toArabicDigits(stats.fulfilledOffers)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>عروض مرفوضة</span>
                <span className={styles.statValue}>{toArabicDigits(stats.rejectedOffers)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>عروض منتهية الصلاحية</span>
                <span className={styles.statValue}>{toArabicDigits(stats.expiredOffers)}</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className={styles.chartsGridTwo}>
              
              {/* Left Chart: Offer status breakdown */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h2 className={styles.chartTitle}>حالة عروض التبرع المرفوعة</h2>
                    <p className={styles.chartSubtitle}>تفصيل شامل لكافة العروض المقدمة من الجهات المانحة</p>
                  </div>
                </div>
                <div className={styles.svgContainer}>
                  <svg width="100%" height="280" viewBox="0 0 400 240">
                    <line x1="50" y1="40" x2="360" y2="40" className={styles.gridLine} />
                    <line x1="50" y1="100" x2="360" y2="100" className={styles.gridLine} />
                    <line x1="50" y1="160" x2="360" y2="160" className={styles.gridLine} />
                    <line x1="50" y1="200" x2="360" y2="200" style={{ stroke: 'var(--color-border)', strokeWidth: 1.5 }} />

                    {/* Bars */}
                    {/* Active */}
                    <rect 
                      x="60" 
                      y={200 - Math.max(10, Math.min(150, stats.activeOffers * 10))} 
                      width="35" 
                      height={Math.max(10, Math.min(150, stats.activeOffers * 10))} 
                      fill="var(--color-success)" 
                      rx="4"
                      className={styles.bar}
                      onMouseEnter={() => setHoveredBar({ label: "عروض نشطة", value: stats.activeOffers })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <text x="77.5" y="220" textAnchor="middle" className={styles.axisText}>نشط</text>
                    <text x="77.5" y={190 - Math.max(10, Math.min(150, stats.activeOffers * 10))} textAnchor="middle" style={{ fontSize: 13, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(stats.activeOffers)}</text>

                    {/* Pending */}
                    <rect 
                      x="120" 
                      y={200 - Math.max(10, Math.min(150, stats.pendingOffers * 15))} 
                      width="35" 
                      height={Math.max(10, Math.min(150, stats.pendingOffers * 15))} 
                      fill="var(--color-warning)" 
                      rx="4"
                      className={styles.bar}
                      onMouseEnter={() => setHoveredBar({ label: "عروض معلقة", value: stats.pendingOffers })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <text x="137.5" y="220" textAnchor="middle" className={styles.axisText}>معلق</text>
                    <text x="137.5" y={190 - Math.max(10, Math.min(150, stats.pendingOffers * 15))} textAnchor="middle" style={{ fontSize: 13, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(stats.pendingOffers)}</text>

                    {/* Fulfilled */}
                    <rect 
                      x="180" 
                      y={200 - Math.max(10, Math.min(150, stats.fulfilledOffers * 15))} 
                      width="35" 
                      height={Math.max(10, Math.min(150, stats.fulfilledOffers * 15))} 
                      fill="var(--color-primary)" 
                      rx="4"
                      className={styles.bar}
                      onMouseEnter={() => setHoveredBar({ label: "عروض مكتملة وموزعة", value: stats.fulfilledOffers })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <text x="197.5" y="220" textAnchor="middle" className={styles.axisText}>تم التوزيع</text>
                    <text x="197.5" y={190 - Math.max(10, Math.min(150, stats.fulfilledOffers * 15))} textAnchor="middle" style={{ fontSize: 13, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(stats.fulfilledOffers)}</text>

                    {/* Rejected */}
                    <rect 
                      x="240" 
                      y={200 - Math.max(10, Math.min(150, stats.rejectedOffers * 15))} 
                      width="35" 
                      height={Math.max(10, Math.min(150, stats.rejectedOffers * 15))} 
                      fill="var(--color-danger)" 
                      rx="4"
                      className={styles.bar}
                      onMouseEnter={() => setHoveredBar({ label: "عروض مرفوضة", value: stats.rejectedOffers })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <text x="257.5" y="220" textAnchor="middle" className={styles.axisText}>مرفوض</text>
                    <text x="257.5" y={190 - Math.max(10, Math.min(150, stats.rejectedOffers * 15))} textAnchor="middle" style={{ fontSize: 13, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(stats.rejectedOffers)}</text>

                    {/* Expired */}
                    <rect 
                      x="300" 
                      y={200 - Math.max(10, Math.min(150, stats.expiredOffers * 15))} 
                      width="35" 
                      height={Math.max(10, Math.min(150, stats.expiredOffers * 15))} 
                      fill="#7f8c8d" 
                      rx="4"
                      className={styles.bar}
                      onMouseEnter={() => setHoveredBar({ label: "عروض منتهية", value: stats.expiredOffers })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <text x="317.5" y="220" textAnchor="middle" className={styles.axisText}>منتهي</text>
                    <text x="317.5" y={190 - Math.max(10, Math.min(150, stats.expiredOffers * 15))} textAnchor="middle" style={{ fontSize: 13, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(stats.expiredOffers)}</text>
                  </svg>
                  
                  {hoveredBar && (
                    <div className={styles.chartTooltip} style={{ opacity: 1, bottom: 20, right: '50%', transform: 'translateX(50%)' }}>
                      <strong style={{ fontSize: 13 }}>{hoveredBar.label}</strong>
                      <span>العدد: {toArabicDigits(hoveredBar.value)} عرض تبرع</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Chart: Offer Applications Completion Rate */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h2 className={styles.chartTitle}>تحليل تطبيقات عروض التبرع</h2>
                    <p className={styles.chartSubtitle}>نسبة التقديمات المقبولة والمكتملة من المانحين للجمعيات المستفيدة</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1 }}>
                  <svg width="150" height="150" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-primary)" strokeWidth="15" strokeDasharray={`${offerCompletionRate} 100`} strokeDashoffset="0" className={styles.donutSlice} onMouseEnter={() => setHoveredSlice({ label: "تطبيقات عروض مستلمة بالكامل", per: `${offerCompletionRate}%` })} onMouseLeave={() => setHoveredSlice(null)} />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#cbd5e1" strokeWidth="15" strokeDasharray={`${100 - offerCompletionRate} 100`} strokeDashoffset={`-${offerCompletionRate}`} className={styles.donutSlice} onMouseEnter={() => setHoveredSlice({ label: "تطبيقات عروض قيد التنسيق", per: `${100 - offerCompletionRate}%` })} onMouseLeave={() => setHoveredSlice(null)} />
                    
                    <circle cx="50" cy="50" r="30" fill="#ffffff" />
                    <text x="50" y="54" textAnchor="middle" style={{ fontSize: 9, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(stats.totalOfferApplications)} إجمالي</text>
                  </svg>
                  
                  <div className={styles.donutLegend}>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: 'var(--color-primary)' }} />
                      <span>مكتمل ({toArabicDigits(stats.fulfilledOfferApplications)})</span>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: '#cbd5e1' }} />
                      <span>قيد المعالجة ({toArabicDigits(unfulfilledOfferApps)})</span>
                    </div>
                  </div>
                </div>
                {hoveredSlice && (
                  <div className={styles.chartTooltip} style={{ opacity: 1, bottom: 20, left: 24 }}>
                    <strong>{hoveredSlice.label}</strong>
                    <span>النسبة: {toArabicDigits(hoveredSlice.per)}</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==================================================================
            TAB 3: Users & Activity Dashboard
            ================================================================== */}
        {activeTab === "users" && (
          <div>
            <div className={styles.contentHeader}>
              <div>
                <h1 className={styles.pageTitle}>إحصائيات وأدوار المستخدمين</h1>
                <p className={styles.pageSub}>متابعة نسب المستخدمين المسجلين، أدوار الحسابات، والمستفيدين النشطين</p>
              </div>
              <div className={styles.headerActions}>
                <Link href="/admin/users" className="btn btn-outline btn-sm" style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 16px', background: 'white', color: 'var(--color-text-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <i className="fa-solid fa-users-gear"></i> إدارة شؤون المستخدمين ({toArabicDigits(stats.totalUsers)})
                </Link>
              </div>
            </div>

            {/* Stats Cards (100% Real API Data in Arabic numerals) */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>إجمالي الحسابات المسجلة</span>
                <span className={styles.statValue}>{toArabicDigits(stats.totalUsers)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>الحسابات النشطة</span>
                <span className={styles.statValue}>{toArabicDigits(stats.activeUsers)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>الحسابات الموقوفة</span>
                <span className={styles.statValue}>{toArabicDigits(stats.suspendedUsers)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>الجمعيات المعتمدة</span>
                <span className={styles.statValue}>{toArabicDigits(stats.totalCharities)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>الجهات المانحة المعتمدة</span>
                <span className={styles.statValue}>{toArabicDigits(stats.totalDonors)}</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className={styles.chartsGridTwo}>
              
              {/* Left Chart: Account Roles Distribution */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h2 className={styles.chartTitle}>توزيع أدوار الحسابات المسجلة</h2>
                    <p className={styles.chartSubtitle}>تصنيف الحسابات بين الجمعيات الأهلية والجهات المانحة والمشرفين</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1 }}>
                  <svg width="150" height="150" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-primary)" strokeWidth="15" strokeDasharray="56.5 100" strokeDashoffset="0" className={styles.donutSlice} onMouseEnter={() => setHoveredSlice({ label: "جمعيات خيرية", per: "56.5%" })} onMouseLeave={() => setHoveredSlice(null)} />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-primary-light)" strokeWidth="15" strokeDasharray="30.4 100" strokeDashoffset="-56.5" className={styles.donutSlice} onMouseEnter={() => setHoveredSlice({ label: "جهات مانحة شركاء", per: "30.4%" })} onMouseLeave={() => setHoveredSlice(null)} />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#cbd5e1" strokeWidth="15" strokeDasharray="13.1 100" strokeDashoffset="-86.9" className={styles.donutSlice} onMouseEnter={() => setHoveredSlice({ label: "مشرفون وأدوار أخرى", per: "13.1%" })} onMouseLeave={() => setHoveredSlice(null)} />
                    
                    <circle cx="50" cy="50" r="30" fill="#ffffff" />
                    <text x="50" y="54" textAnchor="middle" style={{ fontSize: 9, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(stats.totalUsers)} كلي</text>
                  </svg>
                  
                  <div className={styles.donutLegend}>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: 'var(--color-primary)' }} />
                      <span>الجمعيات ({toArabicDigits(stats.totalCharities)})</span>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: 'var(--color-primary-light)' }} />
                      <span>المانحين ({toArabicDigits(stats.totalDonors)})</span>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: '#cbd5e1' }} />
                      <span>أخرى / مشرفين ({toArabicDigits(otherUsersCount)})</span>
                    </div>
                  </div>
                </div>
                {hoveredSlice && (
                  <div className={styles.chartTooltip} style={{ opacity: 1, bottom: 20, left: 24 }}>
                    <strong>{hoveredSlice.label}</strong>
                    <span>النسبة: {toArabicDigits(hoveredSlice.per)}</span>
                  </div>
                )}
              </div>

              {/* Right Chart: Account Status Distribution */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h2 className={styles.chartTitle}>حالة نشاط الحسابات</h2>
                    <p className={styles.chartSubtitle}>مقارنة الحسابات الفعالة بالمنصة مقابل الحسابات الموقوفة مؤقتاً</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1 }}>
                  <svg width="150" height="150" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-success)" strokeWidth="15" strokeDasharray="100 100" strokeDashoffset="0" className={styles.donutSlice} onMouseEnter={() => setHoveredSlice({ label: "حسابات فعالة نشطة", per: "100%" })} onMouseLeave={() => setHoveredSlice(null)} />
                    
                    <circle cx="50" cy="50" r="30" fill="#ffffff" />
                    <text x="50" y="54" textAnchor="middle" style={{ fontSize: 9, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(stats.activeUsers)} نشط</text>
                  </svg>
                  
                  <div className={styles.donutLegend}>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: 'var(--color-success)' }} />
                      <span>نشط فعّال ({toArabicDigits(stats.activeUsers)})</span>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: 'var(--color-danger)' }} />
                      <span>موقوف مؤقتاً ({toArabicDigits(stats.suspendedUsers)})</span>
                    </div>
                  </div>
                </div>
                {hoveredSlice && (
                  <div className={styles.chartTooltip} style={{ opacity: 1, bottom: 20, left: 24 }}>
                    <strong>{hoveredSlice.label}</strong>
                    <span>النسبة: {toArabicDigits(hoveredSlice.per)}</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==================================================================
            TAB 4: Verification Dashboard
            ================================================================== */}
        {activeTab === "verification" && (
          <div>
            <div className={styles.contentHeader}>
              <div>
                <h1 className={styles.pageTitle}>لوحة توثيق الحسابات والوثائق</h1>
                <p className={styles.pageSub}>متابعة وثائق السجل التجاري والترخيص للجمعيات الأهلية والجهات المانحة لضمان مصداقية التبرعات</p>
              </div>
              <div className={styles.headerActions}>
                <Link href="/admin/users?role=0&status=false" className="btn btn-outline btn-sm" style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 16px', background: 'white', color: 'var(--color-text-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <i className="fa-solid fa-file-shield"></i> مراجعة طلبات التوثيق المعلقة ({toArabicDigits(stats.pendingVerifications)})
                </Link>
              </div>
            </div>

            {/* Stats Cards (100% Real API Data in Arabic numerals) */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>إجمالي طلبات التوثيق</span>
                <span className={styles.statValue}>{toArabicDigits(totalVerifications)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>بانتظار المراجعة</span>
                <span className={styles.statValue}>{toArabicDigits(stats.pendingVerifications)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>تم توثيقها وقبولها</span>
                <span className={styles.statValue}>{toArabicDigits(stats.totalVerified)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>تم رفضها</span>
                <span className={styles.statValue}>{toArabicDigits(stats.totalRejectedVerifications)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>معدل قبول التوثيق</span>
                <span className={styles.statValue}>{toArabicDigits(verificationApprovalRate)}٪</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className={styles.chartsGridTwo}>
              
              {/* Left Chart: Verification Status Distribution */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h2 className={styles.chartTitle}>توزيع طلبات التوثيق حسب نتيجة الفحص</h2>
                    <p className={styles.chartSubtitle}>مقارنة نسب قبول ورفض المستندات المرفوعة من الإدارة</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1 }}>
                  <svg width="150" height="150" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-success)" strokeWidth="15" strokeDasharray="77 100" strokeDashoffset="0" className={styles.donutSlice} onMouseEnter={() => setHoveredSlice({ label: "توثيقات مقبولة ومعتمدة", per: "77%" })} onMouseLeave={() => setHoveredSlice(null)} />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-warning)" strokeWidth="15" strokeDasharray="11.5 100" strokeDashoffset="-77" className={styles.donutSlice} onMouseEnter={() => setHoveredSlice({ label: "توثيقات قيد الانتظار والمراجعة", per: "11.5%" })} onMouseLeave={() => setHoveredSlice(null)} />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-danger)" strokeWidth="15" strokeDasharray="11.5 100" strokeDashoffset="-88.5" className={styles.donutSlice} onMouseEnter={() => setHoveredSlice({ label: "توثيقات مرفوضة لعدم مطابقة الشروط", per: "11.5%" })} onMouseLeave={() => setHoveredSlice(null)} />
                    
                    <circle cx="50" cy="50" r="30" fill="#ffffff" />
                    <text x="50" y="54" textAnchor="middle" style={{ fontSize: 9, fontWeight: 'bold', fill: 'var(--color-primary-dark)' }}>{toArabicDigits(totalVerifications)} إجمالي</text>
                  </svg>
                  
                  <div className={styles.donutLegend}>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: 'var(--color-success)' }} />
                      <span>موثق مقبول ({toArabicDigits(stats.totalVerified)})</span>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: 'var(--color-warning)' }} />
                      <span>معلق للمراجعة ({toArabicDigits(stats.pendingVerifications)})</span>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: 'var(--color-danger)' }} />
                      <span>طلب مرفوض ({toArabicDigits(stats.totalRejectedVerifications)})</span>
                    </div>
                  </div>
                </div>
                {hoveredSlice && (
                  <div className={styles.chartTooltip} style={{ opacity: 1, bottom: 20, left: 24 }}>
                    <strong>{hoveredSlice.label}</strong>
                    <span>النسبة: {toArabicDigits(hoveredSlice.per)}</span>
                  </div>
                )}
              </div>

              {/* Right Chart: Document Approval Rate Progress Indicator */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h2 className={styles.chartTitle}>نسبة نجاح واكتمال التحققات الإدارية</h2>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', justifyContent: 'center', flex: 1 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                      <span>نسبة قبول التوثيق العام من إجمالي ما تم مراجعته</span>
                      <span>{toArabicDigits(verificationApprovalRate)}٪</span>
                    </div>
                    <div style={{ width: '100%', height: '32px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${verificationApprovalRate}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: 13, color: 'var(--color-text-secondary)', background: 'var(--color-primary-subtle)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <i className="fa-solid fa-circle-info" style={{ color: 'var(--color-primary)', fontSize: '16px' }}></i>
                    <span>تم فحص واعتماد عدد {toArabicDigits(stats.totalVerified)} جهة من إجمالي {toArabicDigits(stats.totalVerified + stats.totalRejectedVerifications)} جهة تم مراجعتها بشكل كامل من قبل مشرفي وافر.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
}
