import React, { useState, useEffect, useMemo, cloneElement } from "react";
import { downloadReport } from "../utils/reportGenerator";
import { analyzeLegal } from "../api/api";
import { OverviewTab, StepsTab, RisksTab, SourcesTab, RawTab } from "../components/tabs/TabComponents";
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
  const [showResults, setShowResults] = useState(false);
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
    setShowResults(false);
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

          const keys = ["businessType", "licenses", "steps", "risks", "riskScore", "cost", "raw"];

          const extractField = (field, isNum = false) => {
            const otherKeys = keys.filter(k => k !== field).join('|');
            const regex = new RegExp(`"${field}"\\s*:\\s*(.*?)(?=\\s*"(${otherKeys})"\\s*:|$)`, 's');
            const match = cleanText.match(regex);

            if (match) {
              let val = match[1].trim();
              if (isNum) {
                const numMatch = val.match(/\d+/);
                return numMatch ? parseInt(numMatch[0]) : null;
              }
              // Clean up JSON syntax artifacts
              val = val.replace(/^"/, ''); // remove leading quote
              val = val.replace(/,$/, '').trim(); // remove trailing comma
              val = val.replace(/}$/, '').trim(); // remove trailing brace
              val = val.replace(/"$/, '').trim(); // remove trailing quote

              return val.replace(/\\n/g, '\n').replace(/\\"/g, '"');
            }
            return null;
          };

          parsed = {
            businessType: extractField("businessType"),
            licenses: extractField("licenses"),
            steps: extractField("steps"),
            risks: extractField("risks"),
            riskScore: extractField("riskScore", true),
            cost: extractField("cost"),
            raw: extractField("raw")
          };

          if (!parsed.raw) {
            // If raw wasn't found (truncated before generation), use cleaned up full text
            parsed.raw = cleanText.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/[{}"]/g, '');
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
      setLoading(false);
      setShowResults(true);
    }

    // Don't hide loader yet — AILoader will call onStreamComplete
    // setLoading(false) is handled by onStreamComplete callback
  };

  // Dynamic Risk Score
  const riskScore = result.riskScore || (result.risks && result.risks.toLowerCase().includes("breach") ? 80 : 40);

  // Unique sources count
  const uniqueSources = useMemo(() => {
    const s = new Set(retrievedContext.map(c => c.source));
    return s.size;
  }, [retrievedContext]);

  // DOWNLOAD — generates a proper styled HTML report
  const handleDownload = () => {
    downloadReport(result, retrievedContext, idea, riskScore);
  };

  //  Tab navigation items
  const tabs = [
    { id: "overview", label: "Overview", icon: <Briefcase className="w-4 h-4" /> },
    { id: "steps", label: "Action Plan", icon: <Scale className="w-4 h-4" /> },
    { id: "risks", label: "Risks", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "sources", label: `Sources (${uniqueSources})`, icon: <FileSearch className="w-4 h-4" /> },
    { id: "raw", label: "Full Report", icon: <BookOpen className="w-4 h-4" /> },
  ];

  const hasResult = showResults && result.businessType && !loading;

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

      {/* ══════ INPUT — Textarea ══════ */}
      <motion.div
        style={{
          maxWidth: "700px",
          margin: "0 auto 16px auto",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div style={{
          position: "relative",
          borderRadius: "20px",
          border: "1px solid rgba(99,102,241,0.2)",
          background: "rgba(30,41,59,0.7)",
          backdropFilter: "blur(12px)",
          overflow: "hidden",
          transition: "border-color 0.3s ease",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 18px 0",
          }}>
            <Sparkles style={{ width: "16px", height: "16px", color: "#6366f1", opacity: 0.5, flexShrink: 0 }} />
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.03em" }}>Describe your business idea</span>
          </div>
          <textarea
            placeholder="e.g. I am building a mobile platform where registered doctors can consult patients via video call and issue digital prescriptions. The app will collect and store users' medical histories, Aadhaar details for KYC, and payment information..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "10px 18px 12px",
              border: "none",
              background: "transparent",
              color: "white",
              fontSize: "14px",
              lineHeight: 1.7,
              outline: "none",
              resize: "vertical",
              minHeight: "80px",
              maxHeight: "200px",
              fontFamily: "var(--font-sans)",
            }}
          />
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 14px 12px",
            borderTop: "1px solid rgba(255,255,255,0.03)",
          }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {idea.length} chars
            </span>
            <motion.button
              onClick={handleSubmit}
              disabled={loading || !idea.trim()}
              style={{
                padding: "9px 22px",
                borderRadius: "12px",
                border: "none",
                background: loading ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "7px",
                fontWeight: 600, fontSize: "13px",
                boxShadow: "0 0 20px rgba(99,102,241,0.2)",
                transition: "all 0.3s ease",
                fontFamily: "var(--font-sans)",
              }}
              whileHover={{ scale: loading ? 1 : 1.04 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send style={{ width: "14px", height: "14px" }} />
              {loading ? "Analyzing..." : "Analyze"}
            </motion.button>
          </div>
        </div>
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
            <AILoader
              retrievedContext={retrievedContext}
              onStreamComplete={() => {
                setLoading(false);
                setShowResults(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════ RESULT DASHBOARD ══════ */}
      {hasResult && (
        <motion.div
          className="flex flex-col gap-6 md:gap-10 w-full max-w-6xl mx-auto mt-10 mb-20 px-4 md:px-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >

          {/* ──── TOP ROW: Summary + Gauge ──── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
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
            className="w-full bg-slate-900/30 border border-slate-700/50 p-6 md:p-8 rounded-[24px]"
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
              {result.licenses ? (Array.isArray(result.licenses) ? result.licenses : String(result.licenses).split(',')).map((lic, i) => (
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
                  {typeof lic === 'string' ? lic.trim() : String(lic)}
                </motion.div>
              )) : <span style={{ color: "#475569" }}>Evaluating...</span>}
            </div>
          </motion.div>

          {/* ──── TAB NAVIGATION ──── */}
            <div className="flex gap-2 w-full bg-slate-950/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-1.5 overflow-x-auto no-scrollbar scroll-smooth">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-none md:flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl border-none cursor-pointer transition-all duration-300 whitespace-nowrap min-w-[130px] md:min-w-0 ${
                    activeTab === tab.id 
                      ? "bg-indigo-500/20 text-indigo-100 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30" 
                      : "bg-transparent text-slate-500 hover:text-slate-400 hover:bg-slate-800/20"
                  }`}
                  style={{ fontSize: "13px", fontWeight: activeTab === tab.id ? 600 : 500 }}
                >
                  <div className={`p-1 rounded-lg transition-colors ${activeTab === tab.id ? "bg-indigo-400/20" : "bg-slate-800/40"}`}>
                    {cloneElement(tab.icon, { size: 15, strokeWidth: 2.5, className: activeTab === tab.id ? "text-indigo-300" : "text-slate-600" })}
                  </div>
                  {tab.label}
                </button>
              ))}
            </div>

          {/* ──── TAB CONTENT ──── */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" && <OverviewTab result={result} riskScore={riskScore} />}
            {activeTab === "steps" && <StepsTab result={result} />}
            {activeTab === "risks" && <RisksTab result={result} riskScore={riskScore} />}
            {activeTab === "sources" && <SourcesTab retrievedContext={retrievedContext} uniqueSources={uniqueSources} />}
            {activeTab === "raw" && <RawTab result={result} />}
          </AnimatePresence>

          {/* ──── DOWNLOAD BUTTON ──── */}
          <motion.button
            onClick={handleDownload}
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