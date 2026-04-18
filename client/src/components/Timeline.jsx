import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TimelineItem = ({ stepText, index, totalDelay }) => {
  return (
    <motion.div
      style={{ position: "relative", paddingLeft: "32px", paddingTop: "12px", paddingBottom: "12px" }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: totalDelay }}
    >
      <motion.div
        style={{ position: "absolute", left: "-11px", top: "16px" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, delay: totalDelay + 0.2 }}
      >
        <div style={{
          background: "var(--bg-primary)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <CheckCircle2 style={{
            width: "18px",
            height: "18px",
            color: "var(--info)",
            filter: "drop-shadow(0 0 8px rgba(34,211,238,0.6))",
          }} />
        </div>
      </motion.div>

      <div style={{
        background: "var(--bg-glass)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--border-subtle)",
        padding: "16px 20px",
        borderRadius: "var(--radius-lg)",
        transition: "all 0.25s ease",
      }}>
        <div style={{
          fontSize: "13px",
          color: "var(--text-secondary)",
          lineHeight: 1.7,
        }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.7 }}>{children}</p>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" style={{
                  color: "#818cf8",
                  textDecoration: "none",
                  borderBottom: "1px dashed rgba(129,140,248,0.3)",
                }}>
                  {children}
                </a>
              ),
            }}
          >
            {stepText.trim()}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

export const Timeline = ({ stepsString, initialDelay = 1.2 }) => {
  if (!stepsString) return <p style={{ color: "var(--text-muted)", fontStyle: "italic", marginTop: "8px" }}>No steps provided.</p>;

  const stepsList = stepsString.split('\n')
    .map(s => s.replace(/^•|-/, '').trim())
    .filter(s => s.length > 0);

  return (
    <div style={{
      position: "relative",
      borderLeft: "2px solid rgba(51,65,85,0.4)",
      marginLeft: "16px",
      marginTop: "16px",
    }}>
      {stepsList.map((step, idx) => (
        <TimelineItem
          key={idx}
          stepText={step}
          index={idx}
          totalDelay={initialDelay + (idx * 0.3)}
        />
      ))}
    </div>
  );
};

export default Timeline;
