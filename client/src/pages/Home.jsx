import Hero from "../components/Hero";
import Features from "../components/Features";
import Steps from "../components/Steps";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const Home = () => {
  return (
    <div className="main">
      <Hero />
      <Features />
      <Steps />

      {/* ── CTA Section ── */}
      <section style={{
        padding: "100px 40px",
        display: "flex",
        justifyContent: "center",
        position: "relative",
        zIndex: 10,
      }}>
        <motion.div
          style={{
            maxWidth: "800px",
            width: "100%",
            textAlign: "center",
            padding: "64px 48px",
            borderRadius: "var(--radius-2xl)",
            background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))",
            border: "1px solid rgba(99,102,241,0.2)",
            position: "relative",
            overflow: "hidden",
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background glow */}
          <div style={{
            position: "absolute",
            top: "-50%", left: "50%",
            transform: "translateX(-50%)",
            width: "400px", height: "400px",
            background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)",
            pointerEvents: "none",
          }} />

          <motion.div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              fontSize: "0.8rem",
              color: "#a5b4fc",
              fontWeight: 500,
              marginBottom: "24px",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles style={{ width: "14px", height: "14px" }} />
            Free to use · No signup required
          </motion.div>

          <h2 style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            position: "relative",
          }}>
            Ready to navigate your{" "}
            <span className="gradient">legal compliance?</span>
          </h2>

          <p style={{
            color: "var(--text-secondary)",
            fontSize: "1.05rem",
            marginTop: "16px",
            maxWidth: "500px",
            margin: "16px auto 0",
            lineHeight: 1.7,
          }}>
            Join leading Indian startups using AI to stay compliant
            from day one. Your first analysis is just seconds away.
          </p>

          <Link to="/get-started">
            <motion.button
              style={{
                padding: "16px 36px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-gradient)",
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
                border: "none",
                cursor: "pointer",
                marginTop: "32px",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 0 40px var(--accent-glow)",
                fontFamily: "var(--font-sans)",
              }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 55px rgba(99,102,241,0.4)" }}
              whileTap={{ scale: 0.96 }}
            >
              Start Analyzing <ArrowRight style={{ width: "18px", height: "18px" }} />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;