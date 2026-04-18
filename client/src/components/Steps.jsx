import Card from "../components/Card";
import { motion } from "framer-motion";
import s1 from "../assets/step1.png";
import s2 from "../assets/step2.png";
import s3 from "../assets/step3.png";

const Steps = () => {
  const steps = [
    {
      image: s1,
      number: "01",
      title: "Describe Your Startup",
      description:
        "Enter your business idea — the more detail, the better. Mention industry, data handling, payments, and geography.",
    },
    {
      image: s2,
      number: "02",
      title: "AI Scans Legal Corpus",
      description:
        "Our RAG pipeline searches across 50+ Indian compliance documents, matching your idea to relevant laws and sections.",
    },
    {
      image: s3,
      number: "03",
      title: "Get Your Compliance Blueprint",
      description:
        "Receive a full analysis with risk score, required licenses, action steps, and direct links to official government sources.",
    },
  ];

  return (
    <section className="steps-section" id="how-it-works">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2>How It Works</h2>
        <p className="subtitle">Three steps to complete legal clarity</p>
      </motion.div>

      <div className="steps-grid">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
          >
            <Card
              image={step.image}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Steps;