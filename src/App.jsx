import { useState, useEffect } from "react";
import "./index.css";
import AudioCalculator from "./components/AudioCalculator";
import FileRenamer from "./components/FileRenamer";
import TatNotice from "./components/TatNotice";
import RevertRequest from "./components/RevertRequest";
import NonEnglish from "./components/NonEnglish";
import CorrectionNotice from "./components/CorrectionNotice";
import MusicLog from "./components/MusicLog";

function App() {
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("activeTab") || "calculator"
  );

  const [sharedFiles, setSharedFiles] = useState(() => {
    const saved = localStorage.getItem("sharedFiles");
    return saved ? JSON.parse(saved) : [{ name: "", link: "" }];
  });
  const [revertFiles, setRevertFiles] = useState(() => {
    const saved = localStorage.getItem("revertFiles");
    return saved ? JSON.parse(saved) : [{ name: "" }];
  });
  const [nonEngFiles, setNonEngFiles] = useState(() => {
    const saved = localStorage.getItem("nonEngFiles");
    return saved ? JSON.parse(saved) : [{ name: "", link: "" }];
  });

  // NEW: Memory for Correction Notice and Music Log
  const [correctionFiles, setCorrectionFiles] = useState(() => {
    const saved = localStorage.getItem("correctionFiles");
    return saved ? JSON.parse(saved) : [{ name: "", link: "" }];
  });
  const [musicFiles, setMusicFiles] = useState(() => {
    const saved = localStorage.getItem("musicFiles");
    return saved ? JSON.parse(saved) : [{ name: "", link: "", length: "" }];
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
  useEffect(
    () =>
      localStorage.setItem("correctionFiles", JSON.stringify(correctionFiles)),
    [correctionFiles]
  );
  useEffect(
    () => localStorage.setItem("musicFiles", JSON.stringify(musicFiles)),
    [musicFiles]
  );

  return (
    <div className="container">
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
          TAT Delay
        </button>
        <button
          className={`tab-btn ${activeTab === "revert" ? "active" : ""}`}
          onClick={() => setActiveTab("revert")}
        >
          Revert
        </button>
        <button
          className={`tab-btn ${activeTab === "nonenglish" ? "active" : ""}`}
          onClick={() => setActiveTab("nonenglish")}
        >
          Non-Eng
        </button>
        <button
          className={`tab-btn ${activeTab === "correction" ? "active" : ""}`}
          onClick={() => setActiveTab("correction")}
        >
          Correction
        </button>
        <button
          className={`tab-btn ${activeTab === "music" ? "active" : ""}`}
          onClick={() => setActiveTab("music")}
        >
          Music Log
        </button>
      </div>

      {activeTab === "calculator" && <AudioCalculator />}
      {activeTab === "renamer" && (
        <FileRenamer
          setSharedFiles={setSharedFiles}
          setRevertFiles={setRevertFiles}
          setNonEngFiles={setNonEngFiles}
          setCorrectionFiles={setCorrectionFiles}
          setMusicFiles={setMusicFiles}
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
      {activeTab === "correction" && (
        <CorrectionNotice
          correctionFiles={correctionFiles}
          setCorrectionFiles={setCorrectionFiles}
        />
      )}
      {activeTab === "music" && (
        <MusicLog musicFiles={musicFiles} setMusicFiles={setMusicFiles} />
      )}
    </div>
  );
}

export default App;
