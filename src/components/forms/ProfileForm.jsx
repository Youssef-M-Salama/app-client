"use client";

import React, { useState, useEffect } from 'react';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Resolve org name + description based on role from the profile API response:
// role 0 = Charity  → charityDetails.charityName / charityDetails.charityDescription
// role 1 = Donor    → donorDetails.donorName     / donorDetails.donorDescription
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
      // check both common field names the API might return
      description:
        profile.donorDetails.donorOrganizationDescription ||
        profile.donorDetails.donorDescription ||
        '',
    };
  }
  // fallback – use whatever top-level name field exists
  return { name: profile.name || '', description: profile.description || '' };
}

// ─── Edit Icon (left side of editable inputs) ─────────────────────────────────
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

// Wrapper style with extra left padding to make room for the icon
const EDITABLE_WRAPPER_STYLE = { paddingLeft: '38px' };

// For phone inputs (room for icon + "+20")
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
      city: '' // Clear city when governorate changes
    }));
    setFieldErrors(prev => ({ ...prev, governorate: null, city: null }));
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    // Send only non-empty fields
    const payload = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '') {
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
                {/* Fallback to render existing governorate value if it is not in the predefined lists */}
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
                {/* Fallback to render existing city value if it is not in the predefined lists */}
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