import styles from "./ActionButtons.module.css"
import Link from "next/link"
export default function ActionButtons() {
  return (
    <div className="actionButtons">
      <Link href="/MasterCampaign" className={styles.actionButton}>
        Master Campaign
      </Link>
      <Link href="\AddCampaign" className={styles.actionButton}>
        Add Campaign
      </Link>
      <Link href="/Transition" className={styles.actionButton}>
        Transition
      </Link>
      <Link href="/ButtonPermission" className={styles.actionButton}>
        Button Permission
      </Link>
    </div>
  );
}