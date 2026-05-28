"use client";

import { useState, useEffect, useCallback } from "react";
import applicationsService from "@/services/applicationsService";
import { useAuth } from "@/context/AuthContext";
import TransactionCard from "@/components/cards/TransactionCard";
import postsStyles from "@/styles/dashboard/posts.module.css";
import styles from "@/styles/dashboard/transactions.module.css";

const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const { role } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTransactions = useCallback(
    async (p = 1) => {
      if (!role) return;
      setIsLoading(true);
      setError(null);
      try {
        const params = { page: p, pageSize: PAGE_SIZE };
        let response = null;
        if (role === "Charity") {
          response = await applicationsService.getCharityCompletedTransactions(params);
        } else if (role === "DonorOrganization") {
          response = await applicationsService.getDonorCompletedTransactions(params);
        }

        const data = response?.data || response;
        const items =
          data?.items ?? data?.data?.items ?? (Array.isArray(data) ? data : data?.data ?? []);
        const count = data?.totalCount ?? data?.data?.totalCount ?? items.length;
        const pages = data?.totalPages ?? data?.data?.totalPages ?? (Math.ceil(count / PAGE_SIZE) || 1);

        setTransactions(Array.isArray(items) ? items : []);
        setTotalCount(count);
        setTotalPages(pages);
        setPage(p);
      } catch (err) {
        setError(err.appMessage || "حدث خطأ أثناء تحميل سجل المعاملات.");
      } finally {
        setIsLoading(false);
      }
    },
    [role]
  );

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const handlePrev = () => { if (page > 1) fetchTransactions(page - 1); };
  const handleNext = () => { if (page < totalPages) fetchTransactions(page + 1); };

  return (
    <div className={styles.page} dir="rtl">
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <span className={styles.headerIcon}>
            <i className="fa-solid fa-handshake" />
          </span>
          <div>
            <h1 className={styles.title}>سجل المعاملات المكتملة</h1>
            <p className={styles.subtitle}>جميع عمليات التسليم والاستلام التي تمّت بنجاح</p>
          </div>
        </div>
        {totalCount > 0 && (
          <span className={styles.countBadge}>{totalCount} معاملة</span>
        )}
      </div>

      {/* Content */}
      {error && (
        <div className={postsStyles.errorMessage} style={{ marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className={styles.loadingGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <i className="fa-solid fa-handshake-slash" />
          </div>
          <h3>لا توجد معاملات مكتملة بعد</h3>
          <p>ستظهر هنا جميع عمليات التسليم التي تمت بنجاح</p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {transactions.map((tx) => (
              <TransactionCard
                key={tx.applicationId}
                transaction={tx}
                role={role}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={handleNext}
                disabled={page >= totalPages}
              >
                <i className="fa-solid fa-chevron-right" />
              </button>

              <span className={styles.pageInfo}>
                صفحة <strong>{page}</strong> من <strong>{totalPages}</strong>
              </span>

              <button
                className={styles.pageBtn}
                onClick={handlePrev}
                disabled={page <= 1}
              >
                <i className="fa-solid fa-chevron-left" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
