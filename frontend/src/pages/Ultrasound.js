import { useState } from "react";
import { Upload, CheckCircle } from "lucide-react";
import LabReportUpload from "./LabReportUpload";

function Ultrasound({ analysisData }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [result, setResult] = useState(null);

  const handleImageUpload = async () => {
    if (!image) return;

    setUploading(true);
    setUploadMsg("");
    setResult(null);

    const formData = new FormData();
    formData.append("image", image); // 🔑 backend expects "image"

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/ultrasound-check",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log("Ultrasound response:", data);

      setResult(data);
      setUploadMsg("Ultrasound uploaded and analyzed successfully ✔️");
    } catch (err) {
      console.error(err);
      setUploadMsg("Error uploading image. Please try again.");
    }

    setUploading(false);
  };

  return (
    <div>
      {/* Ultrasound Upload */}
      {analysisData && (
        <>
          {/* Step 2 Header */}
          <div
            style={{
              textAlign: "center",
              marginTop: "48px",
              marginBottom: "40px",
              animation: "slideInUp 0.6s ease-out",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "rgba(232, 93, 138, 0.1)",
                border: "1px solid rgba(232, 93, 138, 0.3)",
                borderRadius: "50px",
                marginBottom: "16px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#e85d8a",
              }}
            >
              📷 Step 2: Ultrasound Upload
            </div>

            <h2
              style={{
                fontSize: "44px",
                fontWeight: 900,
                margin: "12px 0 20px",
                background: "linear-gradient(135deg, #e85d8a, #f4a8c1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Upload Ultrasound Scan
            </h2>

            <p style={{ fontSize: "16px", color: "#b0b0c8" }}>
              Upload your ovarian ultrasound for multi-stage analysis
            </p>
          </div>

          {/* Upload Card */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(77, 155, 169, 0.08), rgba(232, 93, 138, 0.08))",
              border: "2px solid rgba(77, 155, 169, 0.2)",
              borderRadius: "20px",
              padding: "56px",
              animation: "slideInUp 0.8s ease-out 0.2s both",
            }}
          >
            <div
              style={{
                border: "2px dashed rgba(77, 155, 169, 0.3)",
                borderRadius: "12px",
                padding: "60px 20px",
                textAlign: "center",
                background: "rgba(77, 155, 169, 0.05)",
              }}
            >
              <input
                type="file"
                accept="image/*"
                id="imageInput"
                style={{ display: "none" }}
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />

              <label
                htmlFor="imageInput"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
              >
                <Upload size={40} color="#4d9ba9" />
                <div>
                  <div style={{ fontWeight: 700 }}>
                    Click to upload or drag & drop
                  </div>
                  <div style={{ fontSize: "14px", color: "#7a7a8e" }}>
                    PNG, JPG up to 10MB
                  </div>
                </div>
              </label>

              {image && (
                <div
                  style={{
                    marginTop: "16px",
                    color: "#10b981",
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircle size={20} />
                  {image.name}
                </div>
              )}
            </div>

            {/* Upload Button */}
            <button
              onClick={handleImageUpload}
              disabled={!image || uploading}
              style={{
                marginTop: "24px",
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "none",
                fontSize: "16px",
                fontWeight: 700,
                color: "#fff",
                cursor: uploading ? "not-allowed" : "pointer",
                background: uploading
                  ? "rgba(77, 155, 169, 0.3)"
                  : "linear-gradient(135deg, #4d9ba9, #7fb8c4)",
              }}
            >
              {uploading ? "Analyzing..." : "Upload Ultrasound"}
            </button>

            {/* Status Message */}
            {uploadMsg && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  color: uploadMsg.includes("Error")
                    ? "#ff7070"
                    : "#10b981",
                  background: uploadMsg.includes("Error")
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(16, 185, 129, 0.1)",
                }}
              >
                {uploadMsg}
              </div>
            )}

            {result && (
  <div style={{ marginTop: "32px" }}>
    <h3>
      PCOS Risk:{" "}
      <span
        style={{
          color: result.risk === "HIGH" ? "#ef4444" : "#10b981",
        }}
      >
        {result.risk}
      </span>
    </h3>

    <p>Confidence: {result.confidence}</p>

    {/* 🔥 TEXT EXPLANATION */}
    {result.explanation && (
      <p
        style={{
          marginTop: "16px",
          paddingLeft: "12px",
          borderLeft: "4px solid #4d9ba9",
          color: "#c0c0d8",
          lineHeight: 1.7,
        }}
      >
        {result.explanation}
      </p>
    )}

    {result.heatmap_url && (
  <div style={{ textAlign: "center", marginTop: "24px" }}>
    <img
      src={result.heatmap_url}
      alt="PCOS Heatmap"
      style={{
        width: "420px",          // 🔑 reduced size
        maxWidth: "100%",
        borderRadius: "12px",
        border: "2px solid rgba(232, 93, 138, 0.3)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
      }}
    />
  </div>
)}

  </div>
)}

          </div>
        </>
      )}
  
{result && (
  <div style={{ marginTop: "40px" }}>
    <LabReportUpload />
  </div>
)}
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Ultrasound;
