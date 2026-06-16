"use client";

import { useState, useEffect, useRef } from "react";
import styles from "@/styles/dashboard/browse.module.css";
import BrowseCard from "@/components/cards/BrowseCard";
import ApplyModal from "@/components/ui/ApplyModal";
import { useAuth } from "@/context/AuthContext";
import charityNeedsService from "@/services/charityNeedsService";
import offersService from "@/services/offersService";
import applicationsService from "@/services/applicationsService";
import profileService from "@/services/profileService";
import { useAlert } from "@/context/AlertContext";

// ─── Haversine Formula ────────────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Nearest sort and AI Match states
  const [nearestActive, setNearestActive] = useState(false);
  const [isSortingNearest, setIsSortingNearest] = useState(false);
  const [aiMatchActive, setAiMatchActive] = useState(false);
  const [isMatchingAI, setIsMatchingAI] = useState(false);
  const originalItemsRef = useRef([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setNearestActive(false);
    setAiMatchActive(false);
    fetchItems();
  }, [role, categoryFilter, priorityFilter, debouncedSearch]);

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
        Category: categoryFilter !== "all" ? parseInt(categoryFilter) : undefined,
      };

      if (role === "DonorOrganization" && priorityFilter !== "all") {
        params.Priority = parseInt(priorityFilter);
      }

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

      if (role === "DonorOrganization" && priorityFilter !== "all") {
        fetchedItems = fetchedItems.filter(
          (item) => item.priority === parseInt(priorityFilter)
        );
      }

      originalItemsRef.current = fetchedItems;
      setItems(fetchedItems);
    } catch (err) {
      setError(err.appMessage || "حدث خطأ أثناء تحميل البيانات.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNearestToggle = async () => {
    if (nearestActive) {
      setNearestActive(false);
      setItems([...originalItemsRef.current]);
      return;
    }

    setIsSortingNearest(true);
    setAiMatchActive(false); // Disable AI match if active
    try {
      const profileResponse = await profileService.getProfile();
      const profileData = profileResponse?.data || profileResponse;
      const myLat = profileData?.latitude;
      const myLng = profileData?.longitude;

      if (!myLat || !myLng) {
        showToast(
          "لم يتم تحديد موقعك الجغرافي. يرجى تحديث الملف الشخصي وإضافة الموقع على الخريطة.",
          "warning"
        );
        return;
      }

      const sorted = [...originalItemsRef.current].sort((a, b) => {
        const aHasCoords = a.latitude != null && a.longitude != null;
        const bHasCoords = b.latitude != null && b.longitude != null;
        if (!aHasCoords && !bHasCoords) return 0;
        if (!aHasCoords) return 1;
        if (!bHasCoords) return -1;
        const distA = haversineKm(myLat, myLng, a.latitude, a.longitude);
        const distB = haversineKm(myLat, myLng, b.latitude, b.longitude);
        return distA - distB;
      });

      setItems(sorted);
      setNearestActive(true);
      showToast("تم الترتيب حسب الأقرب إليك", "success");
    } catch (err) {
      showToast(err.appMessage || "حدث خطأ أثناء جلب بيانات الموقع.", "error");
    } finally {
      setIsSortingNearest(false);
    }
  };

  // ─── NEW: Intelligent AI Match Button Handler ───────────────────────────
  const handleAIMatchToggle = async () => {
    if (aiMatchActive) {
      setAiMatchActive(false);
      setItems([...originalItemsRef.current]);
      return;
    }

    setIsMatchingAI(true);
    setNearestActive(false); // Disable nearest active if active
    showToast("جاري تحليل المطابقات الذكية وبناء نموذج الملاءمة الخاص بك...", "info");

    try {
      const profileResponse = await profileService.getProfile();
      const profileData = profileResponse?.data || profileResponse;
      
      // Simulate intelligent processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const myLat = profileData?.latitude;
      const myLng = profileData?.longitude;
      const myGov = profileData?.governorate;
      const myCity = profileData?.city;

      // Extract org details
      const orgInfo = { name: "", description: "" };
      if (profileData?.role === 0 && profileData.charityDetails) {
        orgInfo.name = profileData.charityDetails.charityName || "";
        orgInfo.description = profileData.charityDetails.charityDescription || "";
      } else if (profileData?.role === 1 && profileData.donorDetails) {
        orgInfo.name = profileData.donorDetails.donorOrganizationName || "";
        orgInfo.description =
          profileData.donorDetails.donorOrganizationDescription ||
          profileData.donorDetails.donorDescription ||
          "";
      } else {
        orgInfo.name = profileData?.name || "";
        orgInfo.description = profileData?.description || "";
      }

      // Helper to normalize Arabic text for matching
      const normalize = (text) => {
        if (!text) return "";
        return text
          .replace(/[إأآا]/g, "ا")
          .replace(/[ىي]/g, "ي")
          .replace(/ة/g, "ه")
          .replace(/[\u064B-\u0652]/g, "")
          .replace(/\s+/g, " ")
          .trim();
      };

      const normName = normalize(orgInfo.name);
      const normDesc = normalize(orgInfo.description);
      const fullProfileText = `${normName} ${normDesc}`;

      // Stop words to exclude from keyword index
      const stopWords = new Set([
        "من", "في", "على", "الى", "عن", "مع", "هذا", "هذه", "التي", "الذي", 
        "نحن", "جمعيه", "مؤسسه", "منظمه", "خيريه", "خلال", "كل", "او", "ام",
        "تم", "كان", "كانت", "ان", "انها", "انه", "بين", "حول", "تحت", "فوق"
      ]);

      // Extract meaningful keywords from profile text
      const keywords = fullProfileText
        .split(/[\s,.:;!?()"\-]+/)
        .map(w => w.trim())
        .filter(w => w.length >= 3 && !stopWords.has(w));

      const scoredItems = [...originalItemsRef.current].map(item => {
        let score = 0;

        // 1. Distance & Location Scoring (Max 40 pts)
        const itemLat = item.latitude;
        const itemLng = item.longitude;
        if (myLat != null && myLng != null && itemLat != null && itemLng != null) {
          const dist = haversineKm(myLat, myLng, itemLat, itemLng);
          if (dist < 5) score += 40;
          else if (dist < 15) score += 30;
          else if (dist < 30) score += 20;
          else if (dist < 100) score += 10;
          else score += 2;
        } else {
          // Fallback to governorate/city text mapping
          const itemGov = item.governorate;
          const itemCity = item.city;
          if (myGov && itemGov && normalize(myGov) === normalize(itemGov)) {
            score += 25;
            if (myCity && itemCity && normalize(myCity) === normalize(itemCity)) {
              score += 10;
            }
          }
        }

        // 2. Priority Scoring (Max 25 pts)
        if (item.priority !== undefined) {
          if (item.priority === 0) score += 25;
          else if (item.priority === 1) score += 18;
          else if (item.priority === 2) score += 10;
          else if (item.priority === 3) score += 3;
        }

        // 3. Keyword & Semantic Alignment (Max 35 pts)
        const itemText = normalize(`${item.productName || ""} ${item.description || ""} ${item.charityName || ""} ${item.donorOrganizationName || ""}`);
        
        let keywordMatches = 0;
        keywords.forEach(kw => {
          if (itemText.includes(kw)) {
            keywordMatches++;
          }
        });
        score += Math.min(25, keywordMatches * 5);

        // Category semantic boosters
        const itemCategory = item.category;
        if (itemCategory === 0) { // Food
          if (fullProfileText.includes("طعام") || fullProfileText.includes("غذاء") || fullProfileText.includes("وجب") || fullProfileText.includes("اطعام")) {
            score += 10;
          }
        } else if (itemCategory === 1) { // Clothing
          if (fullProfileText.includes("ملابس") || fullProfileText.includes("كساء") || fullProfileText.includes("لبس") || fullProfileText.includes("بطاطين")) {
            score += 10;
          }
        } else if (itemCategory === 2) { // Medical
          if (fullProfileText.includes("طبي") || fullProfileText.includes("علاج") || fullProfileText.includes("دواء") || fullProfileText.includes("مرض") || fullProfileText.includes("مستشفي")) {
            score += 10;
          }
        } else if (itemCategory === 3) { // Educational
          if (fullProfileText.includes("تعليم") || fullProfileText.includes("مدرس") || fullProfileText.includes("كتب") || fullProfileText.includes("شنط") || fullProfileText.includes("طالب")) {
            score += 10;
          }
        }

        return { item, score };
      });

      // Sort by score descending
      scoredItems.sort((a, b) => b.score - a.score);

      setItems(scoredItems.map(s => s.item));
      setAiMatchActive(true);
      showToast("تم تطبيق المطابق الذكي بنجاح وتصفية العناصر الأكثر ملاءمة لك ✓", "success");
    } catch (err) {
      showToast(err.appMessage || "حدث خطأ أثناء جلب بيانات الملف الشخصي للمطابقة.", "error");
    } finally {
      setIsMatchingAI(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyClick = (item) => {
    if (user?.verificationState !== 2) {
      showAlert(
        "حساب غير موثق",
        "مرحباً! حسابك قيد المراجعة من قبل الإدارة. ستتمكن من تقديم الطلبات بعد الموافقة.",
        "warning"
      );
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

  // ─── Button Styles ────────────────────────────────────────────────────────
  const nearestBtnStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 18px",
    borderRadius: "10px",
    border: nearestActive ? "2px solid transparent" : "2px solid #e0d5f7",
    background: nearestActive
      ? "linear-gradient(135deg, #6F2DBD 0%, #9B59B6 100%)"
      : "linear-gradient(135deg, #f3f0fb 0%, #ede6fc 100%)",
    color: nearestActive ? "#fff" : "#6F2DBD",
    fontWeight: 700,
    fontSize: "14px",
    cursor: isSortingNearest || isMatchingAI || isLoading ? "not-allowed" : "pointer",
    opacity: isSortingNearest || isMatchingAI || isLoading ? 0.65 : 1,
    boxShadow: nearestActive
      ? "0 4px 16px rgba(111,45,189,0.38)"
      : "0 2px 8px rgba(111,45,189,0.1)",
    transition: "all 0.25s ease",
    whiteSpace: "nowrap",
    letterSpacing: "0.01em",
  };

  const aiMatchBtnStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 18px",
    borderRadius: "10px",
    border: aiMatchActive ? "2px solid transparent" : "2px solid #d1fae5",
    background: aiMatchActive
      ? "linear-gradient(135deg, #059669 0%, #10B981 100%)"
      : "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    color: aiMatchActive ? "#fff" : "#047857",
    fontWeight: 700,
    fontSize: "14px",
    cursor: isSortingNearest || isMatchingAI || isLoading ? "not-allowed" : "pointer",
    opacity: isSortingNearest || isMatchingAI || isLoading ? 0.65 : 1,
    boxShadow: aiMatchActive
      ? "0 4px 16px rgba(5,150,105,0.38)"
      : "0 2px 8px rgba(5,150,105,0.15)",
    transition: "all 0.25s ease",
    whiteSpace: "nowrap",
    letterSpacing: "0.01em",
  };

  return (
    <div className={styles.browsePage}>

      {/* ── Filters bar ── */}
      <div
        className={styles.pageActions}
        style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px" }}
      >
        {/* Right-side filters */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
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

          {role === "DonorOrganization" && (
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>الأولوية :</span>
              <div className={styles.filterSelectWrapper}>
                <select
                  className={styles.filterSelect}
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">الجميع</option>
                  <option value="0">قصوى</option>
                  <option value="1">مرتفعة</option>
                  <option value="2">متوسطة</option>
                  <option value="3">منخفضة</option>
                </select>
                <i className={`fa-solid fa-chevron-down ${styles.filterChevron}`}></i>
              </div>
            </div>
          )}

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

        {/* ── Action Buttons ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "auto" }}>
          
          {/* ✨ AI Match Button */}
          <button
            type="button"
            onClick={handleAIMatchToggle}
            disabled={isSortingNearest || isMatchingAI || isLoading}
            style={aiMatchBtnStyle}
            onMouseEnter={(e) => {
              if (!aiMatchActive && !isMatchingAI && !isSortingNearest && !isLoading) {
                e.currentTarget.style.background = "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(5,150,105,0.25)";
                e.currentTarget.style.borderColor = "#6ee7b7";
              }
            }}
            onMouseLeave={(e) => {
              if (!aiMatchActive) {
                e.currentTarget.style.background = "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(5,150,105,0.15)";
                e.currentTarget.style.borderColor = "#d1fae5";
              }
            }}
          >
            <span
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: aiMatchActive ? "rgba(255,255,255,0.2)" : "rgba(5,150,105,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                flexShrink: 0,
              }}
            >
              <i
                className={
                  isMatchingAI
                    ? "fa-solid fa-spinner fa-spin"
                    : "fa-solid fa-wand-magic-sparkles"
                }
                style={{ color: aiMatchActive ? "#fff" : "inherit" }}
              />
            </span>
            {isMatchingAI ? "جاري المطابقة..." : "مطابق ذكي"}
          </button>

          {/* Nearest Button */}
          <button
            type="button"
            onClick={handleNearestToggle}
            disabled={isSortingNearest || isMatchingAI || isLoading}
            style={nearestBtnStyle}
            onMouseEnter={(e) => {
              if (!nearestActive && !isSortingNearest && !isMatchingAI && !isLoading) {
                e.currentTarget.style.background = "linear-gradient(135deg, #ebe3fc 0%, #ddd0f7 100%)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(111,45,189,0.2)";
                e.currentTarget.style.borderColor = "#c8aff0";
              }
            }}
            onMouseLeave={(e) => {
              if (!nearestActive) {
                e.currentTarget.style.background = "linear-gradient(135deg, #f3f0fb 0%, #ede6fc 100%)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(111,45,189,0.1)";
                e.currentTarget.style.borderColor = "#e0d5f7";
              }
            }}
          >
            <span
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: nearestActive ? "rgba(255,255,255,0.2)" : "rgba(111,45,189,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                flexShrink: 0,
              }}
            >
              <i
                className={
                  isSortingNearest
                    ? "fa-solid fa-spinner fa-spin"
                    : "fa-solid fa-location-crosshairs"
                }
                style={{ color: nearestActive ? "#fff" : "inherit" }}
              />
            </span>
            {isSortingNearest ? "جاري التحديد..." : "الأقرب إليّ"}
          </button>

        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.browseGrid}>
        {isLoading ? (
          <p>جاري التحميل...</p>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            لا توجد طلبات متاحة تطابق الفلتر.
          </div>
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