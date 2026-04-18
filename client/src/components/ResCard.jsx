import { motion } from "framer-motion";
import { useTypewriter } from "../hooks/useTypewriter";

const ResCard = ({ title, value, delay = 0 }) => {
  const typedValue = useTypewriter(value || "", 5, delay * 1000 + 300);

  return (
    <motion.div
      className="info-card h-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay }}
    >
      <h3>{title}</h3>
      <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", color: "#cbd5e1", marginTop: "10px" }}>
        {typedValue || (value ? "" : "No data yet")}
      </p>
    </motion.div>
  );
};

export default ResCard;