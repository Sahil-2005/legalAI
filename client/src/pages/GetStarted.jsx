// import { useState } from "react";
// import { analyzeLegal } from "../api/api";
// import ResCard from "../components/ResCard";

// const GetStarted = () => {
//   const [idea, setIdea] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [result, setResult] = useState({
//     businessType: "",
//     licenses: "",
//     steps: "",
//     risks: "",
//     cost: "",
//     raw: ""
//   });

//   const handleSubmit = async () => {
//     if (!idea.trim()) return;

//     setLoading(true);

//     try {
//       const data = await analyzeLegal(idea);

//       const text =
//         data.response || data.data?.response || "No response received";

//       // 🔥 BASIC PARSING (you can upgrade later with GPT formatting)
//       const parsed = {
//         businessType: idea.toLowerCase().includes("e-commerce")
//           ? "E-commerce Platform"
//           : "Digital Business",

//         licenses: text.includes("consent")
//           ? "User Consent Compliance, Data Protection Compliance"
//           : "General Compliance Required",

//         steps:
//           "Implement privacy policy, collect user consent, secure data storage",

//         risks: text.includes("breach")
//           ? "Data Breach Risk"
//           : "Legal non-compliance risk",

//         cost: "Varies depending on scale",

//         raw: text
//       };

//       setResult(parsed);
//     } catch (err) {
//       console.error(err);
//       setResult({
//         businessType: "",
//         licenses: "",
//         steps: "",
//         risks: "",
//         cost: "",
//         raw: "Something went wrong. Try again."
//       });
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="get-started">

//       {/* 🔥 TITLE */}
//       <h1 className="gs-title">
//         Analyze Your Startup Today 🚀
//       </h1>

//       {/* 🔥 INPUT */}
//       <div className="input-box">
//         <input
//           placeholder="Describe your business idea..."
//           value={idea}
//           onChange={(e) => setIdea(e.target.value)}
//         />
//         <button onClick={handleSubmit}>
//           {loading ? "..." : "⚡"}
//         </button>
//       </div>

//       {/* 🔥 SUGGESTIONS */}
//       <div className="suggestions">
//         <button onClick={() => setIdea("I am building an e-commerce website that collects user data")}>
//           🛒 E-commerce
//         </button>
//         <button onClick={() => setIdea("I am building a mobile app that stores user data")}>
//           📱 App
//         </button>
//         <button onClick={() => setIdea("I am building a SaaS platform handling customer data")}>
//           💻 SaaS
//         </button>
//       </div>

//       {/* 🔥 RESULT CARDS */}
//       <div className="result-grid">

//         <ResCard title="📌 Business Type" value={result.businessType} />
//         <ResCard title="📄 Licenses" value={result.licenses} />
//         <ResCard title="⚙️ Steps" value={result.steps} />
//         <ResCard title="💰 Cost" value={result.cost} />
//         <ResCard title="⚠️ Risks" value={result.risks} />

//       </div>

//       {/* 🔥 FULL AI RESPONSE (optional but powerful) */}
//       {result.raw && (
//         <div className="result-raw">
//           <h3>AI Explanation</h3>
//           <p>{result.raw}</p>
//         </div>
//       )}

//     </div>
//   );
// };

// export default GetStarted;






import { useState, useEffect } from "react";
import { analyzeLegal } from "../api/api";
import ResCard from "../components/ResCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AILoader from "../components/AILoader";
import { motion } from "framer-motion";
import { useTypewriter } from "../hooks/useTypewriter";
import RiskGauge from "../components/RiskGauge";
import Timeline from "../components/Timeline";
import Typewriter from "../components/Typewriter";
import { AlertTriangle, Briefcase, IndianRupee, ShieldCheck } from "lucide-react";

