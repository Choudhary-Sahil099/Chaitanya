import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import ReactMarkdown from "react-markdown";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Camera,
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
const API_URL = "/api/predict";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function NewAnalysis() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [aiReview, setAiReview] = useState<{
    review: string;
    model: string;
    disclaimer: string;
  } | null>(null);

  const [aiReviewError, setAiReviewError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
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
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const closeCamera = () => {
    stopCamera();
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const startCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera access is unavailable. Use HTTPS or localhost, or upload an image instead.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      const errorName = err instanceof Error ? err.name : "";

      if (errorName === "NotAllowedError") {
        setCameraError(
          "Camera permission was denied. Allow camera access in your browser settings.",
        );
      } else if (
        errorName === "NotFoundError" ||
        errorName === "DevicesNotFoundError"
      ) {
        setCameraError("No available camera was found on this device.");
      } else {
        setCameraError(
          "Unable to access the camera. Check your camera connection and permissions.",
        );
      }
    }
  };

  const captureImage = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError("The camera is not ready yet. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Unable to capture the image. Please try again.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Image capture failed. Please try again.");
          return;
        }

        const file = new File([blob], `skinsight-capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        selectFile(file);
        closeCamera();
      },
      "image/jpeg",
      0.92,
    );
  };

  useEffect(() => {
    if (!isCameraOpen) return;

    let cancelled = false;

    const initializeCamera = async () => {
      setCameraError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera access requires HTTPS or localhost. You can upload an image instead.",
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        if (cancelled) return;

        const name = err instanceof Error ? err.name : "";

        setCameraError(
          name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access in your browser settings."
            : name === "NotFoundError"
              ? "No camera was found on this device."
              : "Unable to start the camera. Check your device and browser permissions.",
        );
      }
    };

    void initializeCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [isCameraOpen, facingMode]);
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
    setAiReview(null);
    setAiReviewError(null);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

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
    setAiReview(null);
    setAiReviewError(null);
    setIsGeneratingReview(false);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction request failed.");
      }

      if (!data.success) {
        throw new Error("The model could not process this image.");
      }

      setPrediction(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing the image.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAIReview = async () => {
    if (!prediction) {
      setAiReviewError("Please complete an image analysis first.");
      return;
    }

    setIsGeneratingReview(true);
    setAiReviewError(null);
    setAiReview(null);

    try {
      const classProbabilities = Object.fromEntries(
        [...prediction.class_probabilities]
          .sort((a, b) => b.probability - a.probability)
          .slice(0, 3)
          .map((entry) => [
            entry.class_code,
            Number(entry.probability.toFixed(4)),
          ]),
      );

      const response = await fetch("/api/ai-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          predicted_class: prediction.predicted_class,
          predicted_class_code: prediction.predicted_class_code,
          confidence: prediction.confidence,
          class_probabilities: classProbabilities,
          is_uncertain: prediction.is_uncertain,
          normalized_entropy: prediction.normalized_entropy,
          uncertainty_reasons: prediction.uncertainty_reasons.slice(0, 2),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to start the AI review.");
      }

      if (!response.body) {
        throw new Error("Your browser does not support response streaming.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      let accumulatedReview = "";
      let completed = false;

      const processEvent = (eventText: string) => {
        const dataLine = eventText
          .split("\n")
          .find((line) => line.startsWith("data:"));

        if (!dataLine) return;

        const payload = JSON.parse(dataLine.slice(5).trim());

        if (payload.type === "chunk") {
          accumulatedReview += payload.text;

          setAiReview({
            review: accumulatedReview,
            model: "gemini-3.8-flash",
            disclaimer: "",
          });
        }

        if (payload.type === "done") {
          completed = true;

          setAiReview({
            review: accumulatedReview,
            model: payload.model,
            disclaimer: payload.disclaimer,
          });
        }

        if (payload.type === "error") {
          throw new Error(payload.message);
        }
      };

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        buffer = buffer.replace(/\r\n/g, "\n");

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const eventText of events) {
          processEvent(eventText);
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        processEvent(buffer);
      }

      if (!completed) {
        throw new Error("The AI review stream ended unexpectedly.");
      }
    } catch (err) {
      setAiReviewError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the AI review.",
      );
    } finally {
      setIsGeneratingReview(false);
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

    return Number.isFinite(percentage) ? `${percentage.toFixed(2)}%` : "N/A";
  };

  const formatFileSize = (size: number) => {
    return size < 1024 * 1024
      ? `${(size / 1024).toFixed(1)} KB`
      : `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Sort class probabilities by highest probability
  const probabilityEntries = prediction
    ? [...prediction.class_probabilities].sort(
        (a, b) => b.probability - a.probability,
      )
    : [];

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
                classification, confidence, uncertainty assessment, and visual
                explanations.
              </p>
            </div>

            <div className="analysis-intro-icon">
              <Microscope size={42} strokeWidth={1.4} />
            </div>
          </section>

          <section className="analysis-section">
            <div className="analysis-section-heading">
              <div>
                <span className="analysis-step-label">STEP 01</span>
                <h3>Upload an image</h3>
                <p>
                  Choose an image from your device or drag it into the upload
                  area.
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
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <Upload size={17} />
                      Browse Images
                    </button>

                    <button
                      className="dashboard-secondary-button"
                      type="button"
                      onClick={() => {
                        setCameraError(null);
                        setIsCameraOpen(true);
                      }}
                    >
                      <Camera size={17} />
                      Open Camera
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
                    <img src={previewUrl} alt="Selected skin lesion" />
                  </div>

                  <div className="analysis-preview-info">
                    <div className="analysis-preview-file-icon">
                      <FileImage size={22} />
                    </div>

                    <div className="analysis-preview-file-details">
                      <strong>{selectedFile?.name}</strong>
                      <span>
                        {selectedFile && formatFileSize(selectedFile.size)}
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
                        onClick={() => galleryInputRef.current?.click()}
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
                    The model is processing the image and generating its visual
                    explanation.
                  </span>
                </div>
              </div>
            )}
          </section>

          {prediction && (
            <div className="analysis-results">
              <div className="analysis-results-heading">
                <div>
                  <span className="analysis-step-label">STEP 02</span>
                  <h2>Analysis report</h2>
                  <p>
                    The following results were generated by the SkinSight
                    classification model.
                  </p>
                </div>

                <span
                  className={`analysis-status ${
                    prediction.is_uncertain ? "uncertain" : "accepted"
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

                    <strong>{formatPercentage(prediction.confidence)}</strong>

                    <span>Classification score</span>
                  </div>
                </div>

                <div className="analysis-result-footnote">
                  <ShieldCheck size={16} />
                  <span>
                    Model confidence is not the same as diagnostic certainty.
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
                      Additional information about the model's prediction
                      uncertainty.
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

                    <strong>{prediction.normalized_entropy.toFixed(4)}</strong>

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
                      {prediction.is_uncertain ? "Uncertain" : "Accepted"}
                    </strong>

                    <span className="analysis-metric-description">
                      Based on the model's uncertainty assessment
                    </span>
                  </div>
                </div>

                <div
                  className={`analysis-uncertainty-note ${
                    prediction.is_uncertain ? "warning" : "success"
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
                        {prediction.uncertainty_reasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>
                        No additional uncertainty reasons were returned by the
                        model.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="analysis-section">
                <div className="analysis-section-heading">
                  <div>
                    <span className="analysis-step-label">MODEL OUTPUT</span>

                    <h3>Class probability distribution</h3>

                    <p>
                      See how the model distributed its prediction across the
                      available classes.
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

                        <span>{formatPercentage(entry.probability)}</span>
                      </div>

                      <div className="analysis-progress-track">
                        <div
                          className={`analysis-progress-fill ${
                            index === 0 ? "top-probability" : ""
                          }`}
                          style={{
                            width: `${Math.min(
                              Math.max(entry.probability * 100, 0),
                              100,
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
                    <span className="analysis-step-label">STEP 03</span>

                    <h3>Visual explanation</h3>

                    <p>
                      Explore the Grad-CAM outputs generated during image
                      classification.
                    </p>
                  </div>
                </div>

                <div className="analysis-gradcam-grid">
                  <div className="analysis-gradcam-card">
                    <div className="analysis-gradcam-heading">
                      <div>
                        <strong>Activation heatmap</strong>
                        <span>Model activation visualization</span>
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
                        <span>Activation map over the original image</span>
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
                    Grad-CAM highlights image regions that influenced the
                    model's output. It is an interpretability aid, not a
                    clinically validated lesion-localization tool.
                  </p>
                </div>
              </section>
              {/* Gemini AI Review */}
              <section className="analysis-section ai-review-section">
                {/* <div className="analysis-section-heading">
                  <div>
                    <span className="analysis-step-label">STEP 04</span>
                    <h3>AI-powered skin review</h3>
                    <p>
                      Get an educational explanation of your model's
                      classification and general skin-health guidance.
                    </p>
                  </div>
                </div> */}

                {/* <div className="ai-review-card">
                  <div className="ai-review-intro">
                    <div className="ai-review-icon">
                      <Sparkles size={24} />
                    </div>

                    <div>
                      <strong>Gemini AI Review</strong>
                      <span>
                        Educational feedback based on your classification
                        results.
                      </span>
                    </div>
                  </div>

                  {!aiReview && (
                    <button
                      type="button"
                      className="dashboard-primary-button ai-review-button"
                      onClick={handleGetAIReview}
                      disabled={isGeneratingReview}
                    >
                      {isGeneratingReview ? (
                        <>
                          <span className="analysis-spinner" />
                          Generating AI Review...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Get AI Review
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  )}

                  {aiReviewError && (
                    <div className="analysis-error">
                      <AlertCircle size={19} />
                      <span>{aiReviewError}</span>
                    </div>
                  )}

                  {aiReview && (
                    <div className="ai-review-result">
                      <div className="ai-review-result-header">
                        <div>
                          <strong>Your AI-generated review</strong>
                          <span>
                            {isGeneratingReview
                              ? "Gemini is writing your review..."
                              : `Powered by ${aiReview.model}`}
                          </span>
                        </div>

                        {isGeneratingReview ? (
                          <span className="analysis-spinner" />
                        ) : (
                          <CheckCircle2 size={21} />
                        )}
                      </div>

                      <div className="ai-review-markdown">
                        <ReactMarkdown>{aiReview.review}</ReactMarkdown>

                        {isGeneratingReview && (
                          <span className="ai-streaming-cursor" />
                        )}
                      </div>

                      {!isGeneratingReview && aiReview.disclaimer && (
                        <div className="ai-review-disclaimer">
                          <ShieldCheck size={18} />
                          <p>{aiReview.disclaimer}</p>
                        </div>
                      )}

                      {!isGeneratingReview && (
                        <button
                          type="button"
                          className="dashboard-secondary-button"
                          onClick={handleGetAIReview}
                        >
                          <RotateCcw size={16} />
                          Generate Again
                        </button>
                      )}
                    </div>
                  )}
                </div> */}
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
        {isCameraOpen && (
          <div className="camera-modal-backdrop" onClick={closeCamera}>
            <section
              className="camera-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="camera-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="camera-modal-header">
                <div>
                  <span className="analysis-step-label">IMAGE CAPTURE</span>
                  <h2 id="camera-modal-title">Capture skin image</h2>
                  <p>Position the area clearly inside the camera frame.</p>
                </div>

                <button
                  type="button"
                  className="camera-close-button"
                  onClick={closeCamera}
                  aria-label="Close camera"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="camera-preview-container">
                <video
                  ref={videoRef}
                  className="camera-video"
                  autoPlay
                  playsInline
                  muted
                />

                {cameraError && (
                  <div className="camera-error">
                    <AlertCircle size={20} />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>

              <div className="camera-guidance">
                <AlertCircle size={16} />
                Use good lighting, keep the camera steady, and avoid blurry
                images.
              </div>

              <div className="camera-modal-actions">
                <button
                  type="button"
                  className="dashboard-secondary-button"
                  onClick={() =>
                    setFacingMode((current) =>
                      current === "environment" ? "user" : "environment",
                    )
                  }
                >
                  <RotateCcw size={17} />
                  Switch Camera
                </button>

                <button
                  type="button"
                  className="dashboard-primary-button"
                  onClick={captureImage}
                  disabled={!!cameraError}
                >
                  <Camera size={18} />
                  Capture Image
                </button>
              </div>

              <button
                type="button"
                className="camera-upload-fallback"
                onClick={() => {
                  closeCamera();
                  galleryInputRef.current?.click();
                }}
              >
                Or upload an image from your device
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
