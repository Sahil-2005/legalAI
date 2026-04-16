import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import Home from "./pages/Home";
import GetStarted from "./pages/GetStarted";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SplashCursor from "./components/SplashCursor";
import Particles from "./components/Particles";

import "./App.css";

/* 🔥 INNER APP (has access to location) */
function AppContent() {
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <>
      {/* 🔥 BACKGROUND (only on Home) */}
      {isHome && (
        <Particles
          particleColors={["#8b5cf6"]}
          particleCount={120}
          speed={0.08}
        />
      )}

      {/* 🔥 OPTIONAL CURSOR (only on Home) */}
      {isHome && <SplashCursor />}

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/get-started" element={<GetStarted />} />
      </Routes>

      <Footer />
    </>
  );
}

/* 🔥 WRAPPER */
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;