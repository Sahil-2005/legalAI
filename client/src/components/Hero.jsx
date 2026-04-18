import heroImg from "../assets/hero1.png";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div className="home-container">
      <section className="landing">
        <div className="left">
          {/* Enterprise badge */}
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="hero-badge-dot" />
            Powered by RAG · Gemini LLM · Qdrant Vector DB
          </motion.div>

          <motion.h1
            className="title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="line1">AI-Powered</span>
            <span className="line2">Compliance</span>
            <span className="gradient">for Indian Startups</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Navigate the complex legal landscape of India with confidence.
            Get instant, AI-generated compliance analysis backed by{" "}
            <strong style={{ color: "var(--text-primary)" }}>50+ government documents</strong>.
          </motion.p>

          <motion.div
            className="hero-cta-group"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Link to="/get-started">
              <button className="cta">Analyze Your Business →</button>
            </Link>
            <button
              className="cta-secondary"
              onClick={() => {
                const el = document.getElementById("features");
                if (el && window.__lenis) {
                  window.__lenis.scrollTo(el, { offset: -80, duration: 1.6 });
                } else if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Learn More ↓
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="hero-stats"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <div className="hero-stat">
              <span className="hero-stat-value">50+</span>
              <span className="hero-stat-label">Legal Documents</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">8</span>
              <span className="hero-stat-label">Legal Domains</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">&lt;10s</span>
              <span className="hero-stat-label">Analysis Time</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="right"
          initial={{ opacity: 0, scale: 0.95, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <img src={heroImg} alt="LexAgent AI Dashboard" />
        </motion.div>
      </section>
    </div>
  );
};

export default Hero;
