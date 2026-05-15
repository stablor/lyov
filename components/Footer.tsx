"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import styles from "./Footer.module.css";

// ─── Magnetic pull hook ───────────────────────────────────────────────────────
// Pulls the button body toward the cursor within its own bounding box.

function useMagnetic(strength = 0.30) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 200, damping: 20, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 200, damping: 20, mass: 0.5 });

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left - rect.width  / 2) * strength);
    rawY.set((e.clientY - rect.top  - rect.height / 2) * strength);
  };

  const onMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return { x, y, onMouseMove, onMouseLeave };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="9" width="14" height="10" rx="2" />
      <path d="M7 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg viewBox="0 0 22 18" width="20" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 3h12v9H1z" />
      <path d="M13 6h4l3 4v4h-7V6z" />
      <circle cx="5" cy="15" r="1.5" />
      <circle cx="16" cy="15" r="1.5" />
    </svg>
  );
}

function IconLeaf() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2c3.5 0 7 3.5 7 7 0 5-3.5 8-7 8-3 0-6-2-7-5s0-7 3-9c1-1 2-1 4-1z" />
      <path d="M10 18v-8" strokeLinecap="round" />
    </svg>
  );
}

function FlagFR() {
  return (
    <svg viewBox="0 0 30 20" width="28" height="19" role="img" aria-label="France">
      <rect width="10" height="20" fill="#002395" />
      <rect x="10" width="10" height="20" fill="#EDEDED" />
      <rect x="20" width="10" height="20" fill="#ED2939" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_EXPLORE = [
  { label: "Le Concept",        id: "concept"      },
  { label: "Bien-faits",       id: "ingredients"  },
  { label: "Notre Engagement",  id: "eco"          },
  { label: "Boutique",          id: "boutique"     },
] as const;

const NAV_SUPPORT = [
  { label: "FAQ",               id: "faq"              },
  { label: "Livraison",         id: "livraison"        },
  { label: "Contact",           id: "contact"          },
  { label: "Mentions Légales",  id: "mentions-legales" },
] as const;

const TRUST = [
  { Icon: IconLock,  label: "Paiement Sécurisé" },
  { Icon: IconTruck, label: "Expédition 48h"     },
  { Icon: IconLeaf,  label: "100% Naturel"       },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Footer() {
  const [email, setEmail]         = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const magnetic                  = useMagnetic();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <>
      {/* ── Pre-footer CTA ─────────────────────────────────────────────────── */}
      <section id="commander" className={styles.preCta} aria-labelledby="cta-heading">
        <div className={styles.preCtaInner}>

          <p className={styles.preCtaEyebrow}>Rejoignez le mouvement</p>

          <h2 id="cta-heading" className={styles.preCtaTitle}>
            Prêt à croquer le futur du kéfir&nbsp;?
          </h2>

          {/* Magnetic CTA button — x/y are MotionValues from useSpring */}
          {/* <motion.button
            className={styles.ctaMain}
            style={{ x: magnetic.x, y: magnetic.y }}
            onMouseMove={magnetic.onMouseMove}
            onMouseLeave={magnetic.onMouseLeave}
            whileTap={{ scale: 0.97 }}
          >
            Commander mon pack découverte
          </motion.button> */}

          {/* Newsletter opt-in */}
          <div className={styles.newsletter}>
            <p className={styles.newsletterHint}>
              Rejoignez la révolution Lyov.{" "}
              {/* <span className={styles.newsletterAccent}>
                −10% sur votre première commande.
              </span> */}
            </p>

            {subscribed ? (
              <p className={styles.newsletterSuccess} role="status">
                Merci&nbsp;!
              </p>
            ) : (
              <form onSubmit={handleSubmit} className={styles.newsletterForm}>
                <input
                  type="email"
                  className={styles.newsletterInput}
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Votre adresse e-mail"
                />
                <button type="submit" className={styles.newsletterSubmit}>
                  S&apos;inscrire
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>

          {/* 4-column grid */}
          <div className={styles.footerGrid}>

            {/* Col 1 — Brand */}
            <div className={styles.colBrand}>
              <button
                className={styles.footerLogo}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Retour en haut de la page"
              >
                Lyov
              </button>
              <p className={styles.footerTagline}>
                L&apos;innovation au service de votre microbiote.
              </p>
              <div className={styles.socials}>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Lyov sur Instagram"
                >
                  <IconInstagram />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Lyov sur LinkedIn"
                >
                  <IconLinkedIn />
                </a>
              </div>
            </div>

            {/* Col 2 — Explorer */}
            <nav aria-label="Explorer le site">
              <p className={styles.colTitle}>Explorer</p>
              <ul className={styles.navList}>
                {NAV_EXPLORE.map((link) => (
                  <li key={link.id}>
                    <button
                      className={styles.navLink}
                      onClick={() => scrollTo(link.id)}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Col 3 — Support */}
            <nav aria-label="Support client">
              <p className={styles.colTitle}>Support</p>
              <ul className={styles.navList}>
                {NAV_SUPPORT.map((link) => (
                  <li key={link.id}>
                    <button
                      className={styles.navLink}
                      onClick={() => scrollTo(link.id)}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Col 4 — Certification */}
            <div>
              <p className={styles.colTitle}>Origine</p>
              <div className={styles.certCard}>
                <FlagFR />
                <div>
                  <p className={styles.certName}>Projet ENSAIA</p>
                  <p className={styles.certSub}>Nancy, France</p>
                </div>
              </div>
            </div>

          </div>

          {/* Trust badges */}
          <div className={styles.trustRow} role="list" aria-label="Nos garanties">
            {TRUST.map(({ Icon, label }) => (
              <div key={label} className={styles.trustBadge} role="listitem">
                <Icon />
                <span className={styles.trustLabel}>{label}</span>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className={styles.bottomBar}>
            <p className={styles.copyright} suppressHydrationWarning>
              © {new Date().getFullYear()} Lyov. Tous droits réservés.
            </p>
            <p className={styles.madeWith}>Conçu avec soin à Nancy</p>
          </div>

        </div>
      </footer>
    </>
  );
}
