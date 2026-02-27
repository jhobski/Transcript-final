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
  const [copyBtnText, setCopyBtnText] = useState("Copy to Clipboard");
  const [tatHistory, setTatHistory] = useState([]);

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

  // UPDATE: Functions to handle the dynamic file rows
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
    // If they delete the last row, give them a fresh empty one
    setSharedFiles(
      updatedFiles.length > 0 ? updatedFiles : [{ name: "", link: "" }]
    );
  };

  const generateNotice = () => {
    // Filter out rows that are completely empty
    const validFiles = sharedFiles.filter(
      (f) => f.name.trim() !== "" || f.link.trim() !== ""
    );

    if (validFiles.length === 0) {
      alert("Please enter at least one File Name or Link.");
      return;
    }

    // Combine all names and links into the Discord format
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
      filenames: namesText, // Save the combined string to history so it looks right
      stage: stage,
      fullText: noticeText,
    };
    saveHistory([newEntry, ...tatHistory]);
  };

  const copyNotice = (textToCopy = output) => {
    if (!textToCopy) return alert("Nothing to copy!");

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopyBtnText("Copied! ✓");
        setTimeout(() => setCopyBtnText("Copy to Clipboard"), 2000);
      })
      .catch(() => alert("Failed to copy."));
  };

  const clearDraft = () => {
    if (window.confirm("Clear the current draft?")) {
      setSharedFiles([{ name: "", link: "" }]); // Resets to one empty row
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
            {/* UPDATE: The Dynamic Rows UI */}
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
            rows="7"
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
              marginBottom: "8px",
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
            style={{ maxHeight: "250px", marginBottom: 0 }}
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
