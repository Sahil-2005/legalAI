import Card from "../components/Card";
import s1 from "../assets/step1.png";
import s2 from "../assets/step2.png";
import s3 from "../assets/step3.png";

const Steps = () => {
  return (
    <section className="steps-section">
      <h2>How It Works</h2>

      <div className="steps-grid">
        <Card
          image={s1}
          number="01"
          title="Submit Your Idea"
          description="Enter your startup idea."
        />

        <Card
          image={s2}
          number="02"
          title="AI Analyzes"
          description="Checks laws using Qdrant + Gemini."
        />

        <Card
          image={s3}
          number="03"
          title="Get Compliance"
          description="Receive complete legal requirements."
        />
      </div>
    </section>
  );
};

export default Steps;