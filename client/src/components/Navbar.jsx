import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1 className="logo">⚖️ LegalAI</h1>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/features">Features</Link>
        <Link to="/how-it-works">How it works</Link>
        <Link to="/get-started" className="btn">
          Get Started
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;