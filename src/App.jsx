import { useState, useEffect } from "react";
import "./index.css";
import AudioCalculator from "./components/AudioCalculator";
import FileRenamer from "./components/FileRenamer";
import TatNotice from "./components/TatNotice";
import RevertRequest from "./components/RevertRequest";
import NonEnglish from "./components/NonEnglish";

function App() {
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("activeTab") || "calculator"
  );

  const [sharedFiles, setSharedFiles] = useState(() => {
    const saved = localStorage.getItem("sharedFiles");
    return saved ? JSON.parse(saved) : [{ name: "", link: "" }];
  });

  // NEW: Global memory for Revert and Non-English files
  const [revertFiles, setRevertFiles] = useState(() => {
    const saved = localStorage.getItem("revertFiles");
    return saved ? JSON.parse(saved) : [{ name: "" }];
  });

  const [nonEngFiles, setNonEngFiles] = useState(() => {
    const saved = localStorage.getItem("nonEngFiles");
    return saved ? JSON.parse(saved) : [{ name: "", link: "" }];
  });

  useEffect(() => localStorage.setItem("activeTab", activeTab), [activeTab]);
  useEffect(
    () => localStorage.setItem("sharedFiles", JSON.stringify(sharedFiles)),
    [sharedFiles]
  );
  useEffect(
    () => localStorage.setItem("revertFiles", JSON.stringify(revertFiles)),
    [revertFiles]
  );
  useEffect(
    () => localStorage.setItem("nonEngFiles", JSON.stringify(nonEngFiles)),
    [nonEngFiles]
  );

  return (
    <div className="container">
      {/* Added flexWrap so the 5 buttons stack neatly on mobile */}
      <div className="tabs" style={{ flexWrap: "wrap" }}>
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
        <button
          className={`tab-btn ${activeTab === "revert" ? "active" : ""}`}
          onClick={() => setActiveTab("revert")}
        >
          Revert Request
        </button>
        <button
          className={`tab-btn ${activeTab === "nonenglish" ? "active" : ""}`}
          onClick={() => setActiveTab("nonenglish")}
        >
          Non-English
        </button>
      </div>

      {activeTab === "calculator" && <AudioCalculator />}

      {/* Pass all the teleport functions down to the Renamer */}
      {activeTab === "renamer" && (
        <FileRenamer
          setSharedFiles={setSharedFiles}
          setRevertFiles={setRevertFiles}
          setNonEngFiles={setNonEngFiles}
        />
      )}

      {activeTab === "tat" && (
        <TatNotice sharedFiles={sharedFiles} setSharedFiles={setSharedFiles} />
      )}
      {activeTab === "revert" && (
        <RevertRequest
          revertFiles={revertFiles}
          setRevertFiles={setRevertFiles}
        />
      )}
      {activeTab === "nonenglish" && (
        <NonEnglish nonEngFiles={nonEngFiles} setNonEngFiles={setNonEngFiles} />
      )}
    </div>
  );
}

export default App;
