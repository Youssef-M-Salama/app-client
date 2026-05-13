"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/dashboard/browse.module.css";
import BrowseCard from "@/components/cards/BrowseCard";
import ApplyModal from "@/components/ui/ApplyModal";
import { useAuth } from "@/context/AuthContext";
import charityNeedsService from "@/services/charityNeedsService";
import offersService from "@/services/offersService";
import applicationsService from "@/services/applicationsService";
import { useAlert } from "@/context/AlertContext";

export default function BrowsePage() {
  const { role, user } = useAuth();
  const { showAlert, showToast } = useAlert();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce: only update debouncedSearch 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchItems();
  }, [role, categoryFilter, debouncedSearch]);

  const fetchItems = async () => {
    if (!role) return;
    setIsLoading(true);
    setError(null);
    try {
      let data = null;
      const params = {
        Page: 1,
        PageSize: 50,
        Search: debouncedSearch || undefined,
        Category: categoryFilter !== "all" ? parseInt(categoryFilter) : undefined
      };

      if (role === "DonorOrganization") {
        const response = await charityNeedsService.getPublicCharityNeeds(params);
        data = response?.data || response;
      } else if (role === "Charity") {
        const response = await offersService.getPublicOffers(params);
        data = response?.data || response;
      }

      let fetchedItems = [];
      if (data?.items) {
        fetchedItems = data.items;
      } else if (Array.isArray(data)) {
        fetchedItems = data;
      } else if (data?.data?.items) {
        fetchedItems = data.data.items;
      } else if (data?.data && Array.isArray(data.data)) {
        fetchedItems = data.data;
      }

      setItems(fetchedItems);
    } catch (err) {
      setError(err.appMessage || "حدث خطأ أثناء تحميل البيانات.");
    } finally {
      setIsLoading(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyClick = (item) => {
    if (user?.verificationState !== 2) {
      showAlert("حساب غير موثق", "مرحباً! حسابك قيد المراجعة من قبل الإدارة. ستتمكن من تقديم الطلبات بعد الموافقة.", "warning");
      return;
    }
    setActionError(null);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleConfirmApply = async (item) => {
    setActionError(null);
    setIsSubmitting(true);
    try {
      const id = item.id || item.charityNeedId || item.offerId;
      if (role === "DonorOrganization") {
        await applicationsService.applyToNeed(id);
      } else if (role === "Charity") {
        await applicationsService.applyToOffer(id);
      }
      showToast("تم تقديم الطلب بنجاح!", "success");
      setIsModalOpen(false);
    } catch (err) {
      setActionError(err.appMessage || "حدث خطأ أثناء تقديم الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.browsePage}>
      <div className={styles.pageActions}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>الفئة :</span>
          <div className={styles.filterSelectWrapper}>
            <select
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">الجميع</option>
              <option value="0">طعام</option>
              <option value="1">ملابس</option>
              <option value="2">طبي</option>
              <option value="3">تعليمي</option>
              <option value="4">أخرى</option>
            </select>
            <i className={`fa-solid fa-chevron-down ${styles.filterChevron}`}></i>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>بحث :</span>
          <input
            type="text"
            className={styles.filterSelect}
            placeholder="ابحث هنا..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "200px" }}
          />
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.browseGrid}>
        {isLoading ? (
          <p>جاري التحميل...</p>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>لا توجد طلبات متاحة تطابق الفلتر.</div>
        ) : (
          items.map((item, idx) => (
            <BrowseCard
              key={item.id || item.charityNeedId || item.offerId || idx}
              item={item}
              onApply={handleApplyClick}
            />
          ))
        )}
      </div>

      <ApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleConfirmApply}
        itemData={selectedItem}
        error={actionError}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
