import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Scale, BookOpen, FileSearch } from "lucide-react";
import Timeline from "../Timeline";
import SourceCard from "../SourceCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const OverviewTab = ({ result, riskScore }) => (
  <motion.div
    key="overview"
    className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/30 rounded-[28px] p-6 md:p-8 shadow-xl shadow-black/10 transition-all hover:bg-slate-800/50 hover:border-slate-500/40">
      <h3 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "18px", fontWeight: 700, color: "white", marginBottom: "20px", borderBottom: "1px dashed rgba(100,116,139,0.5)", paddingBottom: "16px" }}>
        ⚙️ Action Plan
      </h3>
      <Timeline stepsString={result.steps} initialDelay={0.2} />
    </div>
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/30 rounded-[28px] p-7 md:p-8 shadow-xl shadow-black/10 transition-all hover:bg-slate-800/50 hover:border-slate-500/40">
      <h3 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "18px", fontWeight: 700, color: "#fb7185", marginBottom: "20px", borderBottom: "1px dashed rgba(100,116,139,0.5)", paddingBottom: "16px" }}>
        <AlertTriangle strokeWidth={2.5} style={{ width: "20px", height: "20px" }} />
        Legal Vulnerabilities
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
        {result.risks ? (Array.isArray(result.risks) ? result.risks : String(result.risks || '').split('\n')).map(r => typeof r === 'string' ? r.trim() : String(r)).filter(r => r.length > 0).map((risk, idx) => (
          <motion.div key={idx} style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.15)", padding: "16px", borderRadius: "16px", display: "flex", gap: "12px", alignItems: "flex-start", position: "relative", overflow: "hidden" }} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 + (idx * 0.15) }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: "3px", height: "100%", background: "rgba(244,63,94,0.4)" }} />
            <AlertTriangle style={{ width: "16px", height: "16px", color: "#fb7185", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ children }) => <span style={{ margin: 0 }}>{children}</span>, a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8", textDecoration: "underline" }}>{children}</a> }}>
                {typeof risk === 'string' ? risk.replace(/^[\d.•\-)\s]+/, '').trim() : String(risk)}
              </ReactMarkdown>
            </div>
          </motion.div>
        )) : null}
      </div>
    </div>
  </motion.div>
);

export const StepsTab = ({ result }) => (
  <motion.div
    key="steps"
    className="w-full bg-slate-800/30 border border-slate-700/40 rounded-[28px] p-6 md:p-10 shadow-2xl shadow-black/20"
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
  >
    <h3 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "20px", fontWeight: 700, color: "white", marginBottom: "24px", borderBottom: "1px solid rgba(51,65,85,0.6)", paddingBottom: "16px" }}>
      <Scale strokeWidth={2.5} style={{ width: "24px", height: "24px", color: "#22d3ee" }} />
      Complete Action Plan
    </h3>
    <Timeline stepsString={result.steps} initialDelay={0.1} />
  </motion.div>
);

export const RisksTab = ({ result, riskScore }) => (
  <motion.div
    key="risks"
    className="w-full bg-slate-800/30 border border-slate-700/40 rounded-[28px] p-6 md:p-10 shadow-2xl shadow-black/20"
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "26px", borderBottom: "1px solid rgba(51,65,85,0.6)", paddingBottom: "18px" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "20px", fontWeight: 700, color: "#fb7185", margin: 0 }}>
        <AlertTriangle strokeWidth={2.5} style={{ width: "24px", height: "24px" }} />
        Risk Analysis
      </h3>
      <div style={{ padding: "8px 20px", borderRadius: "999px", background: riskScore > 70 ? "rgba(239,68,68,0.15)" : riskScore > 40 ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)", color: riskScore > 70 ? "#fca5a5" : riskScore > 40 ? "#fcd34d" : "#6ee7b7", fontSize: "14px", fontWeight: 700, letterSpacing: "0.5px" }}>
        Risk Score: {riskScore}/100
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {result.risks ? (Array.isArray(result.risks) ? result.risks : String(result.risks || '').split('\n')).map(r => typeof r === 'string' ? r.trim() : String(r)).filter(r => r.length > 0).map((risk, idx) => (
        <motion.div key={idx} style={{ background: "rgba(244,63,94,0.04)", border: "1px solid rgba(244,63,94,0.18)", padding: "24px", borderRadius: "20px", display: "flex", gap: "16px", alignItems: "flex-start", position: "relative", overflow: "hidden" }} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 + (idx * 0.12) }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: "4px", height: "100%", background: "rgba(244,63,94,0.6)" }} />
          <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(244,63,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle style={{ width: "16px", height: "16px", color: "#fb7185" }} />
          </div>
          <div>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ children }) => <p style={{ color: "#cbd5e1", fontSize: "15px", lineHeight: 1.8, margin: 0 }}>{children}</p>, a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8", textDecoration: "underline" }}>{children}</a> }}>
              {typeof risk === 'string' ? risk.replace(/^[\d.•\-)\s]+/, '').trim() : String(risk)}
            </ReactMarkdown>
          </div>
        </motion.div>
      )) : null}
    </div>
  </motion.div>
);

