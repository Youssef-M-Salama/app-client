"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import profileService from '@/services/profileService';
import { useAlert } from '@/context/AlertContext';
import styles from '@/styles/profile/ProfileForm.module.css';

// ─── Egypt Data: Governorates & Cities ───────────────────────────────────────
const EGYPT_DATA = {
  "القاهرة": ["القاهرة", "حلوان", "مدينة نصر", "المعادي", "الشروق", "القاهرة الجديدة", "بدر", "15 مايو"],
  "الجيزة": ["الجيزة", "6 أكتوبر", "الشيخ زايد", "الحوامدية", "البدرشين", "العياط", "أوسيم", "كرداسة"],
  "الإسكندرية": ["الإسكندرية", "برج العرب", "العامرية"],
  "الدقهلية": ["المنصورة", "ميت غمر", "طلخا", "دكرنس", "السنبلاوين", "المنزلة", "بلقاس"],
  "البحر الأحمر": ["الغردقة", "مرسى علم", "القصير", "سفاجا", "رأس غارب"],
  "البحيرة": ["دمنهور", "كفر الدوار", "رشيد", "إيتاي البارود", "أبو المطامير", "حوش عيسى"],
  "الفيوم": ["الفيوم", "سنورس", "إطسا", "أبشواي"],
  "الغربية": ["طنطا", "المحلة الكبرى", "كفر الزيات", "زفتى", "السنطة", "بسيون"],
  "الإسماعيلية": ["الإسماعيلية", "فايد", "القنطرة شرق", "القنطرة غرب"],
  "المنوفية": ["شبين الكوم", "السادات", "منوف", "أشمون", "الباجور", "قويسنا"],
  "المنيا": ["المنيا", "ملوي", "بني مزار", "سمالوط", "دير مواس"],
  "القليوبية": ["بنها", "شبرا الخيمة", "القناطر الخيرية", "طوخ", "قليوب", "الخانكة"],
  "الوادي الجديد": ["الخارجة", "الداخلة", "الفرافرة", "باريس"],
  "السويس": ["السويس", "عتاقة"],
  "أسوان": ["أسوان", "كوم أمبو", "إدفو", "دراو", "أبو سمبل"],
  "أسيوط": ["أسيوط", "ديروط", "القوصية", "أبنوب"],
  "بني سويف": ["بني سويف", "الواسطى", "ناصر", "سمسطا"],
  "بورسعيد": ["بورسعيد", "بورفؤاد"],
  "دمياط": ["دمياط", "دمياط الجديدة", "رأس البر", "فارسكور", "الزرقا", "كفر سعد", "كفر البطيخ", "الروضه", "السرو", "ميت ابو غالب"],
  "الشرقية": ["الزقازيق", "العاشر من رمضان", "بلبيس", "فاقوس", "أبو حماد", "منيا القمح", "ههيا", "كفر صقر"],
  "جنوب سيناء": ["شرم الشيخ", "الطور", "دهب", "نويبع", "سانت كاترين"],
  "كفر الشيخ": ["كفر الشيخ", "دسوق", "فوه", "مطوبس", "بيلا", "سيدي سالم"],
  "مطروح": ["مرسى مطروح", "الحمام", "الضبعة", "سيدي براني", "العلمين"],
  "الأقصر": ["الأقصر", "إسنا", "أرمنت"],
  "قنا": ["قنا", "نجع حمادي", "قفط", "دشنا"],
  "شمال سيناء": ["العريش", "الشيخ زويد", "رفح", "بئر العبد"],
  "سوهاج": ["سوهاج", "جرجا", "طهطا", "البلينا"],
};

