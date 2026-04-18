import Card from "./Card";
import { motion } from "framer-motion";
import f1 from "../assets/feature1.svg";
import f2 from "../assets/feature2.png";
import f3 from "../assets/feature3.png";

const Features = () => {
  return (
    <section className="features-section" id="features">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2>
          Experience <span className="gradient">LexAgent</span> in Action
        </h2>
        <p className="subtitle">
          Enterprise-grade compliance analysis, simplified for every startup.
        </p>
      </motion.div>

      <div className="features-grid">
        {[
          {
            image: f1,
            title: "Instant Legal Insights",
            description:
              "Get rapid, context-aware legal guidance tailored to your exact business model and industry vertical.",
          },
          {
            image: f2,
            title: "India-Specific Compliance",
            description:
              "Covers 8 legal domains — from data privacy & IT laws to labour codes, taxation, and food safety regulations.",
          },
          {
            image: f3,
            title: "RAG-Powered Accuracy",
            description:
              "Built on Retrieval-Augmented Generation using Qdrant vector search and Gemini LLM — zero hallucinations.",
          },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
          >
            <Card
              image={feature.image}
              title={feature.title}
              description={feature.description}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;