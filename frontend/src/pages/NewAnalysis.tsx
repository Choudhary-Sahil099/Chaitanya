
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileImage,
  ImagePlus,
  Menu,
  Microscope,
  RotateCcw,
  ShieldCheck,
  Upload,
  UserRound,
  X,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import "../styles/dashboard.css";
import "../styles/NewAnalysis.css";

import { useAnalysis } from "../context/AnalysisContext";

const API_URL = "http://localhost:8000/api/predict";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function NewAnalysis() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shared analysis state
  const {
    selectedFile,
    setSelectedFile,
    previewUrl,
    setPreviewUrl,
    prediction,
    setPrediction,
  } = useAnalysis();

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle file input
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      selectFile(file);
    }

    event.target.value = "";
  };

  // Select and validate image
  const selectFile = (file: File) => {
    setError(null);
    setPrediction(null);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPEG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image size must be less than 10 MB.");
      return;
    }

    // Release the previous preview URL before replacing it
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Handle drag and drop
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];

    if (file) {
      selectFile(file);
    }
  };

  // Run prediction
  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Prediction request failed."
        );
      }

      if (!data.success) {
        throw new Error(
          "The model could not process this image."
        );
      }

      setPrediction(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing the image."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset current analysis
  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    setIsLoading(false);

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  // Formatting helpers
  const formatPercentage = (value: number) => {
    const percentage = Number(value) * 100;

    return Number.isFinite(percentage)
      ? `${percentage.toFixed(2)}%`
      : "N/A";
  };

  const formatFileSize = (size: number) => {
    return size < 1024 * 1024
      ? `${(size / 1024).toFixed(1)} KB`
      : `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Sort class probabilities by highest probability
  const probabilityEntries = prediction
    ? [...prediction.class_probabilities].sort(
        (a, b) => b.probability - a.probability
      )
    : [];

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="dashboard-main">

        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <button
              className="dashboard-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="dashboard-breadcrumb">
                Workspace / New Analysis
              </span>
              <h1>New Analysis</h1>
            </div>
          </div>

          <div className="dashboard-header-actions">
            <div className="dashboard-header-avatar">
              <UserRound size={19} />
            </div>
          </div>
        </header>

        <div className="dashboard-content analysis-page">

          <section className="analysis-intro">
            <div>
              <span className="dashboard-eyebrow">
                <span className="status-pulse" />
                AI-POWERED IMAGE ANALYSIS
              </span>

              <h2>Understand your image with AI.</h2>

              <p>
                Upload a skin lesion image to explore the model's
                classification, confidence, uncertainty assessment,
                and visual explanations.
              </p>
            </div>

            <div className="analysis-intro-icon">
              <Microscope size={42} strokeWidth={1.4} />
            </div>
          </section>

          <section className="analysis-section">
            <div className="analysis-section-heading">
              <div>
                <span className="analysis-step-label">
                  STEP 01
                </span>
                <h3>Upload an image</h3>
                <p>
                  Choose an image from your device or drag it into
                  the upload area.
                </p>
              </div>
            </div>

            <div
              className={`analysis-dropzone ${
                isDragging ? "dragging" : ""
              } ${previewUrl ? "has-image" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleFileChange}
              />

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={handleFileChange}
              />

              {!previewUrl ? (
                <div className="analysis-upload-empty">
                  <div className="analysis-upload-icon">
                    <ImagePlus size={32} />
                  </div>

                  <h3>Drop your image here</h3>

                  <p>or browse files from your computer</p>

                  <div className="analysis-upload-actions">
                    <button
                      className="dashboard-primary-button"
                      type="button"
                      onClick={() =>
                        galleryInputRef.current?.click()
                      }
                    >
                      <Upload size={17} />
                      Browse Images
                    </button>

                    <button
                      className="dashboard-secondary-button"
                      type="button"
                      onClick={() =>
                        cameraInputRef.current?.click()
                      }
                    >
                      <ImagePlus size={17} />
                      Use Camera
                    </button>
                  </div>

                  <div className="analysis-file-hint">
                    <span>JPG</span>
                    <span>PNG</span>
                    <span>WEBP</span>
                    <span>Maximum 10 MB</span>
                  </div>
                </div>
              ) : (
                <div className="analysis-preview">
                  <div className="analysis-preview-image">
                    <img
                      src={previewUrl}
                      alt="Selected skin lesion"
                    />
                  </div>

                  <div className="analysis-preview-info">
                    <div className="analysis-preview-file-icon">
                      <FileImage size={22} />
                    </div>

                    <div className="analysis-preview-file-details">
                      <strong>{selectedFile?.name}</strong>
                      <span>
                        {selectedFile &&
                          formatFileSize(selectedFile.size)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="analysis-remove-button"
                      onClick={handleReset}
                      aria-label="Remove selected image"
                    >
                      <X size={18} />
                    </button>

                    <div className="analysis-preview-actions">
                      <button
                        className="dashboard-primary-button"
                        type="button"
                        onClick={handleAnalyze}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="analysis-spinner" />
                            Analyzing image...
                          </>
                        ) : (
                          <>
                            <Microscope size={18} />
                            Analyze Image
                            <ArrowRight size={17} />
                          </>
                        )}
                      </button>

                      <button
                        className="dashboard-secondary-button"
                        type="button"
                        onClick={() =>
                          galleryInputRef.current?.click()
                        }
                        disabled={isLoading}
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="analysis-error">
                <AlertCircle size={19} />
                <span>{error}</span>
              </div>
            )}

            {isLoading && (
              <div className="analysis-loading">
                <span className="analysis-spinner" />
                <div>
                  <strong>Analyzing your image</strong>
                  <span>
                    The model is processing the image and generating
                    its visual explanation.
                  </span>
                </div>
              </div>
            )}
          </section>

          {prediction && (
            <div className="analysis-results">

              <div className="analysis-results-heading">
                <div>
                  <span className="analysis-step-label">
                    STEP 02
                  </span>
                  <h2>Analysis report</h2>
                  <p>
                    The following results were generated by the
                    SkinSight classification model.
                  </p>
                </div>

                <span
                  className={`analysis-status ${
                    prediction.is_uncertain
                      ? "uncertain"
                      : "accepted"
                  }`}
                >
                  {prediction.is_uncertain ? (
                    <AlertTriangle size={15} />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}

                  {prediction.is_uncertain
                    ? "Uncertain result"
                    : "Prediction accepted"}
                </span>
              </div>

              <section className="analysis-result-card">
                <div className="analysis-result-topline">
                  <div className="analysis-result-icon">
                    <Sparkles size={21} />
                  </div>
                  <span>MODEL PREDICTION</span>
                </div>

                <div className="analysis-prediction-main">
                  <div>
                    <span className="analysis-muted-label">
                      Predicted class
                    </span>

                    <h2>{prediction.predicted_class}</h2>

                    <span className="analysis-class-code">
                      Class code:{" "}
                      {prediction.predicted_class_code.toUpperCase()}
                    </span>
                  </div>

                  <div className="analysis-confidence">
                    <span className="analysis-muted-label">
                      Model confidence
                    </span>

                    <strong>
                      {formatPercentage(prediction.confidence)}
                    </strong>

                    <span>Classification score</span>
                  </div>
                </div>

                <div className="analysis-result-footnote">
                  <ShieldCheck size={16} />
                  <span>
                    Model confidence is not the same as diagnostic
                    certainty.
                  </span>
                </div>
              </section>

              <section className="analysis-section">
                <div className="analysis-section-heading">
                  <div>
                    <span className="analysis-step-label">
                      MODEL RELIABILITY
                    </span>
                    <h3>Uncertainty assessment</h3>
                    <p>
                      Additional information about the model's
                      prediction uncertainty.
                    </p>
                  </div>
                </div>

                <div className="analysis-metric-grid">
                  <div className="analysis-metric-card">
                    <span className="analysis-metric-icon">
                      <Activity size={20} />
                    </span>

                    <span className="analysis-muted-label">
                      Normalized entropy
                    </span>

                    <strong>
                      {prediction.normalized_entropy.toFixed(4)}
                    </strong>

                    <span className="analysis-metric-description">
                      Model uncertainty metric
                    </span>
                  </div>

                  <div
                    className={`analysis-metric-card ${
                      prediction.is_uncertain
                        ? "metric-warning"
                        : "metric-success"
                    }`}
                  >
                    <span className="analysis-metric-icon">
                      {prediction.is_uncertain ? (
                        <AlertTriangle size={20} />
                      ) : (
                        <CheckCircle2 size={20} />
                      )}
                    </span>

                    <span className="analysis-muted-label">
                      Prediction status
                    </span>

                    <strong>
                      {prediction.is_uncertain
                        ? "Uncertain"
                        : "Accepted"}
                    </strong>

                    <span className="analysis-metric-description">
                      Based on the model's uncertainty assessment
                    </span>
                  </div>
                </div>

                <div
                  className={`analysis-uncertainty-note ${
                    prediction.is_uncertain
                      ? "warning"
                      : "success"
                  }`}
                >
                  {prediction.is_uncertain ? (
                    <AlertTriangle size={19} />
                  ) : (
                    <CheckCircle2 size={19} />
                  )}

                  <div>
                    <strong>
                      {prediction.is_uncertain
                        ? "The model indicates uncertainty"
                        : "The model accepted this prediction"}
                    </strong>

                    {prediction.uncertainty_reasons.length > 0 ? (
                      <ul>
                        {prediction.uncertainty_reasons.map(
                          (reason, index) => (
                            <li key={index}>{reason}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p>
                        No additional uncertainty reasons were
                        returned by the model.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="analysis-section">
                <div className="analysis-section-heading">
                  <div>
                    <span className="analysis-step-label">
                      MODEL OUTPUT
                    </span>

                    <h3>Class probability distribution</h3>

                    <p>
                      See how the model distributed its prediction
                      across the available classes.
                    </p>
                  </div>
                </div>

                <div className="analysis-probability-card">
                  {probabilityEntries.map((entry, index) => (
                    <div
                      className="analysis-probability-row"
                      key={entry.class_code}
                    >
                      <div className="analysis-probability-label">
                        <div>
                          <span
                            className={`analysis-rank ${
                              index === 0 ? "top-rank" : ""
                            }`}
                          >
                            {index + 1}
                          </span>

                          <strong>{entry.class_name}</strong>
                        </div>

                        <span>
                          {formatPercentage(entry.probability)}
                        </span>
                      </div>

                      <div className="analysis-progress-track">
                        <div
                          className={`analysis-progress-fill ${
                            index === 0 ? "top-probability" : ""
                          }`}
                          style={{
                            width: `${Math.min(
                              Math.max(
                                entry.probability * 100,
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="analysis-section">
                <div className="analysis-section-heading">
                  <div>
                    <span className="analysis-step-label">
                      STEP 03
                    </span>

                    <h3>Visual explanation</h3>

                    <p>
                      Explore the Grad-CAM outputs generated during
                      image classification.
                    </p>
                  </div>
                </div>

                <div className="analysis-gradcam-grid">
                  <div className="analysis-gradcam-card">
                    <div className="analysis-gradcam-heading">
                      <div>
                        <strong>Activation heatmap</strong>
                        <span>
                          Model activation visualization
                        </span>
                      </div>

                      <Activity size={19} />
                    </div>

                    <div className="analysis-gradcam-image">
                      <img
                        src={`data:image/png;base64,${prediction.gradcam_heatmap}`}
                        alt="Grad-CAM activation heatmap"
                      />
                    </div>
                  </div>

                  <div className="analysis-gradcam-card">
                    <div className="analysis-gradcam-heading">
                      <div>
                        <strong>Image overlay</strong>
                        <span>
                          Activation map over the original image
                        </span>
                      </div>

                      <ImagePlus size={19} />
                    </div>

                    <div className="analysis-gradcam-image">
                      <img
                        src={`data:image/png;base64,${prediction.gradcam_overlay}`}
                        alt="Grad-CAM image overlay"
                      />
                    </div>
                  </div>
                </div>

                <div className="analysis-gradcam-disclaimer">
                  <AlertCircle size={17} />

                  <p>
                    Grad-CAM highlights image regions that influenced
                    the model's output. It is an interpretability aid,
                    not a clinically validated lesion-localization
                    tool.
                  </p>
                </div>
              </section>

              {/* Actions */}
              <div className="analysis-final-actions">
                <button
                  className="dashboard-secondary-button"
                  type="button"
                  onClick={handleReset}
                >
                  <RotateCcw size={17} />
                  Start another analysis
                </button>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <footer className="dashboard-disclaimer">
            <ShieldCheck size={17} />

            <p>
              {prediction?.disclaimer ||
                "SkinSight is an educational AI tool, not a medical diagnostic service. Always consult a qualified healthcare professional about skin concerns."}
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
