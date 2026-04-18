import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  const isHome = location.pathname === "/";

  // Scroll-based navbar background
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle hash navigation (scroll to section on same page, or navigate + scroll)
  const handleHashClick = (e, sectionId) => {
    e.preventDefault();

    if (isHome) {
      // Already on home — use Lenis for premium scroll
      const el = document.getElementById(sectionId);
      if (el && window.__lenis) {
        window.__lenis.scrollTo(el, { offset: -80, duration: 1.6 });
      } else if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Navigate to home first, then scroll after mount
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el && window.__lenis) {
          window.__lenis.scrollTo(el, { offset: -80, duration: 1.6 });
        } else if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 600);
    }
  };

  return (
    <motion.nav
      className="navbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="nav-inner"
        animate={{
          background: scrolled
            ? "rgba(5, 8, 22, 0.85)"
            : "rgba(10, 15, 30, 0.5)",
          borderColor: scrolled
            ? "rgba(99, 102, 241, 0.15)"
            : "rgba(51, 65, 85, 0.4)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(99, 102, 241, 0.06)"
            : "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <motion.div
            className="nav-brand-icon"
            whileHover={{ rotate: 12, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            ⚖️
          </motion.div>
          <span>AMIVRE</span>
          <span style={{
            fontWeight: 400,
            color: "var(--text-tertiary)",
            fontSize: "0.9rem",
          }}>Legal</span>
        </Link>

        {/* Links */}
        <div className="nav-links">
          <Link to="/" className="nav-link" style={isActive("/") ? { color: "var(--text-primary)" } : {}}>
            Home
            {isActive("/") && (
              <motion.div className="nav-active-dot" layoutId="nav-dot" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
          </Link>

          <a
            href="#features"
            className="nav-link"
            onClick={(e) => handleHashClick(e, "features")}
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="nav-link"
            onClick={(e) => handleHashClick(e, "how-it-works")}
          >
            How it works
          </a>

          <Link to="/get-started">
            <motion.button
              className="nav-cta"
              whileHover={{ scale: 1.04, boxShadow: "0 0 35px rgba(99, 102, 241, 0.4)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              Get Started →
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;