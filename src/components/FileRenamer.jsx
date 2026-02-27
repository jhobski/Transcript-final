import { useState, useEffect, useRef } from "react";

export default function FileRenamer({ setSharedFileNames }) {
  const [lastName, setLastName] = useState(
    () => localStorage.getItem("rn_lastName") || ""
  );
  const [firstName, setFirstName] = useState(
    () => localStorage.getItem("rn_firstName") || ""
  );
  const [startNum, setStartNum] = useState(() => {
    const savedNum = localStorage.getItem("rn_startNum");
    return savedNum !== null ? parseInt(savedNum, 10) : 1;
  });

  const [renamedFiles, setRenamedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    localStorage.setItem("rn_lastName", lastName);
    localStorage.setItem("rn_firstName", firstName);
  }, [lastName, firstName]);

  useEffect(() => {
    localStorage.setItem("rn_startNum", startNum);
  }, [startNum]);

  // Load the history of names on startup
  useEffect(() => {
    const saved = localStorage.getItem("transcriptionRenamerData");
    if (saved) setRenamedFiles(JSON.parse(saved));
  }, []);

  const saveFiles = (newFiles) => {
    setRenamedFiles(newFiles);

    // THE FIX: We save the names to permanent storage, but NOT the heavy file data!
    // This completely removes the 5MB storage limit error.
    const safeDataToSave = newFiles.map((f) => ({
      id: f.id,
      originalName: f.originalName,
      newName: f.newName,
    }));
    localStorage.setItem(
      "transcriptionRenamerData",
      JSON.stringify(safeDataToSave)
    );
  };

  const processFiles = () => {
    const files = fileInputRef.current.files;
    if (files.length === 0)
      return alert("Please select at least one .docx file first!");

    const dateString = new Date()
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, "");
    let currentNum = parseInt(startNum) || 1;
    let newFilesList = [...renamedFiles];

    let extractedNames = [];

    Array.from(files).forEach((file) => {
      if (!file.name.toLowerCase().endsWith(".docx")) return;
      const newName = `${dateString} - ${lastName}, ${firstName} - ${currentNum}.docx`;
      currentNum++;

      extractedNames.push(file.name);

      // THE FIX: Create a temporary RAM URL instead of heavy Base64 code
      const fileUrl = URL.createObjectURL(file);

      newFilesList.push({
        id: Date.now() + Math.random(),
        originalName: file.name,
        newName,
        fileData: fileUrl,
      });
    });

    saveFiles(newFilesList);

    if (extractedNames.length > 0) {
      setSharedFileNames((prev) =>
        prev
          ? prev + "\n" + extractedNames.join("\n")
          : extractedNames.join("\n")
      );
    }

    setStartNum(currentNum);
    fileInputRef.current.value = "";
  };

  const deleteFile = (id) => saveFiles(renamedFiles.filter((f) => f.id !== id));

  const clearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all renamed files and reset the file number counter?"
      )
    ) {
      saveFiles([]);
      setStartNum(1);
    }
  };

  const copyOriginalName = (name, id) => {
    navigator.clipboard
      .writeText(name)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => alert("Failed to copy."));
  };

  return (
    <div className="view-section active">
      <div className="header">
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <h2>Docx File Renamer</h2>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSeSEOyac74Awrgevpvi1_d4PzzakhbGvjm6qoZX9ruAs74oyQ/viewform?pli=1&pli=1"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "var(--accent-purple)",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "600",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.opacity = 0.8)}
            onMouseOut={(e) => (e.target.style.opacity = 1)}
          >
            Submit Files Form ↗
          </a>
        </div>
        <button className="action-btn clear-all-btn" onClick={clearAll}>
          Clear All
        </button>
      </div>

      <div className="input-group">
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Start Num"
          value={startNum}
          onChange={(e) => setStartNum(e.target.value)}
        />

        <div
          className="mobile-stack"
          style={{
            width: "100%",
            marginTop: "10px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <input
            type="file"
            accept=".docx"
            multiple
            ref={fileInputRef}
            style={{
              border: "none",
              padding: 0,
              flex: "none",
              color: "var(--text-main)",
            }}
          />
          <button
            className="action-btn"
            onClick={processFiles}
            style={{ width: "100%" }}
          >
            Generate Renamed Files
          </button>
        </div>
      </div>

      <ul className="renamer-list">
        {renamedFiles.map((file) => (
          <li key={file.id}>
            <div className="file-info">
              <div className="original-name">
                <strong>Original File:</strong> {file.originalName}
              </div>
              <div className="new-name">
                <strong>Renamed To:</strong> {file.newName}
              </div>
            </div>

            <div
              className="file-actions"
              style={{ display: "flex", gap: "10px", alignItems: "stretch" }}
            >
              <button
                className="action-btn"
                onClick={() => copyOriginalName(file.originalName, file.id)}
                style={{
                  backgroundColor:
                    copiedId === file.id
                      ? "var(--accent-green)"
                      : "var(--bg-panel)",
                  color:
                    copiedId === file.id
                      ? "var(--bg-deep)"
                      : "var(--text-main)",
                  border: "1px solid var(--border-color)",
                  fontSize: "13px",
                  padding: "8px 12px",
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                  boxSizing: "border-box",
                }}
              >
                {copiedId === file.id ? "Copied! ✓" : "Copy Original"}
              </button>

              {/* UI UPDATE: If they refresh, the Download button turns into a gray "Expired" button */}
              {file.fileData ? (
                <a
                  href={file.fileData}
                  download={file.newName}
                  className="action-btn"
                  style={{
                    fontSize: "13px",
                    padding: "8px 12px",
                    border: "1px solid transparent",
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                    boxSizing: "border-box",
                  }}
                >
                  Download
                </a>
              ) : (
                <button
                  className="action-btn"
                  disabled
                  style={{
                    fontSize: "13px",
                    padding: "8px 12px",
                    backgroundColor: "var(--bg-panel)",
                    color: "var(--text-muted)",
                    border: "1px dashed var(--border-color)",
                    flex: 1,
                    cursor: "not-allowed",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxSizing: "border-box",
                  }}
                >
                  Expired
                </button>
              )}

              <button
                className="delete-btn"
                onClick={() => deleteFile(file.id)}
                style={{
                  fontSize: "13px",
                  padding: "8px 12px",
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                  boxSizing: "border-box",
                  margin: 0,
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