// ─── ACCURATE CITY COORDINATES DATABASE ─────────────────────────────────────
const CITY_COORDS = {
  // ── Damietta Governorate ────────────────────────────────────────────────
  "دمياط": { lat: 31.4175, lng: 31.8144, radiusKm: 4, aliases: ["دمياط المدينة", "مدينة دمياط"] },
  "دمياط الجديدة": { lat: 31.4368, lng: 31.6670, radiusKm: 5, aliases: ["نيو دمياط", "دامياط الجديدة", "المدينة الجديدة"] },
  "رأس البر": { lat: 31.5250, lng: 31.8406, radiusKm: 3, aliases: ["راس البر", "رأس البر السياحية"] },
  "فارسكور": { lat: 31.3297, lng: 31.7147, radiusKm: 6, aliases: ["فارس كور"] },
  "الزرقا": { lat: 31.2082, lng: 31.6350, radiusKm: 8, aliases: ["الزرقى", "مركز الزرقا"] },
  "كفر سعد": { lat: 31.3557, lng: 31.6848, radiusKm: 7, aliases: ["كفرسعد"] },
  "كفر البطيخ": { lat: 31.4040, lng: 31.7378, radiusKm: 6, aliases: ["كفرالبطيخ", "كفر البطيخ الجديدة"] },
  "الروضة": { lat: 31.3234, lng: 31.7612, radiusKm: 4, aliases: ["الروضه", "عزبة الروضة"] },
  "السرو": { lat: 31.2387, lng: 31.6538, radiusKm: 5, aliases: ["السروو", "مدينة السرو"] },
  "ميت ابو غالب": { lat: 31.2884, lng: 31.6772, radiusKm: 5, aliases: ["ميت أبو غالب", "ميتابوغالب"] },

  // ── Cairo Governorate ───────────────────────────────────────────────────
  "القاهرة": { lat: 30.0444, lng: 31.2357, radiusKm: 8, aliases: ["وسط القاهرة", "القاهرة الوسطى"] },
  "حلوان": { lat: 29.8500, lng: 31.3333, radiusKm: 6, aliases: ["مدينة حلوان"] },
  "مدينة نصر": { lat: 30.0626, lng: 31.3462, radiusKm: 5, aliases: ["النصر", "مدينه نصر"] },
  "المعادي": { lat: 29.9602, lng: 31.2569, radiusKm: 4, aliases: ["معادي", "المعادى"] },
  "الشروق": { lat: 30.1286, lng: 31.6103, radiusKm: 7, aliases: ["مدينة الشروق"] },
  "القاهرة الجديدة": { lat: 30.0272, lng: 31.4913, radiusKm: 8, aliases: ["نيو كايرو", "التجمع"] },
  "بدر": { lat: 30.1269, lng: 31.7053, radiusKm: 10, aliases: ["مدينة بدر"] },
  "15 مايو": { lat: 29.9097, lng: 31.2858, radiusKm: 5, aliases: ["خمسة عشر مايو", "15-5"] },

  // ── Giza Governorate ────────────────────────────────────────────────────
  "الجيزة": { lat: 30.0131, lng: 31.2089, radiusKm: 7, aliases: ["مدينة الجيزة"] },
  "6 أكتوبر": { lat: 29.9537, lng: 30.9383, radiusKm: 10, aliases: ["أكتوبر", "مدينة 6 اكتوبر", "السادس من أكتوبر"] },
  "الشيخ زايد": { lat: 30.0254, lng: 30.9714, radiusKm: 6, aliases: ["زايد", "مدينة الشيخ زايد"] },
  "الحوامدية": { lat: 29.9056, lng: 31.2597, radiusKm: 5, aliases: ["حوامدية"] },
  "البدرشين": { lat: 29.7667, lng: 31.2833, radiusKm: 6, aliases: ["بدرشين"] },
  "العياط": { lat: 29.7333, lng: 31.1667, radiusKm: 7, aliases: ["العياط المركز"] },
  "أوسيم": { lat: 30.0500, lng: 31.0500, radiusKm: 5, aliases: ["أوسيم المركز"] },
  "كرداسة": { lat: 30.0333, lng: 31.1167, radiusKm: 4, aliases: ["كرداسه"] },

  // ── Alexandria Governorate ──────────────────────────────────────────────
  "الإسكندرية": { lat: 31.2001, lng: 29.9187, radiusKm: 10, aliases: ["اسكندرية", "الإسكندريه", "السكندرية"] },
  "برج العرب": { lat: 30.9175, lng: 29.5594, radiusKm: 8, aliases: ["برج العرب الجديدة", "مدينة برج العرب"] },
  "العامرية": { lat: 31.0333, lng: 29.8167, radiusKm: 5, aliases: ["عامرية"] },

  // ── Dakahlia Governorate ────────────────────────────────────────────────
  "المنصورة": { lat: 31.0364, lng: 31.3807, radiusKm: 7, aliases: ["مدينه المنصوره"] },
  "ميت غمر": { lat: 30.7167, lng: 31.2667, radiusKm: 6, aliases: ["ميتغمر"] },
  "طلخا": { lat: 31.0547, lng: 31.2889, radiusKm: 5, aliases: ["طلخا المركز"] },
  "دكرنس": { lat: 31.0833, lng: 31.1000, radiusKm: 5, aliases: ["دكرنس المركز"] },
  "السنبلاوين": { lat: 30.9333, lng: 31.5167, radiusKm: 6, aliases: ["سنبلاوين"] },
  "المنزلة": { lat: 31.1167, lng: 31.8167, radiusKm: 5, aliases: ["منزلة"] },
  "بلقاس": { lat: 31.2167, lng: 31.4167, radiusKm: 5, aliases: ["بلقاس المركز"] },

  // ── Red Sea Governorate ─────────────────────────────────────────────────
  "الغردقة": { lat: 27.2579, lng: 33.8116, radiusKm: 12, aliases: ["Hurghada", "الغردقه"] },
  "مرسى علم": { lat: 25.0636, lng: 34.8942, radiusKm: 15, aliases: ["مرسي علم", "مرسى-علم"] },
  "القصير": { lat: 26.1036, lng: 34.2844, radiusKm: 8, aliases: ["القصير المدينة"] },
  "سفاجا": { lat: 26.7500, lng: 33.9333, radiusKm: 10, aliases: ["سفاجا المدينة"] },
  "رأس غارب": { lat: 28.3500, lng: 33.1167, radiusKm: 8, aliases: ["راس غارب"] },

  // ── Beheira Governorate ─────────────────────────────────────────────────
  "دمنهور": { lat: 31.0341, lng: 30.4682, radiusKm: 6, aliases: ["دمنهور المدينة"] },
  "كفر الدوار": { lat: 31.1333, lng: 30.1167, radiusKm: 5, aliases: ["كفرالدوار"] },
  "رشيد": { lat: 31.4000, lng: 30.4167, radiusKm: 4, aliases: ["رشيد المدينة", "روشتا"] },
  "إيتاي البارود": { lat: 30.8167, lng: 30.6167, radiusKm: 6, aliases: ["ايتاي البارود"] },
  "أبو المطامير": { lat: 30.7167, lng: 30.3833, radiusKm: 7, aliases: ["ابو المطامير"] },
  "حوش عيسى": { lat: 30.8667, lng: 30.3000, radiusKm: 5, aliases: ["حوش عيسى المركز"] },

  // ── Fayoum Governorate ──────────────────────────────────────────────────
  "الفيوم": { lat: 29.3084, lng: 30.8428, radiusKm: 8, aliases: ["الفيوم المدينة"] },
  "سنورس": { lat: 29.4167, lng: 30.8167, radiusKm: 5, aliases: ["سنورس المركز"] },
  "إطسا": { lat: 29.2833, lng: 30.7333, radiusKm: 5, aliases: ["اطسا"] },
  "أبشواي": { lat: 29.4333, lng: 30.9167, radiusKm: 6, aliases: ["ابشواي"] },

  // ── Gharbia Governorate ─────────────────────────────────────────────────
  "طنطا": { lat: 30.7865, lng: 31.0004, radiusKm: 7, aliases: ["طنطا المدينة"] },
  "المحلة الكبرى": { lat: 30.9707, lng: 31.1669, radiusKm: 6, aliases: ["المحلة", "محلة الكبرى"] },
  "كفر الزيات": { lat: 30.8167, lng: 30.8167, radiusKm: 5, aliases: ["كفرالزيات"] },
  "زفتى": { lat: 30.7167, lng: 31.2500, radiusKm: 5, aliases: ["زفتى المركز"] },
  "السنطة": { lat: 30.8833, lng: 31.1833, radiusKm: 4, aliases: ["السنطة المركز"] },
  "بسيون": { lat: 30.9167, lng: 31.0500, radiusKm: 5, aliases: ["بسيون المركز"] },

  // ── Ismailia Governorate ────────────────────────────────────────────────
  "الإسماعيلية": { lat: 30.5965, lng: 32.2715, radiusKm: 8, aliases: ["اسماعيلية", "الإسماعيليه"] },
  "فايد": { lat: 30.3167, lng: 32.3000, radiusKm: 6, aliases: ["فايد المركز"] },
  "القنطرة شرق": { lat: 30.8333, lng: 32.3167, radiusKm: 5, aliases: ["قنطرة شرق"] },
  "القنطرة غرب": { lat: 30.8167, lng: 32.2833, radiusKm: 5, aliases: ["قنطرة غرب"] },

  // ── Menoufia Governorate ────────────────────────────────────────────────
  "شبين الكوم": { lat: 30.5594, lng: 31.0118, radiusKm: 6, aliases: ["شبين الكوم المدينة"] },
  "السادات": { lat: 30.3667, lng: 30.5833, radiusKm: 12, aliases: ["مدينة السادات"] },
  "منوف": { lat: 30.5333, lng: 30.9333, radiusKm: 5, aliases: ["منوف المركز"] },
  "أشمون": { lat: 30.3000, lng: 31.0167, radiusKm: 6, aliases: ["أشمون المركز"] },
  "الباجور": { lat: 30.4167, lng: 31.0833, radiusKm: 5, aliases: ["الباجور المركز"] },
  "قويسنا": { lat: 30.4667, lng: 31.1667, radiusKm: 5, aliases: ["قويسنا المركز"] },

  // ── Minya Governorate ───────────────────────────────────────────────────
  "المنيا": { lat: 28.1099, lng: 30.7503, radiusKm: 8, aliases: ["المنيا المدينة"] },
  "ملوي": { lat: 28.3833, lng: 30.7000, radiusKm: 6, aliases: ["ملوي المركز"] },
  "بني مزار": { lat: 28.5000, lng: 30.8000, radiusKm: 5, aliases: ["بنى مزار"] },
  "سمالوط": { lat: 28.2167, lng: 30.7167, radiusKm: 5, aliases: ["سمالوط المركز"] },
  "دير مواس": { lat: 28.0833, lng: 30.9167, radiusKm: 6, aliases: ["دير مواس المركز"] },

  // ── Qalyubia Governorate ────────────────────────────────────────────────
  "بنها": { lat: 30.4667, lng: 31.1833, radiusKm: 6, aliases: ["بنها المدينة"] },
  "شبرا الخيمة": { lat: 30.1286, lng: 31.2442, radiusKm: 5, aliases: ["شبرا", "شبرا الخيمة الجديدة"] },
  "القناطر الخيرية": { lat: 30.1833, lng: 31.1333, radiusKm: 4, aliases: ["قناطر خيرية"] },
  "طوخ": { lat: 30.3333, lng: 31.2000, radiusKm: 6, aliases: ["طوخ المركز"] },
  "قليوب": { lat: 30.1833, lng: 31.2167, radiusKm: 4, aliases: ["قليوب المركز"] },
  "الخانكة": { lat: 30.2167, lng: 31.3667, radiusKm: 5, aliases: ["خانكة"] },

  // ── New Valley Governorate ──────────────────────────────────────────────
  "الخارجة": { lat: 25.4500, lng: 30.5333, radiusKm: 15, aliases: ["واحة الخارجة", "الخارجة الواحة"] },
  "الداخلة": { lat: 25.5000, lng: 29.0000, radiusKm: 20, aliases: ["واحة الداخلة"] },
  "الفرافرة": { lat: 27.0500, lng: 27.9667, radiusKm: 25, aliases: ["واحة الفرافرة"] },
  "باريس": { lat: 25.2833, lng: 30.6667, radiusKm: 10, aliases: ["باريس الواحة"] },

  // ── Suez Governorate ────────────────────────────────────────────────────
  "السويس": { lat: 29.9668, lng: 32.5498, radiusKm: 8, aliases: ["السويس المدينة"] },
  "عتاقة": { lat: 29.8833, lng: 32.5167, radiusKm: 6, aliases: ["عتاقة المركز"] },

  // ── Aswan Governorate ───────────────────────────────────────────────────
  "أسوان": { lat: 24.0889, lng: 32.8998, radiusKm: 10, aliases: ["أسوان المدينة"] },
  "كوم أمبو": { lat: 24.4667, lng: 32.9500, radiusKm: 8, aliases: ["كوم امبو"] },
  "إدفو": { lat: 24.9833, lng: 32.8833, radiusKm: 7, aliases: ["ادفو", "إدفو المدينة"] },
  "دراو": { lat: 24.5167, lng: 32.9167, radiusKm: 6, aliases: ["دراو المركز"] },
  "أبو سمبل": { lat: 22.3372, lng: 31.6258, radiusKm: 15, aliases: ["ابو سمبل", "أبوسمبل"] },

  // ── Assiut Governorate ──────────────────────────────────────────────────
  "أسيوط": { lat: 27.1809, lng: 31.1837, radiusKm: 8, aliases: ["أسيوط المدينة"] },
  "ديروط": { lat: 27.2833, lng: 30.9667, radiusKm: 6, aliases: ["ديروط المركز"] },
  "القوصية": { lat: 27.4333, lng: 30.8333, radiusKm: 7, aliases: ["القوصية المركز"] },
  "أبنوب": { lat: 27.2667, lng: 31.1500, radiusKm: 5, aliases: ["أبنوب المركز"] },

  // ── Beni Suef Governorate ───────────────────────────────────────────────
  "بني سويف": { lat: 29.0661, lng: 31.0994, radiusKm: 7, aliases: ["بنى سويف", "بني سويف المدينة"] },
  "الواسطى": { lat: 29.2333, lng: 31.1167, radiusKm: 6, aliases: ["الواسطى المركز"] },
  "ناصر": { lat: 29.0500, lng: 30.9333, radiusKm: 5, aliases: ["ناصر بني سويف"] },
  "سمسطا": { lat: 29.1167, lng: 30.9833, radiusKm: 5, aliases: ["سمسطا المركز"] },

  // ── Port Said Governorate ───────────────────────────────────────────────
  // FIX: Port Said (west bank) and Port Fouad (east bank/Sinai) are only ~3.5km apart.
  // They are separated by the Suez Canal at ~lng 32.310.
  // lngMax on Port Said = only matches clicks WEST of canal.
  // lngMin on Port Fouad = only matches clicks EAST of canal.
  "بورسعيد": {
    lat: 31.26250,
    lng: 32.30611,
    radiusKm: 1.5,
    aliases: ["بور سعيد", "بورسعيد المدينة", "port said", "portsaid"],
    lngMax: 32.310,   // WEST of Suez Canal only
  },
  "بورفؤاد": {
    lat: 31.25000,
    lng: 32.31700,
    radiusKm: 1.5,
    aliases: ["بور فؤاد", "بورفؤاد المدينة", "بور فواد", "port fouad", "port fuad"],
    lngMin: 32.310,   // EAST of Suez Canal only (Sinai side)
  },

  // ── Sharqia Governorate ─────────────────────────────────────────────────
  "الزقازيق": { lat: 30.5877, lng: 31.5021, radiusKm: 7, aliases: ["زقازيق", "الزقازيق المدينة"] },
  "العاشر من رمضان": { lat: 30.2833, lng: 31.7333, radiusKm: 10, aliases: ["10 رمضان", "مدينة العاشر من رمضان"] },
  "بلبيس": { lat: 30.4167, lng: 31.5667, radiusKm: 6, aliases: ["بلبيس المركز"] },
  "فاقوس": { lat: 30.7333, lng: 31.8000, radiusKm: 7, aliases: ["فاقوس المركز"] },
  "أبو حماد": { lat: 30.7167, lng: 31.6833, radiusKm: 6, aliases: ["ابو حماد"] },
  "منيا القمح": { lat: 30.6167, lng: 31.4333, radiusKm: 5, aliases: ["منيا القمح المركز"] },
  "ههيا": { lat: 30.5667, lng: 31.7000, radiusKm: 6, aliases: ["ههيا المركز"] },
  "كفر صقر": { lat: 30.8000, lng: 31.6333, radiusKm: 5, aliases: ["كفر صقر المركز"] },

  // ── South Sinai Governorate ─────────────────────────────────────────────
  "شرم الشيخ": { lat: 27.9158, lng: 34.3300, radiusKm: 15, aliases: ["شرم الشيخ المدينة", "Sharm El Sheikh"] },
  "الطور": { lat: 28.2333, lng: 33.6167, radiusKm: 10, aliases: ["الطور سيناء"] },
  "دهب": { lat: 28.5000, lng: 34.5167, radiusKm: 8, aliases: ["دهب المدينة"] },
  "نويبع": { lat: 29.0333, lng: 34.6667, radiusKm: 12, aliases: ["نويبع المدينة"] },
  "سانت كاترين": { lat: 28.5556, lng: 33.9494, radiusKm: 20, aliases: ["سانت كاترين", "جبل موسى"] },

  // ── Kafr El-Sheikh Governorate ──────────────────────────────────────────
  "كفر الشيخ": { lat: 31.1107, lng: 30.9388, radiusKm: 7, aliases: ["كفرالشيخ", "كفر الشيخ المدينة"] },
  "دسوق": { lat: 31.1333, lng: 30.6500, radiusKm: 6, aliases: ["دسوق المركز"] },
  "فوه": { lat: 31.2167, lng: 30.6500, radiusKm: 5, aliases: ["فوه المركز"] },
  "مطوبس": { lat: 31.3000, lng: 30.8833, radiusKm: 6, aliases: ["مطوبس المركز"] },
  "بيلا": { lat: 31.2167, lng: 31.0167, radiusKm: 5, aliases: ["بيلا المركز"] },
  "سيدي سالم": { lat: 31.1500, lng: 30.7833, radiusKm: 5, aliases: ["سيدي سالم المركز"] },

  // ── Matrouh Governorate ─────────────────────────────────────────────────
  "مرسى مطروح": { lat: 31.3543, lng: 27.2373, radiusKm: 12, aliases: ["مرسى مطروح المدينة", "مطروح"] },
  "الحمام": { lat: 31.1833, lng: 28.0500, radiusKm: 8, aliases: ["الحمام الساحل"] },
  "الضبعة": { lat: 30.9833, lng: 28.4167, radiusKm: 10, aliases: ["الضبعة المركز"] },
  "سيدي براني": { lat: 31.6167, lng: 25.9167, radiusKm: 15, aliases: ["سيدي براني المركز"] },
  "العلمين": { lat: 30.8333, lng: 28.9500, radiusKm: 10, aliases: ["العلمين الجديدة", "العلمين السياحية"] },

  // ── Luxor Governorate ───────────────────────────────────────────────────
  "الأقصر": { lat: 25.6872, lng: 32.6396, radiusKm: 10, aliases: ["اقصر", "الأقصر المدينة"] },
  "إسنا": { lat: 25.2833, lng: 32.5500, radiusKm: 8, aliases: ["اسنا", "إسنا المدينة"] },
  "أرمنت": { lat: 25.6167, lng: 32.5333, radiusKm: 6, aliases: ["أرمنت المركز"] },

  // ── Qena Governorate ────────────────────────────────────────────────────
  "قنا": { lat: 26.1651, lng: 32.7160, radiusKm: 8, aliases: ["قنا المدينة"] },
  "نجع حمادي": { lat: 26.0500, lng: 32.5500, radiusKm: 7, aliases: ["نجع حمادى", "نجع-حمادي"] },
  "قفط": { lat: 25.9167, lng: 32.7167, radiusKm: 6, aliases: ["قفط المركز"] },
  "دشنا": { lat: 26.1333, lng: 32.4833, radiusKm: 6, aliases: ["دشنا المركز"] },

  // ── North Sinai Governorate ─────────────────────────────────────────────
  "العريش": { lat: 31.1333, lng: 33.8000, radiusKm: 12, aliases: ["العريش المدينة"] },
  "الشيخ زويد": { lat: 31.2833, lng: 34.1167, radiusKm: 10, aliases: ["شيخ زويد"] },
  "رفح": { lat: 31.2833, lng: 34.2500, radiusKm: 8, aliases: ["رفح المدينة"] },
  "بئر العبد": { lat: 30.9833, lng: 33.5500, radiusKm: 15, aliases: ["بئر العبد المركز"] },

  // ── Sohag Governorate ───────────────────────────────────────────────────
  "سوهاج": { lat: 26.5590, lng: 31.6948, radiusKm: 8, aliases: ["سوهاج المدينة"] },
  "جرجا": { lat: 26.3333, lng: 31.8833, radiusKm: 7, aliases: ["جرجا المركز"] },
  "طهطا": { lat: 26.7667, lng: 31.5000, radiusKm: 6, aliases: ["طهطا المركز"] },
  "البلينا": { lat: 26.2333, lng: 31.7000, radiusKm: 6, aliases: ["البلينا المركز"] },
};

