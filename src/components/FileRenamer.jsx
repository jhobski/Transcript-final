import { useState, useEffect, useRef } from "react";

// ==========================================
// INDEXED-DB VAULT MANAGER
// ==========================================
const DB_NAME = "TranscriptionVault";
const STORE_NAME = "docxFiles";
const initDB = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      if (!e.target.result.objectStoreNames.contains(STORE_NAME))
        e.target.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
const saveToVault = async (id, data) => {
  const db = await initDB();
  return new Promise((r) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(data, id);
    tx.oncomplete = () => r();
  });
};
const getFromVault = async (id) => {
  const db = await initDB();
  return new Promise((r) => {
    const req = db
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME)
      .get(id);
    req.onsuccess = () => r(req.result);
    req.onerror = () => r(null);
  });
};
const deleteFromVault = async (id) => {
  const db = await initDB();
  return new Promise((r) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => r();
  });
};
const clearVault = async () => {
  const db = await initDB();
  return new Promise((r) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => r();
  });
};

// ==========================================
// THE REACT COMPONENT
// ==========================================
// UPDATE: Added setCorrectionFiles and setMusicFiles to props
export default function FileRenamer({
  setSharedFiles,
  setRevertFiles,
  setNonEngFiles,
  setCorrectionFiles,
  setMusicFiles,
}) {
  const [lastName, setLastName] = useState(
    () => localStorage.getItem("rn_lastName") || ""
  );
  const [firstName, setFirstName] = useState(
    () => localStorage.getItem("rn_firstName") || ""
  );
  const [startNum, setStartNum] = useState(() => {
    const s = localStorage.getItem("rn_startNum");
    return s !== null ? parseInt(s, 10) : 1;
  });
  const [renamedFiles, setRenamedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [sortBy, setSortBy] = useState("latest");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    localStorage.setItem("rn_lastName", lastName);
    localStorage.setItem("rn_firstName", firstName);
    localStorage.setItem("rn_startNum", startNum);
  }, [lastName, firstName, startNum]);

  useEffect(() => {
    const s = localStorage.getItem("transcriptionRenamerData");
    if (s) setRenamedFiles(JSON.parse(s));
  }, []);

  const saveFilesMetadata = (newFiles) => {
    setRenamedFiles(newFiles);
    localStorage.setItem("transcriptionRenamerData", JSON.stringify(newFiles));
  };

  const processFiles = () => {
    const files = fileInputRef.current.files;
    if (files.length === 0)
      return alert("Please select at least one .docx file first!");

    const dateStr = new Date()
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      })
      .replace(/\//g, "");
    let currentNum = parseInt(startNum) || 1;
    let newFilesList = [...renamedFiles];
    let extractedNames = [];
    const phTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    Array.from(files).forEach((file, index) => {
      if (!file.name.toLowerCase().endsWith(".docx")) return;
      const newName = `${dateStr} - ${lastName}, ${firstName} - ${currentNum}.docx`;
      currentNum++;

      const baseName =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      extractedNames.push(baseName);

      const fileId = Date.now().toString() + String(index).padStart(3, "0");
      const reader = new FileReader();
      reader.onload = async (e) => await saveToVault(fileId, e.target.result);
      reader.readAsDataURL(file);

      newFilesList.push({
        id: fileId,
        originalName: file.name,
        newName,
        generatedAt: phTime,
      });
    });

    saveFilesMetadata(newFilesList);

    if (extractedNames.length > 0) {
      setSharedFiles((prev) => {
        const filtered = prev.filter(
          (f) => f.name.trim() !== "" || f.link.trim() !== ""
        );
        return [
          ...filtered,
          ...extractedNames.map((name) => ({ name, link: "" })),
        ];
      });
    }

    setStartNum(currentNum);
    fileInputRef.current.value = "";
    setCurrentPage(1);
  };

  const handleDownload = async (id, newName) => {
    const fileData = await getFromVault(id);
    if (!fileData)
      return alert("File not found! It may have been cleared or corrupted.");
    const link = document.createElement("a");
    link.href = fileData;
    link.download = newName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteFile = async (id) => {
    await deleteFromVault(id);
    saveFilesMetadata(renamedFiles.filter((f) => f.id !== id));
  };
  const clearAll = async () => {
    if (window.confirm("Are you sure you want to clear all renamed files?")) {
      await clearVault();
      saveFilesMetadata([]);
      setStartNum(1);
      setCurrentPage(1);
    }
  };

  const copyOriginalName = (name, id) => {
    const baseName = name.substring(0, name.lastIndexOf("."));
    navigator.clipboard
      .writeText(baseName || name)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => alert("Failed to copy."));
  };

  // UPDATE: Routing now handles Correction and Music Log
  const routeFile = (originalName, destination) => {
    const baseName =
      originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    if (destination === "revert") {
      setRevertFiles((prev) => [
        ...prev.filter((f) => f.name.trim() !== ""),
        { name: baseName, link: "" },
      ]);
      alert(`Sent "${baseName}" to Revert Requests!`);
    } else if (destination === "noneng") {
      setNonEngFiles((prev) => [
        ...prev.filter((f) => f.name.trim() !== "" || f.link.trim() !== ""),
        { name: baseName, link: "" },
      ]);
      alert(`Sent "${baseName}" to Non-English Files!`);
    } else if (destination === "correction") {
      setCorrectionFiles((prev) => [
        ...prev.filter((f) => f.name.trim() !== "" || f.link.trim() !== ""),
        { name: baseName, link: "" },
      ]);
      alert(`Sent "${baseName}" to Correction Notice!`);
    } else if (destination === "music") {
      setMusicFiles((prev) => [
        ...prev.filter((f) => f.name.trim() !== "" || f.link.trim() !== ""),
        { name: baseName, link: "", length: "" },
      ]);
      alert(`Sent "${baseName}" to Music Log!`);
    }
  };

  const sortedFiles = [...renamedFiles].sort((a, b) => {
    if (sortBy === "latest") return b.id.localeCompare(a.id);
    if (sortBy === "oldest") return a.id.localeCompare(b.id);
    if (sortBy === "name-asc")
      return a.originalName.localeCompare(b.originalName);
    if (sortBy === "name-desc")
      return b.originalName.localeCompare(a.originalName);
    return 0;
  });

  const totalPages = Math.ceil(sortedFiles.length / rowsPerPage) || 1;
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [sortedFiles.length, totalPages, currentPage]);

  const indexOfLastFile = currentPage * rowsPerPage;
  const indexOfFirstFile = indexOfLastFile - rowsPerPage;
  const currentFiles = sortedFiles.slice(indexOfFirstFile, indexOfLastFile);

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
            }}
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

      <div
        className="header"
        style={{
          marginTop: "35px",
          borderTop: "1px dashed var(--border-color)",
          paddingTop: "20px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", color: "var(--text-main)" }}>
          Processed Files
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              backgroundColor: "var(--bg-input)",
              color: "var(--text-main)",
              border: "1px solid var(--border-color)",
              fontSize: "13px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Original Name (A-Z)</option>
            <option value="name-desc">Original Name (Z-A)</option>
          </select>
        </div>
      </div>

      <div
        className="table-container"
        style={{ maxHeight: "none", overflowY: "visible" }}
      >
        <table>
          <thead>
            <tr>
              <th>Original File</th>
              <th>Renamed To</th>
              <th style={{ minWidth: "220px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentFiles.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    padding: "20px",
                  }}
                >
                  No files processed yet.
                </td>
              </tr>
            ) : (
              currentFiles.map((file) => (
                <tr key={file.id}>
                  <td>
                    <div style={{ fontWeight: "bold" }}>
                      {file.originalName}
                    </div>
                    {file.generatedAt && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--text-muted)",
                          marginTop: "4px",
                          fontStyle: "italic",
                        }}
                      >
                        {file.generatedAt}
                      </div>
                    )}
                  </td>
                  <td>
                    <div
                      style={{ color: "var(--text-main)", fontWeight: "500" }}
                    >
                      {file.newName}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          alignItems: "stretch",
                        }}
                      >
                        <button
                          className="action-btn"
                          onClick={() =>
                            copyOriginalName(file.originalName, file.id)
                          }
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
                            fontSize: "12px",
                            padding: "6px 10px",
                            flex: 1,
                          }}
                        >
                          {copiedId === file.id ? "Copied! ✓" : "Copy"}
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => handleDownload(file.id, file.newName)}
                          style={{
                            fontSize: "12px",
                            padding: "6px 10px",
                            border: "1px solid transparent",
                            flex: 1,
                          }}
                        >
                          Download
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteFile(file.id)}
                          style={{
                            fontSize: "12px",
                            padding: "6px 10px",
                            flex: 1,
                            margin: 0,
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      {/* UPDATE: Added Correction and Music buttons */}
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          alignItems: "center",
                          borderTop: "1px dashed var(--border-color)",
                          paddingTop: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            fontWeight: "bold",
                            width: "100%",
                            marginBottom: "4px",
                          }}
                        >
                          Route To:
                        </span>
                        <button
                          className="action-btn"
                          onClick={() => routeFile(file.originalName, "revert")}
                          style={{
                            fontSize: "10px",
                            padding: "4px",
                            backgroundColor: "transparent",
                            color: "var(--accent-pink)",
                            border: "1px solid var(--border-color)",
                            flex: 1,
                          }}
                        >
                          Revert
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => routeFile(file.originalName, "noneng")}
                          style={{
                            fontSize: "10px",
                            padding: "4px",
                            backgroundColor: "transparent",
                            color: "var(--accent-red)",
                            border: "1px solid var(--border-color)",
                            flex: 1,
                          }}
                        >
                          NonEng
                        </button>
                        <button
                          className="action-btn"
                          onClick={() =>
                            routeFile(file.originalName, "correction")
                          }
                          style={{
                            fontSize: "10px",
                            padding: "4px",
                            backgroundColor: "transparent",
                            color: "var(--accent-purple)",
                            border: "1px solid var(--border-color)",
                            flex: 1,
                          }}
                        >
                          Correct
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => routeFile(file.originalName, "music")}
                          style={{
                            fontSize: "10px",
                            padding: "4px",
                            backgroundColor: "transparent",
                            color: "var(--accent-green)",
                            border: "1px solid var(--border-color)",
                            flex: 1,
                          }}
                        >
                          Music
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sortedFiles.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "15px",
            padding: "12px 15px",
            backgroundColor: "var(--bg-panel)",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Show:
            </span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-main)",
                border: "1px solid var(--border-color)",
                fontSize: "12px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value={5}>5 files</option>
              <option value={10}>10 files</option>
              <option value={20}>20 files</option>
              <option value={50}>50 files</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button
              className="action-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Prev
            </button>
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-main)",
                fontWeight: "bold",
              }}
            >
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="action-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                opacity: currentPage === totalPages ? 0.5 : 1,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
