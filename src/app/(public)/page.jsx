import Home from '@/components/layout/Home';
import Navbar from '@/components/layout/Navbar';
import MobileHome from '@/components/layout/MobileHome';
import MobileNavbar from '@/components/layout/MobileNavbar';
import '@/styles/mobile-home.css';

export default function PublicPage() {
  return (
    <>
      {/* ── Desktop (≥ 1025px) ── */}
      <div className='desktopOnly'>
        <Navbar />
        <Home />
      </div>

      {/* ── Mobile / Tablet (≤ 1024px) ── */}
      <div className='mobileOnly'>
        <MobileNavbar />
        <MobileHome />
      </div>
    </>
  );
}