// ─── Governorate Centers with Zoom Levels ──────────────────────────────────
const EGYPT_GOVS = [
  { name: 'القاهرة', lat: 30.0444, lng: 31.2357, zoom: 11 },
  { name: 'الجيزة', lat: 30.0131, lng: 31.2089, zoom: 10 },
  { name: 'الإسكندرية', lat: 31.2001, lng: 29.9187, zoom: 11 },
  { name: 'الدقهلية', lat: 31.0364, lng: 31.3807, zoom: 10 },
  { name: 'الشرقية', lat: 30.5877, lng: 31.5021, zoom: 9 },
  { name: 'القليوبية', lat: 30.4667, lng: 31.1833, zoom: 10 },
  { name: 'الغربية', lat: 30.7865, lng: 31.0004, zoom: 10 },
  { name: 'المنوفية', lat: 30.5594, lng: 31.0118, zoom: 10 },
  { name: 'كفر الشيخ', lat: 31.1107, lng: 30.9388, zoom: 10 },
  { name: 'البحيرة', lat: 31.0341, lng: 30.4682, zoom: 9 },
  { name: 'الإسماعيلية', lat: 30.5965, lng: 32.2715, zoom: 10 },
  { name: 'بورسعيد', lat: 31.2625, lng: 32.3061, zoom: 13 },
  { name: 'السويس', lat: 29.9668, lng: 32.5498, zoom: 11 },
  { name: 'دمياط', lat: 31.4175, lng: 31.8144, zoom: 11 },
  { name: 'مطروح', lat: 31.3543, lng: 27.2373, zoom: 8 },
  { name: 'شمال سيناء', lat: 31.1333, lng: 33.8000, zoom: 9 },
  { name: 'جنوب سيناء', lat: 27.9158, lng: 34.3300, zoom: 8 },
  { name: 'الفيوم', lat: 29.3084, lng: 30.8428, zoom: 10 },
  { name: 'بني سويف', lat: 29.0661, lng: 31.0994, zoom: 10 },
  { name: 'المنيا', lat: 28.1099, lng: 30.7503, zoom: 9 },
  { name: 'أسيوط', lat: 27.1809, lng: 31.1837, zoom: 10 },
  { name: 'سوهاج', lat: 26.5590, lng: 31.6948, zoom: 10 },
  { name: 'قنا', lat: 26.1651, lng: 32.7160, zoom: 10 },
  { name: 'الأقصر', lat: 25.6872, lng: 32.6396, zoom: 11 },
  { name: 'أسوان', lat: 24.0889, lng: 32.8998, zoom: 10 },
  { name: 'البحر الأحمر', lat: 27.2579, lng: 33.8116, zoom: 7 },
  { name: 'الوادي الجديد', lat: 25.4500, lng: 30.5333, zoom: 7 },
];

