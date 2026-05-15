"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  type MotionStyle,
} from "framer-motion";
import styles from "./EcoCommitment.module.css";

// ─── Card visuals (images fill their column via next/image fill) ──────────────

function PackagingVisual() {
  return (
    <Image
      src="/assets/img/lyov-recyclable.png"
      alt=""
      fill
      sizes="(max-width: 768px) 92vw, 32vw"
      className={styles.cardImage}
      aria-hidden="true"
    />
  );
}

function LogistiqueVisual() {
  return (
    <Image
      src="/assets/img/lyov-livraison.png"
      alt=""
      fill
      sizes="(max-width: 768px) 92vw, 32vw"
      className={styles.cardImage}
      aria-hidden="true"
    />
  );
}

function AntiGaspillageVisual() {
  return (
    <Image
      src="/assets/img/lyov-anti-gaspi.png"
      alt=""
      fill
      sizes="(max-width: 768px) 92vw, 32vw"
      className={styles.cardImage}
      aria-hidden="true"
    />
  );
}

// ─── Card data ────────────────────────────────────────────────────────────────

const CARDS = [
  {
    id:     "packaging",
    tag:    "01 · Packaging",
    title:  "Zéro compromis sur le design, zéro déchet pour demain.",
    body:   "Un emballage monomatériau 100% recyclable, pensé pour protéger vos snacks tout en respectant nos écosystèmes.",
    badge:  "Designed in Nancy · Produced in Europe",
    Visual: PackagingVisual,
  },
  {
    id:     "logistique",
    tag:    "02 · Logistique",
    title:  "Le kéfir qui ne craint pas le chaud.",
    body:   "Grâce à la lyophilisation, Lyov voyage à température ambiante. Économie d'énergie massive et réduction du gaspillage.",
    badge:  null,
    Visual: LogistiqueVisual,
  },
  {
    id:     "gaspillage",
    tag:    "03 · Anti-Gaspillage",
    title:  "Le temps est notre allié.",
    body:   "Une péremption étendue sans conservateur. Lyov se garde des mois dans votre sac, prêt à être croqué.",
    badge:  null,
    Visual: AntiGaspillageVisual,
  },
] as const;

const Z_CLASSES = [styles.z1, styles.z2, styles.z3] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function EcoCommitment() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Spring-smoothed progress — matches LyovAnimation spring config
  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping:   30,
    restDelta: 0.001,
  });

  // ── Card transforms ────────────────────────────────────────────────────────

  // Card 0 — pushed into the depth as cards 1 & 2 arrive
  const c0Scale   = useTransform(smooth, [0, 0.22, 0.52, 0.65, 0.90], [1,    1,    0.94, 0.94, 0.88]);
  const c0Opacity = useTransform(smooth, [0, 0.22, 0.52, 0.65, 0.90], [1,    1,    0.90, 0.90, 0.72]);

  // Card 1 — slides up [0.22→0.52], pushed when card 2 arrives [0.65→0.90]
  const c1Y       = useTransform(smooth, [0.22, 0.52], ["106vh", "0vh"]);
  const c1Scale   = useTransform(smooth, [0.65, 0.90], [1, 0.94]);
  const c1Opacity = useTransform(smooth, [0.65, 0.90], [1, 0.90]);

  // Card 2 — slides up [0.65→0.90], stays on top
  const c2Y = useTransform(smooth, [0.65, 0.90], ["106vh", "0vh"]);

  const cardStyles: MotionStyle[] = [
    { scale: c0Scale, opacity: c0Opacity },
    { y: c1Y, scale: c1Scale, opacity: c1Opacity },
    { y: c2Y },
  ];

  // ── Mouse parallax ─────────────────────────────────────────────────────────

  const rawMX = useMotionValue(0); // −1 … 1
  const rawMY = useMotionValue(0);
  const parallaxX = useSpring(
    useTransform(rawMX, [-1, 1], [-14, 14]),
    { stiffness: 80, damping: 20, mass: 0.5 },
  );
  const parallaxY = useSpring(
    useTransform(rawMY, [-1, 1], [-8, 8]),
    { stiffness: 80, damping: 20, mass: 0.5 },
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    rawMX.set(((e.clientX - rect.left) / rect.width)  * 2 - 1);
    rawMY.set(((e.clientY - rect.top)  / rect.height) * 2 - 1);
  };

  const handleMouseLeave = () => {
    rawMX.set(0);
    rawMY.set(0);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <section ref={containerRef} className={styles.container} id="eco">
      <div
        className={styles.sticky}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Ambient section label */}
        <p className={styles.sectionLabel}>L&apos;Impact Invisible</p>

        {/* Card stack */}
        <div className={styles.cardStack}>
          {CARDS.map((card, i) => {
            const Visual = card.Visual;
            return (
              <motion.div
                key={card.id}
                className={`${styles.card} ${Z_CLASSES[i]}`}
                style={cardStyles[i]}
              >
                {/* Left column — image fills column, inner wrapper carries parallax */}
                <div className={styles.cardVisual}>
                  <motion.div
                    className={styles.cardParallax}
                    style={{ x: parallaxX, y: parallaxY }}
                  >
                    <Visual />
                  </motion.div>
                </div>

                {/* Right column — static text */}
                <div className={styles.cardContent}>
                  <span className={styles.cardTag}>{card.tag}</span>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardBody}>{card.body}</p>
                  {card.badge && (
                    <span className={styles.cardBadge}>{card.badge}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
