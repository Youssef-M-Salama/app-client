"use client";

import React, { useState, useEffect, useRef } from 'react';
import profileService from '@/services/profileService';
import { useAlert } from '@/context/AlertContext';
import styles from '@/styles/profile/ProfileForm.module.css';

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
  "سوهاج": ["سوهاج", "جرجا", "طهطا", "البلينا"]
};

// Egypt bounding box
const EGYPT_BOUNDS = [
  [22.0, 25.0], // South-West
  [31.7, 37.0], // North-East
];
const EGYPT_CENTER = [26.8, 30.8];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
        profile.donorDetails.donorDescription ||
        '',
    };
  }
  return { name: profile.name || '', description: profile.description || '' };
}

// ─── Edit Icon ────────────────────────────────────────────────────────────────
const EDIT_ICON_STYLE = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '18px',
  height: '18px',
  opacity: 0.5,
  pointerEvents: 'none',
};

const EDITABLE_WRAPPER_STYLE = { paddingLeft: '38px' };

const PHONE_WRAPPER_STYLE = { paddingLeft: '75px' };

const PHONE_PREFIX_STYLE = {
  position: 'absolute',
  left: '38px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#64748b',
  fontWeight: '600',
  pointerEvents: 'none',
  fontSize: '15px',
  direction: 'ltr',
};

// ─── Map Location Picker ──────────────────────────────────────────────────────
function MapLocationPicker({ latitude, longitude, onChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Load Leaflet CSS + JS dynamically (no npm install needed)
  useEffect(() => {
    // Inject CSS if not already present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject JS if not already present
    if (window.L) {
      setMapReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapReady(true);
    script.onerror = () => setLoadError(true);
    document.head.appendChild(script);
  }, []);

  // Init map once Leaflet is ready and container is mounted
  useEffect(() => {
    if (!mapReady || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = window.L;

    // Fix default marker icon path issue with bundlers
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const initialCenter =
      latitude && longitude ? [latitude, longitude] : EGYPT_CENTER;
    const initialZoom = latitude && longitude ? 10 : 6;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      maxBounds: EGYPT_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 5,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Place initial marker if coords exist
    if (latitude && longitude) {
      markerRef.current = L.marker([latitude, longitude]).addTo(map);
    }

    // Click to set / move marker
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;

      // Keep within Egypt bounds
      const bounds = L.latLngBounds(EGYPT_BOUNDS);
      if (!bounds.contains(e.latlng)) return;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      onChange({ latitude: lat, longitude: lng });
    });

    mapInstanceRef.current = map;
  }, [mapReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync external lat/lng changes into the map (e.g. on profile load)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    if (latitude && longitude) {
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      } else {
        markerRef.current = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
      }
      mapInstanceRef.current.setView([latitude, longitude], 10);
    }
  }, [latitude, longitude]);

  // ── Styles ──
  const wrapperStyle = {
    border: '2px solid #555',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#fff',
    direction: 'rtl',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderBottom: '1px solid #eee',
    background: '#faf8ff',
  };

  const labelStyle = {
    fontWeight: 700,
    fontSize: '14px',
    color: '#333',
    flex: 1,
  };

  const coordsStyle = {
    fontSize: '12px',
    color: '#6F2DBD',
    fontWeight: 600,
    direction: 'ltr',
    background: '#f0ebff',
    padding: '3px 10px',
    borderRadius: '20px',
  };

  const hintStyle = {
    fontSize: '12px',
    color: '#888',
    padding: '8px 16px',
    background: '#fafafa',
    borderTop: '1px solid #f0f0f0',
    textAlign: 'center',
  };

  if (loadError) {
    return (
      <div style={{ ...wrapperStyle, padding: '16px', color: '#C62828', fontSize: '14px', textAlign: 'center' }}>
        تعذّر تحميل الخريطة. يرجى التحقق من الاتصال بالإنترنت.
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{
          width: '36px', height: '36px', minWidth: '36px',
          borderRadius: '10px', background: '#f0ebff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#6F2DBD', fontSize: '15px',
        }}>
          <i className="fa-solid fa-location-dot" />
        </div>
        <span style={labelStyle}>تحديد الموقع على الخريطة</span>
        {latitude && longitude ? (
          <span style={coordsStyle}>
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </span>
        ) : (
          <span style={{ ...coordsStyle, background: '#fff3cd', color: '#856404' }}>
            لم يُحدَّد بعد
          </span>
        )}
      </div>

      {/* Map container */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '320px', background: '#e8e8e8' }}
      >
        {!mapReady && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: '#999', fontSize: '14px',
          }}>
            جاري تحميل الخريطة...
          </div>
        )}
      </div>

      {/* Hint */}
      <p style={hintStyle}>
        انقر على الخريطة لتحديد موقعك داخل مصر
      </p>
    </div>
  );
}

