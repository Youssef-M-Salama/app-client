"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/cards/PostCard";
import PostFormModal from "@/components/ui/PostFormModal";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import styles from "@/styles/dashboard/posts.module.css";
import { useAuth } from "@/context/AuthContext";
import charityNeedsService from "@/services/charityNeedsService";
import offersService from "@/services/offersService";
import { mapCategory } from "@/utils/enumMapper";
import { useAlert } from "@/context/AlertContext";

const CATEGORIES = ["جميع الفئات", "طعام", "ملابس", "طبي", "تعليمي", "أخرى"];

const STATUS_FILTERS_CHARITY = [
  { label: "جميع الحالات", value: "all" },
  { label: "قيد المراجعة", value: "0" },
  { label: "مقبول", value: "1" },
  { label: "مرفوض", value: "2" },
  { label: "مكتمل", value: "3" },
];

const STATUS_FILTERS_DONOR = [
  { label: "جميع الحالات", value: "all" },
  { label: "قيد المراجعة", value: "0" },
  { label: "مقبول", value: "1" },
  { label: "مرفوض", value: "2" },
  { label: "مكتمل", value: "3" },
  { label: "منتهي الصلاحية", value: "4" },
];

export default function PostsPage() {
  const { role, user } = useAuth();
  const { showAlert, showToast } = useAlert();

  const [posts, setPosts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("جميع الفئات");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [deletePost, setDeletePost] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchPosts();
  }, [role]);

  const fetchPosts = async () => {
    if (!role) return;
    setIsLoading(true);
    setError(null);
    try {
      let data = null;
      if (role === "Charity") {
        const response = await charityNeedsService.getMyCharityNeeds({ Page: 1, PageSize: 50 });
        data = response?.data || response;
      } else if (role === "DonorOrganization") {
        const response = await offersService.getMyOffers({ Page: 1, PageSize: 50 });
        data = response?.data || response;
      }

      // Assume paginated envelope returns array in `data.items` or `data` itself is array if not paginated locally
      if (data?.items) {
        setPosts(data.items);
      } else if (Array.isArray(data)) {
        setPosts(data);
      } else if (data?.data?.items) {
        setPosts(data.data.items);
      } else {
        setPosts([]);
      }
    } catch (err) {
      setError(err.appMessage || "حدث خطأ أثناء تحميل المنشورات.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Derived ──
  const filteredPosts = categoryFilter === "جميع الفئات"
    ? posts
    : posts.filter((p) => mapCategory(p.category) === categoryFilter);

  // ── Handlers ──
  async function handleAddSubmit(form) {
    setActionError(null);
    setFieldErrors({});
    try {
      const fd = new FormData();
      // map category back to integer if we used strings in form, but the form uses integer?
      // Wait, in PostFormModal, we should use integer categories. 
      // We will adjust PostFormModal to send category as integer.
      fd.append("Category", form.category);
      fd.append("ProductName", form.title);
      fd.append("Quantity", form.quantity || 1);
      fd.append("Unit", form.unit !== undefined ? form.unit : 8);
      fd.append("Description", form.description);
      if (form.phone) fd.append("Phone", form.phone); // Not in API strictly but okay
      if (form.image) fd.append("ProductImage", form.image);

      if (role === "Charity") {
        fd.append("Priority", form.priority !== undefined ? form.priority : 2);
        await charityNeedsService.createCharityNeed(fd);
      } else if (role === "DonorOrganization") {
        fd.append("ExpiryDate", form.expiryDate ? new Date(form.expiryDate).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
        await offersService.createOffer(fd);
      }

      setAddModalOpen(false);
      fetchPosts(); // Refresh list
    } catch (err) {
      setActionError(err.appMessage || "حدث خطأ أثناء إنشاء المنشور.");
      if (err.validationErrors) setFieldErrors(err.validationErrors);
    }
  }

  async function handleEditSubmit(form) {
    setActionError(null);
    setFieldErrors({});
    try {
      const fd = new FormData();
      fd.append("Category", form.category);
      fd.append("ProductName", form.title);
      fd.append("Quantity", form.quantity || 1);
      fd.append("Unit", form.unit !== undefined ? form.unit : 8);
      fd.append("Description", form.description);
      if (form.image) fd.append("ProductImage", form.image);

      if (role === "Charity") {
        fd.append("Priority", form.priority !== undefined ? form.priority : 2);
        await charityNeedsService.updateCharityNeed(editPost.id || editPost.charityNeedId || editPost.offerId, fd);
      } else if (role === "DonorOrganization") {
        fd.append("ExpiryDate", form.expiryDate ? new Date(form.expiryDate).toISOString() : editPost.expiryDate);
        await offersService.updateOffer(editPost.id || editPost.charityNeedId || editPost.offerId, fd);
      }

      setEditPost(null);
      fetchPosts();
    } catch (err) {
      setActionError(err.appMessage || "حدث خطأ أثناء تعديل المنشور.");
      if (err.validationErrors) setFieldErrors(err.validationErrors);
    }
  }

  async function handleDeleteConfirm() {
    try {
      const id = deletePost.id || deletePost.charityNeedId || deletePost.offerId;
      if (role === "Charity") {
        await charityNeedsService.deleteCharityNeed(id);
      } else if (role === "DonorOrganization") {
        await offersService.deleteOffer(id);
      }
      setDeletePost(null);
      fetchPosts();
      showToast("تم حذف المنشور بنجاح", "success");
    } catch (err) {
      showAlert("فشل الإجراء", err.appMessage || "لا يمكن حذف المنشور. يجب أن يكون قيد المراجعة.", "error");
      setDeletePost(null);
    }
  }

  async function handleFulfill(postId) {
    try {
      if (role === "Charity") {
        await charityNeedsService.fulfillCharityNeed(postId);
      } else if (role === "DonorOrganization") {
        await offersService.fulfillOffer(postId);
      }
      fetchPosts();
      showToast("تم إكمال المنشور بنجاح", "success");
    } catch (err) {
      showAlert("خطأ", err.appMessage || "حدث خطأ أثناء إكمال المنشور.", "error");
    }
  }

  return (
    <div className={styles.postsPage}>
      {/* ── Sub-header ── */}
      <div className={styles.pageActions}>
        <p className={styles.pageSubTitle}>عرض المنشورات</p>

        <div className={styles.rightControls}>
          {/* Category Filter */}
          <div className={styles.filterSelectWrapper}>
            <select
              id="category-filter"
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className={styles.filterChevron}>▼</span>
          </div>

          {/* Add button */}
          <button
            id="add-post-btn"
            className={styles.addPostBtn}
            onClick={() => {
              if (user?.verificationState !== 2) {
                showAlert("غير مسموح", "يجب تفعيل حسابك من قبل الإدارة لتتمكن من النشر.", "warning");
                return;
              }
              setAddModalOpen(true);
            }}
            aria-label="إضافة منشور جديد"
          >
            +
          </button>
        </div>
      </div>

      {actionError && <div className={styles.errorMessage}>{actionError}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* ── Grid ── */}
      {isLoading ? (
        <p>جاري التحميل...</p>
      ) : (
        <div className={styles.postsGrid}>
          {filteredPosts.length === 0 ? (
            <p className={styles.emptyState}>لا توجد منشورات في هذه الفئة</p>
          ) : (
            filteredPosts.map((post, index) => (
              <PostCard
                key={post.id || post.charityNeedId || post.offerId || index}
                post={post}
                role={role}
                onEdit={(p) => setEditPost(p)}
                onDelete={(p) => setDeletePost(p)}
                onFulfill={(id) => handleFulfill(id)}
              />
            ))
          )}
        </div>
      )}

      {/* ── Add Modal ── */}
      {addModalOpen && (
        <PostFormModal
          isOpen={addModalOpen}
          onClose={() => {
            setAddModalOpen(false);
            setFieldErrors({});
            setActionError(null);
          }}
          onSubmit={handleAddSubmit}
          initialData={null}
          role={role}
          fieldErrors={fieldErrors}
          generalError={actionError}
        />
      )}

      {/* ── Edit Modal ── */}
      {editPost && (
        <PostFormModal
          isOpen={Boolean(editPost)}
          onClose={() => {
            setEditPost(null);
            setFieldErrors({});
            setActionError(null);
          }}
          onSubmit={handleEditSubmit}
          initialData={editPost}
          role={role}
          fieldErrors={fieldErrors}
          generalError={actionError}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deletePost && (
        <DeleteConfirmModal
          isOpen={Boolean(deletePost)}
          onClose={() => setDeletePost(null)}
          onConfirm={handleDeleteConfirm}
          postTitle={deletePost?.productName || deletePost?.title || ""}
        />
      )}
    </div>
  );
}
