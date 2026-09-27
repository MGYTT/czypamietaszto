import type { ReactNode } from "react";
import styles from "./RetroWindow.module.css";

type RetroWindowProps = {
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function RetroWindow({
  title,
  icon = "🌐",
  children,
  className = "",
  contentClassName = "",
}: RetroWindowProps) {
  return (
    <section className={`${styles.window} ${className}`}>
      <div className={styles.titleBar}>
        <div className={styles.title}>
          <span aria-hidden="true">{icon}</span>
          <span>{title}</span>
        </div>

        <div className={styles.controls} aria-hidden="true">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </div>
      </div>

      <div className={`${styles.content} ${contentClassName}`}>{children}</div>
    </section>
  );
}