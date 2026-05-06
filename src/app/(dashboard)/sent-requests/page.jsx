"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/dashboard/posts.module.css";
import requestStyles from "@/styles/dashboard/requests.module.css"; // Reuse filter styles
import RequestListCard from "@/components/cards/RequestListCard";
import { useAuth } from "@/context/AuthContext";
import applicationsService from "@/services/applicationsService";

export default function SentRequestsPage() {
  const { role } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchSentRequests();
  }, [role]);

  const fetchSentRequests = async () => {
    if (!role) return;
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        Page: 1,
        PageSize: 50,
      };

      let response = null;
      if (role === "Charity") {
        response = await applicationsService.getSentOfferApplications(params);
      } else if (role === "DonorOrganization") {
        response = await applicationsService.getSentNeedApplications(params);
      }

      const data = response?.data || response;
      if (data?.items) {
        setRequests(data.items);
      } else if (data?.data?.items) {
        setRequests(data.data.items);
      } else if (Array.isArray(data)) {
        setRequests(data);
      } else if (Array.isArray(data?.data)) {
        setRequests(data.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      setError(err.appMessage || "حدث خطأ أثناء تحميل الطلبات.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === "all") return true;
    const status = req.status ?? req.Status;
    return status === parseInt(filter);
  });

  return (
    <div className={styles.postsPage}>
      {/* Header / Filter */}
      <div className={requestStyles.pageActions}>
        <div className={requestStyles.filterGroup}>
          <span className={requestStyles.filterLabel}>فلترة حسب الحالة :</span>
          <div className={requestStyles.filterSelectWrapper}>
            <select
              className={requestStyles.filterSelect}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">جميع الحالات</option>
              <option value="0">قيد الانتظار</option>
              <option value="1">مقبول</option>
              <option value="2">مرفوض</option>
            </select>
            <i className={`fa-solid fa-chevron-down ${requestStyles.filterChevron}`}></i>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.postsGrid}>
        {isLoading ? (
          <div className={styles.emptyState}>جاري تحميل الطلبات...</div>
        ) : filteredRequests.length === 0 ? (
          <div className={styles.emptyState}>
             <div style={{ fontSize: '48px', marginBottom: '16px' }}><i className="fa-solid fa-envelope-open-text" style={{ color: "#171123" }}></i></div>
             لا توجد طلبات مرسلة حالياً تطابق الفلتر.
          </div>
        ) : (
          filteredRequests.map((request, idx) => (
            <RequestListCard 
              key={request.id || idx} 
              request={request} 
              role={role}
              isSent={true}
            />
          ))
        )}
      </div>
    </div>
  );
}
