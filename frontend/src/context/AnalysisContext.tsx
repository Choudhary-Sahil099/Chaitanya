
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface PredictionResult {
  success: boolean;
  predicted_class: string;
  predicted_class_code: string;
  confidence: number;
  status: "accepted" | "uncertain";
  is_uncertain: boolean;
  normalized_entropy: number;
  uncertainty_reasons: string[];

  class_probabilities: {
    class_index: number;
    class_code: string;
    class_name: string;
    probability: number;
  }[];

  gradcam_heatmap: string;
  gradcam_overlay: string;
  disclaimer: string;
}

interface AnalysisContextType {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;

  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;

  prediction: PredictionResult | null;
  setPrediction: (result: PredictionResult | null) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  return (
    <AnalysisContext.Provider
      value={{
        selectedFile,
        setSelectedFile,
        previewUrl,
        setPreviewUrl,
        prediction,
        setPrediction,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);

  if (!context) {
    throw new Error("useAnalysis must be used inside an AnalysisProvider");
  }

  return context;
}
