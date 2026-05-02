"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/dashboard/posts.module.css";
import RequestListCard from "@/components/cards/RequestListCard";
import { useAuth } from "@/context/AuthContext";
import applicationsService from "@/services/applicationsService";

export default function SentRequestsPage() {
  const { role } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className={styles.postsPage}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.postsGrid}>
        {isLoading ? (
          <p>جاري التحميل...</p>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>لا توجد طلبات مرسلة حتى الآن.</div>
        ) : (
          requests.map((request, idx) => (
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
