"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/dashboard/requests.module.css";
import RequestListCard from "@/components/cards/RequestListCard";
import RequestActionModal from "@/components/ui/RequestActionModal";
import { useAuth } from "@/context/AuthContext";
import applicationsService from "@/services/applicationsService";
import globalPostsStyles from "@/styles/dashboard/posts.module.css";

export default function RequestsPage() {
  const { role } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState(null); // 'accept' or 'reject'
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [role, filter]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchRequests = async () => {
    if (!role || role === "Admin") return;
    setIsLoading(true);
    setError(null);
    try {
      let data = null;
      const params = {
        Page: 1,
        PageSize: 50,
        Status: filter !== "all" ? parseInt(filter) : undefined
      };

      if (role === "Charity") {
        const response = await applicationsService.getReceivedNeedApplications(params);
        data = response?.data || response;
      } else if (role === "DonorOrganization") {
        const response = await applicationsService.getReceivedOfferApplications(params);
        data = response?.data || response;
      }

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
      setError(err.appMessage || "حدث خطأ أثناء تحميل الطلبات الواردة.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAccept = (item) => {
    setActionError(null);
    setSelectedItem(item);
    setActionType("accept");
    setModalOpen(true);
  };

  const handleOpenReject = (item) => {
    setActionError(null);
    setSelectedItem(item);
    setActionType("reject");
    setModalOpen(true);
  };

  const handleConfirmAction = async (item, type) => {
    setActionError(null);
    setIsSubmitting(true);
    try {
      const id = item.id || item.needApplicationId || item.offerApplicationId;
      if (role === "Charity") {
        if (type === "accept") await applicationsService.acceptNeedApplication(id);
        else if (type === "reject") await applicationsService.rejectNeedApplication(id);
      } else if (role === "DonorOrganization") {
        if (type === "accept") await applicationsService.acceptOfferApplication(id);
        else if (type === "reject") await applicationsService.rejectOfferApplication(id);
      }
      
      setSuccessMessage(type === "accept" ? "تم قبول الطلب بنجاح" : "تم رفض الطلب");
      setModalOpen(false);
      fetchRequests(); 
    } catch (err) {
      setActionError(err.appMessage || "حدث خطأ أثناء تنفيذ العملية.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === "all") return true;
    const status = req.status ?? req.Status;
    return status === parseInt(filter);
  });

  return (
    <div className={styles.requestsPage}>
      
      {/* Header / Filter */}
      <div className={styles.pageActions}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>فلترة حسب الحالة :</span>
          <div className={styles.filterSelectWrapper}>
            <select
              className={styles.filterSelect}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">جميع الحالات</option>
              <option value="0">قيد الانتظار</option>
              <option value="1">مقبول</option>
              <option value="2">مرفوض</option>
            </select>
            <i className={`fa-solid fa-chevron-down ${styles.filterChevron}`}></i>
          </div>
        </div>
      </div>

      {error && <div className={globalPostsStyles.errorMessage}>{error}</div>}
      {successMessage && (
        <div style={{ 
          backgroundColor: '#e8f5e9', 
          color: '#2e7d32', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px', 
          textAlign: 'center',
          fontWeight: 'bold',
          border: '1px solid #c8e6c9'
        }}>
          {successMessage}
        </div>
      )}

      {/* List */}
      <div className={globalPostsStyles.postsGrid}>
        {isLoading ? (
          <div className={globalPostsStyles.emptyState}>جاري تحميل الطلبات...</div>
        ) : filteredRequests.length === 0 ? (
          <div className={globalPostsStyles.emptyState}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}><i className="fa-solid fa-envelope-open-text" style={{ color: "#171123" }}></i></div>
            لا توجد طلبات واردة حالياً تطابق الفلتر.
          </div>
        ) : (
          filteredRequests.map((req, idx) => (
            <RequestListCard 
              key={req.id || req.needApplicationId || req.offerApplicationId || idx} 
              request={req} 
              onAccept={handleOpenAccept}
              onReject={handleOpenReject}
              role={role}
            />
          ))
        )}
      </div>

      {/* Action Modal */}
      <RequestActionModal 
        isOpen={modalOpen}
        onClose={() => !isSubmitting && setModalOpen(false)}
        onConfirm={handleConfirmAction}
        itemData={selectedItem}
        actionType={actionType}
        error={actionError}
        isSubmitting={isSubmitting}
      />

    </div>
  );
}
