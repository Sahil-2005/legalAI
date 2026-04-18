import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* LEFT — Brand */}
        <div className="footer-left">
          <h2>⚖️ AMIVRE Legal</h2>
          <p>
            AI-powered legal compliance assistant for Indian startups.
            Analyze your business against 50+ government regulations in seconds.
          </p>
        </div>

        {/* CENTER — Links */}
        <div className="footer-links">
          <h4>Product</h4>
          <Link to="/">Home</Link>
          <Link to="/#features">Features</Link>
          <Link to="/#how-it-works">How it works</Link>
          <Link to="/get-started">Get Started</Link>
        </div>

        {/* RIGHT — Contact */}
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>support@amivrelegal.com</p>
          <p>India 🇮🇳</p>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} AMIVRE Legal · All rights reserved · Built with Gemini & Qdrant
      </div>
    </footer>
  );
};

export default Footer;