import { FileText, Sparkles, Loader, Upload, CheckCircle } from "lucide-react";
import { useState } from "react";

function LabReportUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a lab report");

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:5000/upload-lab-report", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setResult(
        JSON.stringify(
          {
            lab_values: data.lab_values,
            pcos_result: data.pcos_result,
          },
          null,
          2
        )
      );
    } catch (err) {
      alert("Failed to analyze lab report");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* STEP 3 HEADER */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div
          style={{
            display: "inline-block",
            padding: "10px 22px",
            background: "rgba(232, 93, 138, 0.1)",
            border: "1px solid rgba(232, 93, 138, 0.3)",
            borderRadius: "50px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#e85d8a",
            marginBottom: "16px",
          }}
        >
          🧪 Step 3: Lab Report Analysis
        </div>

        <h2 style={{
                fontSize: "44px",
                fontWeight: 900,
                margin: "12px 0 20px",
                background: "linear-gradient(135deg, #e85d8a, #f4a8c1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
          Upload Your Lab Report
        </h2>

        <p style={{ fontSize: "16px", color: "#b0b0c8" }}>
          Upload hormone test reports to enhance diagnostic accuracy using OCR.
        </p>
      </div>

      {/* UPLOAD CARD */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(232, 93, 138, 0.08), rgba(77, 155, 169, 0.08))",
          border: "2px solid rgba(232, 93, 138, 0.2)",
          borderRadius: "20px",
          padding: "56px",
        }}
      >
        {/* DROP ZONE */}
        <div
          style={{
            border: "2px dashed rgba(232, 93, 138, 0.35)",
            borderRadius: "14px",
            padding: "60px 20px",
            textAlign: "center",
            background: "rgba(232, 93, 138, 0.05)",
          }}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            id="labInput"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <label
            htmlFor="labInput"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
          >
            <Upload size={42} color="#e85d8a" />

            <div>
              <div style={{ fontWeight: 700 }}>
                Click to upload or drag & drop
              </div>
              <div style={{ fontSize: "14px", color: "#7a7a8e" }}>
                PNG, JPG or PDF up to 10MB
              </div>
            </div>
          </label>

          {file && (
            <div
              style={{
                marginTop: "18px",
                color: "#10b981",
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                fontWeight: 600,
              }}
            >
              <CheckCircle size={18} />
              {file.name}
            </div>
          )}
        </div>

        {/* ANALYZE BUTTON */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          style={{
            marginTop: "28px",
            width: "100%",
            padding: "18px",
            background: loading
              ? "rgba(232, 93, 138, 0.3)"
              : "linear-gradient(135deg, #e85d8a, #f4a8c1)",
            border: "none",
            borderRadius: "14px",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {loading ? <Loader size={20} /> : <Sparkles size={20} />}
          {loading ? "Analyzing Lab Report..." : "Analyze Lab Report"}
        </button>

        {/* RESULT */}
        {result && (
          <div
            style={{
              marginTop: "32px",
              background: "rgba(15, 15, 30, 0.6)",
              border: "2px solid rgba(232, 93, 138, 0.3)",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h4 style={{ color: "#e85d8a", marginBottom: "12px" }}>
              Extracted Lab Data
            </h4>

            <pre
              style={{
                whiteSpace: "pre-wrap",
                color: "#c0c0d8",
                lineHeight: 1.7,
              }}
            >
              {result}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}

export default LabReportUpload;
