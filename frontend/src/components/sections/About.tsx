import {
  BrainCircuit,
  ShieldCheck,
  ChartNoAxesColumn,
  Monitor,
  Play,
  Sun,
  UsersRound,
  Clock3,
  CircleHelp,
} from "lucide-react";

import "../../styles/about.css";

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Analysis",
    description:
      "Classifies skin lesions into seven diagnostic categories using deep learning.",
    color: "blue",
  },
  {
    icon: ShieldCheck,
    title: "Explainable Predictions",
    description:
      "Highlights influential image regions with Grad-CAM visualizations.",
    color: "green",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Confidence & Uncertainty",
    description:
      "Displays prediction confidence and flags potentially unreliable results.",
    color: "purple",
  },
  {
    icon: Monitor,
    title: "Educational Purpose",
    description:
      "Built for awareness, learning, and responsible AI use — not for medical diagnosis.",
    color: "pink",
  },
];

const insights = [
  {
    icon: Sun,
    title: "Increasing UV Exposure",
    description: "Higher risk of skin damage due to prolonged sun exposure.",
    color: "red",
  },
  {
    icon: UsersRound,
    title: "Growing Global Cases",
    description: "Skin cancer rates are rising worldwide.",
    color: "purple",
  },
  {
    icon: Clock3,
    title: "Late Detection",
    description: "Many serious skin conditions go unnoticed in early stages.",
    color: "blue",
  },
  {
    icon: CircleHelp,
    title: "Uncertainty in Diagnosis",
    description:
      "Visual similarity between lesions can make diagnosis difficult.",
    color: "cyan",
  },
];

export default function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-container">
        {/* LEFT CONTENT */}
        <div className="about-left">
          <div className="about-eyebrow">
            <span>ABOUT SKINSIGHT</span>
            <span className="about-eyebrow-line" />
          </div>

          <h2 className="about-heading">
            A Safer Future for
            <br />
            <span>Skin Health</span> with AI
          </h2>

          <p className="about-description">
            SkinSight is an AI-powered web application that classifies skin
            lesion images using the HAM10000 dataset. It provides prediction
            confidence, visual explanations through Grad-CAM, and identifies
            uncertain results — helping users understand skin conditions better
            through transparent and responsible AI.
          </p>

          <div className="about-features">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className="feature-card" key={feature.title}>
                  <div className={`feature-icon ${feature.color}`}>
                    <Icon size={29} strokeWidth={2} />
                  </div>

                  <div className="feature-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="about-right">
          <div className="about-visual">
            <video
              className="about-visual-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Skin lesion scanning visualization"
            >
              <source src="/videos/vid2.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>

          <div className="video-caption">
            <span className="caption-play">
              <Play size={16} fill="currentColor" />
            </span>
            <span>VIDEO LOOP: MODERN SKIN DISEASE CHALLENGES</span>
          </div>
        </div>
      </div>
    </section>
  );
}
