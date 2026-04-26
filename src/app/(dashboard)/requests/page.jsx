"use client";

import { useState } from "react";
import styles from "@/styles/dashboard/requests.module.css";
import RequestListCard from "@/components/cards/RequestListCard";
import RequestActionModal from "@/components/ui/RequestActionModal";

const MOCK_REQUESTS = [
  {
    id: 1,
    title: "مؤسسة مصر الخير",
    date: "5 فبراير 2026",
    typeLabel: "العرض:",
    description: "رأينا إعلان المؤسسة في المنشورات عن تقديمها لعدد من مؤن الشتاء والأغطية وتحتاج المؤسسة لدينا إلى هذا العرض لوجود العديد من الحالات في حاجة شديدة إليها لتجنب بها برودة الشتاء",
    phone: "+965 332 554 ...",
    location: "القاهرة - حي المهندسين",
    logo: "", // Fallback
  },
  {
    id: 2,
    title: "مؤسسة فرصة حياة",
    date: "20 فبراير 2026",
    typeLabel: "العرض:",
    description: "رأينا إعلان المؤسسة في المنشورات عن عرضها لعديد من قطع الأثاث وتحتاج المؤسسة لدينا إلى هذا العرض لوجود العديد من الحالات في حاجة ماسة إليها وأيضاً لتجهيز أشخاص لعرسهم",
    phone: "+965 223 485 ...",
    location: "القاهرة - المعادي",
    logo: "",
  },
  {
    id: 3,
    title: "مؤسسة كريمة العلا",
    date: "5 فبراير 2026",
    typeLabel: "العرض:",
    description: "رأينا إعلان المؤسسة في المنشورات عن تقديمها لعدد من أدوات البناء وتحتاج المؤسسة لدينا إلى هذا العرض لوجود حالات متضررة جداً من أمطار الشتاء وتحتاج إصلاحات عديدة",
    phone: "+965 111 222 ...",
    location: "الجيزة - الدقي",
    logo: "",
  }
];

export default function RequestsPage() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [filter, setFilter] = useState("all");
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState(null); // 'accept' or 'reject'

  const handleOpenAccept = (item) => {
    setSelectedItem(item);
    setActionType("accept");
    setModalOpen(true);
  };

  const handleOpenReject = (item) => {
    setSelectedItem(item);
    setActionType("reject");
    setModalOpen(true);
  };

  const handleConfirmAction = (item, type) => {
    // type is "accept" or "reject"
    console.log(`Action: ${type} for request ID: ${item.id}`);
    
    // Remove the item from the list to simulate processing
    setRequests((prev) => prev.filter((r) => r.id !== item.id));
    
    // Typically show a success toast here
  };

  return (
    <div className={styles.requestsPage}>
      
      {/* Header / Filter */}
      <div className={styles.pageActions}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>نوع العرض :</span>
          <div className={styles.filterSelectWrapper}>
            <select
              className={styles.filterSelect}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">جميع العروض</option>
            </select>
            <i className={`fa-solid fa-chevron-down ${styles.filterChevron}`}></i>
          </div>
        </div>
      </div>

      {/* List */}
      <div className={styles.requestsList}>
        {requests.map((req) => (
          <RequestListCard 
            key={req.id} 
            request={req} 
            onAccept={handleOpenAccept}
            onReject={handleOpenReject}
          />
        ))}
        
        {requests.length === 0 && (
          <div className={styles.emptyState}>لا توجد طلبات واردة حالياً.</div>
        )}
      </div>

      {/* Action Modal */}
      <RequestActionModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmAction}
        itemData={selectedItem}
        actionType={actionType}
      />

    </div>
  );
}
