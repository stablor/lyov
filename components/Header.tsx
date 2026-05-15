"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { label: "Le Concept",   id: "concept"     },
  { label: "Ingrédients",  id: "ingredients" },
  { label: "Engagement",   id: "engagement"  },
] as const;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const ticking                 = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize past breakpoint
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleNav = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <>
      <motion.header
        className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <button
          className={styles.logoBtn}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Lyov — retour en haut"
        >
          <span className={styles.logoText}>Lyov</span>
        </button>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              className={styles.navLink}
              onClick={() => scrollToSection(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className={styles.right}>
          <button
            className={styles.cta}
            onClick={() => scrollToSection("stockists")}
          >
            Où nous trouver&nbsp;?
          </button>

          {/* Burger */}
          <button
            className={styles.burger}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            <span
              className={`${styles.burgerLine} ${open ? styles.burgerLineTopOpen : ""}`}
            />
            <span
              className={`${styles.burgerLine} ${open ? styles.burgerLineBottomOpen : ""}`}
            />
          </button>
        </div>
      </motion.header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                className={styles.mobileLink}
                onClick={() => handleNav(link.id)}
              >
                {link.label}
              </button>
            ))}
            <button
              className={styles.ctaMobile}
              onClick={() => handleNav("stockists")}
            >
              Où nous trouver&nbsp;?
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
