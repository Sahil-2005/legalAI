import Card from "./Card";
import f1 from "../assets/feature1.svg";
import f2 from "../assets/feature2.png";
import f3 from "../assets/feature3.png";

const Features = () => {
  return (
    <section className="features-section">
      <h2>Experience LegalAI Assistant in Action</h2>
      <p className="subtitle">
        See how it can simplify your compliance tasks.
      </p>

      <div className="features-grid">
        <Card
          image={f1}
          title="Instant Legal Insights"
          description="Get quick, tailored legal advice based on your business idea."
        />

        <Card
          image={f2}
          title="India-Specific Compliance"
          description="Stay compliant with Indian laws and regulations."
        />

        <Card
          image={f3}
          title="AI & LLM Powered"
          description="Uses Qdrant DB and Gemini LLM for accurate advice."
        />
      </div>
    </section>
  );
};

export default Features;