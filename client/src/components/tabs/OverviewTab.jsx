import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Timeline from "../Timeline";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const OverviewTab = ({ result }) => {
  return (
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
          {result.risks ? (Array.isArray(result.risks) ? result.risks : String(result.risks || '').split('\n')).map(r => typeof r === 'string' ? r.trim() : String(r)).filter(r => r.length > 0).map((risk, idx) => (
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
              <div style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <span style={{ margin: 0 }}>{children}</span>,
                    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8", textDecoration: "underline" }}>{children}</a>,
                  }}
                >
                  {typeof risk === 'string' ? risk.replace(/^[\d.•\-)\s]+/, '').trim() : String(risk)}
                </ReactMarkdown>
              </div>
            </motion.div>
          )) : null}
        </div>
      </div>
    </motion.div>
  );
};
