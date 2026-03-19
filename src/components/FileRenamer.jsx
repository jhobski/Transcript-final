import { useState, useEffect } from "react";

export default function FileRenamer({
  setSharedFiles,
  setRevertFiles,
  setNonEngFiles,
  setCorrectionFiles,
  setMusicFiles,
}) {
  // Universal Input States
  const [fileName, setFileName] = useState("");
  const [fileLink, setFileLink] = useState("");
  const [fileDetail, setFileDetail] = useState(""); // Serves as the Reason OR the File Length

  // Hub Storage State
  const [hubFiles, setHubFiles] = useState([]);

  // UI States
  const [copiedId, setCopiedId] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load saved hub files on startup
  useEffect(() => {
    const saved = localStorage.getItem("transcriptionHubData");
    if (saved) setHubFiles(JSON.parse(saved));
  }, []);

  const saveToHub = (newFiles) => {
    setHubFiles(newFiles);
    localStorage.setItem("transcriptionHubData", JSON.stringify(newFiles));
  };

  const addFileToHub = () => {
    if (!fileName.trim()) return alert("Please enter a File Name first!");

    const phTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const newFile = {
      id: Date.now().toString(),
      name: fileName.trim(),
      link: fileLink.trim(),
      detail: fileDetail.trim(),
      generatedAt: phTime,
    };

    saveToHub([newFile, ...hubFiles]);

    // Clear inputs after adding
    setFileName("");
    setFileLink("");
    setFileDetail("");
    setCurrentPage(1); // Snap to page 1 to see the new entry
  };

  const deleteFile = (id) => saveToHub(hubFiles.filter((f) => f.id !== id));

  const clearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all files from the Universal Hub?"
      )
    ) {
      saveToHub([]);
      setCurrentPage(1);
    }
  };

  const copyText = (text, id) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => alert("Failed to copy."));
  };

  // The Universal Teleporter
  const routeFile = (file, destination) => {
    // Helper to remove totally empty default rows before adding the new one
    const filterEmpty = (prev) =>
      prev.filter(
        (f) => f.name.trim() !== "" || (f.link && f.link.trim() !== "")
      );

    if (destination === "tat") {
      setSharedFiles((prev) => [
        ...filterEmpty(prev),
        { name: file.name, link: file.link },
      ]);
      alert(`Sent to TAT Delay Notice!`);
    } else if (destination === "revert") {
      setRevertFiles((prev) => [
        ...filterEmpty(prev),
        { name: file.name, link: file.link },
      ]);
      alert(`Sent to Revert Requests!`);
    } else if (destination === "noneng") {
      setNonEngFiles((prev) => [
        ...filterEmpty(prev),
        { name: file.name, link: file.link },
      ]);
      alert(`Sent to Non-English Files!`);
    } else if (destination === "correction") {
      setCorrectionFiles((prev) => [
        ...filterEmpty(prev),
        { name: file.name, link: file.link },
      ]);
      alert(`Sent to Correction Notice!`);
    } else if (destination === "music") {
      // Notice how 'file.detail' maps directly to 'length' for the Music Log!
      setMusicFiles((prev) => [
        ...filterEmpty(prev),
        { name: file.name, link: file.link, length: file.detail },
      ]);
      alert(`Sent to Music Log!`);
    }
  };

  // --- SORTING & PAGINATION LOGIC ---
  const sortedFiles = [...hubFiles].sort((a, b) => {
    if (sortBy === "latest") return b.id.localeCompare(a.id);
    if (sortBy === "oldest") return a.id.localeCompare(b.id);
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
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
          <h2>Universal File Hub</h2>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            (Distribute files to any tab)
          </span>
        </div>
        <button className="action-btn clear-all-btn" onClick={clearAll}>
          Clear All
        </button>
      </div>

      {/* The New Universal Input Form */}
      <div className="vertical-group" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="File Name *"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <input
          type="text"
          placeholder="File Link"
          value={fileLink}
          onChange={(e) => setFileLink(e.target.value)}
        />
        <input
          type="text"
          placeholder="Reason / File Length (Optional)"
          value={fileDetail}
          onChange={(e) => setFileDetail(e.target.value)}
        />

        <button
          className="action-btn"
          onClick={addFileToHub}
          style={{ marginTop: "10px", padding: "12px", fontSize: "15px" }}
        >
          + Add to Universal Hub
        </button>
      </div>

      <div
        className="header"
        style={{
          marginTop: "25px",
          borderTop: "1px dashed var(--border-color)",
          paddingTop: "20px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", color: "var(--text-main)" }}>
          Tracked Files
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Sort:
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
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
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
              <th>File Info</th>
              <th>Reason / Length</th>
              <th style={{ minWidth: "260px" }}>Actions</th>
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
                  No files logged yet.
                </td>
              </tr>
            ) : (
              currentFiles.map((file) => (
                <tr key={file.id}>
                  <td>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "var(--text-main)",
                        marginBottom: "4px",
                      }}
                    >
                      {file.name}
                    </div>
                    {file.link && (
                      <a
                        href={file.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: "11px",
                          color: "var(--accent-purple)",
                          textDecoration: "none",
                          wordBreak: "break-all",
                        }}
                      >
                        View Link ↗
                      </a>
                    )}
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        marginTop: "6px",
                        fontStyle: "italic",
                      }}
                    >
                      {file.generatedAt}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{ color: "var(--text-main)", fontSize: "13px" }}
                    >
                      {file.detail || "-"}
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
                          onClick={() => copyText(file.name, `name_${file.id}`)}
                          style={{
                            backgroundColor:
                              copiedId === `name_${file.id}`
                                ? "var(--accent-green)"
                                : "var(--bg-panel)",
                            color:
                              copiedId === `name_${file.id}`
                                ? "var(--bg-deep)"
                                : "var(--text-main)",
                            border: "1px solid var(--border-color)",
                            fontSize: "11px",
                            padding: "6px 8px",
                            flex: 1,
                          }}
                        >
                          {copiedId === `name_${file.id}`
                            ? "Copied!"
                            : "Copy Name"}
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteFile(file.id)}
                          style={{
                            fontSize: "11px",
                            padding: "6px 8px",
                            flex: 1,
                            margin: 0,
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      {/* UNIVERSAL ROUTING BUTTONS */}
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
                          onClick={() => routeFile(file, "tat")}
                          style={{
                            fontSize: "10px",
                            padding: "4px",
                            backgroundColor: "transparent",
                            color: "var(--accent-purple)",
                            border: "1px solid var(--border-color)",
                            flex: 1,
                          }}
                        >
                          TAT
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => routeFile(file, "revert")}
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
                          onClick={() => routeFile(file, "noneng")}
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
                          onClick={() => routeFile(file, "correction")}
                          style={{
                            fontSize: "10px",
                            padding: "4px",
                            backgroundColor: "transparent",
                            color: "var(--accent-green)",
                            border: "1px solid var(--border-color)",
                            flex: 1,
                          }}
                        >
                          Correct
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => routeFile(file, "music")}
                          style={{
                            fontSize: "10px",
                            padding: "4px",
                            backgroundColor: "transparent",
                            color: "#89dceb",
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