export const SourcesTab = ({ retrievedContext, uniqueSources }) => (
  <motion.div
    key="sources"
    className="w-full bg-slate-800/30 border border-slate-700/40 rounded-[28px] p-6 md:p-10 shadow-2xl shadow-black/20"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: "26px", borderBottom: "1px solid rgba(51,65,85,0.6)",
      paddingBottom: "16px",
    }}>
      <h3 style={{
        display: "flex", alignItems: "center", gap: "10px",
        fontSize: "20px", fontWeight: 700, color: "white", margin: 0,
      }}>
        <FileSearch strokeWidth={2.5} style={{ width: "24px", height: "24px", color: "#a78bfa" }} />
        Legal Sources
      </h3>
      <div style={{ padding: "8px 20px", borderRadius: "999px", background: "rgba(167,139,250,0.15)", color: "#c4b5fd", fontSize: "14px", fontWeight: 700, letterSpacing: "0.5px" }}>
        {uniqueSources} Unique Documents
      </div>
    </div>

    {retrievedContext.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <p style={{ color: "#475569", fontStyle: "italic", fontSize: "15px" }}>
        No source documents retrieved yet.
      </p>
    )}
  </motion.div>
);

export const RawTab = ({ result }) => (
  <motion.div
    key="raw"
    className="w-full bg-slate-900/50 border border-slate-700/40 rounded-[28px] p-6 md:p-10 shadow-2xl shadow-black/20"
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
  >
    <h3 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "20px", fontWeight: 700, color: "#c4b5fd", marginBottom: "24px", borderBottom: "1px solid rgba(51,65,85,0.6)", paddingBottom: "16px" }}>
      <BookOpen strokeWidth={2.5} style={{ width: "24px", height: "24px", color: "#60a5fa" }} />
      Detailed Legal Synthesis
    </h3>
    <div style={{ color: "#cbd5e1", fontSize: "16px", lineHeight: 1.8, fontFamily: "var(--font-sans)", letterSpacing: "0.2px" }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h1: ({ children }) => <h1 style={{ color: "#e2e8f0", fontSize: "22px", fontWeight: 700, marginTop: "24px", borderBottom: "1px solid rgba(51,65,85,0.5)", paddingBottom: "8px" }}>{children}</h1>, h2: ({ children }) => <h2 style={{ color: "#e2e8f0", fontSize: "18px", fontWeight: 600, marginTop: "20px" }}>{children}</h2>, h3: ({ children }) => <h3 style={{ color: "#c7d2fe", fontSize: "16px", fontWeight: 600, marginTop: "16px" }}>{children}</h3>, p: ({ children }) => <p style={{ color: "#cbd5e1", fontSize: "16px", lineHeight: 1.8, marginBottom: "20px" }}>{children}</p>, a: ({ href, children }) => (<a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8", textDecoration: "underline", textUnderlineOffset: "4px", transition: "all 0.2s ease" }}>{children}</a>), li: ({ children }) => <li style={{ color: "#cbd5e1", marginBottom: "10px", fontSize: "16px" }}>{children}</li>, strong: ({ children }) => <strong style={{ color: "white", fontWeight: 700 }}>{children}</strong>, blockquote: ({ children }) => (<blockquote style={{ borderLeft: "3px solid #6366f1", paddingLeft: "16px", margin: "16px 0", color: "#94a3b8", fontStyle: "italic" }}>{children}</blockquote>) }}>
        {result.raw}
      </ReactMarkdown>
    </div>
  </motion.div>
);
