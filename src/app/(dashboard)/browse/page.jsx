"use client";

import { useState } from "react";
import styles from "@/styles/dashboard/browse.module.css";
import BrowseCard from "@/components/cards/BrowseCard";
import ApplyModal from "@/components/ui/ApplyModal";

const MOCK_ITEMS = [
  {
    id: 1,
    title: "جمعية الوسيم",
    description: "تحتاج الجمعية إلى تبرعات مالية مبالغ مالية سواء نقدية أو عن طريق تحويلات لوجود حالات متعددة في حاجة ماسة إلى إجراء العديد من العمليات (قلب مفتوح وغيرهم).",
    phone: "+965 332 554 ...",
    priority: "high",
    logo: "", // Will fall back to placeholder in component
    location: "القاهرة - مصر",
  },
  {
    id: 2,
    title: "مؤسسة ميجا خير",
    description: "تبحث المؤسسة عن أدوات صحية مواد تعقيم و ضمادات وأدوية لعلاج نزلات البرد و غيرهم تحتاج إليهم في غضون أسبوع لوجود حالات في حاجة شديدة لهذه الأدوات.",
    phone: "+965 223 485 ...",
    priority: "medium",
    logo: "",
    location: "الجيزة - مصر",
  },
  {
    id: 3,
    title: "مؤسسة مصر الخير",
    description: "تبحث المؤسسة عن أغراض للشتاء أغطية - بطاطين - جواكيت وغيرها تحتاج إلى كمية (20-50 مستلزمات الشتاء) عاجلاً نظراً إلى العديد من الأزمات الحالية و شدة برودة الشتاء.",
    phone: "+965 647 326 ...",
    priority: "high",
    logo: "",
    location: "جاردن سيتي - القاهرة",
  },
  {
    id: 4,
    title: "رسالة",
    description: "مطلوب متطوعين للمساعدة في تعبئة كراتين رمضان وتوزيعها على المحتاجين في مختلف المحافظات.",
    phone: "+965 111 222 ...",
    priority: "medium",
    logo: "",
    location: "المهندسين - الجيزة",
  }
];

export default function BrowsePage() {
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = MOCK_ITEMS.filter((item) => {
    if (filter === "all") return true;
    return item.priority === filter;
  });

  const handleApplyClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleConfirmApply = (item) => {
    console.log("Applied for item:", item.id);
    // Here we would typically send an API request to apply
    alert("تم تقديم الطلب بنجاح!");
  };

  return (
    <div className={styles.browsePage}>
      <div className={styles.pageActions}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>الأولوية :</span>
          <div className={styles.filterSelectWrapper}>
            <select
              className={styles.filterSelect}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">الجميع</option>
              <option value="high">قصوى</option>
              <option value="medium">ضرورية</option>
            </select>
            <i className={`fa-solid fa-chevron-down ${styles.filterChevron}`}></i>
          </div>
        </div>
      </div>

      <div className={styles.browseGrid}>
        {filteredItems.map((item) => (
          <BrowseCard 
            key={item.id} 
            item={item} 
            onApply={handleApplyClick} 
          />
        ))}
        {filteredItems.length === 0 && (
          <div className={styles.emptyState}>لا توجد طلبات متاحة تطابق الفلتر.</div>
        )}
      </div>

      <ApplyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleConfirmApply}
        itemData={selectedItem}
      />
    </div>
  );
}
