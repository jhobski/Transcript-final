import { useState } from "react";

export default function MusicLog({ musicFiles, setMusicFiles }) {
  const [output, setOutput] = useState("");
  const [copyBtnText, setCopyBtnText] = useState("Copy Music Log");

  const handleFileChange = (index, field, value) => {
    const updated = [...musicFiles];
    updated[index][field] = value;
    setMusicFiles(updated);
  };

  const addFileRow = () =>
    setMusicFiles([...musicFiles, { name: "", link: "", length: "" }]);

  const removeFileRow = (index) => {
    const updated = musicFiles.filter((_, i) => i !== index);
    setMusicFiles(
      updated.length > 0 ? updated : [{ name: "", link: "", length: "" }]
    );
  };

  const generateNotice = () => {
    const validFiles = musicFiles.filter(
      (f) => f.name.trim() !== "" || f.link.trim() !== ""
    );
    if (validFiles.length === 0)
      return alert("Please enter at least one File Name or Link.");

    const namesText = validFiles.map((f) => f.name).join("\n");
    const linksText = validFiles.map((f) => f.link).join("\n");
    const lengthsText = validFiles.map((f) => f.length).join("\n");

    const noticeText = `MUSIC LOG\nFilename:\n${namesText}\n\nFile Link:\n${linksText}\n\nFile Length:\n${lengthsText}`;
    setOutput(noticeText);
  };

  const copyNotice = () => {
    if (!output) return alert("Generate a notice first!");
    navigator.clipboard
      .writeText(output)
      .then(() => {
        setCopyBtnText("Copied! ✓");
        setTimeout(() => setCopyBtnText("Copy Music Log"), 2000);
      })
      .catch(() => alert("Failed to copy."));
  };

  const clearDraft = () => {
    if (window.confirm("Clear the current draft?")) {
      setMusicFiles([{ name: "", link: "", length: "" }]);
      setOutput("");
    }
  };

  return (
    <div className="view-section active">
      <div className="tat-split-layout">
        <div>
          <div className="header">
            <h2>Music Log Generator</h2>
          </div>
          <div
            className="vertical-group"
            style={{ padding: "15px", boxSizing: "border-box" }}
          >
            <div
              style={{
                maxHeight: "280px",
                overflowY: "auto",
                marginBottom: "10px",
                paddingRight: "5px",
              }}
            >
              {musicFiles.map((file, index) => (
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
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      minWidth: 0,
                    }}
                  >
                    <input
                      type="text"
                      placeholder={`File ${index + 1} Name`}
                      value={file.name}
                      onChange={(e) =>
                        handleFileChange(index, "name", e.target.value)
                      }
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "8px",
                        fontSize: "13px",
                      }}
                    />
                    <input
                      type="text"
                      placeholder={`File ${index + 1} Link`}
                      value={file.link}
                      onChange={(e) =>
                        handleFileChange(index, "link", e.target.value)
                      }
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "8px",
                        fontSize: "13px",
                      }}
                    />
                    <input
                      type="text"
                      placeholder={`File ${index + 1} Length (e.g., 15:30)`}
                      value={file.length}
                      onChange={(e) =>
                        handleFileChange(index, "length", e.target.value)
                      }
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

        <div>
          <div className="header">
            <h2>Generated Log</h2>
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
