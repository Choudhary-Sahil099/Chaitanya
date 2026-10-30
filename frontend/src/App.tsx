
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import NewAnalysis from "./pages/NewAnalysis";
import AnalysisHistory from "./pages/AnalysisHistory";
import Dashboard from "./pages/Dashboard";

import { AnalysisProvider } from "./context/AnalysisContext";

export default function App() {
  return (
    <AnalysisProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/app" element={<Dashboard />} />

          <Route
            path="/app/analyze"
            element={<NewAnalysis />}
          />

          <Route
            path="/app/history"
            element={<AnalysisHistory />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </BrowserRouter>
    </AnalysisProvider>
  );
}
