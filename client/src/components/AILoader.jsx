import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, Brain, CheckCircle2, Cpu } from "lucide-react";

/**
 * AILoader with two phases:
 * Phase 1 (waiting): Generic RAG pipeline messages while API is in-flight
 * Phase 2 (streaming): Shows actual retrieved documents from API response, one by one
 * 
 * Props:
 *   - retrievedContext: array of { source, page_number, score } — pass once API returns
 *   - onStreamComplete: callback fired when all documents have been shown
 */
const AILoader = ({ retrievedContext = [], onStreamComplete }) => {
  const phases = [
    { text: "Vectorizing your business idea...", icon: <Brain className="w-4 h-4" />, color: "#a78bfa" },
    { text: "Searching legal vector database...", icon: <Search className="w-4 h-4" />, color: "#22d3ee" },
    { text: "Retrieving relevant legal sections...", icon: <FileText className="w-4 h-4" />, color: "#34d399" },
    { text: "Analyzing compliance with Gemini LLM...", icon: <Cpu className="w-4 h-4" />, color: "#f59e0b" },
    { text: "Generating your compliance report...", icon: <CheckCircle2 className="w-4 h-4" />, color: "#6366f1" },
  ];

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [thoughtLog, setThoughtLog] = useState([]);
  const [streamedCount, setStreamedCount] = useState(0);
  const logRef = useRef(null);
  const hasReceivedDocs = retrievedContext.length > 0;

  // Phase rotation (only while waiting for API)
  useEffect(() => {
    if (hasReceivedDocs) return;
    const interval = setInterval(() => {
      setPhaseIndex((prev) => Math.min(prev + 1, phases.length - 1));
    }, 3200);
    return () => clearInterval(interval);
  }, [hasReceivedDocs]);

  // Progress bar — slow while waiting, fast once docs arrive
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (hasReceivedDocs) return Math.min(prev + 1.5, 98);
        return Math.min(prev + 0.4, 55);
      });
    }, 200);
    return () => clearInterval(interval);
  }, [hasReceivedDocs]);

  // Phase 1: Initial system messages (while waiting for API)
  useEffect(() => {
    let cancelled = false;
    const timeouts = [];
    const schedule = (fn, ms) => {
      const id = setTimeout(() => { if (!cancelled) fn(); }, ms);
      timeouts.push(id);
    };

    const msgs = [
      { delay: 300, text: "Initializing RAG pipeline..." },
      { delay: 1200, text: "Embedding business idea using all-MiniLM-L6-v2" },
      { delay: 2400, text: "Querying Qdrant vector database (top_k=20)" },
      { delay: 3800, text: "Scanning across 8 legal domains..." },
      { delay: 5200, text: "Matching against compliance requirements..." },
    ];

    msgs.forEach(({ delay, text }) => {
      schedule(() => {
        setThoughtLog((prev) => [...prev, { type: "system", text }]);
      }, delay);
    });

    return () => { cancelled = true; timeouts.forEach(clearTimeout); };
  }, []);

  // Phase 2: Stream actual retrieved documents once API responds
  useEffect(() => {
    if (!hasReceivedDocs) return;

    let cancelled = false;
    const timeouts = [];

    // Add a transition message
    const startDelay = 400;
    const t0 = setTimeout(() => {
      if (cancelled) return;
      setThoughtLog((prev) => [...prev, { type: "system", text: `Found ${retrievedContext.length} relevant chunks across multiple documents` }]);
    }, startDelay);
    timeouts.push(t0);

    // De-duplicate sources for cleaner display
    const seen = new Set();
    const uniqueDocs = retrievedContext.filter(ctx => {
      const key = ctx.source;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Stream each unique document with comfortable pacing
    uniqueDocs.forEach((ctx, idx) => {
      const delay = startDelay + 800 + (idx * 600); // 600ms between each — no rush
      const id = setTimeout(() => {
        if (cancelled) return;
        setThoughtLog((prev) => [...prev, {
          type: "doc",
          text: ctx.source,
          page: ctx.page_number,
          score: Math.round((ctx.score || 0) * 100),
        }]);
        setStreamedCount(idx + 1);
      }, delay);
      timeouts.push(id);
    });

    // Final messages + trigger completion
    const totalDocTime = startDelay + 800 + (uniqueDocs.length * 600);

    const finals = [
      { delay: totalDocTime + 500, text: "Cross-referencing legal obligations..." },
      { delay: totalDocTime + 1200, text: "Structuring compliance report..." },
      { delay: totalDocTime + 1800, text: "✓ Analysis complete — rendering results" },
    ];

    finals.forEach(({ delay, text }) => {
      const id = setTimeout(() => {
        if (cancelled) return;
        setThoughtLog((prev) => [...prev, { type: "success", text }]);
      }, delay);
      timeouts.push(id);
    });

    // Notify parent to show results
    const completeId = setTimeout(() => {
      if (!cancelled && onStreamComplete) onStreamComplete();
    }, totalDocTime + 2600);
    timeouts.push(completeId);

    return () => { cancelled = true; timeouts.forEach(clearTimeout); };
  }, [hasReceivedDocs]);

  // Auto-scroll thought log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [thoughtLog]);

  const currentPhase = hasReceivedDocs
    ? { text: "Processing retrieved documents...", icon: <CheckCircle2 className="w-4 h-4" />, color: "#34d399" }
    : phases[phaseIndex];

  return (
    <motion.div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "48px 16px", gap: "24px", maxWidth: "640px", margin: "0 auto", width: "100%",
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Spinner */}
      <div style={{ position: "relative", width: "56px", height: "56px" }}>
        <div style={{
          position: "absolute", inset: 0,
          border: "2px solid rgba(99,102,241,0.1)",
          borderTopColor: hasReceivedDocs ? "rgba(16,185,129,0.8)" : "rgba(99,102,241,0.8)",
          borderRadius: "50%",
          animation: "spin 1.2s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: "8px",
          border: "2px solid rgba(139,92,246,0.1)",
          borderTopColor: hasReceivedDocs ? "rgba(34,211,238,0.6)" : "rgba(139,92,246,0.6)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite reverse",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "6px", height: "6px",
          background: hasReceivedDocs ? "#10b981" : "var(--accent-primary)",
          borderRadius: "50%",
          boxShadow: `0 0 16px ${hasReceivedDocs ? "rgba(16,185,129,0.6)" : "rgba(99,102,241,0.6)"}`,
        }} />
      </div>

      {/* Phase message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={hasReceivedDocs ? "streaming" : phaseIndex}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            fontSize: "0.9rem", fontWeight: 500, color: currentPhase.color,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {currentPhase.icon}
          {currentPhase.text}
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div style={{
        width: "100%", maxWidth: "300px", height: "3px", borderRadius: "4px",
        background: "rgba(255,255,255,0.04)", overflow: "hidden",
      }}>
        <motion.div
          style={{
            height: "100%", borderRadius: "4px",
            background: hasReceivedDocs
              ? "linear-gradient(90deg, #10b981, #22d3ee)"
              : "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
          }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Thought stream terminal */}
      <motion.div
        style={{
          width: "100%",
          background: "rgba(5, 8, 22, 0.8)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Terminal header */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 16px",
          background: "rgba(255,255,255,0.02)",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
          </div>
          <span style={{
            fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)",
            marginLeft: "8px", letterSpacing: "0.05em",
          }}>
            lexagent — rag-pipeline
          </span>
        </div>

        {/* Log content */}
        <div
          ref={logRef}
          style={{
            padding: "12px 16px",
            maxHeight: "220px",
            overflowY: "auto",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            lineHeight: 2,
          }}
        >
          {thoughtLog.filter(Boolean).map((entry, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                color: entry.type === "doc" ? "var(--text-tertiary)"
                     : entry.type === "success" ? "#34d399"
                     : "#a5b4fc",
              }}
            >
              {entry.type === "doc" ? (
                <>
                  <FileText style={{ width: "11px", height: "11px", color: "#475569", flexShrink: 0 }} />
                  <span style={{ color: "#475569" }}>found</span>
                  <span style={{ color: "#94a3b8", flex: 1 }}>{entry.text}</span>
                  <span style={{ color: "#475569", fontSize: "0.65rem" }}>p.{entry.page}</span>
                  <span style={{
                    fontSize: "0.6rem", color: "#6366f1",
                    background: "rgba(99,102,241,0.1)",
                    padding: "1px 6px", borderRadius: "4px",
                  }}>
                    {entry.score}%
                  </span>
                </>
              ) : (
                <>
                  <span style={{ color: entry.type === "success" ? "#34d399" : "#6366f1" }}>▸</span>
                  <span>{entry.text}</span>
                </>
              )}
            </motion.div>
          ))}
          <span style={{ color: "#6366f1", animation: "blink 1s infinite" }}>▌</span>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </motion.div>
  );
};

export default AILoader;