// ─── Change Password Section ──────────────────────────────────────────────────
function ChangePasswordSection() {
  const { showToast } = useAlert();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
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
    setFieldErrors({});
    setGeneralError('');

    if (!form.currentPassword) {
      setFieldErrors({ currentPassword: ['كلمة المرور الحالية مطلوبة'] });
      return;
    }
    if (form.newPassword.length < 5) {
      setFieldErrors({ newPassword: ['يجب أن تكون 5 أحرف على الأقل'] });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: ['كلمة المرور غير متطابقة'] });
      return;
    }

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
      if (err.validationErrors) {
        setFieldErrors(err.validationErrors);
      } else {
        setGeneralError(err.appMessage || 'حدث خطأ أثناء تغيير كلمة المرور.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ marginTop: '32px' }}>
      <h3 style={{ marginBottom: '16px', fontWeight: 700, fontSize: '1.1rem', color: '#333' }}>
        تغيير كلمة المرور
      </h3>

      {generalError && (
        <p style={{ color: '#C62828', background: '#FFEBEE', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.9rem' }}>
          {generalError}
        </p>
      )}

      {/* Current password — full width */}
      <div className={styles.formField} style={{ marginBottom: '16px' }}>
        <div className={styles.inputWrapper} style={EDITABLE_WRAPPER_STYLE}>
          <img src="/icons/editIcon.png" alt="" style={EDIT_ICON_STYLE} />
          <input
            type="password"
            placeholder=" "
            value={form.currentPassword}
            onChange={e => handleChange('currentPassword', e.target.value)}
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
          <label>كلمة المرور الحالية</label>
        </div>
        {(fieldErrors?.currentPassword || fieldErrors?.CurrentPassword) && (
          <p style={{ color: '#C62828', fontSize: '0.8rem', marginTop: '4px' }}>
            {fieldErrors?.currentPassword?.[0] || fieldErrors?.CurrentPassword?.[0]}
          </p>
        )}
      </div>

      {/* New + Confirm password — two columns */}
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <div className={styles.inputWrapper} style={EDITABLE_WRAPPER_STYLE}>
            <img src="/icons/editIcon.png" alt="" style={EDIT_ICON_STYLE} />
            <input
              type="password"
              placeholder=" "
              value={form.newPassword}
              onChange={e => handleChange('newPassword', e.target.value)}
              style={{ direction: 'ltr', textAlign: 'right' }}
            />
            <label>كلمة المرور الجديدة</label>
          </div>
          {(fieldErrors?.newPassword || fieldErrors?.NewPassword) && (
            <p style={{ color: '#C62828', fontSize: '0.8rem', marginTop: '4px' }}>
              {fieldErrors?.newPassword?.[0] || fieldErrors?.NewPassword?.[0]}
            </p>
          )}
        </div>

        <div className={styles.formField}>
          <div className={styles.inputWrapper} style={EDITABLE_WRAPPER_STYLE}>
            <img src="/icons/editIcon.png" alt="" style={EDIT_ICON_STYLE} />
            <input
              type="password"
              placeholder=" "
              value={form.confirmPassword}
              onChange={e => handleChange('confirmPassword', e.target.value)}
              style={{ direction: 'ltr', textAlign: 'right' }}
            />
            <label>تأكيد كلمة المرور</label>
          </div>
          {(fieldErrors?.confirmPassword || fieldErrors?.ConfirmPassword) && (
            <p style={{ color: '#C62828', fontSize: '0.8rem', marginTop: '4px' }}>
              {fieldErrors?.confirmPassword?.[0] || fieldErrors?.ConfirmPassword?.[0]}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isSaving}
        style={{ background: '#C62828' }}
      >
        {isSaving ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
      </button>
    </form>
  );
}

// ─── Main Profile Form ────────────────────────────────────────────────────────
export default function ProfileForm({ profile, isSaving, onSave }) {
  const [form, setForm] = useState({
    phone: '',
    whatsapp: '',
    city: '',
    governorate: '',
    postalCode: '',
    latitude: null,
    longitude: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Pre-fill when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        phone: profile.phone || '',
        whatsapp: profile.whatsapp || '',
        city: profile.city || '',
        governorate: profile.governorate || '',
        postalCode: profile.postalCode || '',
        // Use existing coords if the API returned them (non-null, non-zero)
        latitude: profile.latitude || null,
        longitude: profile.longitude || null,
      });
    }
  }, [profile]);

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setFieldErrors(prev => ({ ...prev, [field]: null }));
    setGeneralError('');
  };

  const handleGovernorateChange = (govVal) => {
    setForm(prev => ({
      ...prev,
      governorate: govVal,
      city: '',
    }));
    setFieldErrors(prev => ({ ...prev, governorate: null, city: null }));
    setGeneralError('');
  };

  // Called by MapLocationPicker when user clicks the map
  const handleMapChange = ({ latitude, longitude }) => {
    setForm(prev => ({ ...prev, latitude, longitude }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    // Send only non-empty fields
    const payload = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) {
        if (k === 'phone' || k === 'whatsapp') {
          payload[k] = v.replace(/^\+20/, '');
        } else {
          payload[k] = v;
        }
      }
    });

    const phonePattern = /^(01[0125][0-9]{8}|1[0125][0-9]{8})$/;
    if (payload.phone && !phonePattern.test(payload.phone)) {
      setFieldErrors(prev => ({ ...prev, phone: ['يرجى إدخال رقم هاتف مصري صحيح (مثال: 10xxxxxxxxx)'] }));
      return;
    }
    if (payload.whatsapp && !phonePattern.test(payload.whatsapp)) {
      setFieldErrors(prev => ({ ...prev, whatsapp: ['يرجى إدخال رقم واتساب مصري صحيح (مثال: 10xxxxxxxxx)'] }));
      return;
    }

    if (onSave) await onSave(payload, setFieldErrors, setGeneralError);
  };

  const { name: orgName, description: orgDescription } = getOrgInfo(profile);

  return (
    <>
      <form className={styles.formContainer} onSubmit={handleSubmit} noValidate>

        {generalError && (
          <p style={{ color: '#C62828', background: '#FFEBEE', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}>
            {generalError}
          </p>
        )}

        {/* ── Info Block: Name / Username / Email / Description ── */}
        <div className={styles.infoBlock}>

          {/* Org Name */}
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}>
              <i className="fa-solid fa-building" />
            </div>
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>
                {profile?.role === 0 ? 'اسم الجمعية' : 'اسم المنظمة'}
              </span>
              <span className={styles.infoValue}>{orgName || '—'}</span>
            </div>
          </div>

          {/* Username */}
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}>
              <i className="fa-solid fa-user" />
            </div>
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>اسم المستخدم</span>
              <span className={styles.infoValue}>{profile?.userName || '—'}</span>
            </div>
          </div>

          {/* Email */}
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}>
              <i className="fa-solid fa-envelope" />
            </div>
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>البريد الإلكتروني</span>
              <span className={styles.infoValue}>
                {profile?.email || '—'}
              </span>
            </div>
          </div>

          {/* Description — only when present */}
          {orgDescription ? (
            <div className={styles.infoRow}>
              <div className={styles.infoIcon}>
                <i className="fa-solid fa-circle-info" />
              </div>
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>
                  {profile?.role === 0 ? 'عن الجمعية' : 'عن المنظمة'}
                </span>
                <span className={styles.infoValue}>{orgDescription}</span>
              </div>
            </div>
          ) : null}

        </div>

        {/* ── Row 3: Phone (editable) + Whatsapp (editable) ── */}
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={styles.inputWrapper} style={PHONE_WRAPPER_STYLE}>
              <img src="/icons/editIcon.png" alt="" style={EDIT_ICON_STYLE} />
              <span style={PHONE_PREFIX_STYLE}>+20</span>
              <input
                type="text"
                placeholder=" "
                value={form.phone.replace(/^\+20/, '')}
                onChange={e => handleChange('phone', e.target.value)}
                style={{ direction: 'ltr', textAlign: 'left' }}
                dir="ltr"
              />
              <label>رقم الهاتف</label>
            </div>
            {(fieldErrors?.Phone || fieldErrors?.phone) && (
              <p style={{ color: '#C62828', fontSize: '0.8rem', marginTop: '4px' }}>
                {fieldErrors?.Phone?.[0] || fieldErrors?.phone?.[0]}
              </p>
            )}
          </div>

          <div className={styles.formField}>
            <div className={styles.inputWrapper} style={PHONE_WRAPPER_STYLE}>
              <img src="/icons/editIcon.png" alt="" style={EDIT_ICON_STYLE} />
              <span style={PHONE_PREFIX_STYLE}>+20</span>
              <input
                type="text"
                placeholder=" "
                value={form.whatsapp.replace(/^\+20/, '')}
                onChange={e => handleChange('whatsapp', e.target.value)}
                style={{ direction: 'ltr', textAlign: 'left' }}
                dir="ltr"
              />
              <label>واتساب</label>
            </div>
            {(fieldErrors?.Whatsapp || fieldErrors?.whatsapp) && (
              <p style={{ color: '#C62828', fontSize: '0.8rem', marginTop: '4px' }}>
                {fieldErrors?.Whatsapp?.[0] || fieldErrors?.whatsapp?.[0]}
              </p>
            )}
          </div>
        </div>

        {/* ── Row 4: Governorate (dropdown) + City (dropdown) ── */}
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={`${styles.inputWrapper} ${form.governorate ? styles.hasValue : ''}`} style={EDITABLE_WRAPPER_STYLE}>
              <img src="/icons/editIcon.png" alt="" style={EDIT_ICON_STYLE} />
              <select
                value={form.governorate}
                onChange={e => handleGovernorateChange(e.target.value)}
              >
                <option value=""></option>
                {form.governorate && !EGYPT_DATA[form.governorate] && (
                  <option value={form.governorate}>{form.governorate}</option>
                )}
                {Object.keys(EGYPT_DATA).map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
              <label>المحافظة</label>
            </div>
            {(fieldErrors?.Governorate || fieldErrors?.governorate) && (
              <p style={{ color: '#C62828', fontSize: '0.8rem', marginTop: '4px' }}>
                {fieldErrors?.Governorate?.[0] || fieldErrors?.governorate?.[0]}
              </p>
            )}
          </div>

          <div className={styles.formField}>
            <div className={`${styles.inputWrapper} ${form.city ? styles.hasValue : ''}`} style={EDITABLE_WRAPPER_STYLE}>
              <img src="/icons/editIcon.png" alt="" style={EDIT_ICON_STYLE} />
              <select
                value={form.city}
                onChange={e => handleChange('city', e.target.value)}
                disabled={!form.governorate}
              >
                <option value=""></option>
                {form.city && (!form.governorate || !EGYPT_DATA[form.governorate]?.includes(form.city)) && (
                  <option value={form.city}>{form.city}</option>
                )}
                {form.governorate && EGYPT_DATA[form.governorate]?.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <label>المدينة</label>
            </div>
            {(fieldErrors?.City || fieldErrors?.city) && (
              <p style={{ color: '#C62828', fontSize: '0.8rem', marginTop: '4px' }}>
                {fieldErrors?.City?.[0] || fieldErrors?.city?.[0]}
              </p>
            )}
          </div>
        </div>

        {/* ── Row 5: Postal Code (editable) ── */}
        <div className={styles.formField}>
          <div className={styles.inputWrapper} style={EDITABLE_WRAPPER_STYLE}>
            <img src="/icons/editIcon.png" alt="" style={EDIT_ICON_STYLE} />
            <input
              type="text"
              placeholder=" "
              value={form.postalCode}
              onChange={e => handleChange('postalCode', e.target.value)}
            />
            <label>الرمز البريدي</label>
          </div>
          {(fieldErrors?.PostalCode || fieldErrors?.postalCode) && (
            <p style={{ color: '#C62828', fontSize: '0.8rem', marginTop: '4px' }}>
              {fieldErrors?.PostalCode?.[0] || fieldErrors?.postalCode?.[0]}
            </p>
          )}
        </div>

        {/* ── Map Location Picker ── */}
        <MapLocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          onChange={handleMapChange}
        />

        <button type="submit" className={styles.submitBtn} disabled={isSaving}>
          {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>

      </form>

      {/* ── Divider ── */}
      <hr style={{ margin: '28px 0', border: 'none', borderTop: '1px solid #eee' }} />

      {/* ── Change Password (separate form — no nesting) ── */}
      <ChangePasswordSection />
    </>
  );
}