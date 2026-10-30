import {
  Image as ImageIcon,
  BrainCircuit,
  ChartNoAxesColumn,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";

import "../../styles/how-it-works.css";

const steps = [
  {
    icon: ImageIcon,
    number: "1",
    title: "Upload Image",
    description:
      "Upload a dermoscopic skin lesion image. The system performs basic validation and quality checks.",
    color: "blue",
  },
  {
    icon: BrainCircuit,
    number: "2",
    title: "AI Analysis",
    description:
      "A deep learning model using transfer learning classifies the image into one of seven diagnostic categories.",
    color: "green",
  },
  {
    icon: ChartNoAxesColumn,
    number: "3",
    title: "Prediction & Confidence",
    description:
      "View the predicted category with confidence scores for all seven classes.",
    color: "purple",
  },
  {
    icon: ScanSearch,
    number: "4",
    title: "Visual Explanation",
    description:
      "Grad-CAM highlights image regions that influenced the model's prediction.",
    color: "orange",
  },
  {
    icon: ShieldCheck,
    number: "5",
    title: "Uncertainty Detection",
    description:
      "The system flags potentially uncertain predictions based on a validation-based threshold.",
    color: "pink",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="how-container">
        {/* LEFT: PROCESS STEPS */}

        <div className="how-content">
          <div className="how-eyebrow">
            <span>HOW IT WORKS</span>
            <span className="how-eyebrow-line" />
          </div>

          <h2 className="how-heading">
            From Image to Insights
            <br />
            in a Few <span>Simple Steps</span>
          </h2>

          <p className="how-description">
            SkinSight uses a deep learning model trained on the HAM10000 dataset
            to classify skin lesion images, provide prediction confidence,
            generate visual explanations using Grad-CAM, and identify uncertain
            results — making AI more transparent and trustworthy.
          </p>

          <div className="process-list">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article className="process-step" key={step.number}>
                  <div className={`process-icon ${step.color}`}>
                    <Icon size={30} strokeWidth={2} />
                  </div>

                  <div className="process-number">{step.number}</div>

                  <div className="process-info">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* RIGHT: PROCESS VISUALIZATION */}

        <div className="how-visual-column">
          <div className="how-visual">
            <video
              className="how-visual-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Step-by-step AI skin lesion analysis"
            >
              <source src="/videos/vid1.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>

          <div className="how-video-caption">
            <span>VIDEO LOOP: STEP-BY-STEP PROCESS ANIMATION</span>
          </div>
        </div>
      </div>
    </section>
  );
}
