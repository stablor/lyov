"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Zap, Activity, Leaf } from "lucide-react";
import type { LucideProps } from "lucide-react";
import styles from "./HealthPromise.module.css";

// ─── Timeline data ────────────────────────────────────────────────────────────

type Side = "left" | "right";

interface Item {
  id:    string;
  Icon:  React.ComponentType<LucideProps>;
  title: string;
  body:  string;
  side:  Side;
  xFrom: number; // initial x offset for text slide-in (px)
}

const ITEMS: Item[] = [
  {
    id:    "probiotiques",
    Icon:  Zap,
    title: "Probiotiques Préservés",
    body:  "La lyophilisation garde les ferments du kéfir vivants et actifs.",
    side:  "right",
    xFrom: 22,
  },
  {
    id:    "fibres",
    Icon:  Activity,
    title: "Riche en Fibres",
    body:  "Un allié digestion au quotidien.",
    side:  "left",
    xFrom: -22,
  },
  {
    id:    "naturel",
    Icon:  Leaf,
    title: "Naturel",
    body:  "Sans conservateurs, sans colorants, sans arômes artificiels.",
    side:  "right",
    xFrom: 22,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HealthPromise() {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Scroll progress over the full timeline height
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.85", "end 0.15"],
  });

  // Spring-smoothed scale for the line draw (high stiffness = low lag)
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <section className={styles.section} id="ingredients">
      <div className={styles.inner}>

        {/* ── Title ── */}
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Votre microbiote vous dira merci.</h2>
        </div>

        {/* ── Timeline ── */}
        <div ref={timelineRef} className={styles.timelineWrapper}>

          {/* Static background track */}
          <div className={styles.lineTrack} />

          {/* Scroll-driven fill — scaleY driven by spring MotionValue */}
          <motion.div className={styles.lineFill} style={{ scaleY: lineScale }} />

          {/* Items */}
          {ITEMS.map(({ id, Icon, title, body, side, xFrom }) => (
            <div
              key={id}
              className={`${styles.row} ${side === "right" ? styles.rowRight : styles.rowLeft}`}
            >
              {/* Dot with spring scale-in */}
              <div className={styles.dotCell}>
                <motion.div
                  className={styles.dot}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <Icon size={18} strokeWidth={1.5} />
                </motion.div>
              </div>

              {/* Text with fade + lateral slide, delayed after dot */}
              <div className={styles.textCell}>
                <motion.div
                  initial={{ opacity: 0, x: xFrom }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
                >
                  <p className={styles.itemTitle}>{title}</p>
                  <p className={styles.itemBody}>{body}</p>
                </motion.div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
