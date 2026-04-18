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
    }, Math.max(10, 1500 / (safeScore || 1))); // Dynamic speed
    return () => clearInterval(interval);
  }, [safeScore]);

  const radius = 60;
  const circumference = radius * Math.PI;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const getColor = (s) => {
    if (s <= 35) return "#10b981"; // Emerald green
    if (s <= 70) return "#f59e0b"; // Amber orange
    return "#ef4444"; // Rose red
  };
  const color = getColor(safeScore);

  return (
    <motion.div 
      className="flex flex-col items-center justify-center relative w-full h-[180px] bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
    >
      <svg className="w-48 h-24 transform rotate-180" viewBox="0 0 140 70">
        <path
          d="M 10,70 A 60,60 0 0,1 130,70"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
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
          style={{ filter: `drop-shadow(0 0 12px ${color}80)` }}
        />
      </svg>
      <div className="absolute top-[85px] flex flex-col items-center">
        <span className="text-4xl font-black tracking-tight" style={{ color }}>{displayScore}%</span>
        <span className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">Severity Index</span>
      </div>
    </motion.div>
  );
};

export default RiskGauge;
