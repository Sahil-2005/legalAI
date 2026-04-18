import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AILoader = () => {
  const messages = [
    { text: "Vectorizing your business idea...", icon: "🔮" },
    { text: "Scanning 50+ Indian compliance documents...", icon: "📜" },
    { text: "Matching against relevant legal sections...", icon: "🔍" },
    { text: "Synthesizing legal guidance with Gemini...", icon: "✨" },
    { text: "Preparing your compliance blueprint...", icon: "📋" },
  ];

  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 0.8, 95));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        gap: "28px",
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Orbital spinner */}
      <div style={{
        position: "relative",
        width: "64px",
        height: "64px",
      }}>
        {/* Outer ring */}
        <div style={{
          position: "absolute", inset: 0,
          border: "2px solid rgba(99,102,241,0.1)",
          borderTopColor: "rgba(99,102,241,0.8)",
          borderRadius: "50%",
          animation: "spin 1.2s linear infinite",
        }} />
        {/* Inner ring */}
        <div style={{
          position: "absolute", inset: "8px",
          border: "2px solid rgba(139,92,246,0.1)",
          borderTopColor: "rgba(139,92,246,0.6)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite reverse",
        }} />
        {/* Center dot */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "8px", height: "8px",
          background: "var(--accent-primary)",
          borderRadius: "50%",
          boxShadow: "0 0 20px rgba(99,102,241,0.6)",
          animation: "pulse-dot 1.5s infinite",
        }} />
      </div>

      {/* Message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          style={{
            fontSize: "0.95rem",
            fontWeight: 500,
            color: "var(--text-secondary)",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <span>{messages[messageIndex].icon}</span>
          {messages[messageIndex].text}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <div style={{
        width: "280px",
        height: "3px",
        borderRadius: "4px",
        background: "rgba(255,255,255,0.05)",
        overflow: "hidden",
      }}>
        <motion.div
          style={{
            height: "100%",
            borderRadius: "4px",
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
          }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default AILoader;