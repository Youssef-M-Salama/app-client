import AdminNavbar from "@/components/admin/AdminNavbar";
import adminStyle from "@/styles/admin/admin.module.css";

export const metadata = {
  title: "لوحة تحكم المشرف — وافر",
  description: "لوحة تحكم المشرف لإدارة المستخدمين والجمعيات والعروض",
};

export default function AdminLayout({ children }) {
  return (
    <div className={adminStyle.container}>
      <AdminNavbar />
      <main className={adminStyle.mainContent}>
        {children}
      </main>
    </div>
  );
}
