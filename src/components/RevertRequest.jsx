import { useState, useEffect } from "react";

export default function RevertRequest({ revertFiles, setRevertFiles }) {
  const [currentStage, setCurrentStage] = useState(
    () => localStorage.getItem("rev_current") || ""
  );
  const [targetStage, setTargetStage] = useState(
    () => localStorage.getItem("rev_target") || ""
  );
  const [reason, setReason] = useState(
    () => localStorage.getItem("rev_reason") || ""
  );
  const [output, setOutput] = useState("");
  const [copyBtnText, setCopyBtnText] = useState("Copy Revert Notice");

  useEffect(() => {
    localStorage.setItem("rev_current", currentStage);
    localStorage.setItem("rev_target", targetStage);
    localStorage.setItem("rev_reason", reason);
  }, [currentStage, targetStage, reason]);

  const handleFileChange = (index, value) => {
    const updated = [...revertFiles];
    updated[index].name = value;
    setRevertFiles(updated);
  };

  const addFileRow = () => setRevertFiles([...revertFiles, { name: "" }]);

  const removeFileRow = (index) => {
    const updated = revertFiles.filter((_, i) => i !== index);
    setRevertFiles(updated.length > 0 ? updated : [{ name: "" }]);
  };

  const generateNotice = () => {
    const validFiles = revertFiles.filter((f) => f.name.trim() !== "");
    if (validFiles.length === 0)
      return alert("Please enter at least one Filename.");

    const namesText = validFiles.map((f) => f.name).join("\n");
    const noticeText = `REVERT REQUESTS\nFilename:\n${namesText}\n\nCurrent Stage: ${currentStage}\nTarget Stage: ${targetStage}\nReason: ${reason}`;
    setOutput(noticeText);
  };

  const copyNotice = () => {
    if (!output) return alert("Generate a notice first!");
    navigator.clipboard
      .writeText(output)
      .then(() => {
        setCopyBtnText("Copied! ✓");
        setTimeout(() => setCopyBtnText("Copy Revert Notice"), 2000);
      })
      .catch(() => alert("Failed to copy."));
  };

  const clearDraft = () => {
    if (window.confirm("Clear the current draft?")) {
      setRevertFiles([{ name: "" }]);
      setCurrentStage("");
      setTargetStage("");
      setReason("");
      setOutput("");
    }
  };

  return (
    <div className="view-section active">
      <div className="tat-split-layout">
        {/* LEFT COLUMN */}
        <div>
          <div className="header">
            <h2>Revert Request Generator</h2>
          </div>
          <div
            className="vertical-group"
            style={{ padding: "15px", boxSizing: "border-box" }}
          >
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                marginBottom: "10px",
                paddingRight: "5px",
              }}
            >
              {revertFiles.map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "10px",
                    alignItems: "center",
                    backgroundColor: "var(--bg-deep)",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input
                      type="text"
                      placeholder={`File ${index + 1} Name`}
                      value={file.name}
                      onChange={(e) => handleFileChange(index, e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "8px",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => removeFileRow(index)}
                    style={{ padding: "10px 12px" }}
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
                boxSizing: "border-box",
              }}
            >
              + Add File
            </button>

            <div
              className="mobile-stack"
              style={{
                display: "flex",
                gap: "10px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <input
                type="text"
                placeholder="Current Stage"
                value={currentStage}
                onChange={(e) => setCurrentStage(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
              <input
                type="text"
                placeholder="Target Stage"
                value={targetStage}
                onChange={(e) => setTargetStage(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>

            <input
              type="text"
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                marginTop: "10px",
                width: "100%",
                boxSizing: "border-box",
              }}
            />

            <div
              className="mobile-stack"
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "15px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <button
                className="action-btn"
                onClick={generateNotice}
                style={{ flex: 2, padding: "12px", boxSizing: "border-box" }}
              >
                Generate
              </button>
              <button
                className="action-btn clear-all-btn"
                onClick={clearDraft}
                style={{ flex: 1, padding: "12px", boxSizing: "border-box" }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <div className="header">
            <h2>Generated Request</h2>
          </div>
          <textarea
            rows="9"
            readOnly
            placeholder="Your notice will appear here..."
            value={output}
            style={{ width: "100%", boxSizing: "border-box" }}
          ></textarea>
          <button
            className="action-btn"
            onClick={copyNotice}
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "12px",
              boxSizing: "border-box",
              backgroundColor:
                copyBtnText === "Copied! ✓"
                  ? "var(--accent-green)"
                  : "var(--accent-purple)",
              color: "var(--bg-deep)",
            }}
          >
            {copyBtnText}
          </button>
        </div>
      </div>
    </div>
  );
}
