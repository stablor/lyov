"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring, useTransform, motion } from "framer-motion";
import styles from "./LyovAnimation.module.css";

// ─── Frame config ─────────────────────────────────────────────────────────────

const FRAME_COUNT = 160;
const FRAME_PATH  = (i: number) => `/assets/frames/frame_${i}.webp`;
const BG          = "#F5F5DC";

// ─── Annotation anchors ───────────────────────────────────────────────────────
//
// All positions are fractions of the viewport (0 = left/top, 1 = right/bottom).
// • labelCy  — vertical centre of the glass card
// • anchor   — dot on the product surface
//
// lineFrom is computed automatically from CARD_W + LABEL_PAD — no need to touch it.
// Only adjust labelCy and anchor when the product position shifts.

const CARD_W     = 175;   // px — must match .labelCard { width } in the CSS module
const LABEL_PAD  = 0.04;  // 4% inset from each side edge

const LABELS = [
  {
    id:      "chocolat",
    title:   "Chocolat Noir 72%",
    body:    "Coque protectrice et gourmande",
    side:    "right" as const,
    labelCy: 0.24,               // card vertical centre
    anchor:  { x: 0.615, y: 0.40 }, // top of right-half chocolate dome
  },
  {
    id:      "kefir",
    title:   "Kéfir Lyophilisé",
    body:    "Concentré de probiotiques naturels",
    side:    "left" as const,
    labelCy: 0.52,
    anchor:  { x: 0.305, y: 0.54 }, // white kefir interior, left half
  },
] as const;

// Scroll progress thresholds (container = 600vh, frames lock at 0.68)
// Labels enter while the last few frames play so the product feels "ready"
// when the annotations land. 38% of total scroll is pure dwell time (0.62→1).
const LABELS_IN_START  = 0.62; // labels start fading in (~frame 145 / 159)
const LABELS_IN_END    = 0.73; // labels fully visible
const DRAW_START       = 0.64; // lines start drawing
const DRAW_END         = 0.80; // lines fully drawn
const DOT_IN_START     = 0.73; // dots appear as lines finish

// ─── Component ────────────────────────────────────────────────────────────────

