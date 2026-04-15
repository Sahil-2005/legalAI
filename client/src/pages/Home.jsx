import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Steps from "../components/Steps";

const Home = () => {
  return (
    <div className="main">
      {/* <Navbar /> */}
      <Hero />
      <Features />
      <Steps />
    </div>
  );
};

export default Home;