// ─── Egypt Bounds & Center ─────────────────────────────────────────────────
const EGYPT_BOUNDS = [[22.0, 24.7], [31.8, 37.2]];
const EGYPT_CENTER = [26.8, 30.5];

// ─── Search Index ───────────────────────────────────────────────────────────
const SEARCH_INDEX = [];
Object.entries(EGYPT_DATA).forEach(([govName, cities]) => {
  const govCoords = EGYPT_GOVS.find(g => g.name === govName);
  SEARCH_INDEX.push({
    label: govName, sublabel: 'محافظة',
    lat: govCoords?.lat || 30.5, lng: govCoords?.lng || 31.0,
    zoom: govCoords?.zoom || 9,
    gov: govName, city: '', isCity: false, isGov: true,
  });
  cities.forEach(cityName => {
    const cityData = CITY_COORDS[cityName];
    SEARCH_INDEX.push({
      label: cityName, sublabel: govName,
      lat: cityData?.lat || govCoords?.lat || 30.5,
      lng: cityData?.lng || govCoords?.lng || 31.0,
      zoom: cityData ? 13 : 12,
      radiusKm: cityData?.radiusKm || 5,
      aliases: cityData?.aliases || [],
      gov: govName, city: cityName, isCity: true, isGov: false,
    });
  });
});

// ─── Matching Functions ─────────────────────────────────────────────────────
function normalizeArabic(text) {
  if (!text) return '';
  return text
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function scoreMatch(item, query, userLat = null, userLng = null) {
  const q = normalizeArabic(query.trim());
  if (!q) return -1;
  const label = normalizeArabic(item.label);
  const aliases = (item.aliases || []).map(normalizeArabic);
  if (label === q || aliases.includes(q)) return 100;
  if (label.startsWith(q) || aliases.some(a => a.startsWith(q))) return 85;
  if (label.includes(q) || aliases.some(a => a.includes(q))) return 70;
  let qi = 0;
  for (let i = 0; i < label.length && qi < q.length; i++) {
    if (label[i] === q[qi]) qi++;
  }
  if (qi === q.length && q.length >= 3) {
    return 40 + (q.length / Math.max(label.length, 1)) * 25;
  }
  if (userLat && userLng && item.isCity && item.lat && item.lng) {
    const distance = haversineDistance(userLat, userLng, item.lat, item.lng);
    if (distance <= (item.radiusKm || 5)) {
      return 50 + Math.max(0, 30 - distance * 3);
    }
  }
  return -1;
}

function searchPlaces(query, userLat = null, userLng = null) {
  const q = query.trim();
  if (!q) return [];
  return SEARCH_INDEX
    .map(item => ({ ...item, score: scoreMatch(item, q, userLat, userLng) }))
    .filter(item => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.isCity && !b.isCity) return -1;
      if (!a.isCity && b.isCity) return 1;
      return a.label.localeCompare(b.label, 'ar');
    })
    .slice(0, 10);
}

/**
 * Find best city by coordinates.
 * KEY FIX: Cities with lngMin/lngMax (Port Said / Port Fouad) are hard-disqualified
 * if the click longitude is on the wrong side of the Suez Canal divider (32.310).
 */
function findCityByCoords(lat, lng, detectedCityName = '', detectedState = '') {
  let bestMatch = null;
  let bestScore = -1;

  for (const item of SEARCH_INDEX) {
    if (!item.isCity || !item.lat || !item.lng) continue;
    const cityData = CITY_COORDS[item.label];
    if (!cityData) continue;

    // Hard longitude constraint — prevents Port Said ↔ Port Fouad cross-matching
    if (cityData.lngMin !== undefined && lng < cityData.lngMin) continue;
    if (cityData.lngMax !== undefined && lng > cityData.lngMax) continue;

    const distance = haversineDistance(lat, lng, item.lat, item.lng);
    const radius = cityData.radiusKm || 5;

    let score = 0;
    if (distance <= radius) {
      score = 100 - (distance / radius) * 40;
    } else if (distance <= radius * 2) {
      score = 40 - ((distance - radius) / radius) * 20;
    } else {
      score = Math.max(0, 20 - distance);
    }

    if (detectedCityName) {
      const normDetected = normalizeArabic(detectedCityName);
      const normLabel = normalizeArabic(item.label);
      const normAliases = (cityData.aliases || []).map(normalizeArabic);
      if (normLabel === normDetected || normAliases.includes(normDetected)) score += 30;
      else if (normLabel.includes(normDetected) || normDetected.includes(normLabel)) score += 15;
    }
    if (detectedState && item.gov === detectedState) score += 10;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { ...item, distance, score };
    }
  }

  return bestScore > 30 ? bestMatch : null;
}

// ─── Design Tokens ──────────────────────────────────────────────────────────
const T = {
  primary: '#6F2DBD',
  primaryLight: '#f0ebff',
  primaryMid: '#e8e0fa',
  border: '#e2ddf0',
  borderFocus: '#6F2DBD',
  radius: '10px',
  radiusSm: '8px',
  text: '#1a1a2e',
  textMuted: '#8a8a9a',
  surface: '#ffffff',
  surfaceAlt: '#faf9fd',
  errorBg: '#FFF5F5',
  errorText: '#C62828',
  errorBorder: '#f5c6c6',
  successBg: '#f0fdf4',
  successText: '#166534',
  successBorder: '#bbf7d0',
};

