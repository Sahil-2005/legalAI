import { useState, useEffect, useMemo } from "react";
import { analyzeLegal } from "../api/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AILoader from "../components/AILoader";
import { motion, AnimatePresence } from "framer-motion";
import RiskGauge from "../components/RiskGauge";
import Timeline from "../components/Timeline";
import Typewriter from "../components/Typewriter";
import SourceCard from "../components/SourceCard";
import {
  AlertTriangle, Briefcase, IndianRupee, ShieldCheck,
  BookOpen, Sparkles, Download,
  FileSearch, Scale, Send
} from "lucide-react";

const GetStarted = () => {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview | steps | risks | sources | raw

  const [history, setHistory] = useState([]);
  const [retrievedContext, setRetrievedContext] = useState([]);

  const [result, setResult] = useState({
    businessType: "",
    licenses: "",
    steps: "",
    risks: "",
    cost: "",
    riskScore: null,
    raw: ""
  });

  // Load history
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("history")) || [];
    setHistory(saved);
  }, []);

  const handleSubmit = async () => {
    if (!idea.trim()) return;

    setLoading(true);
    setActiveTab("overview");
    setRetrievedContext([]);

    try {
      const data = await analyzeLegal(idea);

      const text = data.response || data.data?.response || "{}";

      // Store retrieved context
      if (data.retrieved_context) {
        // De-duplicate by source + page_number
        const seen = new Set();
        const unique = data.retrieved_context.filter(ctx => {
          const key = `${ctx.source}_p${ctx.page_number}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setRetrievedContext(unique);
      }

      let parsed = {};
      try {
        let cleanText = text;
        if (cleanText.includes("```json")) {
          cleanText = cleanText.split("```json")[1].split("```")[0].trim();
        } else if (cleanText.includes("```")) {
          cleanText = cleanText.split("```")[1].split("```")[0].trim();
        }

        // Attempt standard parse first
        try {
          parsed = JSON.parse(cleanText);
        } catch (initialErr) {
          console.warn("JSON Parse Failed. Engaging Robust Regex Extraction...", initialErr);

          const extractField = (field, isNum = false) => {
            if (isNum) {
              const match = cleanText.match(new RegExp(`"${field}"\\s*:\\s*(\\d+)`));
              return match ? parseInt(match[1]) : null;
            }
            const match = cleanText.match(new RegExp(`"${field}"\\s*:\\s*"(.*?)"(?:\\s*,\\s*"|\\s*})`, 's'));
            if (match) return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
            return null;
          };

          parsed = {
            businessType: extractField("businessType"),
            licenses: extractField("licenses"),
            steps: extractField("steps"),
            risks: extractField("risks"),
            riskScore: extractField("riskScore", true),
            cost: extractField("cost")
          };

          const rawMatch = cleanText.match(/"raw"\s*:\s*"(.*)/s);
          if (rawMatch) {
            parsed.raw = rawMatch[1].replace(/\"\s*}$/, '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
          } else {
            parsed.raw = cleanText;
          }
        }
      } catch (parseErr) {
        console.error("Critical Failure in Content Processing:", parseErr);
        parsed = {
          businessType: idea.substring(0, 20) + "...",
          licenses: "Check detailed response below.",
          steps: "Review AI analysis.",
          risks: "Potential non-compliance (Parsing Error)",
          cost: "Consult Legal",
          raw: text
        };
      }

      setResult({
        businessType: parsed.businessType || "Unknown Business",
        licenses: parsed.licenses || "General Compliance Required",
        steps: parsed.steps || "Please refer to explanation.",
        risks: parsed.risks || "Standard Legal Risk",
        cost: parsed.cost || "Variable Cost",
        riskScore: parsed.riskScore || null,
        raw: parsed.raw || text
      });

      // Save History
      const newHistory = [idea, ...history.filter(h => h !== idea).slice(0, 3)];
      setHistory(newHistory);
      localStorage.setItem("history", JSON.stringify(newHistory));

    } catch (err) {
      console.error(err);
      setResult({
        businessType: "",
        licenses: "",
        steps: "",
        risks: "",
        cost: "",
        riskScore: null,
        raw: "Something went wrong. Try again."
      });
    }

    setLoading(false);
  };

  // Dynamic Risk Score
  const riskScore = result.riskScore || (result.risks && result.risks.toLowerCase().includes("breach") ? 80 : 40);

  // Unique sources count
  const uniqueSources = useMemo(() => {
    const s = new Set(retrievedContext.map(c => c.source));
    return s.size;
  }, [retrievedContext]);

  // PDF DOWNLOAD
  const downloadReport = () => {
    const content = `
═══════════════════════════════════════════════
  AMIVRE LEGAL — AI Compliance Report
═══════════════════════════════════════════════

Business Idea: ${idea}

Business Type: ${result.businessType}
Licenses: ${result.licenses}
Risk Score: ${riskScore}/100

Steps:
${result.steps}

Risks:
${result.risks}

Cost: ${result.cost}

────────────────────────────────────────────────
  Full AI Analysis
────────────────────────────────────────────────
${result.raw}

────────────────────────────────────────────────
  Referenced Documents (${retrievedContext.length})
────────────────────────────────────────────────
${retrievedContext.map((ctx, i) => `${i + 1}. ${ctx.source} — Page ${ctx.page_number} (${Math.round(ctx.score * 100)}% match)${ctx.ref ? `\n   URL: ${ctx.ref}` : ""}`).join("\n")}

═══════════════════════════════════════════════
  Generated by AMIVRE Legal AI · ${new Date().toLocaleDateString()}
═══════════════════════════════════════════════
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `legal-report-${Date.now()}.txt`;
    link.click();
  };

  //  Tab navigation items
  const tabs = [
    { id: "overview", label: "Overview", icon: <Briefcase className="w-4 h-4" /> },
    { id: "steps", label: "Action Plan", icon: <Scale className="w-4 h-4" /> },
    { id: "risks", label: "Risks", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "sources", label: `Sources (${uniqueSources})`, icon: <FileSearch className="w-4 h-4" /> },
    { id: "raw", label: "Full Report", icon: <BookOpen className="w-4 h-4" /> },
  ];

  const hasResult = result.businessType && !loading;

  return (
    <div className="get-started" style={{ minHeight: "100vh" }}>

      {/* ══════ HEADER ══════ */}
      <motion.div
        style={{ marginBottom: "40px" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="gs-title" style={{ fontSize: "2.8rem", fontWeight: 800, marginBottom: "8px" }}>
          Analyze Your Startup Today
        </h1>
        <p style={{ color: "#64748b", fontSize: "1rem", marginTop: 0 }}>
          Powered by RAG · 50+ Indian compliance documents · Real-time AI analysis
        </p>
      </motion.div>

      {/* ══════ INPUT ══════ */}
      <motion.div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          maxWidth: "700px",
          margin: "0 auto 16px auto",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div style={{
          position: "relative",
          flex: 1,
          display: "flex",
          alignItems: "center",
        }}>
          <Sparkles style={{
            position: "absolute", left: "16px",
            width: "18px", height: "18px",
            color: "#6366f1", opacity: 0.6,
          }} />
          <input
            placeholder="Describe your business idea in detail..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{
              width: "100%",
              padding: "16px 16px 16px 46px",
              borderRadius: "16px",
              border: "1px solid rgba(99,102,241,0.2)",
              background: "rgba(30,41,59,0.7)",
              backdropFilter: "blur(12px)",
              color: "white",
              fontSize: "15px",
              outline: "none",
              transition: "border-color 0.3s ease",
            }}
          />
        </div>
        <motion.button
          onClick={handleSubmit}
          disabled={loading || !idea.trim()}
          style={{
            padding: "14px 28px",
            borderRadius: "16px",
            border: "none",
            background: loading ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
            fontSize: "14px",
            boxShadow: "0 0 30px rgba(99,102,241,0.25)",
            transition: "all 0.3s ease",
          }}
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="w-4 h-4" />
          {loading ? "Analyzing..." : "Analyze"}
        </motion.button>
      </motion.div>

      {/* ══════ HISTORY ══════ */}
      {history.length > 0 && (
        <motion.div
          style={{
            display: "flex", gap: "8px", justifyContent: "center",
            flexWrap: "wrap", marginTop: "8px", marginBottom: "10px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {history.map((h, i) => (
            <span
              key={i}
              onClick={() => setIdea(h)}
              style={{
                fontSize: "12px", padding: "5px 12px",
                background: "rgba(30,41,59,0.6)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "20px", cursor: "pointer",
                color: "#94a3b8", transition: "all 0.2s ease",
                maxWidth: "200px", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {h}
            </span>
          ))}
        </motion.div>
      )}

      {/* ══════ QUICK SUGGESTIONS ══════ */}
      <div className="suggestions" style={{ marginBottom: "30px" }}>
        <button onClick={() => setIdea("I am building a mobile platform where registered doctors can consult patients via video call and issue digital prescriptions. The app will collect and store users' medical histories, Aadhaar details for KYC, and payment information.")}>
          🏥 Telemedicine
        </button>
        <button onClick={() => setIdea("I am building an e-commerce website that collects user data and processes payments through UPI and credit cards")}>
          🛒 E-commerce
        </button>
        <button onClick={() => setIdea("I am building a fintech lending platform that provides instant personal loans using AI-based credit scoring and collects PAN, bank statements, and Aadhaar for KYC")}>
          💳 Fintech
        </button>
        <button onClick={() => setIdea("I am building a food delivery app that partners with restaurants and cloud kitchens, handles online payments, and collects customer addresses and dietary preferences")}>
          🍕 FoodTech
        </button>
      </div>

      {/* ══════ LOADING ══════ */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <AILoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════ RESULT DASHBOARD ══════ */}
      {hasResult && (
        <motion.div
          style={{
            display: "flex", flexDirection: "column", gap: "24px",
            marginTop: "40px", textAlign: "left",
            alignItems: "center", width: "100%",
            maxWidth: "1100px", margin: "40px auto 60px auto",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >

          {/* ──── TOP ROW: Summary + Gauge ──── */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 280px",
            gap: "20px", width: "100%",
          }}>
            {/* Business Type */}
            <motion.div
              style={{
                background: "rgba(30,41,59,0.4)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(51,65,85,0.5)", padding: "24px",
                borderRadius: "20px", boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
                position: "relative", overflow: "hidden",
              }}
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div style={{
                position: "absolute", top: 0, left: 0,
                width: "3px", height: "100%",
                background: "#22d3ee",
                boxShadow: "0 0 15px #22d3ee",
              }} />
              <h3 style={{
                display: "flex", alignItems: "center", gap: "8px",
                color: "#94a3b8", fontWeight: 600, marginBottom: "10px",
                textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "12px",
              }}>
                <Briefcase style={{ width: "16px", height: "16px", color: "#22d3ee" }} />
                Business Classification
              </h3>
              <p style={{ fontSize: "18px", color: "white", fontWeight: 500, paddingLeft: "4px", margin: 0 }}>
                <Typewriter text={result.businessType} delay={15} startDelay={600} />
              </p>
            </motion.div>

            {/* Cost */}
            <motion.div
              style={{
                background: "rgba(30,41,59,0.4)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(51,65,85,0.5)", padding: "24px",
                borderRadius: "20px", boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
                position: "relative", overflow: "hidden",
              }}
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div style={{
                position: "absolute", top: 0, left: 0,
                width: "3px", height: "100%",
                background: "#34d399",
                boxShadow: "0 0 15px #34d399",
              }} />
              <h3 style={{
                display: "flex", alignItems: "center", gap: "8px",
                color: "#94a3b8", fontWeight: 600, marginBottom: "10px",
                textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "12px",
              }}>
                <IndianRupee style={{ width: "16px", height: "16px", color: "#34d399" }} />
                Estimated Cost
              </h3>
              <p style={{ fontSize: "18px", color: "white", fontWeight: 500, paddingLeft: "4px", margin: 0 }}>
                <Typewriter text={result.cost} delay={15} startDelay={900} />
              </p>
            </motion.div>

            {/* Risk Gauge */}
            <motion.div
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <RiskGauge score={riskScore} />
            </motion.div>
          </div>

          {/* ──── LICENSES BADGES ──── */}
          <motion.div
            style={{
              width: "100%",
              background: "rgba(30,41,59,0.3)",
              border: "1px solid rgba(51,65,85,0.5)",
              padding: "28px 32px",
              borderRadius: "24px",
            }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <h3 style={{
              display: "flex", alignItems: "center", gap: "8px",
              fontSize: "16px", color: "white", fontWeight: 700, marginBottom: "20px",
            }}>
              <ShieldCheck style={{ width: "20px", height: "20px", color: "#818cf8" }} />
              Essential Licenses & Compliance
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {result.licenses ? result.licenses.split(',').map((lic, i) => (
                <motion.div
                  key={i}
                  style={{
                    padding: "10px 20px",
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    color: "#c7d2fe",
                    borderRadius: "999px",
                    fontWeight: 500,
                    fontSize: "13px",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 0 15px rgba(99,102,241,0.08)",
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", delay: 1.2 + (i * 0.12) }}
                >
                  {lic.trim()}
                </motion.div>
              )) : <span style={{ color: "#475569" }}>Evaluating...</span>}
            </div>
          </motion.div>

          {/* ──── TAB NAVIGATION ──── */}
          <motion.div
            style={{
              display: "flex", gap: "6px", width: "100%",
              background: "rgba(15,23,42,0.6)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(51,65,85,0.4)",
              borderRadius: "16px", padding: "6px",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background: activeTab === tab.id
                    ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))"
                    : "transparent",
                  color: activeTab === tab.id ? "#c7d2fe" : "#64748b",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  borderBottom: activeTab === tab.id ? "2px solid #6366f1" : "2px solid transparent",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* ──── TAB CONTENT ──── */}
          <AnimatePresence mode="wait">

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Steps Preview */}
                <div style={{
                  background: "rgba(30,41,59,0.3)",
                  border: "1px solid rgba(51,65,85,0.4)",
                  borderRadius: "20px", padding: "28px",
                }}>
                  <h3 style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    fontSize: "16px", fontWeight: 700, color: "white",
                    marginBottom: "16px", borderBottom: "1px solid rgba(51,65,85,0.5)",
                    paddingBottom: "12px",
                  }}>
                    ⚙️ Action Plan
                  </h3>
                  <Timeline stepsString={result.steps} initialDelay={0.2} />
                </div>

                {/* Risks Preview */}
                <div style={{
                  background: "rgba(30,41,59,0.3)",
                  border: "1px solid rgba(51,65,85,0.4)",
                  borderRadius: "20px", padding: "28px",
                }}>
                  <h3 style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    fontSize: "16px", fontWeight: 700, color: "#fb7185",
                    marginBottom: "16px", borderBottom: "1px solid rgba(51,65,85,0.5)",
                    paddingBottom: "12px",
                  }}>
                    <AlertTriangle strokeWidth={2.5} style={{ width: "18px", height: "18px" }} />
                    Legal Vulnerabilities
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                    {result.risks ? result.risks.split('\n').map(r => r.trim()).filter(r => r.length > 0).map((risk, idx) => (
                      <motion.div
                        key={idx}
                        style={{
                          background: "rgba(244,63,94,0.05)",
                          border: "1px solid rgba(244,63,94,0.15)",
                          padding: "16px",
                          borderRadius: "16px",
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + (idx * 0.15) }}
                      >
                        <div style={{
                          position: "absolute", left: 0, top: 0,
                          width: "3px", height: "100%",
                          background: "rgba(244,63,94,0.4)",
                        }} />
                        <AlertTriangle style={{ width: "16px", height: "16px", color: "#fb7185", flexShrink: 0, marginTop: "2px" }} />
                        <p style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                          {risk.replace(/^[\d.•\-)\s]+/, '').trim()}
                        </p>
                      </motion.div>
                    )) : null}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEPS TAB */}
            {activeTab === "steps" && (
              <motion.div
                key="steps"
                style={{
                  width: "100%",
                  background: "rgba(30,41,59,0.3)",
                  border: "1px solid rgba(51,65,85,0.4)",
                  borderRadius: "20px", padding: "32px",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  fontSize: "18px", fontWeight: 700, color: "white",
                  marginBottom: "20px", borderBottom: "1px solid rgba(51,65,85,0.5)",
                  paddingBottom: "12px",
                }}>
                  <Scale style={{ width: "20px", height: "20px", color: "#22d3ee" }} />
                  Complete Action Plan
                </h3>
                <Timeline stepsString={result.steps} initialDelay={0.1} />
              </motion.div>
            )}

            {/* RISKS TAB */}
            {activeTab === "risks" && (
              <motion.div
                key="risks"
                style={{
                  width: "100%",
                  background: "rgba(30,41,59,0.3)",
                  border: "1px solid rgba(51,65,85,0.4)",
                  borderRadius: "20px", padding: "32px",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: "20px", borderBottom: "1px solid rgba(51,65,85,0.5)",
                  paddingBottom: "12px",
                }}>
                  <h3 style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    fontSize: "18px", fontWeight: 700, color: "#fb7185", margin: 0,
                  }}>
                    <AlertTriangle strokeWidth={2.5} style={{ width: "20px", height: "20px" }} />
                    Risk Analysis
                  </h3>
                  <div style={{
                    padding: "6px 16px", borderRadius: "999px",
                    background: riskScore > 70 ? "rgba(239,68,68,0.15)" : riskScore > 40 ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
                    color: riskScore > 70 ? "#fca5a5" : riskScore > 40 ? "#fcd34d" : "#6ee7b7",
                    fontSize: "13px", fontWeight: 600,
                  }}>
                    Risk Score: {riskScore}/100
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {result.risks ? result.risks.split('\n').map(r => r.trim()).filter(r => r.length > 0).map((risk, idx) => (
                    <motion.div
                      key={idx}
                      style={{
                        background: "rgba(244,63,94,0.05)",
                        border: "1px solid rgba(244,63,94,0.15)",
                        padding: "20px",
                        borderRadius: "16px",
                        display: "flex",
                        gap: "14px",
                        alignItems: "flex-start",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + (idx * 0.12) }}
                    >
                      <div style={{
                        position: "absolute", left: 0, top: 0,
                        width: "3px", height: "100%",
                        background: "rgba(244,63,94,0.5)",
                      }} />
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "8px",
                        background: "rgba(244,63,94,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <AlertTriangle style={{ width: "14px", height: "14px", color: "#fb7185" }} />
                      </div>
                      <div>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({children}) => <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>{children}</p>,
                            a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8", textDecoration: "underline" }}>{children}</a>,
                          }}
                        >
                          {risk.replace(/^[\d.•\-)\s]+/, '').trim()}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  )) : null}
                </div>
              </motion.div>
            )}

            {/* SOURCES TAB */}
            {activeTab === "sources" && (
              <motion.div
                key="sources"
                style={{
                  width: "100%",
                  background: "rgba(30,41,59,0.3)",
                  border: "1px solid rgba(51,65,85,0.4)",
                  borderRadius: "20px", padding: "32px",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: "20px", borderBottom: "1px solid rgba(51,65,85,0.5)",
                  paddingBottom: "12px",
                }}>
                  <h3 style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    fontSize: "18px", fontWeight: 700, color: "white", margin: 0,
                  }}>
                    <FileSearch style={{ width: "20px", height: "20px", color: "#818cf8" }} />
                    Referenced Legal Documents
                  </h3>
                  <span style={{
                    padding: "4px 14px", borderRadius: "999px",
                    background: "rgba(99,102,241,0.1)",
                    color: "#a5b4fc", fontSize: "12px", fontWeight: 600,
                  }}>
                    {retrievedContext.length} chunks · {uniqueSources} documents
                  </span>
                </div>

                {retrievedContext.length > 0 ? (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}>
                    {retrievedContext.map((ctx, idx) => (
                      <SourceCard
                        key={idx}
                        source={ctx.source}
                        page_number={ctx.page_number}
                        score={ctx.score}
                        refUrl={ctx.ref}
                        index={idx}
                        delay={0.05 * idx}
                      />
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#475569", fontStyle: "italic" }}>
                    No source documents retrieved yet.
                  </p>
                )}
              </motion.div>
            )}

            {/* RAW / FULL REPORT TAB */}
            {activeTab === "raw" && (
              <motion.div
                key="raw"
                style={{
                  width: "100%",
                  background: "rgba(30,41,59,0.5)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(51,65,85,0.5)",
                  borderRadius: "24px",
                  padding: "40px",
                  boxShadow: "0 0 60px rgba(30,41,59,0.4)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  fontSize: "20px", fontWeight: 700,
                  color: "#c4b5fd",
                  marginBottom: "24px",
                }}>
                  <BookOpen style={{ width: "22px", height: "22px" }} />
                  Detailed Legal Synthesis
                </h3>
                <div style={{
                  color: "#cbd5e1",
                  fontSize: "14px",
                  lineHeight: 1.9,
                }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 style={{ color: "#e2e8f0", fontSize: "22px", fontWeight: 700, marginTop: "24px", borderBottom: "1px solid rgba(51,65,85,0.5)", paddingBottom: "8px" }}>{children}</h1>,
                      h2: ({children}) => <h2 style={{ color: "#e2e8f0", fontSize: "18px", fontWeight: 600, marginTop: "20px" }}>{children}</h2>,
                      h3: ({children}) => <h3 style={{ color: "#c7d2fe", fontSize: "16px", fontWeight: 600, marginTop: "16px" }}>{children}</h3>,
                      p: ({children}) => <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.9, marginBottom: "12px" }}>{children}</p>,
                      a: ({href, children}) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#818cf8",
                            textDecoration: "none",
                            borderBottom: "1px dashed rgba(129,140,248,0.4)",
                            transition: "all 0.2s ease",
                            fontWeight: 500,
                          }}
                        >
                          {children}
                        </a>
                      ),
                      li: ({children}) => <li style={{ color: "#cbd5e1", marginBottom: "6px" }}>{children}</li>,
                      strong: ({children}) => <strong style={{ color: "#f1f5f9", fontWeight: 600 }}>{children}</strong>,
                      blockquote: ({children}) => (
                        <blockquote style={{
                          borderLeft: "3px solid #6366f1",
                          paddingLeft: "16px", margin: "16px 0",
                          color: "#94a3b8", fontStyle: "italic",
                        }}>
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {result.raw}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ──── DOWNLOAD BUTTON ──── */}
          <motion.button
            onClick={downloadReport}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "14px 32px",
              borderRadius: "16px",
              border: "1px solid rgba(99,102,241,0.3)",
              background: "rgba(99,102,241,0.08)",
              color: "#c7d2fe",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              transition: "all 0.3s ease",
              marginTop: "8px",
            }}
            whileHover={{
              background: "rgba(99,102,241,0.15)",
              boxShadow: "0 0 30px rgba(99,102,241,0.15)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <Download className="w-4 h-4" />
            Download Complete Report
          </motion.button>

        </motion.div>
      )}

    </div>
  );
};

export default GetStarted;