"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/dashboard/posts.module.css";
import requestStyles from "@/styles/dashboard/requests.module.css"; // Reuse filter styles
import RequestListCard from "@/components/cards/RequestListCard";
import RequestDetailsModal from "@/components/ui/RequestDetailsModal";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import applicationsService from "@/services/applicationsService";

export default function SentRequestsPage() {
  const { role } = useAuth();
  const { showConfirm, showToast, showAlert } = useAlert();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsRequest, setDetailsRequest] = useState(null);

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

  const handleCancel = async (id) => {
    showConfirm(
      "إلغاء الطلب",
      "هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟",
      async () => {
        try {
          if (role === "Charity") {
            await applicationsService.cancelOfferApplication(id);
          } else if (role === "DonorOrganization") {
            await applicationsService.cancelNeedApplication(id);
          }
          setRequests((prev) => prev.filter((req) => (req.id || req.offerApplicationId || req.needApplicationId) !== id));
          showToast("تم إلغاء الطلب بنجاح", "success");
        } catch (err) {
          showAlert("فشل الإلغاء", err.appMessage || "تعذّر إلغاء الطلب.", "error");
        }
      }
    );
  };

  const handleFulfill = (request) => {
    showConfirm(
      "تأكيد استلام البضاعة",
      "هل تؤكد أنك استلمت هذه التبرعات بشكل كامل؟ لن يمكن التراجع عن هذا الإجراء.",
      async () => {
        try {
          const id = request.id || request.offerApplicationId || request.needApplicationId;
          await applicationsService.fulfillOfferApplication(id);
          showToast("تم تأكيد استلام البضاعة بنجاح ✨", "success");
          fetchSentRequests();
        } catch (err) {
          showAlert(
            "فشل العملية",
            err.response?.data?.message || err.appMessage || "تعذّر تأكيد الاستلام.",
            "error"
          );
        }
      }
    );
  };

  return (
    <div className={styles.postsPage}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.postsGrid}>
        {isLoading ? (
          <div className={styles.emptyState}>جاري تحميل الطلبات...</div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}><i className="fa-solid fa-envelope-open-text" style={{ color: "#171123" }}></i></div>
            لا توجد طلبات مرسلة حالياً.
          </div>
        ) : (
          requests.map((request, idx) => (
            <RequestListCard
              key={request.id || idx}
              request={request}
              role={role}
              isSent={true}
              onCancel={handleCancel}
              onFulfill={role === 'Charity' ? handleFulfill : undefined}
              onViewDetails={(req) => setDetailsRequest(req)}
            />
          ))
        )}
      </div>

      <RequestDetailsModal
        isOpen={Boolean(detailsRequest)}
        onClose={() => setDetailsRequest(null)}
        request={detailsRequest}
        role={role}
        isSent={true}
      />
    </div>
  );
}
