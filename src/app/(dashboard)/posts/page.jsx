"use client";

import { useState } from "react";
import PostCard from "@/components/cards/PostCard";
import PostFormModal from "@/components/ui/PostFormModal";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import styles from "@/styles/dashboard/posts.module.css";

// ── Mock data ──────────────────────────────────────────────
const INITIAL_POSTS = [
  {
    id: 1,
    title: "مصنع حديد عـــز",
    category: "حديد تسليح",
    description:
      "توفر كمية من حديد التسليح مختلفة الأشكال وصالحة للعديد من الأعمال. الكمية تصل إلى (80 طن) مع إمكانية إرفاق عمال محترفين لتركيبه.",
    phone: "01200000001",
    timeAgo: "2 يوم و 15 ساعة",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  },
  {
    id: 2,
    title: "مصنع حديد عـــز",
    category: "أدوات بناء",
    description:
      "توفر معدات بناء مختلفة الأشكال والاستخدامات مع إمكانية إرفاق عمال محترفين لاستخدامها.",
    phone: "01200000002",
    timeAgo: "3 أيام و 20 ساعة",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  },
  {
    id: 3,
    title: "مصنع حديد عـــز",
    category: "عمال بناء و تسليح",
    description:
      "نوفر عدد من العمال مشرعين والقيام بالعديد من أعمال البناء والتسليح وغيره. متوفرين على مدار 24 ساعة لإتمام كافة المهام.",
    phone: "01200000003",
    timeAgo: "1 يوم و 3 ساعات",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  },
  {
    id: 4,
    title: "مصنع حديد عـــز",
    category: "حديد تسليح",
    description:
      "متوفر حديد تسليح بجودة عالية وأسعار تنافسية. التوصيل متاح لجميع المحافظات.",
    phone: "01200000004",
    timeAgo: "5 أيام و 10 ساعات",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  },
  {
    id: 5,
    title: "مصنع حديد عـــز",
    category: "أدوات بناء",
    description:
      "نوفر جميع أدوات البناء اللازمة مع فريق متخصص لمساعدتك في كل مرحلة من مراحل الإنشاء.",
    phone: "01200000005",
    timeAgo: "7 أيام و 2 ساعة",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  },
  {
    id: 6,
    title: "مصنع حديد عـــز",
    category: "عمال بناء و تسليح",
    description:
      "فريق من المهندسين والعمال المتخصصين في أعمال البناء والتشطيب متاح للتعاقد.",
    phone: "01200000006",
    timeAgo: "10 أيام",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  },
];

const CATEGORIES = ["جميع المنشورات", "حديد تسليح", "أدوات بناء", "عمال بناء و تسليح"];

export default function PostsPage() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [filter, setFilter] = useState("جميع المنشورات");

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editPost, setEditPost] = useState(null);   // post object or null
  const [deletePost, setDeletePost] = useState(null); // post object or null

  // ── Derived ──
  const filteredPosts =
    filter === "جميع المنشورات"
      ? posts
      : posts.filter((p) => p.category === filter);

  // ── Handlers ──
  function handleAddSubmit(form) {
    const newPost = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      description: form.description,
      phone: form.phone,
      timeAgo: "الآن",
      image:
        form.imagePreview ||
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
    };
    setPosts((prev) => [newPost, ...prev]);
    setAddModalOpen(false);
  }

  function handleEditSubmit(form) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === editPost.id
          ? {
              ...p,
              title: form.title,
              category: form.category,
              description: form.description,
              phone: form.phone,
              image: form.imagePreview || p.image,
            }
          : p
      )
    );
    setEditPost(null);
  }

  function handleDeleteConfirm() {
    setPosts((prev) => prev.filter((p) => p.id !== deletePost.id));
    setDeletePost(null);
  }

  return (
    <div className={styles.postsPage}>
      {/* ── Sub-header ── */}
      <div className={styles.pageActions}>
        <p className={styles.pageSubTitle}>عرض المنشورات</p>

        <div className={styles.rightControls}>
          {/* Filter */}
          <div className={styles.filterSelectWrapper}>
            <select
              id="posts-filter-select"
              className={styles.filterSelect}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
            onClick={() => setAddModalOpen(true)}
            aria-label="إضافة منشور جديد"
          >
            +
          </button>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className={styles.postsGrid}>
        {filteredPosts.length === 0 ? (
          <p className={styles.emptyState}>لا توجد منشورات في هذه الفئة</p>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={(p) => setEditPost(p)}
              onDelete={(p) => setDeletePost(p)}
            />
          ))
        )}
      </div>

      {/* ── Add Modal ── */}
      <PostFormModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        initialData={null}
      />

      {/* ── Edit Modal ── */}
      <PostFormModal
        isOpen={Boolean(editPost)}
        onClose={() => setEditPost(null)}
        onSubmit={handleEditSubmit}
        initialData={editPost}
      />

      {/* ── Delete Confirm ── */}
      <DeleteConfirmModal
        isOpen={Boolean(deletePost)}
        onClose={() => setDeletePost(null)}
        onConfirm={handleDeleteConfirm}
        postTitle={deletePost?.title || ""}
      />
    </div>
  );
}
