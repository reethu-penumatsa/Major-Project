import {
  AlertCircle,
  ArrowLeft,
  FileText,
  Heart,
  Shield,
  Sparkles,
  Upload
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Diagnose() {
  const navigate = useNavigate();

  /* ===================== STATES ===================== */

  // Symptom checker
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Ultrasound
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  const [ultrasoundResult, setUltrasoundResult] = useState(null);
  const [ultrasoundError, setUltrasoundError] = useState("");

  /* ===================== SYMPTOM CHECK ===================== */

  const handleSymptomSubmit = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("http://127.0.0.1:5000/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      const data = await response.json();
      setResult(data.pcos_risk);
    } catch (error) {
      setResult("Error connecting to backend. Please try again.");
    }

    setLoading(false);
  };

  /* ===================== ULTRASOUND CHECK ===================== */

  const handleImageUpload = async () => {
    if (!image) {
      setUploadMsg("Please select an ultrasound image first");
      return;
    }

    setUploading(true);
    setUploadMsg("");
    setUltrasoundResult(null);
    setUltrasoundError("");

    const formData = new FormData();
    formData.append("image", image); // must be "image"

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/ultrasound-check",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();
      setUltrasoundResult(data);
      setUploadMsg("Ultrasound analysis completed successfully");
    } catch (error) {
      console.error(error);
      setUltrasoundError("Error analyzing ultrasound. Please try again.");
    }

    setUploading(false);
  };
  {/* ================= ULTRASOUND RESULT DISPLAY ================= */}

  /* ===================== RETURN STARTS BELOW ===================== */



  return (
    <div style={{ 
      minHeight: "100vh",
      background: "var(--gradient-hero)",
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Header */}
      <header style={{ 
        padding: "20px 0",
        borderBottom: "1px solid var(--border-light)",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)"
      }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button 
              onClick={() => navigate("/")}
              style={{ 
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "var(--bg-white)",
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--text-dark)",
                transition: "var(--transition-smooth)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.color = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-soft)";
                e.currentTarget.style.color = "var(--text-dark)";
              }}
            >
              <ArrowLeft style={{ width: 18, height: 18 }} />
              Back to Home
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Heart style={{ width: 24, height: 24, color: "var(--primary)" }} />
              <span style={{ 
                fontFamily: "'Playfair Display', serif", 
                fontWeight: 700, 
                fontSize: "20px",
                color: "var(--text-dark)"
              }}>
                PCOSight
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "48px 0 80px" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          {/* Page Title */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ 
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "rgba(212, 99, 138, 0.1)",
              borderRadius: "100px",
              marginBottom: "16px",
              color: "var(--primary)",
              fontSize: "14px",
              fontWeight: 500
            }}>
              <Sparkles style={{ width: 16, height: 16 }} />
              AI-Powered Assessment
            </div>
            <h1 style={{ 
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 700,
              color: "var(--text-dark)",
              marginBottom: "12px"
            }}>
              PCOS Diagnosis
            </h1>
            <p style={{ 
              color: "var(--text-muted)",
              fontSize: "18px",
              maxWidth: "500px",
              margin: "0 auto"
            }}>
              Get personalized insights about your symptoms using our intelligent analysis system.
            </p>
          </div>

          {/* Symptom Checker Card */}
          <div style={{ 
            background: "var(--gradient-card)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--border-light)",
            padding: "32px",
            marginBottom: "24px",
            transition: "var(--transition-smooth)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ 
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                background: "rgba(212, 99, 138, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <FileText style={{ width: 24, height: 24, color: "var(--primary)" }} />
              </div>
              <div>
                <h2 style={{ 
                  fontWeight: 600,
                  fontSize: "18px",
                  color: "var(--text-dark)",
                  marginBottom: "4px"
                }}>
                  Symptom Checker
                </h2>
                <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  Describe your symptoms for AI analysis
                </p>
              </div>
            </div>

            <textarea
              rows={5}
              placeholder="Describe your symptoms in detail (e.g., irregular periods, unexplained weight gain, acne, excessive hair growth, fatigue...)"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              style={{ 
                width: "100%",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-soft)",
                fontSize: "15px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                resize: "vertical",
                minHeight: "120px",
                background: "var(--bg-light)",
                color: "var(--text-dark)",
                outline: "none",
                transition: "var(--transition-smooth)"
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--primary-light)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "var(--border-soft)"}
            />

            <button 
              onClick={handleSymptomSubmit} 
              disabled={!symptoms || loading}
              style={{ 
                marginTop: "20px",
                padding: "14px 28px",
                background: (!symptoms || loading) ? "var(--text-light)" : "var(--gradient-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-md)",
                cursor: (!symptoms || loading) ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: (!symptoms || loading) ? "none" : "var(--shadow-button)",
                transition: "var(--transition-smooth)"
              }}
            >
              <Sparkles style={{ width: 18, height: 18 }} />
              {loading ? "Analyzing Symptoms..." : "Check PCOS Risk"}
            </button>

            {result && (
              <div style={{ 
                marginTop: "24px",
                padding: "20px",
                background: result.includes("Error") 
                  ? "rgba(239, 68, 68, 0.08)" 
                  : "linear-gradient(135deg, rgba(212, 99, 138, 0.08) 0%, rgba(90, 154, 168, 0.08) 100%)",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${result.includes("Error") ? "rgba(239, 68, 68, 0.2)" : "var(--border-light)"}`
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  {result.includes("Error") ? (
                    <AlertCircle style={{ width: 20, height: 20, color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
                  ) : (
                    <Shield style={{ width: 20, height: 20, color: "var(--accent)", flexShrink: 0, marginTop: "2px" }} />
                  )}
                  <div>
                    <p style={{ 
                      fontWeight: 600,
                      marginBottom: "4px",
                      color: "var(--text-dark)",
                      fontSize: "15px"
                    }}>
                      Analysis Result
                    </p>
                    <p style={{ 
                      color: result.includes("Error") ? "#dc2626" : "var(--text-muted)",
                      fontSize: "14px",
                      lineHeight: 1.6
                    }}>
                      {result}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ultrasound Upload Card */}
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
                <h2 style={{ 
                  fontWeight: 600,
                  fontSize: "18px",
                  color: "var(--text-dark)",
                  marginBottom: "4px"
                }}>
                  Upload Ultrasound Scan
                </h2>
                <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  Upload your ovarian ultrasound for analysis
                </p>
              </div>
            </div>

            <div style={{ 
              border: "2px dashed var(--border-soft)",
              borderRadius: "var(--radius-md)",
              padding: "32px",
              textAlign: "center",
              background: "var(--bg-light)",
              transition: "var(--transition-smooth)",
              marginBottom: "20px"
            }}>
              <input
                type="file"
                accept="image/*"
                id="ultrasound-upload"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
              <label 
                htmlFor="ultrasound-upload"
                style={{ 
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px"
                }}
              >
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
                  <p style={{ fontWeight: 500, color: "var(--text-dark)", marginBottom: "4px" }}>
                    {image ? image.name : "Click to upload or drag and drop"}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    PNG, JPG, or JPEG (max 10MB)
                  </p>
                </div>
              </label>
            </div>

            <button 
              onClick={handleImageUpload} 
              disabled={!image || uploading}
              style={{ 
                padding: "14px 28px",
                background: (!image || uploading) ? "var(--text-light)" : "var(--gradient-accent)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-md)",
                cursor: (!image || uploading) ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: (!image || uploading) ? "none" : "0 4px 15px rgba(90, 154, 168, 0.25)",
                transition: "var(--transition-smooth)"
              }}
            >
              <Upload style={{ width: 18, height: 18 }} />
              {uploading ? "Uploading..." : "Analyze Ultrasound"}
            </button>

            {uploadMsg && (
              <div style={{ 
                marginTop: "24px",
                padding: "20px",
                background: uploadMsg.includes("Error") 
                  ? "rgba(239, 68, 68, 0.08)" 
                  : "linear-gradient(135deg, rgba(90, 154, 168, 0.08) 0%, rgba(212, 99, 138, 0.08) 100%)",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${uploadMsg.includes("Error") ? "rgba(239, 68, 68, 0.2)" : "var(--border-light)"}`
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  {uploadMsg.includes("Error") ? (
                    <AlertCircle style={{ width: 20, height: 20, color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
                  ) : (
                    <Shield style={{ width: 20, height: 20, color: "var(--accent)", flexShrink: 0, marginTop: "2px" }} />
                  )}
                  <p style={{ 
                    color: uploadMsg.includes("Error") ? "#dc2626" : "var(--text-muted)",
                    fontSize: "14px",
                    lineHeight: 1.6
                  }}>
                    {uploadMsg}
                  </p>
                </div>
              </div>
            )}
          </div>
          {ultrasoundResult && (
  <div
    style={{
      marginTop: "32px",
      padding: "24px",
      borderRadius: "12px",
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    }}
  >
    <h3 style={{ marginBottom: "8px" }}>
      Ultrasound PCOS Risk:{" "}
      <span
        style={{
          color: ultrasoundResult.risk === "HIGH" ? "#dc2626" : "#16a34a",
          fontWeight: "700",
        }}
      >
        {ultrasoundResult.risk}
      </span>
    </h3>

    <p style={{ fontSize: "14px", marginBottom: "16px" }}>
      Confidence: <strong>{ultrasoundResult.confidence}</strong>
    </p>

    {/* Images side by side */}
    <div
      style={{
        display: "flex",
        gap: "24px",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {/* Original Ultrasound */}
      

      {/* Grad-CAM Heatmap */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "14px", marginBottom: "6px" }}>
          Grad-CAM Heatmap
        </p>
        <img
          src={ultrasoundResult.heatmap_url}
          alt="PCOS Heatmap"
          style={{
            width: "200px",
            height: "200px",
            objectFit: "contain",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        />
      </div>
    </div>

    {/* Explanation for HIGH risk */}
    {ultrasoundResult.risk === "HIGH" && (
      <div
        style={{
          marginTop: "20px",
          padding: "12px 16px",
          backgroundColor: "#fff5f5",
          borderLeft: "5px solid #dc2626",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        <strong>Explanation:</strong>
        <br />
        The <span style={{ color: "#dc2626", fontWeight: 600 }}>red and yellow regions</span>{" "}
        in the heatmap highlight ovarian areas that strongly influenced the
        model’s decision. These regions indicate multiple follicular
        structures, which are commonly associated with{" "}
        <strong>Polycystic Ovary Syndrome (PCOS)</strong>.
      </div>
    )}
  </div>
)}


          

          {/* Disclaimer */}
          <div style={{ 
            padding: "20px 24px",
            background: "rgba(212, 99, 138, 0.05)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-light)",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px"
          }}>
            <AlertCircle style={{ width: 20, height: 20, color: "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text-dark)" }}>Disclaimer:</strong> This tool is for educational and informational purposes only. 
              It does not replace professional medical advice, diagnosis, or treatment. 
              Always consult with a qualified healthcare provider for medical concerns.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        background: "var(--bg-white)",
        padding: "24px 0",
        borderTop: "1px solid var(--border-light)"
      }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Heart style={{ width: 20, height: 20, color: "var(--primary)" }} />
              <span style={{ 
                fontFamily: "'Playfair Display', serif", 
                fontWeight: 700, 
                fontSize: "18px",
                color: "var(--text-dark)"
              }}>
                PCOSight
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              © 2026 PCOSight. For educational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default Diagnose;