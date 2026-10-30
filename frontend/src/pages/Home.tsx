
import Navbar from "../components/layout/Navbar";

import Hero from "../components/sections/Hero";
import About from "../components/sections/About";
import Dataset from "../components/sections/Dataset";
import HowItWorks from "../components/sections/HowItWorks";
import ContactFooter from "../components/sections/ContactFooter";

export default function Home() {
  return (
    <div className="landing-page">
      <div className="background-orb background-orb-left" />
      <div className="background-orb background-orb-right" />

      <Navbar />

      <Hero />

      <About />

      <Dataset />

      <HowItWorks />

      <ContactFooter />
    </div>
  );
}
