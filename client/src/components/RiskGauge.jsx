import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const RiskGauge = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const safeScore = score || 0;
  
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < safeScore) {
        current += 1;
        setDisplayScore(current);
      } else {
        clearInterval(interval);
      }
    }, Math.max(10, 1500 / (safeScore || 1)));
    return () => clearInterval(interval);
  }, [safeScore]);

  const radius = 60;
  const circumference = radius * Math.PI;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const getColor = (s) => {
    if (s <= 35) return "#10b981";
    if (s <= 70) return "#f59e0b";
    return "#ef4444";
  };

  const getLabel = (s) => {
    if (s <= 35) return "Low Risk";
    if (s <= 70) return "Medium Risk";
    return "High Risk";
  };

  const color = getColor(safeScore);

  return (
    <motion.div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        width: "100%",
        height: "180px",
        background: "var(--bg-glass)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-md)",
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
    >
      <svg style={{ width: "192px", height: "96px", transform: "rotate(180deg)" }} viewBox="0 0 140 70">
        <path
          d="M 10,70 A 60,60 0 0,1 130,70"
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <motion.path
          d="M 10,70 A 60,60 0 0,1 130,70"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
          style={{ filter: `drop-shadow(0 0 16px ${color}60)` }}
        />
      </svg>
      <div style={{
        position: "absolute",
        top: "85px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <span style={{
          fontSize: "2.2rem",
          fontWeight: 800,
          fontFamily: "var(--font-mono)",
          letterSpacing: "-0.02em",
          color,
        }}>
          {displayScore}%
        </span>
        <span style={{
          fontSize: "0.65rem",
          color: "var(--text-tertiary)",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginTop: "2px",
        }}>
          {getLabel(safeScore)}
        </span>
      </div>
    </motion.div>
  );
};

export default RiskGauge;
