import { useState, useEffect } from "react";
import "./index.css";
import AudioCalculator from "./components/AudioCalculator";
import FileRenamer from "./components/FileRenamer";
import TatNotice from "./components/TatNotice";

function App() {
  // 1. Check memory for the last open tab, default to 'calculator' if none exists
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "calculator";
  });

  // 2. Check memory for shared file names so they survive a refresh
  const [sharedFileNames, setSharedFileNames] = useState(() => {
    return localStorage.getItem("sharedFileNames") || "";
  });

  // 3. Whenever the tab changes, save it to memory
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // 4. Whenever the shared file names change, save them to memory
  useEffect(() => {
    localStorage.setItem("sharedFileNames", sharedFileNames);
  }, [sharedFileNames]);

  return (
    <div className="container">
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "calculator" ? "active" : ""}`}
          onClick={() => setActiveTab("calculator")}
        >
          Audio Calculator
        </button>
        <button
          className={`tab-btn ${activeTab === "renamer" ? "active" : ""}`}
          onClick={() => setActiveTab("renamer")}
        >
          Docx File Renamer
        </button>
        <button
          className={`tab-btn ${activeTab === "tat" ? "active" : ""}`}
          onClick={() => setActiveTab("tat")}
        >
          TAT Delay Notice
        </button>
      </div>

      {activeTab === "calculator" && <AudioCalculator />}
      {activeTab === "renamer" && (
        <FileRenamer setSharedFileNames={setSharedFileNames} />
      )}
      {activeTab === "tat" && (
        <TatNotice
          sharedFileNames={sharedFileNames}
          setSharedFileNames={setSharedFileNames}
        />
      )}
    </div>
  );
}

export default App;
