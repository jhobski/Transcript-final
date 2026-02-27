import { useState, useEffect } from "react";
import "./index.css";
import AudioCalculator from "./components/AudioCalculator";
import FileRenamer from "./components/FileRenamer";
import TatNotice from "./components/TatNotice";

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "calculator";
  });

  // UPDATE: Changed to an array to handle organized rows
  const [sharedFiles, setSharedFiles] = useState(() => {
    const saved = localStorage.getItem("sharedFiles");
    return saved ? JSON.parse(saved) : [{ name: "", link: "" }];
  });

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("sharedFiles", JSON.stringify(sharedFiles));
  }, [sharedFiles]);

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

      {/* UPDATE: Passing the new sharedFiles list */}
      {activeTab === "renamer" && (
        <FileRenamer setSharedFiles={setSharedFiles} />
      )}

      {activeTab === "tat" && (
        <TatNotice sharedFiles={sharedFiles} setSharedFiles={setSharedFiles} />
      )}
    </div>
  );
}

export default App;
