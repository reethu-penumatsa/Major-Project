import { AlertCircle, ArrowLeft, FileText, Heart, Shield, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Diagnose() {
  const navigate = useNavigate();

  // Symptom Checker
  const [symptoms, setSymptoms] = useState("");
  const [symptomResult, setSymptomResult] = useState("");
  const [symptomLoading, setSymptomLoading] = useState(false);

  // Ultrasound Upload
  const [ultrasoundImage, setUltrasoundImage] = useState(null);
  const [ultrasoundMsg, setUltrasoundMsg] = useState("");
  const [ultrasoundLoading, setUltrasoundLoading] = useState(false);

  // Lab Report Upload
  const [labImage, setLabImage] = useState(null);
  const [labResult, setLabResult] = useState("");
  const [labLoading, setLabLoading] = useState(false);

  // Symptom Checker Handler
  const handleSymptomSubmit = async () => {
    setSymptomLoading(true);
    setSymptomResult("");

    try {
      const res = await fetch("http://127.0.0.1:5000/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      const data = await res.json();
      setSymptomResult(data.pcos_risk);
    } catch {
      setSymptomResult("Error connecting to backend. Please ensure the server is running.");
    }

    setSymptomLoading(false);
  };

  // Ultrasound Upload Handler
  const handleUltrasoundUpload = async () => {
    if (!ultrasoundImage) return setUltrasoundMsg("Please select an ultrasound image first");

    setUltrasoundLoading(true);
    const formData = new FormData();
    formData.append("image", ultrasoundImage);

    try {
      const res = await fetch("http://127.0.0.1:5000/upload-ultrasound", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUltrasoundMsg(data.message);
    } catch {
      setUltrasoundMsg("Error uploading image. Please try again.");
    }

    setUltrasoundLoading(false);
  };

  // Lab Report Upload Handler
  const handleLabUpload = async () => {
    if (!labImage) return setLabResult("Please select a lab report image first");

    setLabLoading(true);
    const formData = new FormData();
    formData.append("image", labImage);

    try {
      const res = await fetch("http://127.0.0.1:5000/upload-labreport", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setLabResult(
        `PCOS Analysis: ${data.pcos_result}\n\nDetected Lab Values:\n${JSON.stringify(data.lab_values, null, 2)}`
      );
    } catch {
      setLabResult("Error uploading lab report. Please try again.");
    }

    setLabLoading(false);
  };

  // Reusable Upload Card
  const renderUploadCard = (title, description, file, setFile, loading, onUpload, result) => (
    <div style={{
      background: "var(--gradient-card)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-card)",
      border: "1px solid var(--border-light)",
      padding: "32px",
      marginBottom: "32px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "var(--radius-md)",
          background: "rgba(90, 154, 168, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Upload style={{ width: 24, height: 24, color: "var(--accent)" }} />
        </div>
        <div>
          <h2 style={{ fontWeight: 600, fontSize: "18px", color: "var(--text-dark)", marginBottom: "4px" }}>{title}</h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>{description}</p>
        </div>
      </div>

      <div style={{
        border: "2px dashed var(--border-soft)",
        borderRadius: "var(--radius-md)",
        padding: "32px",
        textAlign: "center",
        background: "var(--bg-light)",
        marginBottom: "20px"
      }}>
        <input
          type="file"
          accept="image/*"
          id={title.replace(/\s+/g, "-").toLowerCase()}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ display: "none" }}
        />
        <label htmlFor={title.replace(/\s+/g, "-").toLowerCase()} style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(90, 154, 168, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Upload style={{ width: 28, height: 28, color: "var(--accent)" }} />
          </div>
          <div>
            <p style={{ fontWeight: 500, color: "var(--text-dark)", marginBottom: "4px" }}>{file ? file.name : "Click to upload or drag and drop"}</p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>PNG, JPG, or JPEG (max 10MB)</p>
          </div>
        </label>
      </div>

      <button
        onClick={onUpload}
        disabled={!file || loading}
        style={{
          padding: "14px 28px",
          background: (!file || loading) ? "var(--text-light)" : "var(--gradient-accent)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-md)",
          cursor: (!file || loading) ? "not-allowed" : "pointer",
          fontSize: "15px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Upload style={{ width: 18, height: 18 }} />
        {loading ? "Analyzing..." : `Analyze ${title}`}
      </button>

      {result && (
        <div style={{
          marginTop: "24px",
          padding: "20px",
          background: result.includes("Error") ? "rgba(239, 68, 68, 0.08)" : "linear-gradient(135deg, rgba(90, 154, 168, 0.08) 0%, rgba(212, 99, 138, 0.08) 100%)",
          borderRadius: "var(--radius-md)",
          border: `1px solid ${result.includes("Error") ? "rgba(239, 68, 68, 0.2)" : "var(--border-light)"}`
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            {result.includes("Error") ? <AlertCircle style={{ width: 20, height: 20, color: "#ef4444", flexShrink: 0, marginTop: "2px" }} /> : <Shield style={{ width: 20, height: 20, color: "var(--accent)", flexShrink: 0, marginTop: "2px" }} />}
            <p style={{ color: result.includes("Error") ? "#dc2626" : "var(--text-muted)", fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{result}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--gradient-hero)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <header style={{ padding: "20px 0", borderBottom: "1px solid var(--border-light)", background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "var(--bg-white)", border: "1px solid var(--border-soft)", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "14px", fontWeight: 500, color: "var(--text-dark)" }}>
            <ArrowLeft style={{ width: 18, height: 18 }} />
            Back to Home
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Heart style={{ width: 24, height: 24, color: "var(--primary)" }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "20px", color: "var(--text-dark)" }}>PCOSight</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "48px 0 80px" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          {/* Symptom Checker */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontWeight: 600, fontSize: "18px", color: "var(--text-dark)", marginBottom: "8px" }}>Symptom Checker</h2>
            <textarea
              rows={5}
              placeholder="Describe your symptoms..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              style={{ width: "100%", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-soft)", fontSize: "15px", resize: "vertical" }}
            />
            <button onClick={handleSymptomSubmit} disabled={!symptoms || symptomLoading} style={{ marginTop: "12px", padding: "14px 28px", background: (!symptoms || symptomLoading) ? "var(--text-light)" : "var(--gradient-primary)", color: "#fff", borderRadius: "var(--radius-md)" }}>
              {symptomLoading ? "Analyzing Symptoms..." : "Check PCOS Risk"}
            </button>
            {symptomResult && <pre style={{ marginTop: "16px", whiteSpace: "pre-wrap" }}>{symptomResult}</pre>}
          </div>

          {/* Ultrasound Upload */}
          {renderUploadCard("Ultrasound Scan", "Upload your ovarian ultrasound for analysis", ultrasoundImage, setUltrasoundImage, ultrasoundLoading, handleUltrasoundUpload, ultrasoundMsg)}

          {/* Lab Report Upload */}
          {renderUploadCard("Lab Report", "Upload your lab report for PCOS analysis", labImage, setLabImage, labLoading, handleLabUpload, labResult)}
        </div>
      </main>
    </div>
  );
}

export default Diagnose;
