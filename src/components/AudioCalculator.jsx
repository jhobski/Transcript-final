import { useState, useEffect } from "react";

export default function AudioCalculator() {
  const HOURLY_RATE = 238.1;
  const [filesData, setFilesData] = useState([]);
  const [quickAh, setQuickAh] = useState("");

  // Input states
  const [fileName, setFileName] = useState("File 1");
  const [duration, setDuration] = useState("00:00:00");
  const [penalty, setPenalty] = useState(0);

  // Load saved data on startup
  useEffect(() => {
    const saved = localStorage.getItem("transcriptionCalcData");
    if (saved) {
      setFilesData(JSON.parse(saved));
      setFileName(`File ${JSON.parse(saved).length + 1}`);
    }
  }, []);

  // Save data whenever filesData changes
  useEffect(() => {
    localStorage.setItem("transcriptionCalcData", JSON.stringify(filesData));
  }, [filesData]);

  const timeToAH = (timeStr) => {
    let parts = timeStr.split(":");
    if (parts.length !== 3) return 0;
    return (
      (parseInt(parts[0]) * 3600 +
        parseInt(parts[1]) * 60 +
        parseInt(parts[2])) /
        3600 || 0
    );
  };

  const addFile = () => {
    const newFile = {
      id: Date.now(),
      name: fileName,
      duration,
      penalty: parseFloat(penalty) || 0,
    };
    const newFilesList = [...filesData, newFile];
    setFilesData(newFilesList);
    setFileName(`File ${newFilesList.length + 1}`);
    setDuration("00:00:00");
    setPenalty(0);
  };

  const deleteFile = (id) => setFilesData(filesData.filter((f) => f.id !== id));

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all calculator data?")) {
      setFilesData([]);
      setFileName("File 1");
    }
  };

  // Auto-calculate totals
  let totals = { rawAh: 0, penalty: 0, finalAh: 0, earnings: 0 };
  const renderedRows = filesData.map((file) => {
    let rawAh = timeToAH(file.duration);
    let finalAh = Math.max(0, rawAh - file.penalty);
    let earnings = finalAh * HOURLY_RATE;

    totals.rawAh += rawAh;
    totals.penalty += file.penalty;
    totals.finalAh += finalAh;
    totals.earnings += earnings;

    return (
      <tr key={file.id}>
        <td>{file.name}</td>
        <td>{file.duration}</td>
        <td>{rawAh.toFixed(3)}</td>
        <td className="penalty">
          {file.penalty > 0 ? "-" + file.penalty.toFixed(3) : "-"}
        </td>
        <td>
          <strong>{finalAh.toFixed(3)}</strong>
        </td>
        <td>₱{earnings.toFixed(2)}</td>
        <td>
          <button className="delete-btn" onClick={() => deleteFile(file.id)}>
            Remove
          </button>
        </td>
      </tr>
    );
  });

  return (
    <div className="view-section active">
      <div className="quick-calc-bar">
        <label>Quick Earnings Check:</label>
        <input
          type="number"
          step="0.001"
          placeholder="Total AH"
          value={quickAh}
          onChange={(e) => setQuickAh(e.target.value)}
        />
        <span>=</span>
        <span className="quick-calc-result">
          ₱{((parseFloat(quickAh) || 0) * HOURLY_RATE).toFixed(2)}
        </span>
      </div>

      <div className="header">
        <h2>File Breakdown Tracker</h2>
        <div className="summary">
          <span>
            Total Files: <span>{filesData.length}</span>
          </span>
          <span>
            Total AH: <span>{totals.finalAh.toFixed(3)}</span>
          </span>
          <span>
            Total Earnings: ₱<span>{totals.earnings.toFixed(2)}</span>
          </span>
        </div>
      </div>

      <div className="input-group">
        <input
          type="text"
          placeholder="File Name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Duration (HH:MM:SS)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <input
          type="number"
          step="0.001"
          placeholder="Penalty AH"
          value={penalty}
          onChange={(e) => setPenalty(e.target.value)}
        />
        <button className="action-btn" onClick={addFile}>
          Add File
        </button>
        <button className="action-btn clear-all-btn" onClick={clearAll}>
          Clear All
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>File Name</th>
            <th>Duration</th>
            <th>Raw AH</th>
            <th>Penalty (AH)</th>
            <th>Final AH</th>
            <th>Earnings (PHP)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{renderedRows}</tbody>
        <tfoot>
          <tr className="total-row">
            <td colSpan="2">Totals</td>
            <td>{totals.rawAh.toFixed(3)}</td>
            <td className="penalty">
              {totals.penalty > 0 ? "-" + totals.penalty.toFixed(3) : "0.000"}
            </td>
            <td>{totals.finalAh.toFixed(3)}</td>
            <td>₱{totals.earnings.toFixed(2)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