const GetStarted = () => {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState([]);

  const [result, setResult] = useState({
    businessType: "",
    licenses: "",
    steps: "",
    risks: "",
    cost: "",
    raw: ""
  });

  // 🔥 LOAD HISTORY
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("history")) || [];
    setHistory(saved);
  }, []);

  const handleSubmit = async () => {
    if (!idea.trim()) return;

    setLoading(true);

    try {
      const data = await analyzeLegal(idea);

      const text =
        data.response || data.data?.response || "{}";

      let parsed = {};
      try {
        let cleanText = text;
        if (cleanText.includes("```json")) {
           cleanText = cleanText.split("```json")[1].split("```")[0].trim();
        } else if (cleanText.includes("```")) {
           cleanText = cleanText.split("```")[1].split("```")[0].trim();
        }
        
        // Attempt standard parse first
        try {
          parsed = JSON.parse(cleanText);
        } catch (initialErr) {
          // LLM JSON structure might contain unescaped literal newlines or be truncated midway.
          console.warn("JSON Parse Failed. Engaging Robust Regex Extraction...", initialErr);
          
          const extractField = (field, isNum = false) => {
             if (isNum) {
                 const match = cleanText.match(new RegExp(`"${field}"\\s*:\\s*(\\d+)`));
                 return match ? parseInt(match[1]) : null;
             }
             const match = cleanText.match(new RegExp(`"${field}"\\s*:\\s*"(.*?)"(?:\\s*,\\s*"|\\s*})`, 's'));
             if (match) return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
             return null;
          };

          parsed = {
             businessType: extractField("businessType"),
             licenses: extractField("licenses"),
             steps: extractField("steps"),
             risks: extractField("risks"),
             riskScore: extractField("riskScore", true),
             cost: extractField("cost")
          };

          // Raw extraction (can be incredibly long and usually where the truncation drops)
          const rawMatch = cleanText.match(/"raw"\s*:\s*"(.*)/s);
          if (rawMatch) {
              parsed.raw = rawMatch[1].replace(/\"\s*}$/, '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
          } else {
              parsed.raw = cleanText;
          }
        }
      } catch (parseErr) {
        console.error("Critical Failure in Content Processing:", parseErr);
        parsed = {
          businessType: idea.substring(0, 20) + "...",
          licenses: "Check detailed response below.",
          steps: "Review AI analysis.",
          risks: "Potential non-compliance (Parsing Error)",
          cost: "Consult Legal",
          raw: text
        };
      }

      setResult({
        businessType: parsed.businessType || "Unknown Business",
        licenses: parsed.licenses || "General Compliance Required",
        steps: parsed.steps || "Please refer to explanation.",
        risks: parsed.risks || "Standard Legal Risk",
        cost: parsed.cost || "Variable Cost",
        riskScore: parsed.riskScore || null,
        raw: parsed.raw || text
      });

      // 🔥 SAVE HISTORY
      const newHistory = [idea, ...history.filter(h => h !== idea).slice(0, 3)];
      setHistory(newHistory);
      localStorage.setItem("history", JSON.stringify(newHistory));

    } catch (err) {
      console.error(err);
      setResult({
        businessType: "",
        licenses: "",
        steps: "",
        risks: "",
        cost: "",
        raw: "Something went wrong. Try again."
      });
    }

    setLoading(false);
  };

  // 🔥 DYNAMIC RISK SCORE
  const riskScore = result.riskScore || (result.risks && result.risks.toLowerCase().includes("breach") ? 80 : 40);

  // Typewriter effect for Markdown
  const typedRawMarkdown = useTypewriter(result.raw || "", 3, 3500); // starts after HUD finishes

  // 🔥 PDF DOWNLOAD
  const downloadReport = () => {
    const content = `
Business Type: ${result.businessType}
Licenses: ${result.licenses}
Steps: ${result.steps}
Risks: ${result.risks}
Cost: ${result.cost}

Full AI Response:
${result.raw}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "legal-report.txt";
    link.click();
  };

  // 🔥 AI SUGGESTIONS
  const suggestions = [];
  if (!result.licenses.toLowerCase().includes("gst")) {
    suggestions.push("⚠️ You might need GST registration");
  }
  if (!result.steps.toLowerCase().includes("privacy")) {
    suggestions.push("📜 Add a privacy policy");
  }

  return (
    <div className="get-started">

      {/* TITLE */}
      <h1 className="gs-title">
        Analyze Your Startup Today 🚀
      </h1>

      {/* INPUT */}
      <div className="input-box">
        <input
          placeholder="Describe your business idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
        <button onClick={handleSubmit}>
          {loading ? "..." : "⚡"}
        </button>
      </div>

      {/* 🔥 HISTORY */}
      {history.length > 0 && (
        <div className="history">
          {history.map((h, i) => (
            <span key={i} onClick={() => setIdea(h)}>
              {h}
            </span>
          ))}
        </div>
      )}

      {/* SUGGESTIONS */}
      <div className="suggestions">
        <button onClick={() => setIdea("I am building an e-commerce website that collects user data")}>
          🛒 E-commerce
        </button>
        <button onClick={() => setIdea("I am building a mobile app that stores user data")}>
          📱 App
        </button>
        <button onClick={() => setIdea("I am building a SaaS platform handling customer data")}>
          💻 SaaS
        </button>
      </div>

      {/* RESULT DASHBOARD HUD */}
      {loading ? (
        <AILoader />
      ) : result.businessType ? (
        <div className="flex flex-col gap-8 mt-14 text-left items-center w-full max-w-6xl mx-auto mb-10">
          
          {/* TOP ROW: Summary & Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Left Area: Business Type & Cost */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <motion.div 
                className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-lg relative overflow-hidden"
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
                <h3 className="flex items-center gap-2 text-slate-400 font-semibold mb-2 uppercase tracking-wider text-sm"><Briefcase className="w-5 h-5 text-cyan-400" /> Business Classification</h3>
                <p className="text-xl text-white font-medium pl-1">
                  <Typewriter text={result.businessType} delay={15} startDelay={600} />
                </p>
              </motion.div>

              <motion.div 
                className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-lg relative overflow-hidden"
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400 shadow-[0_0_15px_#34d399]" />
                <h3 className="flex items-center gap-2 text-slate-400 font-semibold mb-2 uppercase tracking-wider text-sm"><IndianRupee className="w-5 h-5 text-emerald-400" /> Estimated Cost</h3>
                <p className="text-xl text-white font-medium pl-1">
                  <Typewriter text={result.cost} delay={15} startDelay={900} />
                </p>
              </motion.div>
            </div>

            {/* Right Area: Risk Gauge */}
            <motion.div 
               className="lg:col-span-1 w-full flex items-center justify-center p-2"
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
            >
                <RiskGauge score={riskScore} />
            </motion.div>
          </div>

          {/* SECOND ROW: Licenses Badges */}
          <motion.div 
            className="w-full bg-slate-800/30 border border-slate-700/50 p-8 rounded-3xl mt-4"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.8 }}
          >
            <h3 className="flex items-center gap-2 text-lg text-white font-bold mb-6"><ShieldCheck className="w-6 h-6 text-indigo-400" /> Essential Licenses & Compliance</h3>
            <div className="flex flex-wrap gap-4">
              {result.licenses ? result.licenses.split(',').map((lic, i) => (
                <motion.div 
                  key={i}
                  className="px-5 py-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 rounded-full font-medium shadow-[0_0_15px_rgba(99,102,241,0.1)] backdrop-blur-md"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", delay: 1.2 + (i * 0.15) }}
                >
                  {lic.trim()}
                </motion.div>
              )) : <span className="text-slate-500">Evaluating...</span>}
            </div>
          </motion.div>

          {/* BOTTOM ROW: Timeline & Risks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full mt-4">
            
            {/* Steps Timeline */}
            <div className="w-full">
               <motion.h3 
                 className="flex items-center gap-2 text-xl font-bold text-white mb-6 border-b border-slate-700 pb-3"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
               >
                 ⚙️ Action Plan
               </motion.h3>
               <Timeline stepsString={result.steps} initialDelay={1.8} />
            </div>

            {/* Risk Warning Cards */}
            <div className="w-full">
               <motion.h3 
                 className="flex items-center gap-3 text-xl font-bold text-rose-400 mb-6 border-b border-slate-700 pb-3"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
               >
                 <AlertTriangle strokeWidth={2.5} className="w-6 h-6" /> Legal Vulnerabilities
               </motion.h3>
               
               <div className="flex flex-col gap-4 mt-6">
                 {result.risks ? result.risks.split('\n').map(r => r.trim()).filter(r => r.length > 0).map((risk, idx) => (
                   <motion.div 
                     key={idx}
                     className="bg-rose-500/5 border border-rose-500/20 p-5 rounded-2xl flex gap-4 items-start relative overflow-hidden"
                     initial={{ opacity: 0, x: 30 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.5, delay: 2.2 + (idx * 0.3) }}
                   >
                     <div className="absolute left-0 top-0 w-1 h-full bg-rose-500/50" />
                     <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-1" />
                     <p className="text-slate-300 text-sm leading-relaxed"><Typewriter text={risk.replace(/^•|-/, '').trim()} delay={15} startDelay={(2.2 + (idx * 0.3)) * 1000 + 300} /></p>
                   </motion.div>
                 )) : null}
               </div>
            </div>

          </div>
        </div>
      ) : null}

      {/* 🔥 AI SUGGESTIONS */}
      {!loading && suggestions.length > 0 && (
        <motion.div 
          className="ai-suggestions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.6 }}
        >
          <h3>Smart Suggestions</h3>
          {suggestions.map((s, i) => (
            <p key={i}>{s}</p>
          ))}
        </motion.div>
      )}

      {/* FIRE DOWNLOAD */}
      {!loading && result.raw && (
        <motion.button 
          className="download-btn z-10 relative mb-10" 
          onClick={downloadReport}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 3.8 }}
        >
          📄 Download Complete Report
        </motion.button>
      )}

      {/* FULL RESPONSE */}
      {!loading && result.raw && (
        <motion.div 
          className="result-raw mt-6 max-w-6xl mx-auto w-full text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3.2 }}
        >
          <h3 className="text-2xl font-bold mb-6 text-[#FF9FFC]">Detailed Legal Synthesis</h3>
          <div className="prose prose-invert max-w-none text-left bg-[#1e293b]/80 backdrop-blur-xl p-10 rounded-3xl shadow-[0_0_40px_rgba(30,41,59,0.5)] border border-gray-700/50 leading-loose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {typedRawMarkdown}
            </ReactMarkdown>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default GetStarted;