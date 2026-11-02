import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import SkinScene from "../three/SkinScene";
import TrustIndicators from "../ui/TrustIndicator";

export default function Hero() {
  return (
    <main className="hero" id="home">
      <motion.section
        className="hero-visual"
        aria-label="SkinSight AI visualization"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <SkinScene />
      </motion.section>

      <motion.section
        className="hero-content"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.12, ease: "easeOut" }}
      >
        <div className="eyebrow">
          <span>AI FOR HEALTHIER SKIN</span>
          <span className="eyebrow-line" />
        </div>

        <h1>
          Skin<span>Sight</span>
        </h1>

        <h2>Explainable AI for Skin Lesion Classification</h2>

        <p className="hero-description">
          An AI-powered web application that classifies skin lesion images,
          provides prediction confidence, visual explanations, and helps
          identify uncertain results — built for education, awareness, and
          responsible AI use.
        </p>

        <a className="button button-hero" href="/app">
          Enter the site <ArrowRight size={21} strokeWidth={1.8} />
        </a>

        <div className="hero-divider" />
        <TrustIndicators />
      </motion.section>
    </main>
  );
}
