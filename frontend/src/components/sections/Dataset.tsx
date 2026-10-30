
import {
  Image as ImageIcon,
  Layers3,
  UsersRound,
  Database,
} from "lucide-react";

import "../../styles/dataset.css";

const datasetFeatures = [
  {
    icon: ImageIcon,
    title: "10,015 Images",
    description:
      "High-quality dermoscopic images of skin lesions.",
    color: "blue",
  },
  {
    icon: Layers3,
    title: "7 Diagnostic Categories",
    description:
      "Includes AKIEC, BCC, BKL, DF, MEL, NV and VASC.",
    color: "green",
  },
  {
    icon: UsersRound,
    title: "Diverse Samples",
    description:
      "Images covering different patients, lesion types and clinical characteristics.",
    color: "purple",
  },
  {
    icon: Database,
    title: "Standard Benchmark",
    description:
      "Widely used research dataset for skin lesion classification.",
    color: "pink",
  },
];

export default function Dataset() {
  return (
    <section className="dataset-section" id="dataset">
      <div className="dataset-container">
        <div className="dataset-visual">
          <img
            src="/images/dataset-showcase.png"
            alt="HAM10000 dataset visualization showing dermoscopic images from seven diagnostic categories"
            className="dataset-image"
            loading="lazy"
          />
        </div>
        <div className="dataset-content">

          <div className="dataset-eyebrow">
            <span>THE DATASET</span>
            <span className="dataset-eyebrow-line" />
          </div>

          <h2 className="dataset-heading">
            HAM10000 <span>Dataset</span>
          </h2>

          <h3 className="dataset-subheading">
            A Diverse Collection of Dermoscopic Images
          </h3>

          <p className="dataset-description">
            SkinSight uses the official HAM10000 dataset
            (Human Against Machine with 10000 training images),
            a widely used dermoscopic image dataset containing
            10,015 images of skin lesions across seven diagnostic
            categories. The dataset provides examples of different
            lesion types and clinical characteristics, making it a
            valuable benchmark for developing and evaluating AI
            models for skin lesion classification.
          </p>

          <div className="dataset-features">
            {datasetFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  className="dataset-card"
                  key={feature.title}
                >
                  <div
                    className={`dataset-card-icon ${feature.color}`}
                  >
                    <Icon size={30} strokeWidth={2} />
                  </div>

                  <div className="dataset-card-content">
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </div>
                </article>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