const PIN_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="38" height="50" viewBox="0 0 38 50">
    <ellipse cx="19" cy="46" rx="7" ry="3" fill="rgba(0,0,0,0.18)"/>
    <path d="M19 2C10.7 2 4 8.7 4 17c0 11 15 31 15 31s15-20 15-31C34 8.7 27.3 2 19 2z" fill="#6F2DBD" stroke="white" stroke-width="1.5"/>
    <circle cx="19" cy="17" r="7.5" fill="white"/>
    <circle cx="19" cy="17" r="4.5" fill="#6F2DBD"/>
  </svg>`;

// ─── Helpers ────────────────────────────────────────────────────────────────
function getOrgInfo(profile) {
  if (!profile) return { name: '', description: '' };
  if (profile.role === 0 && profile.charityDetails) {
    return {
      name: profile.charityDetails.charityName || '',
      description: profile.charityDetails.charityDescription || '',
    };
  }
  if (profile.role === 1 && profile.donorDetails) {
    return {
      name: profile.donorDetails.donorOrganizationName || '',
      description:
        profile.donorDetails.donorOrganizationDescription ||
        profile.donorDetails.donorDescription || '',
    };
  }
  return { name: profile.name || '', description: profile.description || '' };
}

// ─── Floating Label Input ───────────────────────────────────────────────────
function FloatField({ label, value, onChange, type = 'text', prefix, disabled, dir }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== '' && value !== undefined && value !== null;
  const raised = focused || hasValue;

  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'stretch',
      direction: dir || undefined,
      minHeight: '56px',
      border: `1.5px solid ${focused ? T.borderFocus : T.border}`,
      borderRadius: T.radius, background: disabled ? T.surfaceAlt : T.surface,
      boxShadow: focused ? `0 0 0 3px ${T.primaryLight}` : 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      overflow: 'hidden', opacity: disabled ? 0.7 : 1,
    }}>
      {prefix && (
        <span style={{
          display: 'flex', alignItems: 'center', padding: '0 12px',
          background: T.surfaceAlt, borderLeft: `1.5px solid ${T.border}`,
          color: T.textMuted, fontWeight: '600', fontSize: '14px',
          flexShrink: 0, direction: 'ltr', userSelect: 'none',
        }}>
          {prefix}
        </span>
      )}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <label style={{
          position: 'absolute', right: '14px',
          top: raised ? '7px' : '50%',
          transform: raised ? 'none' : 'translateY(-50%)',
          fontSize: raised ? '11px' : '15px',
          color: raised && focused ? T.primary : T.textMuted,
          fontWeight: raised ? '600' : '400',
          transition: 'top 0.18s, font-size 0.18s, color 0.18s, transform 0.18s',
          pointerEvents: 'none', lineHeight: 1, whiteSpace: 'nowrap',
        }}>
          {label}
        </label>
        <input
          type={type} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          disabled={disabled} placeholder=""
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            width: '100%', fontSize: '15px', color: T.text, fontFamily: 'inherit',
            direction: dir || 'rtl', textAlign: dir === 'ltr' ? 'left' : 'right',
            padding: raised ? '18px 14px 16px' : '16px 14px',
            lineHeight: '1.4',
            transition: 'padding 0.18s',
          }}
        />
      </div>
    </div>
  );
}

// ─── Floating Label Select ──────────────────────────────────────────────────
function FloatSelect({ label, value, onChange, options, disabled }) {
  const [focused, setFocused] = useState(false);
  const raised = focused || !!value;

  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'stretch',
      border: `1.5px solid ${focused ? T.borderFocus : T.border}`,
      borderRadius: T.radius, background: disabled ? T.surfaceAlt : T.surface,
      boxShadow: focused ? `0 0 0 3px ${T.primaryLight}` : 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      overflow: 'hidden', opacity: disabled ? 0.6 : 1,
    }}>
      <i className="fa-solid fa-chevron-down" style={{
        position: 'absolute', left: '14px', top: '50%',
        transform: 'translateY(-50%)', color: T.textMuted,
        fontSize: '11px', pointerEvents: 'none', zIndex: 2,
      }} />
      <div style={{ position: 'relative', flex: 1 }}>
        <label style={{
          position: 'absolute', right: '14px',
          top: raised ? '7px' : '50%',
          transform: raised ? 'none' : 'translateY(-50%)',
          fontSize: raised ? '11px' : '15px',
          color: raised && focused ? T.primary : T.textMuted,
          fontWeight: raised ? '600' : '400',
          transition: 'top 0.18s, font-size 0.18s, color 0.18s, transform 0.18s',
          pointerEvents: 'none', lineHeight: 1, whiteSpace: 'nowrap', zIndex: 2,
        }}>
          {label}
        </label>
        <select
          value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          disabled={disabled}
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            width: '100%', fontSize: '15px', color: T.text, fontFamily: 'inherit',
            direction: 'rtl', cursor: disabled ? 'not-allowed' : 'pointer',
            padding: raised ? '22px 14px 8px 36px' : '15px 14px 15px 36px',
            transition: 'padding 0.18s',
            appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
          }}
        >
          <option value=""></option>
          {options.map(o => (
            <option key={o.value !== undefined ? o.value : o} value={o.value !== undefined ? o.value : o}>
              {o.label || o}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Field Error ────────────────────────────────────────────────────────────
function FieldError({ errors, keys }) {
  const msg = keys.map(k => errors?.[k]?.[0]).find(Boolean);
  if (!msg) return null;
  return (
    <p style={{ color: T.errorText, fontSize: '12px', marginTop: '5px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
      <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '11px' }} />
      {msg}
    </p>
  );
}

// ─── Error Banner ───────────────────────────────────────────────────────────
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{ background: T.errorBg, border: `1px solid ${T.errorBorder}`, borderRadius: T.radiusSm, padding: '10px 14px', fontSize: '13px', color: T.errorText, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <i className="fa-solid fa-triangle-exclamation" />
      {message}
    </div>
  );
}

// ─── Submit Button ──────────────────────────────────────────────────────────
function SubmitBtn({ loading, label, loadingLabel, color, icon }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        background: color || T.primary, color: '#fff', border: 'none',
        borderRadius: T.radiusSm, padding: '11px 22px', fontSize: '14px',
        fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1, display: 'inline-flex', alignItems: 'center',
        gap: '8px', marginTop: '20px', fontFamily: 'inherit',
      }}
    >
      <i className={`fa-solid ${loading ? 'fa-circle-notch fa-spin' : icon}`} />
      {loading ? loadingLabel : label}
    </button>
  );
}

// ─── Accordion Section ──────────────────────────────────────────────────────
function AccordionSection({ icon, title, isOpen, onToggle, children }) {
  return (
    <div style={{
      background: T.surface,
      border: `1.5px solid ${isOpen ? T.primary : T.border}`,
      borderRadius: '14px', overflow: 'hidden',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: isOpen ? `0 4px 20px rgba(111,45,189,0.08)` : '0 1px 4px rgba(0,0,0,0.03)',
    }}>
      <button
        type="button" onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
          padding: '16px 20px', background: isOpen ? T.primaryLight : T.surface,
          border: 'none', cursor: 'pointer', direction: 'rtl', textAlign: 'right',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: '38px', height: '38px', minWidth: '38px', borderRadius: '10px',
          background: isOpen ? T.primary : T.primaryLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isOpen ? '#fff' : T.primary, fontSize: '15px',
          transition: 'background 0.2s, color 0.2s',
        }}>
          <i className={`fa-solid ${icon}`} />
        </div>
        <span style={{ flex: 1, fontWeight: '700', fontSize: '15px', color: T.text }}>{title}</span>
        <i className="fa-solid fa-chevron-down" style={{
          color: T.primary, fontSize: '13px', transition: 'transform 0.25s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }} />
      </button>
      <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 24px', borderTop: isOpen ? `1px solid ${T.border}` : 'none' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Map Location Picker ────────────────────────────────────────────────────
function MapLocationPicker({
  latitude,
  longitude,
  onChange,
  onPlaceSelected,
  flyGovSignal,
  flyCitySignal,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const warnTimerRef = useRef(null);
  const searchInputRef = useRef(null);
  const pinJustPlaced = useRef(false);
  const lastUserCoords = useRef(null);

  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [coordText, setCoordText] = useState('');
  const [detectedAddr, setDetectedAddr] = useState('');
  const [hasPinState, setHasPinState] = useState(!!(latitude && longitude));
  const [hintText, setHintText] = useState('انقر في أي مكان داخل مصر لتحديد موقعك · اسحب الدبوس لتعديله');
  const [hintError, setHintError] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [geoLoading, setGeoLoading] = useState(false);
  const [accuracy, setAccuracy] = useState(null);

  // ── Load Leaflet ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css'; link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (window.L) { setMapReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapReady(true);
    script.onerror = () => setLoadError(true);
    document.head.appendChild(script);
  }, []);

  // ── Reverse Geocode ───────────────────────────────────────────────────
  const reverseGeocode = useCallback((lat, lng) => {
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`)
      .then(r => r.json())
      .then(data => {
        const addr = data.address || {};
        const state = addr.state || addr.county || '';
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.city_district || '';
        const matchedCity = findCityByCoords(lat, lng, city, state);
        const displayState = matchedCity?.gov || state || '';
        const displayCity = matchedCity?.label || city || '';
        setDetectedAddr([displayState, displayCity].filter(Boolean).join(' - '));
        if (onPlaceSelected) {
          onPlaceSelected({
            detectedState: displayState,
            detectedCity: displayCity,
            matchedCityData: matchedCity,
            rawNominatimCity: city,
            rawNominatimState: state,
          });
        }
      })
      .catch(() => setDetectedAddr('داخل مصر'));
  }, [onPlaceSelected]);

  // ── Init Map ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapContainerRef.current || mapRef.current) return;
    const L = window.L;
    delete L.Icon.Default.prototype._getIconUrl;

    const egyptBounds = L.latLngBounds(EGYPT_BOUNDS);
    const map = L.map(mapContainerRef.current, {
      center: EGYPT_CENTER, zoom: 6, minZoom: 5, maxZoom: 18,
      zoomControl: false, attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    L.control.attribution({
      position: 'bottomright',
      prefix: '<a href="https://openstreetmap.org/copyright" style="font-size:10px;opacity:.5">© OSM</a>',
    }).addTo(map);

    const pinIcon = L.divIcon({ className: '', html: PIN_SVG, iconSize: [38, 50], iconAnchor: [19, 50] });

    const placePin = (lat, lng, fly = false, zoom = null, triggerReverseGeocode = true) => {
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', e => {
          const p = e.target.getLatLng();
          pinJustPlaced.current = true;
          placePin(p.lat, p.lng, false, null, true);
        });
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
      const z = zoom || Math.max(map.getZoom(), 10);
      if (fly) map.flyTo([lat, lng], z, { duration: 1.1 });
      const fLat = parseFloat(lat.toFixed(5));
      const fLng = parseFloat(lng.toFixed(5));
      setCoordText(`${fLat}, ${fLng}`);
      setHasPinState(true);
      setHintText('اسحب الدبوس لضبط موقعك بدقة أكبر');
      setHintError(false);
      setAccuracy(null);
      lastUserCoords.current = { lat: fLat, lng: fLng };
      if (triggerReverseGeocode) reverseGeocode(fLat, fLng);
      onChange({ latitude: fLat, longitude: fLng });
    };

    map.on('click', e => {
      if (!egyptBounds.contains(e.latlng)) {
        setHintText('⚠ الرجاء اختيار موقع داخل حدود مصر');
        setHintError(true);
        clearTimeout(warnTimerRef.current);
        warnTimerRef.current = setTimeout(() => {
          setHintText(markerRef.current
            ? 'اسحب الدبوس لضبط موقعك بدقة أكبر'
            : 'انقر في أي مكان داخل مصر لتحديد موقعك · اسحب الدبوس لتعديله');
          setHintError(false);
        }, 2500);
        return;
      }
      pinJustPlaced.current = true;
      placePin(e.latlng.lat, e.latlng.lng, false, null, true);
    });

    mapRef.current = map;
    mapRef.current._placePin = placePin;
    map.fitBounds(egyptBounds, { padding: [10, 10] });

    if (latitude && longitude) {
      setTimeout(() => placePin(latitude, longitude, false, null, false), 100);
    }
  }, [mapReady]); // eslint-disable-line

  // ── Sync lat/lng props → map ──────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current?._placePin || !latitude || !longitude) return;
    if (pinJustPlaced.current) { pinJustPlaced.current = false; return; }
    mapRef.current._placePin(latitude, longitude, true, null, false);
  }, [latitude, longitude]); // eslint-disable-line

  // ── Governorate dropdown → fly map ────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !flyGovSignal?.name) return;
    const gov = EGYPT_GOVS.find(g => g.name === flyGovSignal.name);
    if (!gov) return;
    mapRef.current.flyTo([gov.lat, gov.lng], gov.zoom, { duration: 1.0 });
  }, [flyGovSignal]); // eslint-disable-line

  // ── City dropdown → place pin ─────────────────────────────────────────
  useEffect(() => {
    if (!flyCitySignal?.city || !flyCitySignal?.gov || !mapRef.current?._placePin) return;
    const { city: cityName, gov: govName } = flyCitySignal;
    const gov = EGYPT_GOVS.find(g => g.name === govName);
    if (gov) mapRef.current.flyTo([gov.lat, gov.lng], 12, { duration: 0.6 });
    const cityData = CITY_COORDS[cityName];
    if (cityData?.lat && cityData?.lng) {
      pinJustPlaced.current = false;
      mapRef.current._placePin(cityData.lat, cityData.lng, true, 13, false);
      onChange({ latitude: parseFloat(cityData.lat.toFixed(5)), longitude: parseFloat(cityData.lng.toFixed(5)) });
      return;
    }
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName + ' ' + govName + ' مصر')}&format=json&limit=1&accept-language=ar&countrycodes=eg`)
      .then(r => r.json())
      .then(results => {
        if (results?.[0] && mapRef.current?._placePin) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);
          pinJustPlaced.current = false;
          mapRef.current._placePin(lat, lng, true, 13, false);
          onChange({ latitude: parseFloat(lat.toFixed(5)), longitude: parseFloat(lng.toFixed(5)) });
        }
      })
      .catch(() => {
        if (gov && mapRef.current?._placePin) {
          pinJustPlaced.current = false;
          mapRef.current._placePin(gov.lat, gov.lng, true, 11, false);
        }
      });
  }, [flyCitySignal]); // eslint-disable-line

  // ── Geolocation ───────────────────────────────────────────────────────
  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGeoLoading(false);
        const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
        setAccuracy(Math.round(acc));
        pinJustPlaced.current = true;
        lastUserCoords.current = { lat, lng };
        if (mapRef.current?._placePin) mapRef.current._placePin(lat, lng, true, 14, true);
      },
      () => {
        setGeoLoading(false);
        setHintText('⚠ لم يتم السماح بالوصول للموقع');
        setHintError(true);
        clearTimeout(warnTimerRef.current);
        warnTimerRef.current = setTimeout(() => {
          setHintText('انقر في أي مكان داخل مصر لتحديد موقعك');
          setHintError(false);
        }, 3000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // ── Reset ─────────────────────────────────────────────────────────────
  const handleReset = () => {
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    setHasPinState(false);
    setCoordText('');
    setDetectedAddr('');
    setAccuracy(null);
    setHintText('انقر في أي مكان داخل مصر لتحديد موقعك · اسحب الدبوس لتعديله');
    setHintError(false);
    lastUserCoords.current = null;
    onChange({ latitude: null, longitude: null });
  };

  // ── Search ────────────────────────────────────────────────────────────
  const handleSearchChange = e => {
    const q = e.target.value;
    setSearchVal(q);
    setActiveIdx(-1);
    const userCoords = lastUserCoords.current || (latitude && longitude ? { lat: latitude, lng: longitude } : null);
    setSuggestions(searchPlaces(q, userCoords?.lat, userCoords?.lng));
  };

  const handleSuggestionClick = item => {
    setSearchVal(item.label);
    setSuggestions([]);
    setActiveIdx(-1);
    if (!mapRef.current?._placePin) return;
    if (item.isCity) {
      const gov = EGYPT_GOVS.find(g => g.name === item.gov);
      if (gov) mapRef.current.flyTo([gov.lat, gov.lng], 12, { duration: 0.6 });
      pinJustPlaced.current = true;
      mapRef.current._placePin(item.lat, item.lng, true, 13, false);
      onChange({ latitude: parseFloat(item.lat.toFixed(5)), longitude: parseFloat(item.lng.toFixed(5)) });
      if (onPlaceSelected) {
        onPlaceSelected({ fromSearch: true, gov: item.gov, city: item.city, cityCoords: { lat: item.lat, lng: item.lng } });
      }
    } else {
      mapRef.current.flyTo([item.lat, item.lng], item.zoom, { duration: 1.0 });
      if (onPlaceSelected) onPlaceSelected({ fromSearch: true, gov: item.gov, city: '' });
    }
  };

  const handleSearchKeyDown = e => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); handleSuggestionClick(suggestions[activeIdx]); }
    else if (e.key === 'Escape') { setSuggestions([]); setActiveIdx(-1); }
  };

  if (loadError) {
    return (
      <div style={{ border: `1.5px solid ${T.errorBorder}`, borderRadius: T.radius, padding: '20px', textAlign: 'center', color: T.errorText, fontSize: '14px', background: T.errorBg }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ marginLeft: '8px' }} />
        تعذّر تحميل الخريطة. يرجى التحقق من الاتصال بالإنترنت.
      </div>
    );
  }

  return (
    <div style={{ border: `1.5px solid ${T.border}`, borderRadius: T.radius, overflow: 'hidden', background: T.surface }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 15px', background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: T.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.primary, fontSize: '15px', flexShrink: 0 }}>
          <i className="fa-solid fa-location-dot" />
        </div>
        <span style={{ flex: 1, fontWeight: '700', fontSize: '14px', color: T.text }}>تحديد الموقع على الخريطة</span>
        <button
          type="button" onClick={handleGeolocate} disabled={geoLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: geoLoading ? T.surfaceAlt : T.primaryLight, border: `1px solid ${T.border}`, borderRadius: '20px', padding: '4px 11px', fontSize: '12px', color: T.primary, fontWeight: '600', cursor: geoLoading ? 'wait' : 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}
        >
          <i className={`fa-solid ${geoLoading ? 'fa-circle-notch fa-spin' : 'fa-location-crosshairs'}`} style={{ fontSize: '11px' }} />
          {geoLoading ? 'جاري التحديد...' : 'موقعي الحالي'}
        </button>
        {coordText ? (
          <span style={{ fontSize: '12px', color: T.primary, fontWeight: '600', background: T.primaryLight, padding: '3px 11px', borderRadius: '20px', direction: 'ltr', whiteSpace: 'nowrap' }}>
            {coordText}
          </span>
        ) : (
          <span style={{ fontSize: '12px', color: '#856404', background: '#fff8e1', padding: '3px 11px', borderRadius: '20px' }}>
            لم يُحدَّد بعد
          </span>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', padding: '10px 14px', borderBottom: `1px solid ${T.border}`, background: T.surface }}>
        <div style={{ position: 'relative' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: '14px', pointerEvents: 'none', zIndex: 1 }} />
          {searchVal && (
            <button
              type="button"
              onClick={() => { setSearchVal(''); setSuggestions([]); searchInputRef.current?.focus(); }}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, fontSize: '13px', padding: '2px 4px', zIndex: 1 }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
          <input
            ref={searchInputRef}
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onBlur={() => setTimeout(() => setSuggestions([]), 180)}
            placeholder="ابحث عن محافظة أو مدينة... (مثال: المنصورة، الغردقة)"
            style={{ width: '100%', border: `1.5px solid ${T.border}`, borderRadius: T.radius, padding: '9px 38px 9px 30px', fontSize: '13.5px', fontFamily: 'inherit', direction: 'rtl', color: T.text, background: T.surface, outline: 'none', transition: 'border-color .2s, box-shadow .2s', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = T.primary; e.target.style.boxShadow = `0 0 0 3px ${T.primaryLight}`; }}
            onBlurCapture={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        {suggestions.length > 0 && (
          <div style={{ position: 'absolute', top: 'calc(100% - 10px)', right: '14px', left: '14px', background: T.surface, border: `1.5px solid ${T.primary}`, borderTop: 'none', borderRadius: `0 0 ${T.radiusSm} ${T.radiusSm}`, zIndex: 9999, overflow: 'hidden', boxShadow: '0 8px 24px rgba(111,45,189,0.12)' }}>
            {suggestions.map((item, idx) => (
              <div
                key={`${item.gov}-${item.label}-${idx}`}
                onMouseDown={() => handleSuggestionClick(item)}
                style={{ padding: '9px 14px', cursor: 'pointer', fontSize: '13.5px', color: T.text, display: 'flex', alignItems: 'center', gap: '8px', transition: 'background .1s', background: idx === activeIdx ? T.primaryLight : 'transparent', borderTop: idx > 0 ? `1px solid ${T.border}` : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
                onMouseLeave={e => e.currentTarget.style.background = idx === activeIdx ? T.primaryLight : ''}
              >
                <i className={`fa-solid ${item.isCity ? 'fa-city' : 'fa-map'}`} style={{ fontSize: '13px', color: T.primary, minWidth: '16px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1 }}>
                  <span style={{ fontWeight: '600' }}>{item.label}</span>
                  <span style={{ fontSize: '11px', color: T.textMuted }}>{item.sublabel}</span>
                </div>
                {item.isCity && item.radiusKm && (
                  <span style={{ fontSize: '10px', color: T.textMuted, background: T.primaryLight, padding: '2px 6px', borderRadius: '4px' }}>
                    ±{item.radiusKm}كم
                  </span>
                )}
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '10px', color: T.textMuted }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '380px', background: '#e8edf0' }}>
        {!mapReady && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: T.textMuted, fontSize: '14px', gap: '10px' }}>
            <i className="fa-solid fa-circle-notch fa-spin" />
            جاري تحميل الخريطة...
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '9px 14px', borderTop: `1px solid ${T.border}`, background: T.surfaceAlt, minHeight: '46px' }}>
        {hasPinState ? (
          <>
            {detectedAddr && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: T.primaryLight, border: `1px solid ${T.border}`, borderRadius: '20px', padding: '4px 11px', fontSize: '12.5px', color: T.primary, fontWeight: '600' }}>
                <i className="fa-solid fa-building" style={{ fontSize: '11px' }} />
                {detectedAddr}
              </div>
            )}
            {coordText && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '20px', padding: '4px 11px', fontSize: '12.5px', color: T.text, direction: 'ltr' }}>
                <i className="fa-solid fa-crosshairs" style={{ fontSize: '11px', color: T.primary }} />
                {coordText}
              </div>
            )}
            {accuracy !== null && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: T.successBg, border: `1px solid ${T.successBorder}`, borderRadius: '20px', padding: '4px 11px', fontSize: '12.5px', color: T.successText }}>
                <i className="fa-solid fa-wifi" style={{ fontSize: '11px' }} />
                دقة ±{accuracy}م
              </div>
            )}
            <button
              type="button" onClick={handleReset}
              style={{ marginRight: 'auto', background: 'none', border: `1px solid ${T.border}`, borderRadius: T.radiusSm, padding: '5px 12px', fontSize: '12px', cursor: 'pointer', color: T.textMuted, fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '5px', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = T.primaryLight; e.currentTarget.style.color = T.primary; e.currentTarget.style.borderColor = T.primary; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.textMuted; e.currentTarget.style.borderColor = T.border; }}
            >
              <i className="fa-solid fa-rotate-right" style={{ fontSize: '11px' }} />
              مسح
            </button>
          </>
        ) : (
          <span style={{ fontSize: '12.5px', color: T.textMuted }}>انقر على الخريطة أو ابحث عن محافظة أو مدينة</span>
        )}
      </div>

      {/* Hint */}
      <p style={{ margin: 0, fontSize: '12px', color: hintError ? T.errorText : T.textMuted, padding: '7px 14px', textAlign: 'center', background: hintError ? T.errorBg : T.surface, borderTop: `1px solid ${T.border}`, direction: 'rtl', transition: 'color .2s, background .2s' }}>
        {hintText}
      </p>
    </div>
  );
}

// ─── Section: Basic Info (read-only) ──────────────────────────────────────
function InfoSection({ profile }) {
  const { name: orgName, description: orgDescription } = getOrgInfo(profile);
  const rows = [
    { icon: 'fa-building', label: profile?.role === 0 ? 'اسم الجمعية' : 'اسم المنظمة', value: orgName },
    { icon: 'fa-user', label: 'اسم المستخدم', value: profile?.userName },
    { icon: 'fa-envelope', label: 'البريد الإلكتروني', value: profile?.email },
    orgDescription ? { icon: 'fa-circle-info', label: profile?.role === 0 ? 'عن الجمعية' : 'عن المنظمة', value: orgDescription } : null,
  ].filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', borderRadius: T.radiusSm, background: i % 2 === 0 ? T.surfaceAlt : T.surface, direction: 'rtl' }}>
          <div style={{ width: '34px', height: '34px', minWidth: '34px', borderRadius: '9px', background: T.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.primary, fontSize: '14px' }}>
            <i className={`fa-solid ${row.icon}`} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '11px', color: T.textMuted, fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{row.label}</span>
            <span style={{ fontSize: '15px', fontWeight: '600', color: T.text, wordBreak: 'break-word' }}>{row.value || '—'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section: Contact ─────────────────────────────────────────────────────
function ContactSection({ profile, onSave }) {
  const [form, setForm] = useState({ phone: '', whatsapp: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ phone: profile.phone || '', whatsapp: profile.whatsapp || '' });
  }, [profile]);

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setFieldErrors(prev => ({ ...prev, [field]: null }));
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({}); setGeneralError('');
    const phonePattern = /^(01[0125][0-9]{8}|1[0125][0-9]{8})$/;
    const payload = {};
    if (form.phone) {
      const c = form.phone.replace(/^\+20/, '');
      if (!phonePattern.test(c)) { setFieldErrors(p => ({ ...p, phone: ['رقم هاتف مصري غير صحيح'] })); return; }
      payload.phone = c;
    }
    if (form.whatsapp) {
      const c = form.whatsapp.replace(/^\+20/, '');
      if (!phonePattern.test(c)) { setFieldErrors(p => ({ ...p, whatsapp: ['رقم واتساب مصري غير صحيح'] })); return; }
      payload.whatsapp = c;
    }
    setIsSaving(true);
    try { if (onSave) await onSave(payload, setFieldErrors, setGeneralError); }
    finally { setIsSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorBanner message={generalError} />
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <FloatField label="رقم الهاتف" value={form.phone.replace(/^\+20/, '')} onChange={e => handleChange('phone', e.target.value)} prefix="+20" dir="ltr" />
          <FieldError errors={fieldErrors} keys={['phone', 'Phone']} />
        </div>
        <div className={styles.formField}>
          <FloatField label="رقم الواتساب" value={form.whatsapp.replace(/^\+20/, '')} onChange={e => handleChange('whatsapp', e.target.value)} prefix="+20" dir="ltr" />
          <FieldError errors={fieldErrors} keys={['whatsapp', 'Whatsapp']} />
        </div>
      </div>
      <SubmitBtn loading={isSaving} label="حفظ بيانات التواصل" loadingLabel="جاري الحفظ..." icon="fa-floppy-disk" />
    </form>
  );
}

// ─── Section: Location ────────────────────────────────────────────────────
function LocationSection({ profile, onSave }) {
  const [form, setForm] = useState({
    city: '', governorate: '', postalCode: '',
    latitude: null, longitude: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const prevGovRef = useRef('');
  const prevCityRef = useRef('');
  const [flyGovSignal, setFlyGovSignal] = useState(null);
  const [flyCitySignal, setFlyCitySignal] = useState(null);

  useEffect(() => {
    if (profile) {
      const f = {
        city: profile.city || '',
        governorate: profile.governorate || '',
        postalCode: profile.postalCode || '',
        latitude: profile.latitude || null,
        longitude: profile.longitude || null,
      };
      setForm(f);
      prevGovRef.current = f.governorate;
      prevCityRef.current = f.city;
    }
  }, [profile]);

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setFieldErrors(prev => ({ ...prev, [field]: null }));
    setGeneralError('');
  };

  const handleGovernorateChange = (val) => {
    handleChange('governorate', val);
    handleChange('city', '');
    prevGovRef.current = val;
    prevCityRef.current = '';
    if (val) setFlyGovSignal({ name: val, key: Date.now() });
  };

  const handleCityChange = (val) => {
    handleChange('city', val);
    prevCityRef.current = val;
    if (val && form.governorate) {
      setFlyCitySignal({ city: val, gov: form.governorate, key: Date.now() });
    }
  };

  const handlePlaceSelected = useCallback(({ detectedState, detectedCity, fromSearch, gov, city, matchedCityData, rawNominatimCity, rawNominatimState }) => {
    if (fromSearch) {
      if (gov) {
        const matchedGov = Object.keys(EGYPT_DATA).find(k => k === gov || gov.includes(k) || k.includes(gov)) || '';
        if (matchedGov && matchedGov !== prevGovRef.current) {
          setForm(prev => ({ ...prev, governorate: matchedGov, city: '' }));
          prevGovRef.current = matchedGov;
          prevCityRef.current = '';
        }
        if (city) {
          const cities = EGYPT_DATA[matchedGov] || [];
          const matchedCity = cities.find(c => c === city) || '';
          if (matchedCity && matchedCity !== prevCityRef.current) {
            setForm(prev => ({ ...prev, city: matchedCity }));
            prevCityRef.current = matchedCity;
          }
        }
      }
      return;
    }

    if (matchedCityData?.label && matchedCityData?.gov) {
      if (matchedCityData.gov !== prevGovRef.current) {
        setForm(prev => ({ ...prev, governorate: matchedCityData.gov, city: '' }));
        prevGovRef.current = matchedCityData.gov;
        prevCityRef.current = '';
      }
      if (matchedCityData.label !== prevCityRef.current) {
        setForm(prev => ({ ...prev, city: matchedCityData.label }));
        prevCityRef.current = matchedCityData.label;
      }
      return;
    }

    if (!detectedState && !detectedCity) return;

    const matchedGov = Object.keys(EGYPT_DATA).find(k =>
      (detectedState && (detectedState.includes(k) || k.includes(detectedState))) ||
      (detectedCity && (detectedCity.includes(k) || k.includes(detectedCity)))
    ) || '';

    if (matchedGov && matchedGov !== prevGovRef.current) {
      setForm(prev => ({ ...prev, governorate: matchedGov, city: '' }));
      prevGovRef.current = matchedGov;
      prevCityRef.current = '';
    }

    if (matchedGov && detectedCity) {
      const cities = EGYPT_DATA[matchedGov] || [];
      const matchedCity = cities.find(c =>
        normalizeArabic(detectedCity).includes(normalizeArabic(c)) ||
        normalizeArabic(c).includes(normalizeArabic(detectedCity))
      ) || '';
      if (matchedCity && matchedCity !== prevCityRef.current) {
        setForm(prev => ({ ...prev, city: matchedCity }));
        prevCityRef.current = matchedCity;
      }
    }
  }, []);

  const handleMapChange = ({ latitude, longitude }) => {
    setForm(prev => ({ ...prev, latitude, longitude }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({}); setGeneralError('');
    const payload = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) payload[k] = v;
    });
    setIsSaving(true);
    try { if (onSave) await onSave(payload, setFieldErrors, setGeneralError); }
    finally { setIsSaving(false); }
  };

  const govOptions = Object.keys(EGYPT_DATA);
  const cityOptions = form.governorate ? (EGYPT_DATA[form.governorate] || []) : [];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorBanner message={generalError} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <FloatSelect label="المحافظة" value={form.governorate} onChange={e => handleGovernorateChange(e.target.value)} options={govOptions} />
            <FieldError errors={fieldErrors} keys={['governorate', 'Governorate']} />
          </div>
          <div className={styles.formField}>
            <FloatSelect label="المدينة" value={form.city} onChange={e => handleCityChange(e.target.value)} options={cityOptions} disabled={!form.governorate} />
            <FieldError errors={fieldErrors} keys={['city', 'City']} />
          </div>
        </div>
        <div>
          <FloatField label="الرمز البريدي" value={form.postalCode} onChange={e => handleChange('postalCode', e.target.value)} />
          <FieldError errors={fieldErrors} keys={['postalCode', 'PostalCode']} />
        </div>
        <MapLocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          onChange={handleMapChange}
          onPlaceSelected={handlePlaceSelected}
          flyGovSignal={flyGovSignal}
          flyCitySignal={flyCitySignal}
        />
      </div>
      <SubmitBtn loading={isSaving} label="حفظ العنوان والموقع" loadingLabel="جاري الحفظ..." icon="fa-floppy-disk" />
    </form>
  );
}

// ─── Section: Password ────────────────────────────────────────────────────
function PasswordSection() {
  const { showToast } = useAlert();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setFieldErrors(prev => ({ ...prev, [field]: null }));
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({}); setGeneralError('');
    if (!form.currentPassword) { setFieldErrors({ currentPassword: ['كلمة المرور الحالية مطلوبة'] }); return; }
    if (form.newPassword.length < 5) { setFieldErrors({ newPassword: ['يجب أن تكون 5 أحرف على الأقل'] }); return; }
    if (form.newPassword !== form.confirmPassword) { setFieldErrors({ confirmPassword: ['كلمة المرور غير متطابقة'] }); return; }
    setIsSaving(true);
    try {
      await profileService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      showToast('تم تغيير كلمة المرور بنجاح', 'success');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      if (err.validationErrors) setFieldErrors(err.validationErrors);
      else setGeneralError(err.appMessage || 'حدث خطأ أثناء تغيير كلمة المرور.');
    } finally { setIsSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorBanner message={generalError} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <FloatField label="كلمة المرور الحالية" value={form.currentPassword} onChange={e => handleChange('currentPassword', e.target.value)} type="password" dir="ltr" />
          <FieldError errors={fieldErrors} keys={['currentPassword', 'CurrentPassword']} />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <FloatField label="كلمة المرور الجديدة" value={form.newPassword} onChange={e => handleChange('newPassword', e.target.value)} type="password" dir="ltr" />
            <FieldError errors={fieldErrors} keys={['newPassword', 'NewPassword']} />
          </div>
          <div className={styles.formField}>
            <FloatField label="تأكيد كلمة المرور" value={form.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} type="password" dir="ltr" />
            <FieldError errors={fieldErrors} keys={['confirmPassword', 'ConfirmPassword']} />
          </div>
        </div>
      </div>
      <SubmitBtn loading={isSaving} label="تحديث كلمة المرور" loadingLabel="جاري التحديث..." icon="fa-lock" color="#C62828" />
    </form>
  );
}

// ─── Main ProfileForm ─────────────────────────────────────────────────────
export default function ProfileForm({ profile, onSave }) {
  const [openSection, setOpenSection] = useState(null);
  const toggle = (id) => setOpenSection(prev => prev === id ? null : id);

  const sections = [
    { id: 'info',     icon: 'fa-building',    title: 'معلومات المنظمة',    content: <InfoSection profile={profile} /> },
    { id: 'contact',  icon: 'fa-phone',        title: 'بيانات التواصل',     content: <ContactSection profile={profile} onSave={onSave} /> },
    { id: 'location', icon: 'fa-location-dot', title: 'العنوان والموقع',    content: <LocationSection profile={profile} onSave={onSave} /> },
    { id: 'password', icon: 'fa-lock',         title: 'تغيير كلمة المرور', content: <PasswordSection /> },
  ];

  return (
    <div className={styles.formContainer}>
      {sections.map(({ id, icon, title, content }) => (
        <AccordionSection key={id} icon={icon} title={title} isOpen={openSection === id} onToggle={() => toggle(id)}>
          {content}
        </AccordionSection>
      ))}
    </div>
  );
}