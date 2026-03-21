import { AlertCircle, ArrowLeft, FileText, Heart, Sparkles, Loader } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Ultrasound from "./Ultrasound";
import LabReportUpload from "./LabReportUpload";


function Diagnose() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const [resultSections, setResultSections] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [multimodalData, setMultimodalData] = useState({
  symptom: null,
  ultrasound: null,
  lab: null,
  final: null
});

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
                  setMultimodalData(prev => ({
  ...prev,
  symptom: chunk.data
}));

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
  const handleFinalResult = async () => {
  try {
    // const response = await fetch("http://localhost:5000/generate-final-result");
    const response = await fetch("http://localhost:5000/generate-final-result", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  }
});

    const data = await response.json();
    console.log("FINAL DATA:", data);

    if (!response.ok) {
      alert(data.error);
      return;
    }

    setMultimodalData(prev => ({
      ...prev,
      final: data
}));

  } catch (error) {
    alert("Failed to generate final result");
  }
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

{analysisData && (
  <Ultrasound 
    analysisData={analysisData} 
    setMultimodalData={setMultimodalData}
  />
)}

   {multimodalData.ultrasound && (
  <LabReportUpload
    multimodalData={multimodalData}
    setMultimodalData={setMultimodalData}
  />
)}
       {multimodalData.final && (
  <div style={{
    marginTop: "60px",
    padding: "40px",
    borderRadius: "20px",
    border: "3px solid rgba(232,93,138,0.4)",
    background: "linear-gradient(135deg, rgba(232,93,138,0.12), rgba(77,155,169,0.12))"
  }}>
    <h2 style={{ fontSize: "36px", fontWeight: 900 }}>
      🧠 Final PCOS Risk Assessment
    </h2>

    <h3 style={{
      color: multimodalData.final.risk === "HIGH" ? "#ef4444" : "#10b981",
      marginTop: "16px"
    }}>
      Risk Level: {multimodalData.final.risk}
    </h3>

    <p style={{ marginTop: "8px", fontWeight: 600 }}>
      Confidence Score: {multimodalData.final?.score !== undefined
        ? (multimodalData.final.score * 100).toFixed(1)
        : 0}%
    </p>

    <div style={{ marginTop: "20px" }}>
  {(multimodalData.final.sections || []).map((section, index) => (
    <div key={index} style={{ marginTop: "20px" }}>

      {/* Section Title */}
      <div style={{
        fontSize: "18px",
        fontWeight: "800",
        color: "#e85d8a",
        marginBottom: "10px"
      }}>
        {section.title}
      </div>

      {/* Section Content */}
      {Array.isArray(section.content) ? (
        <ul style={{ paddingLeft: "20px", color: "#c0c0d8" }}>
          {section.content.map((item, i) => (
            <li key={i} style={{ marginBottom: "6px" }}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{
          color: "#c0c0d8",
          lineHeight: 1.7,
          borderLeft: "4px solid #e85d8a",
          paddingLeft: "12px"
        }}>
          {section.content}
        </p>
      )}

    </div>
  ))}
</div>

    {/* 🚀 NEW BUTTON */}
    <button
      onClick={() => navigate("/progress")}
      style={{
        marginTop: "30px",
        width: "100%",
        padding: "16px",
        borderRadius: "12px",
        border: "none",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        background: "linear-gradient(135deg, #e85d8a, #f4a8c1)",
        color: "#fff",
        transition: "all 0.3s ease"
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
      }}
    >
      📊 Track My Progress
    </button>

  </div>
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