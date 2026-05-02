'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import styles from '@/styles/ui/alert.module.css';

const AlertContext = createContext({
  showAlert: (title, message, type = 'success') => {},
  showConfirm: (title, message, onConfirm, type = 'confirm') => {},
  showToast: (message, type = 'success') => {},
});

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null); // { title, message, type }
  const [confirm, setConfirm] = useState(null); // { title, message, type, onConfirm }
  const [toasts, setToasts] = useState([]); // Array of { id, message, type }

  const showAlert = useCallback((title, message, type = 'success') => {
    setAlert({ title, message, type });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const showConfirm = useCallback((title, message, onConfirm, type = 'confirm') => {
    setConfirm({ title, message, type, onConfirm });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirm?.onConfirm) confirm.onConfirm();
    setConfirm(null);
  }, [confirm]);

  const closeConfirm = useCallback(() => {
    setConfirm(null);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, showToast }}>
      {children}
      
      {/* ── Toast Container ── */}
      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[`toast${t.type.charAt(0).toUpperCase() + t.type.slice(1)}`]}`}>
            <span className={styles.toastIcon}>
              {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span className={styles.toastMessage}>{t.message}</span>
          </div>
        ))}
      </div>

      {/* ── Alert Modal ── */}
      {alert && (
        <div className={styles.overlay} onClick={closeAlert}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={`${styles.iconWrapper} ${styles[`icon${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`]}`}>
              {alert.type === 'success' ? '✔' : '✖'}
            </div>
            <h3 className={styles.title}>{alert.title}</h3>
            <p className={styles.message}>{alert.message}</p>
            <div className={styles.actions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={closeAlert}>
                موافق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Modal ── */}
      {confirm && (
        <div className={styles.overlay} onClick={closeConfirm}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={`${styles.iconWrapper} ${styles.iconConfirm}`}>
              ❓
            </div>
            <h3 className={styles.title}>{confirm.title}</h3>
            <p className={styles.message}>{confirm.message}</p>
            <div className={styles.actions}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeConfirm}>
                إلغاء
              </button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleConfirm}>
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
