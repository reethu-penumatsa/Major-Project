import { AlertCircle, ArrowLeft, FileText, Heart, Sparkles, Upload, Loader, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Diagnose() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const [resultSections, setResultSections] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [image, setImage] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSymptomSubmit = async () => {
    setLoading(true);
    setIsStreaming(true);
    setResultSections([]);
    setAnalysisData(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines[lines.length - 1];

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          if (line.startsWith("data: ")) {
            const data = line.substring(6);
            if (data.startsWith("{")) {
              try {
                const chunk = JSON.parse(data);
                if (chunk.type === "section_header") {
                  setResultSections(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    type: "header",
                    content: chunk.content
                  }]);
                } else if (chunk.type === "text") {
                  setResultSections(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    type: "text",
                    content: chunk.content
                  }]);
                } else if (chunk.type === "final_result") {
                  setAnalysisData(chunk.data);
                  setIsStreaming(false);
                }
              } catch (e) {
                console.error("Parse error:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      setResultSections([{
        id: Date.now(),
        type: "error",
        content: "Error connecting to backend. Please ensure the server is running."
      }]);
      console.error("Error:", error);
    }

    setIsStreaming(false);
    setLoading(false);
  };

  const handleImageUpload = async () => {
    if (!image) {
      setUploadMsg("Please select an ultrasound image first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", image);
    if (analysisData) {
      formData.append("pcos_risk_class", analysisData.pcos_risk_class);
      formData.append("confidence", analysisData.confidence);
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/upload-ultrasound", {
        method: "POST",
        body: formData,
      });
      const uploadData = await response.json();
      setUploadMsg(uploadData.message);
    } catch (error) {
      setUploadMsg("Error uploading image. Please try again.");
      console.error("Error:", error);
    }
    setUploading(false);
  };

  return (
    <div style={{ background: "#0f0f1e", color: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{
        padding: "24px 0",
        background: "rgba(15, 15, 30, 0.95)",
        backdropFilter: "blur(30px)",
        borderBottom: "1px solid rgba(232, 93, 138, 0.1)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              background: "rgba(232, 93, 138, 0.1)",
              border: "1px solid rgba(232, 93, 138, 0.2)",
              borderRadius: "8px",
              color: "#e85d8a",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(232, 93, 138, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(232, 93, 138, 0.1)";
            }}
          >
            <ArrowLeft size={18} /> Back Home
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Heart size={28} color="#e85d8a" />
            <span style={{ fontSize: "20px", fontWeight: 800 }}>PCOSight</span>
          </div>
          <div style={{ width: "120px" }} />
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "60px 40px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "60px", animation: "slideInUp 0.6s ease-out" }}>
          <div style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "rgba(232, 93, 138, 0.1)",
            border: "1px solid rgba(232, 93, 138, 0.3)",
            borderRadius: "50px",
            marginBottom: "24px",
            fontSize: "14px",
            fontWeight: 600
          }}>
            📋 Step 1: Symptom Analysis
          </div>
          <h1 style={{
            fontSize: "56px",
            fontWeight: 900,
            marginBottom: "16px",
            background: "linear-gradient(135deg, #e85d8a, #f4a8c1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Tell Us About Your Symptoms
          </h1>
          <p style={{ fontSize: "18px", color: "#b0b0c8", maxWidth: "700px", margin: "0 auto" }}>
            Describe your symptoms in detail. Our AI will analyze and provide personalized insights.
          </p>
        </div>

        {/* Input Card */}
        <div style={{
          background: "linear-gradient(135deg, rgba(232, 93, 138, 0.08), rgba(77, 155, 169, 0.08))",
          border: "2px solid rgba(232, 93, 138, 0.2)",
          borderRadius: "20px",
          padding: "48px",
          marginBottom: "40px",
          animation: "slideInUp 0.7s ease-out 0.1s both"
        }}>
          <label style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", display: "block" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <FileText size={24} color="#e85d8a" />
              Describe Your Symptoms
            </div>
          </label>

          <textarea
            placeholder="E.g., I have irregular periods and acne. Can you tell if I have PCOS?"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            style={{
              width: "100%",
              padding: "20px",
              borderRadius: "12px",
              border: "2px solid rgba(232, 93, 138, 0.3)",
              background: "rgba(15, 15, 30, 0.5)",
              color: "#fff",
              fontSize: "16px",
              fontFamily: "inherit",
              minHeight: "160px",
              resize: "vertical",
              outline: "none",
              transition: "all 0.3s ease",
              marginBottom: "24px"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#e85d8a";
              e.target.style.boxShadow = "0 0 0 3px rgba(232, 93, 138, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(232, 93, 138, 0.3)";
              e.target.style.boxShadow = "none";
            }}
          />

          <button
            onClick={handleSymptomSubmit}
            disabled={!symptoms || loading}
            style={{
              width: "100%",
              padding: "18px 40px",
              background: (!symptoms || loading) ? "rgba(232, 93, 138, 0.3)" : "linear-gradient(135deg, #e85d8a, #f4a8c1)",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: (!symptoms || loading) ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px"
            }}
            onMouseEnter={(e) => {
              if (symptoms && !loading) {
                e.target.style.transform = "translateY(-4px)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
            }}
          >
            <Sparkles size={20} />
            {loading ? "Analyzing Symptoms..." : "Analyze My Symptoms"}
          </button>
        </div>

        {/* Results Section */}
        {(resultSections.length > 0 || isStreaming) && (
          <div style={{
            background: "linear-gradient(135deg, rgba(232, 93, 138, 0.08), rgba(77, 155, 169, 0.08))",
            border: "2px solid rgba(232, 93, 138, 0.2)",
            borderRadius: "20px",
            padding: "40px",
            animation: "slideInUp 0.6s ease-out"
          }}>
            {resultSections.map((section) => (
              <div key={section.id} style={{ marginBottom: "24px", animation: "slideInUp 0.4s ease-out" }}>
                {section.type === "header" && (
                  <div style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#e85d8a",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    {section.content}
                  </div>
                )}
                {section.type === "text" && (
                  <p style={{
                    fontSize: "16px",
                    color: "#c0c0d8",
                    lineHeight: 1.8,
                    margin: 0,
                    paddingLeft: "16px",
                    borderLeft: "4px solid #e85d8a"
                  }}>
                    {section.content}
                  </p>
                )}
                {section.type === "error" && (
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    background: "rgba(239, 68, 68, 0.1)",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#ff7070"
                  }}>
                    <AlertCircle size={20} style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0 }}>{section.content}</p>
                  </div>
                )}
              </div>
            ))}

            {isStreaming && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#e85d8a",
                marginTop: "24px"
              }}>
                <Loader size={20} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontWeight: 600 }}>Processing your analysis...</span>
              </div>
            )}

            {analysisData && (
              <div style={{
                marginTop: "32px",
                padding: "32px",
                background: "rgba(15, 15, 30, 0.5)",
                borderRadius: "16px",
                border: "2px solid rgba(232, 93, 138, 0.3)",
                animation: "slideInUp 0.6s ease-out"
              }}>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "13px", color: "#7a7a8e", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
                    Assessment Result
                  </div>
                  <div style={{
                    fontSize: "32px",
                    fontWeight: 900,
                    color: analysisData.pcos_risk_class === 1 ? "#ff7070" : "#10b981",
                    marginBottom: "8px"
                  }}>
                    PCOS Risk: {analysisData.result?.pcos_risk || (analysisData.pcos_risk_class === 1 ? "High" : "Low")}
                  </div>
                  <div style={{ fontSize: "16px", color: "#b0b0c8" }}>
                    Confidence: <span style={{ fontWeight: 700, color: "#fff" }}>{analysisData.result?.confidence || analysisData.confidence}%</span>
                  </div>
                </div>

                <div style={{ height: "2px", background: "linear-gradient(90deg, #e85d8a, transparent)", margin: "20px 0" }} />

                {analysisData.result?.recommendation && (
                  <div style={{ marginTop: "20px" }}>
                    <div style={{ fontSize: "13px", color: "#7a7a8e", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
                      Recommendation
                    </div>
                    <p style={{
                      fontSize: "16px",
                      color: "#c0c0d8",
                      lineHeight: 1.8,
                      margin: 0,
                      paddingLeft: "16px",
                      borderLeft: "4px solid #4d9ba9",
                      fontStyle: "italic"
                    }}>
                      {analysisData.result.recommendation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Ultrasound Upload */}
        {analysisData && (
          <>
            {/* Step 2 header — placed outside the rounded upload card and centered to match Step 1 */}
            <div style={{ textAlign: "center", marginTop: "48px", marginBottom: "40px", animation: "slideInUp 0.6s ease-out" }}>
              <div style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "rgba(232, 93, 138, 0.1)",
                border: "1px solid rgba(232, 93, 138, 0.3)",
                borderRadius: "50px",
                marginBottom: "16px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#e85d8a"
              }}>
                📷 Step 2: Ultrasound Upload
              </div>

              <h2 style={{
                fontSize: "44px",
                fontWeight: 900,
                margin: "12px 0 20px",
                background: "linear-gradient(135deg, #e85d8a, #f4a8c1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "block"
              }}>
                Upload Ultrasound Scan
              </h2>

              <p style={{ fontSize: "16px", color: "#b0b0c8", margin: 0 }}>
                Upload your ovarian ultrasound for multi-stage analysis
              </p>
            </div>

            <div style={{
              marginTop: "32px",
              background: "linear-gradient(135deg, rgba(77, 155, 169, 0.08), rgba(232, 93, 138, 0.08))",
              border: "2px solid rgba(77, 155, 169, 0.2)",
              borderRadius: "20px",
              padding: "56px",
              animation: "slideInUp 0.8s ease-out 0.2s both"
            }}>
              <div style={{
                border: "2px dashed rgba(77, 155, 169, 0.3)",
                borderRadius: "12px",
                padding: "60px 20px",
                textAlign: "center",
                marginBottom: "28px",
                background: "rgba(77, 155, 169, 0.05)",
                transition: "all 0.3s ease"
              }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || "")}
                style={{ display: "none" }}
                id="imageInput"
              />
              <label
                htmlFor="imageInput"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer"
                }}
              >
                <Upload size={40} color="#4d9ba9" />
                <div>
                  <div style={{ fontWeight: 700, marginBottom: "4px" }}>Click to upload or drag and drop</div>
                  <div style={{ color: "#7a7a8e", fontSize: "14px" }}>PNG, JPG, GIF up to 10MB</div>
                </div>
              </label>
              {image && (
                <div style={{ marginTop: "16px", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <CheckCircle size={20} />
                  {image.name}
                </div>
              )}
            </div>

            <button
              onClick={handleImageUpload}
              disabled={!image || uploading}
              style={{
                width: "100%",
                padding: "16px 40px",
                background: (!image || uploading) ? "rgba(77, 155, 169, 0.3)" : "linear-gradient(135deg, #4d9ba9, #7fb8c4)",
                border: "none",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 700,
                cursor: (!image || uploading) ? "not-allowed" : "pointer",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                if (image && !uploading) {
                  e.target.style.transform = "translateY(-4px)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
              }}
            >
              {uploading ? "Uploading..." : "Upload Ultrasound"}
            </button>

            {uploadMsg && (
              <div style={{
                marginTop: "16px",
                padding: "12px",
                background: uploadMsg.includes("Error") ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                border: `1px solid ${uploadMsg.includes("Error") ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                borderRadius: "8px",
                color: uploadMsg.includes("Error") ? "#ff7070" : "#10b981",
                fontSize: "14px",
                fontWeight: 600
              }}>
                {uploadMsg}
              </div>
            )}
          </div>
        </>
        )}
      </main>

      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Diagnose;
