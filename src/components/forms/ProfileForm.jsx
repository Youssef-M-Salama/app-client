"use client";

import React, { useState, useEffect } from 'react';
import profileService from '@/services/profileService';
import { useAlert } from '@/context/AlertContext';
import styles from '@/styles/profile/ProfileForm.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Resolve org name + description based on role from the profile API response:
// role 0 = Charity  → charityDetails.charityName / charityDetails.charityDescription
// role 1 = Donor    → donorDetails.donorName     / donorDetails.donorDescription
function getOrgInfo(profile) {
  if (!profile) return { name: '', description: '' };

  if (profile.role === 0 && profile.charityDetails) {
    return {
      name:        profile.charityDetails.charityName        || '',
      description: profile.charityDetails.charityDescription || '',
    };
  }
  if (profile.role === 1 && profile.donorDetails) {
    return {
      name:        profile.donorDetails.donorName        || '',
      description: profile.donorDetails.donorDescription || '',
    };
  }
  // fallback – use whatever top-level name field exists
  return { name: profile.name || '', description: profile.description || '' };
}

// ─── Edit Icon (left side of editable inputs) ─────────────────────────────────
const EDIT_ICON_STYLE = {
  position:  'absolute',
  left:      '12px',
  top:       '50%',
  transform: 'translateY(-50%)',
  width:     '18px',
  height:    '18px',
  opacity:   0.5,
  pointerEvents: 'none',
};

// Wrapper style with extra left padding to make room for the icon
const EDITABLE_WRAPPER_STYLE = { paddingLeft: '38px' };

// ─── Change Password Section ──────────────────────────────────────────────────
function ChangePasswordSection() {
  const { showToast } = useAlert();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [fieldErrors,   setFieldErrors]   = useState({});
  const [generalError,  setGeneralError]  = useState('');
  const [isSaving,      setIsSaving]      = useState(false);

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
        newPassword:     form.newPassword,
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
    phone:       '',
    whatsapp:    '',
    city:        '',
    governorate: '',
    postalCode:  '',
  });
  const [fieldErrors,  setFieldErrors]  = useState({});
  const [generalError, setGeneralError] = useState('');

  // Pre-fill when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        phone:       profile.phone       || '',
        whatsapp:    profile.whatsapp    || '',
        city:        profile.city        || '',
        governorate: profile.governorate || '',
        postalCode:  profile.postalCode  || '',
      });
    }
  }, [profile]);

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setFieldErrors(prev => ({ ...prev, [field]: null }));
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    // Send only non-empty fields
    const payload = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '') payload[k] = v;
    });

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

        {/* ── Row 1: Org Name (read-only) + Username (read-only) ── */}
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={styles.inputWrapper}>
              <input type="text" placeholder=" " value={orgName} readOnly />
              <label>
                {profile?.role === 0 ? 'اسم الجمعية' : 'اسم المنظمة'}
              </label>
            </div>
          </div>

          <div className={styles.formField}>
            <div className={styles.inputWrapper}>
              <input type="text" placeholder=" " value={profile?.userName || ''} readOnly />
              <label>اسم المستخدم</label>
            </div>
          </div>
        </div>

        {/* ── Row 2: Email (read-only) ── */}
        <div className={styles.formField}>
          <div className={styles.inputWrapper}>
            <input
              type="email"
              placeholder=" "
              value={profile?.email || ''}
              readOnly
              style={{ direction: 'ltr', textAlign: 'right' }}
            />
            <label>البريد الإلكتروني</label>
          </div>
        </div>

        {/* ── Description (read-only) — shown when available ── */}
        {orgDescription ? (
          <div className={styles.formField}>
            <div className={styles.inputWrapper}>
              <input type="text" placeholder=" " value={orgDescription} readOnly />
              <label>
                {profile?.role === 0 ? 'عن الجمعية' : 'عن المنظمة'}
              </label>
            </div>
          </div>
        ) : null}

        {/* ── Row 3: Phone (editable) + Whatsapp (editable) ── */}
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={styles.inputWrapper} style={EDITABLE_WRAPPER_STYLE}>
              <img src="/icons/editIcon.png" alt="" style={EDIT_ICON_STYLE} />
              <input
                type="text"
                placeholder=" "
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
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
            <div className={styles.inputWrapper} style={EDITABLE_WRAPPER_STYLE}>
              <img src="/icons/editIcon.png" alt="" style={EDIT_ICON_STYLE} />
              <input
                type="text"
                placeholder=" "
                value={form.whatsapp}
                onChange={e => handleChange('whatsapp', e.target.value)}
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

        {/* ── Row 4: City (editable) + Governorate (editable) ── */}
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <div className={styles.inputWrapper} style={EDITABLE_WRAPPER_STYLE}>
              <img src="/icons/editIcon.png" alt="" style={EDIT_ICON_STYLE} />
              <input
                type="text"
                placeholder=" "
                value={form.city}
                onChange={e => handleChange('city', e.target.value)}
              />
              <label>المدينة</label>
            </div>
            {(fieldErrors?.City || fieldErrors?.city) && (
              <p style={{ color: '#C62828', fontSize: '0.8rem', marginTop: '4px' }}>
                {fieldErrors?.City?.[0] || fieldErrors?.city?.[0]}
              </p>
            )}
          </div>

          <div className={styles.formField}>
            <div className={styles.inputWrapper} style={EDITABLE_WRAPPER_STYLE}>
              <img src="/icons/editIcon.png" alt="" style={EDIT_ICON_STYLE} />
              <input
                type="text"
                placeholder=" "
                value={form.governorate}
                onChange={e => handleChange('governorate', e.target.value)}
              />
              <label>المحافظة</label>
            </div>
            {(fieldErrors?.Governorate || fieldErrors?.governorate) && (
              <p style={{ color: '#C62828', fontSize: '0.8rem', marginTop: '4px' }}>
                {fieldErrors?.Governorate?.[0] || fieldErrors?.governorate?.[0]}
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