// Static — no links yet (Phase 0)
 
import Image from 'next/image';
import styles from './Navbar.module.css';
 
export default function Navbar() {
  return (
    <nav className={styles.navbar}>
 
 
      {/* ── Right side: Logo ── */}
      <div className={styles.logo}>
        <Image src="/logo-white.png" alt="وافر" width={99.72} height={35} className={styles.logoImg} priority />
        <div className={styles.brandDivider} />
        <span className={styles.tagline}>وفَّــــــرنـــــاهــــا عـــــلــــيــــكـ</span>
      </div>
      {/* ── Left: Auth buttons ── */}
      <div className={styles.actions}>
        <button className={styles.loginBtn}>تـــســجيل الــدخــول</button>
        <button className={styles.registerBtn}>الإشـــــتــــــراك</button>
      </div>

    </nav>
 
  );
}