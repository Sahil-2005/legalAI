import Hero from "../components/Hero";
import Features from "../components/Features";
import Steps from "../components/Steps";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Zap, Database, Scale, BookOpen, Globe } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

const stagger = (delay = 0) => ({
  ...fadeUp,
  transition: { ...fadeUp.transition, delay },
});

const Home = () => {
  const legalDomains = [
    { icon: <Shield className="w-5 h-5" />, name: "Data Privacy & IT Laws", count: "7 documents", color: "#22d3ee" },
    { icon: <Scale className="w-5 h-5" />, name: "Startup & Company Laws", count: "10 documents", color: "#a78bfa" },
    { icon: <BookOpen className="w-5 h-5" />, name: "Intellectual Property", count: "3 documents", color: "#f472b6" },
    { icon: <Zap className="w-5 h-5" />, name: "Taxation & Finance", count: "4 documents", color: "#fbbf24" },
    { icon: <Database className="w-5 h-5" />, name: "Fintech & RBI Regulations", count: "5 documents", color: "#34d399" },
    { icon: <Globe className="w-5 h-5" />, name: "Food Safety & Standards", count: "6 documents", color: "#fb923c" },
    { icon: <Shield className="w-5 h-5" />, name: "Health & Medical Regs", count: "4 documents", color: "#60a5fa" },
    { icon: <Scale className="w-5 h-5" />, name: "Labour & Employment", count: "7 documents", color: "#c084fc" },
  ];

  const techStack = [
    { label: "Qdrant", desc: "Vector Database", icon: "🔮" },
    { label: "Gemini 2.5", desc: "Flash LLM", icon: "✨" },
    { label: "all-MiniLM", desc: "Embeddings", icon: "🧬" },
    { label: "FastAPI", desc: "Backend", icon: "⚡" },
    { label: "React", desc: "Frontend", icon: "⚛️" },
    { label: "RAG", desc: "Architecture", icon: "🏗️" },
  ];

  return (
    <div className="main">
      <Hero />
      <Features />
      <Steps />

      {/* ═══════ LEGAL DOMAINS COVERAGE ═══════ */}
      <section id="coverage" style={{ padding: "100px 40px", maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: "56px" }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: "var(--radius-full)",
            background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
            fontSize: "0.78rem", fontWeight: 500, color: "#a5b4fc", marginBottom: "20px",
            letterSpacing: "0.05em", textTransform: "uppercase",
          }}>
            Comprehensive Coverage
          </span>
          <h2 style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            8 Legal Domains. <span className="gradient">50+ Documents.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "12px", fontSize: "1.05rem", maxWidth: "600px", margin: "12px auto 0" }}>
            Every major compliance area an Indian startup encounters — indexed, vectorized, and ready to analyze your business.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          {legalDomains.map((domain, idx) => (
            <motion.div
              key={idx}
              {...stagger(idx * 0.08)}
              style={{
                padding: "24px 20px",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-glass)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--border-subtle)",
                transition: "all 0.3s ease",
                cursor: "default",
              }}
              whileHover={{
                borderColor: `${domain.color}40`,
                boxShadow: `0 0 30px ${domain.color}15`,
                y: -4,
              }}
            >
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: `${domain.color}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: domain.color, marginBottom: "14px",
              }}>
                {domain.icon}
              </div>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                {domain.name}
              </h4>
              <span style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                {domain.count}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ TECH STACK RIBBON ═══════ */}
      <section style={{ padding: "80px 40px", position: "relative", zIndex: 10 }}>
        <motion.div {...fadeUp} style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Built with <span className="gradient">cutting-edge</span> technology
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "10px", fontSize: "1rem" }}>
            Enterprise-grade infrastructure, startup-friendly interface.
          </p>
        </motion.div>

        <div style={{
          display: "flex", justifyContent: "center", gap: "16px",
          flexWrap: "wrap", maxWidth: "900px", margin: "0 auto",
        }}>
          {techStack.map((tech, idx) => (
            <motion.div
              key={idx}
              {...stagger(idx * 0.1)}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "14px 24px",
                borderRadius: "var(--radius-full)",
                background: "var(--bg-glass)",
                border: "1px solid var(--border-subtle)",
                backdropFilter: "blur(12px)",
                transition: "all 0.3s ease",
              }}
              whileHover={{ borderColor: "rgba(99,102,241,0.3)", y: -2 }}
            >
              <span style={{ fontSize: "1.2rem" }}>{tech.icon}</span>
              <div>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{tech.label}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", display: "block" }}>{tech.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ TESTIMONIAL / SOCIAL PROOF ═══════ */}
      <section style={{ padding: "80px 20px", maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        <motion.div {...fadeUp} style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px",
        }}>
          {[
            { value: "50+", label: "Legal Documents Indexed", sub: "Across 8 compliance domains" },
            { value: "3,000+", label: "Chunks Vectorized", sub: "High-precision RAG retrieval" },
            { value: "< 10s", label: "Average Analysis Time", sub: "From idea to full compliance report" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              {...stagger(idx * 0.12)}
              style={{
                textAlign: "center",
                padding: "40px 24px",
                borderRadius: "var(--radius-xl)",
                background: "var(--bg-glass)",
                border: "1px solid var(--border-subtle)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{
                fontSize: "2.4rem", fontWeight: 800,
                fontFamily: "var(--font-mono)", letterSpacing: "-0.03em",
              }}>
                <span className="gradient">{stat.value}</span>
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "8px" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════ BOTTOM CTA ═══════ */}
      <section style={{
        padding: "100px 40px 120px",
        display: "flex",
        justifyContent: "center",
        position: "relative",
        zIndex: 10,
      }}>
        <motion.div
          {...fadeUp}
          style={{
            maxWidth: "800px", width: "100%", textAlign: "center",
            padding: "72px 48px",
            borderRadius: "var(--radius-2xl)",
            background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))",
            border: "1px solid rgba(99,102,241,0.2)",
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)",
            width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)",
            pointerEvents: "none",
          }} />

          <motion.div
            {...stagger(0.1)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "6px 14px", borderRadius: "var(--radius-full)",
              background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
              fontSize: "0.8rem", color: "#a5b4fc", fontWeight: 500, marginBottom: "24px",
            }}
          >
            <Sparkles style={{ width: "14px", height: "14px" }} />
            Free to use · No signup required
          </motion.div>

          <h2 style={{
            fontSize: "2.2rem", fontWeight: 800, color: "var(--text-primary)",
            letterSpacing: "-0.02em", lineHeight: 1.2, position: "relative",
          }}>
            Ready to navigate your{" "}
            <span className="gradient">legal compliance?</span>
          </h2>

          <p style={{
            color: "var(--text-secondary)", fontSize: "1.05rem",
            maxWidth: "500px", margin: "16px auto 0", lineHeight: 1.7,
          }}>
            Join leading Indian startups using AI to stay compliant
            from day one. Your first analysis is just seconds away.
          </p>

          <Link to="/get-started">
            <motion.button
              style={{
                padding: "16px 36px", borderRadius: "var(--radius-md)",
                background: "var(--accent-gradient)", color: "white",
                fontWeight: 600, fontSize: "1rem", border: "none", cursor: "pointer",
                marginTop: "32px", display: "inline-flex", alignItems: "center", gap: "10px",
                boxShadow: "0 0 40px var(--accent-glow)", fontFamily: "var(--font-sans)",
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