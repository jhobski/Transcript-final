import { useState, useEffect } from "react";

export default function TatNotice({ sharedFiles, setSharedFiles }) {
  const [stage, setStage] = useState(
    () => localStorage.getItem("tat_stage") || ""
  );
  const [estimated, setEstimated] = useState(
    () => localStorage.getItem("tat_estimated") || ""
  );
  const [reason, setReason] = useState(
    () => localStorage.getItem("tat_reason") || ""
  );
  const [output, setOutput] = useState("");
  const [copyBtnText, setCopyBtnText] = useState("Copy Discord Notice");
  const [tatHistory, setTatHistory] = useState([]);

  // State to track which specific form field was just copied
  const [copiedField, setCopiedField] = useState(null);

  // Pull your first and last name from memory to format as "First Last"
  const editorName = `${localStorage.getItem("rn_firstName") || ""} ${
    localStorage.getItem("rn_lastName") || ""
  }`.trim();

  useEffect(() => {
    const savedHistory = localStorage.getItem("transcriptionTatHistory");
    if (savedHistory) setTatHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem("tat_stage", stage);
    localStorage.setItem("tat_estimated", estimated);
    localStorage.setItem("tat_reason", reason);
  }, [stage, estimated, reason]);

  const saveHistory = (newHistory) => {
    setTatHistory(newHistory);
    localStorage.setItem("transcriptionTatHistory", JSON.stringify(newHistory));
  };

  const handleFileChange = (index, field, value) => {
    const updatedFiles = [...sharedFiles];
    updatedFiles[index][field] = value;
    setSharedFiles(updatedFiles);
  };

  const addFileRow = () => {
    setSharedFiles([...sharedFiles, { name: "", link: "" }]);
  };

  const removeFileRow = (index) => {
    const updatedFiles = sharedFiles.filter((_, i) => i !== index);
    setSharedFiles(
      updatedFiles.length > 0 ? updatedFiles : [{ name: "", link: "" }]
    );
  };

  const generateNotice = () => {
    const validFiles = sharedFiles.filter(
      (f) => f.name.trim() !== "" || f.link.trim() !== ""
    );

    if (validFiles.length === 0) {
      alert("Please enter at least one File Name or Link.");
      return;
    }

    const namesText = validFiles.map((f) => f.name).join("\n");
    const linksText = validFiles.map((f) => f.link).join("\n");

    const noticeText = `TAT Delay Notice\n\nFile Name:\n${namesText}\n\nFile Link:\n${linksText}\n\nWorkflow Stage: ${stage}\nEstimated TAT: ${estimated}\nReason: ${reason}`;
    setOutput(noticeText);

    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      filenames: namesText,
      stage: stage,
      fullText: noticeText,
    };
    saveHistory([newEntry, ...tatHistory]);
  };

  const copyNotice = (textToCopy = output) => {
    if (!textToCopy) return alert("Nothing to copy! Generate a notice first.");

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopyBtnText("Copied! ✓");
        setTimeout(() => setCopyBtnText("Copy Discord Notice"), 2000);
      })
      .catch(() => alert("Failed to copy."));
  };

  const copyForForm = (text, fieldId) => {
    if (!text || text.trim() === "") {
      return alert(`Nothing to copy for this field!`);
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch(() => alert("Failed to copy."));
  };

  const clearDraft = () => {
    if (window.confirm("Clear the current draft?")) {
      setSharedFiles([{ name: "", link: "" }]);
      setStage("");
      setEstimated("");
      setReason("");
      setOutput("");
    }
  };

  const deleteHistoryEntry = (id) =>
    saveHistory(tatHistory.filter((h) => h.id !== id));

  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to delete all past TAT notices?"))
      saveHistory([]);
  };

  // Helper to filter out empty rows for our Quick Copy list
  const validFiles = sharedFiles.filter(
    (f) => f.name.trim() !== "" || f.link.trim() !== ""
  );

  // Helper function to keep button styling clean
  const getCopyBtnStyle = (fieldId) => ({
    fontSize: "12px",
    padding: "8px",
    backgroundColor:
      copiedField === fieldId ? "var(--accent-green)" : "var(--bg-panel)",
    color: copiedField === fieldId ? "var(--bg-deep)" : "var(--text-main)",
    border: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    borderRadius: "6px",
    fontFamily: "inherit",
    fontWeight: "bold",
    transition: "all 0.2s",
  });

  return (
    <div className="view-section active">
      <div className="tat-split-layout">
        {/* ================= LEFT COLUMN ================= */}
        <div>
          <div className="header">
            <h2>TAT Notice Generator</h2>
          </div>

          <div
            className="vertical-group"
            style={{ marginBottom: 0, padding: "15px" }}
          >
            <div
              style={{
                maxHeight: "280px",
                overflowY: "auto",
                paddingRight: "5px",
                marginBottom: "10px",
              }}
            >
              {sharedFiles.map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "15px",
                    alignItems: "center",
                    backgroundColor: "var(--bg-deep)",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="text"
                      placeholder={`File ${index + 1} Name`}
                      value={file.name}
                      onChange={(e) =>
                        handleFileChange(index, "name", e.target.value)
                      }
                      style={{ padding: "8px", fontSize: "13px" }}
                    />
                    <input
                      type="text"
                      placeholder={`File ${index + 1} Link`}
                      value={file.link}
                      onChange={(e) =>
                        handleFileChange(index, "link", e.target.value)
                      }
                      style={{ padding: "8px", fontSize: "13px" }}
                    />
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => removeFileRow(index)}
                    style={{ padding: "12px 10px", height: "100%" }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <button
              className="action-btn"
              onClick={addFileRow}
              style={{
                backgroundColor: "transparent",
                color: "var(--text-muted)",
                border: "1px dashed #585b70",
                width: "100%",
                marginBottom: "15px",
                padding: "8px",
              }}
            >
              + Add Another File
            </button>

            <div
              className="mobile-stack"
              style={{ display: "flex", gap: "10px", width: "100%" }}
            >
              <input
                type="text"
                placeholder="Stage (e.g., FR)"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              />
              <input
                type="text"
                placeholder="ETA (e.g., 20 mins)"
                value={estimated}
                onChange={(e) => setEstimated(e.target.value)}
              />
            </div>

            <input
              type="text"
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ marginTop: "10px" }}
            />

            <div
              className="mobile-stack"
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "15px",
                width: "100%",
              }}
            >
              <button
                className="action-btn"
                onClick={generateNotice}
                style={{ flex: 2, fontSize: "15px", padding: "12px" }}
              >
                Generate Notice
              </button>
              <button
                className="action-btn clear-all-btn"
                onClick={clearDraft}
                style={{ flex: 1, padding: "12px", fontSize: "15px" }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div>
          <div className="header">
            <h2>Generated Notice</h2>
          </div>

          <textarea
            rows="6"
            readOnly
            placeholder="Your generated notice will appear here..."
            value={output}
            style={{ width: "100%", boxSizing: "border-box" }}
          ></textarea>

          <button
            className="action-btn"
            onClick={() => copyNotice(output)}
            style={{
              width: "100%",
              marginTop: "10px",
              marginBottom: "20px",
              fontSize: "15px",
              padding: "12px",
              backgroundColor:
                copyBtnText === "Copied! ✓"
                  ? "var(--accent-green)"
                  : "var(--accent-purple)",
              color: "var(--bg-deep)",
            }}
          >
            {copyBtnText}
          </button>

          {/* UPDATED: Form Quick Copy Tools Panel */}
          <div
            style={{
              backgroundColor: "var(--bg-input)",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                margin: "0 0 10px 0",
                fontSize: "13px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Form Quick Copy Tools
            </h3>

            {/* Global Settings (Name and Reason) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "15px",
              }}
            >
              <button
                onClick={() => copyForForm(editorName, "global_name")}
                style={getCopyBtnStyle("global_name")}
              >
                {copiedField === "global_name" ? "Copied!" : "Copy My Name"}
              </button>
              <button
                onClick={() => copyForForm(reason, "global_reason")}
                style={getCopyBtnStyle("global_reason")}
              >
                {copiedField === "global_reason" ? "Copied!" : "Copy Reason"}
              </button>
            </div>

            {/* Individual File Loop */}
            {validFiles.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "8px",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: "4px",
                  }}
                >
                  Individual Files (Submit form for each)
                </div>
                <div
                  style={{
                    maxHeight: "160px",
                    overflowY: "auto",
                    paddingRight: "5px",
                  }}
                >
                  {validFiles.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: "10px",
                        backgroundColor: "var(--bg-deep)",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          marginBottom: "8px",
                          color: "var(--text-main)",
                          fontWeight: "bold",
                        }}
                      >
                        {f.name
                          ? f.name.substring(0, 30) +
                            (f.name.length > 30 ? "..." : "")
                          : `File ${i + 1}`}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() => copyForForm(f.name, `file_name_${i}`)}
                          style={getCopyBtnStyle(`file_name_${i}`)}
                        >
                          {copiedField === `file_name_${i}`
                            ? "Copied!"
                            : "Copy File Name"}
                        </button>
                        <button
                          onClick={() => copyForForm(f.link, `file_link_${i}`)}
                          style={getCopyBtnStyle(`file_link_${i}`)}
                        >
                          {copiedField === `file_link_${i}`
                            ? "Copied!"
                            : "Copy Link"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdwS3iUD1V1ByUTbqcRAglDU6gjXZouL-ICg0qUg2_S0g5jKQ/viewform"
              target="_blank"
              rel="noreferrer"
              style={{
                color: "var(--text-muted)",
                textDecoration: "none",
                fontSize: "13px",
                transition: "color 0.2s",
              }}
            >
              Ready to submit?{" "}
              <strong style={{ color: "var(--accent-purple)" }}>
                Open TAT Form ↗
              </strong>
            </a>
          </div>

          <div className="header">
            <h2>History Tracker</h2>
            <button
              className="action-btn clear-all-btn"
              onClick={clearAllHistory}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Clear All
            </button>
          </div>

          <div
            className="table-container"
            style={{ maxHeight: "200px", marginBottom: 0 }}
          >
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Files</th>
                  <th>Stage</th>
                  <th style={{ minWidth: "130px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tatHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      No notices yet.
                    </td>
                  </tr>
                ) : (
                  tatHistory.map((entry) => {
                    const fileArray = entry.filenames
                      .split("\n")
                      .filter((f) => f.trim() !== "");
                    const displayFileName = fileArray[0] || "Unknown";
                    const extraFilesCount =
                      fileArray.length > 1 ? ` (+${fileArray.length - 1})` : "";

                    return (
                      <tr key={entry.id}>
                        <td
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          {entry.date}
                        </td>
                        <td>
                          <strong>{displayFileName}</strong>
                          <span
                            style={{
                              color: "var(--accent-pink)",
                              fontSize: "12px",
                            }}
                          >
                            {extraFilesCount}
                          </span>
                        </td>
                        <td>{entry.stage}</td>
                        <td>
                          <button
                            className="action-btn"
                            onClick={() => setOutput(entry.fullText)}
                            style={{
                              padding: "4px 8px",
                              fontSize: "11px",
                              marginRight: "5px",
                              backgroundColor: "var(--border-color)",
                              color: "var(--text-main)",
                            }}
                          >
                            View
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => deleteHistoryEntry(entry.id)}
                            style={{ padding: "4px 8px", fontSize: "11px" }}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
