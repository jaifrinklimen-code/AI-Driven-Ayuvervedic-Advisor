import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./components/pages/LandingPage";
import { Chatbot } from "./components/pages/Chatbot";
import { FormulationClassifier } from "./components/pages/FormulationClassifier";
import { JurisdictionComparison } from "./components/pages/JurisdictionComparison";
import { ABSKioskPage } from "./components/pages/ABSKioskPage";
import { SourcesCatalog } from "./components/pages/SourcesCatalog";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ask" element={<Chatbot />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/classify" element={<FormulationClassifier />} />
        <Route path="/jurisdictions" element={<JurisdictionComparison />} />
        <Route path="/abs-navigator" element={<ABSKioskPage />} />
        <Route path="/sources" element={<SourcesCatalog />} />
      </Routes>
    </Router>
  );
}

export default App;
