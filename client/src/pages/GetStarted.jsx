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
        data.response || data.data?.response || "No response received";

      const parsed = {
        businessType: idea.toLowerCase().includes("e-commerce")
          ? "E-commerce Platform"
          : "Digital Business",

        licenses: text.includes("consent")
          ? "User Consent, Data Protection Compliance"
          : "General Compliance Required",

        steps:
          "Implement privacy policy, collect user consent, secure data storage",

        risks: text.includes("breach")
          ? "Data Breach Risk"
          : "Legal non-compliance risk",

        cost: "Varies depending on scale",

        raw: text
      };

      setResult(parsed);

      // 🔥 SAVE HISTORY
      const newHistory = [idea, ...history.slice(0, 4)];
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

  // 🔥 SIMPLE RISK SCORE
  const riskScore =
    result.risks.toLowerCase().includes("breach") ? 80 : 40;

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

      {/* RESULT CARDS */}
      <div className="result-grid">
        <ResCard title="📌 Business Type" value={result.businessType} />
        <ResCard title="📄 Licenses" value={result.licenses} />
        <ResCard title="⚙️ Steps" value={result.steps} />
        <ResCard title="💰 Cost" value={result.cost} />
        <ResCard title="⚠️ Risks" value={result.risks} />
      </div>

      {/* 🔥 RISK GRAPH */}
      {result.risks && (
        <div className="risk-bar">
          <p>Risk Score: {riskScore}%</p>
          <div className="bar">
            <div style={{ width: `${riskScore}%` }}></div>
          </div>
        </div>
      )}

      {/* 🔥 AI SUGGESTIONS */}
      {suggestions.length > 0 && (
        <div className="ai-suggestions">
          <h3>Smart Suggestions</h3>
          {suggestions.map((s, i) => (
            <p key={i}>{s}</p>
          ))}
        </div>
      )}

      {/* 🔥 DOWNLOAD */}
      {result.raw && (
        <button className="download-btn" onClick={downloadReport}>
          📄 Download Report
        </button>
      )}

      {/* FULL RESPONSE */}
      {result.raw && (
        <div className="result-raw">
          <h3>AI Explanation</h3>
          <p>{result.raw}</p>
        </div>
      )}

    </div>
  );
};

export default GetStarted;