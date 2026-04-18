import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./pages/Home";
import GetStarted from "./pages/GetStarted";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SplashCursor from "./components/SplashCursor";
import Particles from "./components/Particles";

import "./App.css";

/* Scroll to top on route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

/* Page transition wrapper */
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

/* INNER APP (has access to location) */
function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      {/* Background particles (only on Home) */}
      {isHome && (
        <Particles
          particleColors={["#8b5cf6"]}
          particleCount={120}
          speed={0.08}
        />
      )}

      {/* Splash cursor (only on Home) */}
      {isHome && <SplashCursor />}

      <ScrollToTop />
      <Navbar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/get-started" element={<PageTransition><GetStarted /></PageTransition>} />
        </Routes>
      </AnimatePresence>

      <Footer />
    </>
  );
}

/* WRAPPER */
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;