import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <img src="/godown-bar/s-hotels-logo.png" alt="S Hotels Chennai" className={styles.logo} />
      <h1 className={styles.heading}>Menus</h1>
      <div className={styles.menuList}>
        <Link href="/godown-bar" className={styles.menuLink}>The Godown Bar</Link>
        <Link href="/southern-station" className={styles.menuLink}>Southern Station</Link>
      </div>
      <div className={styles.adminWrap}>
        <Link href="/admin" className={styles.adminLink}>Admin</Link>
      </div>
    </div>
  );
}
