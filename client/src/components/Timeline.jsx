import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useTypewriter } from "../hooks/useTypewriter";

const TimelineItem = ({ stepText, index, totalDelay }) => {
  const typedText = useTypewriter(stepText.trim(), 4, totalDelay * 1000);
  
  return (
    <motion.div 
      className="relative pl-8 py-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: totalDelay }}
    >
      <motion.div 
        className="absolute left-[-11px] top-5"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, delay: totalDelay + 0.2 }}
      >
        <div className="bg-[#020617] rounded-full">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </div>
      </motion.div>

      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl shadow-xl transition-all hover:bg-slate-800/60 hover:border-slate-600">
        <p className="text-[15px] text-slate-300 leading-relaxed font-medium">
          {typedText || <span className="opacity-0">.</span>}
        </p>
      </div>
    </motion.div>
  );
};

export const Timeline = ({ stepsString, initialDelay = 1.2 }) => {
  if (!stepsString) return <p className="text-slate-500 italic mt-2">No steps provided.</p>;

  // Clean steps parsing, removing dots and spaces.
  const stepsList = stepsString.split('\n')
    .map(s => s.replace(/^•|-/, '').trim())
    .filter(s => s.length > 0);

  return (
    <div className="relative border-l-2 border-slate-700/60 ml-4 mt-6">
      {stepsList.map((step, idx) => (
        <TimelineItem 
          key={idx} 
          stepText={step} 
          index={idx}
          totalDelay={initialDelay + (idx * 0.4)} 
        />
      ))}
    </div>
  );
};

export default Timeline;
