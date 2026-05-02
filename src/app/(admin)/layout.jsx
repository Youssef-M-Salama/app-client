'use client';

import AuthGuard from "@/components/layout/AuthGuard";
import AdminNavbar from "@/components/admin/AdminNavbar";
import adminStyle from "@/styles/admin/admin.module.css";

export default function AdminLayout({ children }) {
  return (
    <AuthGuard requiredRole={['Admin']}>
      <div className={adminStyle.container}>
        <AdminNavbar />
        <main className={adminStyle.mainContent}>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
