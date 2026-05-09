export const mapCategory = (categoryInt) => {
  const map = {
    0: "طعام",
    1: "ملابس",
    2: "طبي",
    3: "تعليمي",
    4: "أخرى"
  };
  return map[categoryInt] || "غير معروف";
};

export const mapStatus = (statusInt, isOffer = false) => {
  if (isOffer) {
    const map = {
      0: "قيد المراجعة",
      1: "مقبول",
      2: "مرفوض",
      3: "مكتمل",
      4: "منتهي الصلاحية"
    };
    return map[statusInt] || "غير معروف";
  } else {
    const map = {
      0: "قيد المراجعة",
      1: "مقبول",
      2: "مرفوض",
      3: "مكتمل"
    };
    return map[statusInt] || "غير معروف";
  }
};

export const mapPriority = (priorityInt) => {
  const map = {
    0: "عاجل",
    1: "عالي",
    2: "عادي",
    3: "منخفض"
  };
  return map[priorityInt] || "غير معروف";
};

export const mapApplicationStatus = (statusInt) => {
  const map = {
    0: "قيد الانتظار",
    1: "مقبول",
    2: "مرفوض"
  };
  return map[statusInt] || "غير معروف";
};

export const mapUnit = (unitInt) => {
  const map = {
    0: "طن",
    1: "كجم",
    2: "جرام",
    3: "لتر",
    4: "مللتر",
    5: "عبوة",
    6: "صندوق",
    7: "علبة",
    8: "قطعة"
  };
  return map[unitInt] || "غير معروف";
};
