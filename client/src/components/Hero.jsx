// import heroImg from "../assets/hero1.png";

// const Home = () => {
//   return (
//     <section className="landing">
//       <div className="left">
//        <h1 className="title">
//         <span className="line1">AI-Powered</span>
//         <span className="line2">Compliance</span>
//         <span className="gradient">for Indian Startups</span>
//         </h1>

//         <p>Get instant legal advice tailored to your business</p>

//         <button className="cta">Get Started</button>
//       </div>

//       <div className="right">
//         <img src={heroImg} alt="hero" />
//       </div>
//     </section>
//   );
// };

// export default Home;


import heroImg from "../assets/hero1.png";
import Particles from "../components/Particles";

const Home = () => {
  return (
    <div className="home-container">

 

      {/* 🔥 CONTENT */}
      <section className="landing">
        <div className="left">
          <h1 className="title">
            <span className="line1">AI-Powered</span>
            <span className="line2">Compliance</span>
            <span className="gradient">for Indian Startups</span>
          </h1>

          <p>Get instant legal advice tailored to your business</p>

          <button className="cta">Get Started</button>
        </div>

        <div className="right">
          <img src={heroImg} alt="hero" />
        </div>
      </section>

    </div>
  );
};

export default Home;
