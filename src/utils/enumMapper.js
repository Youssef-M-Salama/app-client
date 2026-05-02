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
      3: "منتهي الصلاحية",
      4: "مكتمل"
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
