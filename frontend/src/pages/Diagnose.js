import { AlertCircle, ArrowLeft, FileText, Heart, Shield, Sparkles, Upload, Loader } from "lucide-react";
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        
        // Keep the last incomplete line in the buffer
        buffer = lines[lines.length - 1];

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          if (line.startsWith("data: ")) {
            const data = line.substring(6);

            // Check if it's JSON
            if (data.startsWith("{")) {
              try {
                const chunk = JSON.parse(data);
                
                if (chunk.type === "section_header") {
                  // Add section header
                  setResultSections(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    type: "header",
                    content: chunk.content
                  }]);
                } else if (chunk.type === "text") {
                  // Add text content
                  setResultSections(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    type: "text",
                    content: chunk.content
                  }]);
                } else if (chunk.type === "final_result") {
                  // Final result
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
    
    // Add analysis data to the request
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

            {(resultSections.length > 0 || isStreaming) && (
              <div style={{ marginTop: "32px" }}>
                {/* Streaming Sections */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(212, 99, 138, 0.05) 0%, rgba(90, 154, 168, 0.05) 100%)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-lg)",
                  padding: "24px",
                  overflow: "hidden"
                }}>
                  {resultSections.map((section, idx) => (
                    <div
                      key={section.id}
                      style={{
                        marginBottom: idx < resultSections.length - 1 ? "24px" : "0",
                        animation: "slideIn 0.4s ease-out"
                      }}
                    >
                      {section.type === "header" && (
                        <div style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "var(--primary)",
                          marginBottom: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px"
                        }}>
                          {section.content}
                        </div>
                      )}
                      {section.type === "text" && (
                        <p style={{
                          fontSize: "14px",
                          lineHeight: 1.7,
                          color: "var(--text-muted)",
                          margin: 0,
                          paddingLeft: "12px",
                          borderLeft: "3px solid rgba(212, 99, 138, 0.3)"
                        }}>
                          {section.content}
                        </p>
                      )}
                      {section.type === "error" && (
                        <div style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          color: "#dc2626"
                        }}>
                          <AlertCircle style={{ width: 20, height: 20, flexShrink: 0, marginTop: "2px" }} />
                          <p style={{ margin: 0, fontSize: "14px" }}>{section.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isStreaming && (
                    <div style={{
                      marginTop: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "var(--primary)"
                    }}>
                      <Loader style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: "13px", fontWeight: 500 }}>Processing your analysis...</span>
                    </div>
                  )}
                </div>

                {/* Result Card - Matching Figure Format */}
                {analysisData && (
                  <div style={{
                    marginTop: "24px",
                    background: "linear-gradient(135deg, rgba(212, 99, 138, 0.05) 0%, rgba(90, 154, 168, 0.05) 100%)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-lg)",
                    padding: "24px",
                    overflow: "hidden",
                    animation: "slideIn 0.6s ease-out"
                  }}>
                    {/* Result Header */}
                    <div style={{ marginBottom: "20px" }}>
                      <p style={{ 
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        margin: "0 0 8px 0"
                      }}>
                        Assessment Result
                      </p>
                      <h3 style={{ 
                        fontSize: "20px",
                        fontWeight: 700,
                        color: analysisData.pcos_risk_class === 1 ? "#dc2626" : "#22c55e",
                        margin: "0 0 4px 0"
                      }}>
                        PCOS Risk: {analysisData.result?.pcos_risk || (analysisData.pcos_risk_class === 1 ? "High" : "Low")}
                      </h3>
                      <p style={{
                        fontSize: "14px",
                        color: "var(--text-muted)",
                        margin: 0
                      }}>
                        Confidence: {analysisData.result?.confidence || analysisData.confidence}%
                      </p>
                    </div>

                    {/* Divider */}
                    <div style={{
                      height: "1px",
                      background: "var(--border-light)",
                      margin: "20px 0"
                    }} />

                    {/* Recommendation */}
                    {analysisData.result?.recommendation && (
                      <div style={{ marginTop: "16px" }}>
                        <p style={{ 
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          margin: "0 0 8px 0"
                        }}>
                          Recommendation
                        </p>
                        <p style={{
                          fontSize: "14px",
                          color: "var(--text-dark)",
                          margin: 0,
                          lineHeight: 1.5,
                          fontStyle: "italic",
                          paddingLeft: "12px",
                          borderLeft: "3px solid var(--primary)"
                        }}>
                          "{analysisData.result.recommendation}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
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