import { motion } from "framer-motion";
import { ExternalLink, FileText, Star } from "lucide-react";

const SourceCard = ({ source, page_number, score, refUrl, index, delay = 0 }) => {
  const relevance = Math.round((score || 0) * 100);
  const getRelevanceColor = (r) => {
    if (r >= 55) return { bar: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)" };
    if (r >= 45) return { bar: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" };
    return { bar: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.25)" };
  };
  const colors = getRelevanceColor(relevance);

  // Clean source name for display
  const displayName = source?.replace(/\.pdf$/i, "").replace(/_/g, " ") || "Unknown";

  return (
    <motion.a
      href={refUrl || "#"}
      target={refUrl ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="source-card-link"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 18px",
        borderRadius: "16px",
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        textDecoration: "none",
        color: "inherit",
        cursor: refUrl ? "pointer" : "default",
        transition: "all 0.25s ease",
        position: "relative",
        overflow: "hidden",
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, boxShadow: `0 0 25px ${colors.border}` }}
    >
      {/* Icon */}
      <div style={{
        width: "40px", height: "40px", borderRadius: "12px",
        background: `linear-gradient(135deg, ${colors.bar}20, ${colors.bar}10)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <FileText style={{ width: "18px", height: "18px", color: colors.bar }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: "13px", fontWeight: 600, color: "#e2e8f0",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          margin: 0,
        }}>
          {displayName}
        </p>
        <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0 0" }}>
          Page {page_number || "?"} · {relevance}% match
        </p>
      </div>

      {/* Relevance mini-bar */}
      <div style={{ width: "50px", flexShrink: 0 }}>
        <div style={{
          height: "4px", borderRadius: "4px",
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}>
          <motion.div
            style={{
              height: "100%", borderRadius: "4px",
              background: colors.bar,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${relevance}%` }}
            transition={{ duration: 0.8, delay: delay + 0.3 }}
          />
        </div>
      </div>

      {/* External link icon */}
      {refUrl && (
        <ExternalLink style={{ width: "14px", height: "14px", color: "#475569", flexShrink: 0 }} />
      )}
    </motion.a>
  );
};

export default SourceCard;
