"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/ui/verification-banner.module.css";

const VerificationBanner = () => {
  const { user } = useAuth();
  const state = user?.verificationState;

  // Only show banner if NOT verified (2)
  if (state === 2 || state === undefined) return null;

  const getBannerContent = () => {
    switch (state) {
      case 0: // Pending
        return {
          title: "حسابك قيد الانتظار",
          message: "شكراً لتسجيلك! حسابك الآن بانتظار المراجعة من قبل الإدارة. ستتمكن من استخدام كافة المميزات قريباً.",
          type: "pending",
          icon: "fa-solid fa-hourglass-start"
        };
      case 1: // InReview
        return {
          title: "حسابك قيد المراجعة",
          message: "يقوم فريق الإدارة حالياً بمراجعة مستنداتك وتوثيق حسابك. سنقوم بإبلاغك فور الانتهاء.",
          type: "review",
          icon: "fa-solid fa-magnifying-glass-chart"
        };
      case 3: // Rejected
        return {
          title: "تم رفض التوثيق",
          message: "نأسف، تم رفض طلب توثيق حسابك بسبب نقص في البيانات أو المستندات. يرجى مراجعة قسم التوثيق في ملفك الشخصي.",
          type: "rejected",
          icon: "fa-solid fa-circle-exclamation"
        };
      default:
        return null;
    }
  };

  const content = getBannerContent();
  if (!content) return null;

  return (
    <div className={`${styles.banner} ${styles[content.type]}`}>
      <div className={styles.icon}>
        <i className={content.icon}></i>
      </div>
      <div className={styles.text}>
        <h4 className={styles.title}>{content.title}</h4>
        <p className={styles.message}>{content.message}</p>
      </div>
    </div>
  );
};

export default VerificationBanner;
