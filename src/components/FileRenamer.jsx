import { useState, useEffect, useRef } from "react";

export default function FileRenamer({ setSharedFileNames }) {
  // Pull the names from memory
  const [lastName, setLastName] = useState(
    () => localStorage.getItem("rn_lastName") || ""
  );
  const [firstName, setFirstName] = useState(
    () => localStorage.getItem("rn_firstName") || ""
  );

  // NEW: Pull the starting number from memory (default to 1 if it's not there)
  const [startNum, setStartNum] = useState(() => {
    const savedNum = localStorage.getItem("rn_startNum");
    return savedNum !== null ? parseInt(savedNum, 10) : 1;
  });

  const [renamedFiles, setRenamedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Save names to memory when typing
  useEffect(() => {
    localStorage.setItem("rn_lastName", lastName);
    localStorage.setItem("rn_firstName", firstName);
  }, [lastName, firstName]);

  // NEW: Save the starting number to memory whenever it changes
  useEffect(() => {
    localStorage.setItem("rn_startNum", startNum);
  }, [startNum]);

  // Load renamed files on startup
  useEffect(() => {
    const saved = localStorage.getItem("transcriptionRenamerData");
    if (saved) setRenamedFiles(JSON.parse(saved));
  }, []);

  const saveFiles = (newFiles) => {
    setRenamedFiles(newFiles);
    try {
      localStorage.setItem(
        "transcriptionRenamerData",
        JSON.stringify(newFiles)
      );
    } catch (e) {
      alert("Browser storage is full! Please clear renamed files.");
    }
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

      const reader = new FileReader();
      reader.onload = (e) => {
        newFilesList.push({
          id: Date.now() + Math.random(),
          originalName: file.name,
          newName,
          fileData: e.target.result,
        });
        saveFiles([...newFilesList]);
      };
      reader.readAsDataURL(file);
    });

    // Teleport names to the TAT tab
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

  // NEW: Update Clear All to also reset the counter
  const clearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all renamed files and reset the file number counter?"
      )
    ) {
      saveFiles([]);
      setStartNum(1); // Resets the box back to 1
    }
  };

  return (
    <div className="view-section active">
      <div className="header">
        <h2>Docx File Renamer</h2>
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
          style={{ maxWidth: "150px" }}
        />
        <div
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
          <button className="action-btn" onClick={processFiles}>
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
            <div className="file-actions">
              <a
                href={file.fileData}
                download={file.newName}
                className="action-btn"
              >
                Download
              </a>
              <button
                className="delete-btn"
                onClick={() => deleteFile(file.id)}
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