export default function LyovAnimation() {
  const containerRef   = useRef<HTMLDivElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const imagesRef      = useRef<HTMLImageElement[]>([]);
  const rafRef         = useRef<number | null>(null);
  const sizeRef        = useRef({ w: 0, h: 0 });
  const loaderFillRef  = useRef<HTMLDivElement>(null);

  const [loadProgress, setLoadProgress] = useState(0);
  const [ready, setReady]               = useState(false);
  const [vp, setVp]                     = useState({ w: 0, h: 0 }); // for SVG coordinates

  // ── Scroll + spring ────────────────────────────────────────────────────────

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const spring = useSpring(scrollYProgress, {
    stiffness: 100,
    damping:   30,
    restDelta: 0.0001,
  });

  // Frames complete at 68% of scroll — last 32% is locked on the exploded frame
  // while label annotations are visible, giving comfortable reading time.
  const frameIndex = useTransform(spring, [0, 0.68], [0, FRAME_COUNT - 1]);

  // ── Annotation motion values ───────────────────────────────────────────────

  // Card opacity + vertical slide
  const labelsOpacity = useTransform(spring, [LABELS_IN_START, LABELS_IN_END], [0, 1]);
  const labelsY       = useTransform(labelsOpacity, [0, 1], [14, 0]);

  // SVG line draw (pathLength 0 → 1)
  const drawProgress  = useTransform(spring, [DRAW_START, DRAW_END], [0, 1]);

  // Dot appears just as lines complete their trace
  const dotOpacity    = useTransform(spring, [DOT_IN_START, DRAW_END], [0, 1]);

  // ── Loader bar progress (imperative CSS var update — avoids inline style lint) ─

  useEffect(() => {
    loaderFillRef.current?.style.setProperty("--progress", String(loadProgress / 100));
  }, [loadProgress]);

  // ── Preload all frames ─────────────────────────────────────────────────────

  useEffect(() => {
    let loaded = 0;
    const images = new Array<HTMLImageElement>(FRAME_COUNT);
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = img.onerror = () => {
        loaded++;
        setLoadProgress(Math.round((loaded / FRAME_COUNT) * 100));
        if (loaded === FRAME_COUNT) setReady(true);
      };
      images[i] = img;
    }
    imagesRef.current = images;
  }, []);

  // ── Canvas resize + viewport tracking ─────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w   = window.innerWidth;
      const h   = window.innerHeight;
      sizeRef.current     = { w, h };
      setVp({ w, h });                          // drives SVG viewBox
      canvas.width        = Math.round(w * dpr);
      canvas.height       = Math.round(h * dpr);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ── RAF render loop ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const { w, h } = sizeRef.current;
      if (!w || !h) { rafRef.current = requestAnimationFrame(render); return; }

      const dpr   = window.devicePixelRatio || 1;
      const index = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(frameIndex.get())));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      const img = imagesRef.current[index];
      if (img?.complete && img.naturalWidth > 0) {
        // object-fit: cover — image fills the viewport, edges clipped
        const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const dw    = img.naturalWidth  * scale;
        const dh    = img.naturalHeight * scale;
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [ready, frameIndex]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.sticky}>

        {/* ── Canvas with radial vignette ── */}
        <div className={styles.vignette}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>

        {/* ── SVG annotation lines + dots ── */}
        {vp.w > 0 && (
          <svg
            className={styles.svgOverlay}
            viewBox={`0 0 ${vp.w} ${vp.h}`}
            aria-hidden="true"
          >
            <defs>
              <filter id="line-shadow" x="-20%" y="-50%" width="140%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="rgba(0,0,0,0.40)" />
              </filter>
            </defs>

            {LABELS.map((label) => {
              const fx =
                label.side === "right"
                  ? vp.w * (1 - LABEL_PAD) - CARD_W
                  : vp.w * LABEL_PAD + CARD_W;
              const fy = label.labelCy * vp.h;
              const ax = label.anchor.x * vp.w;
              const ay = label.anchor.y * vp.h;

              return (
                <g key={label.id} filter="url(#line-shadow)">
                  {/* Traced line */}
                  <motion.path
                    d={`M ${fx},${fy} L ${ax},${ay}`}
                    stroke="rgba(255,255,255,0.88)"
                    strokeWidth={1.6}
                    fill="none"
                    strokeLinecap="round"
                    style={{ pathLength: drawProgress, opacity: labelsOpacity }}
                  />
                  {/* Landing dot only — no arrowhead */}
                  <motion.circle
                    cx={ax}
                    cy={ay}
                    r={5}
                    fill="rgba(255,255,255,0.92)"
                    stroke="rgba(40,25,10,0.35)"
                    strokeWidth={1}
                    style={{ opacity: dotOpacity }}
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* ── Glassmorphism label cards ── */}
        {LABELS.map((label) => (
          // Outer div: CSS absolute positioning via --ly custom property (set via ref to avoid inline style lint)
          <div
            key={label.id}
            ref={(el) => el?.style.setProperty("--ly", `${label.labelCy * 100}%`)}
            className={`${styles.labelWrapper} ${label.side === "left" ? styles.labelLeft : styles.labelRight}`}
          >
            {/* Inner motion.div: Framer Motion opacity + y slide */}
            <motion.div
              className={styles.labelCard}
              style={{ opacity: labelsOpacity, y: labelsY }}
            >
              <p className={styles.labelTitle}>{label.title}</p>
              <p className={styles.labelBody}>{label.body}</p>
            </motion.div>
          </div>
        ))}

        {/* ── Mobile label bar — replaces SVG overlay on small screens ── */}
        <motion.div
          className={styles.mobileLabels}
          style={{ opacity: labelsOpacity, y: labelsY }}
        >
          {LABELS.map((label) => (
            <div key={`mob-${label.id}`} className={styles.mobileLabelCard}>
              <p className={styles.mobileLabelTitle}>{label.title}</p>
              <p className={styles.mobileLabelBody}>{label.body}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Loading screen ── */}
        {!ready && (
          <div className={styles.loader}>
            <p className={styles.loaderTitle}>Lyov</p>
            <div className={styles.loaderTrack}>
              <div ref={loaderFillRef} className={styles.loaderFill} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
