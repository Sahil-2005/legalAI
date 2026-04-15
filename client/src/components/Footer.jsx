const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* LEFT */}
        <div className="footer-left">
          <h2>⚖️ LegalAI</h2>
          <p>AI-powered compliance assistant for Indian startups.</p>
        </div>

        {/* CENTER */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="/">Home</a>
          <a href="/features">Features</a>
          <a href="/how-it-works">How it works</a>
          <a href="/get-started">Get Started</a>
        </div>

        {/* RIGHT */}
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Email: support@legalai.com</p>
          <p>India 🇮🇳</p>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 LegalAI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;