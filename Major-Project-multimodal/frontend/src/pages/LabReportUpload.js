// import { Sparkles, Loader, Upload, CheckCircle } from "lucide-react";
// import { useState } from "react";

// function LabReportUpload({ setMultimodalData, multimodalData }) {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [finalLoading, setFinalLoading] = useState(false);

//   const [labValues, setLabValues] = useState(null);
//   const [message, setMessage] = useState("");
//   const [pcosResult, setPcosResult] = useState("");

//   // ---------------------------
//   // STEP 1: Upload Lab Report
//   // ---------------------------
//   const handleUpload = async () => {
//     if (!file) {
//       alert("Please upload a lab report");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("image", file);

//     try {
//       setLoading(true);

//       const labRes = await fetch("http://127.0.0.1:5000/upload-lab-report", {
//         method: "POST",
//         body: formData,
//       });

//       if (!labRes.ok) {
//         throw new Error("Lab upload failed");
//       }

//       const labData = await labRes.json();
//       console.log("Lab Data:", labData);

//       if (!labData.lab_values) {
//         throw new Error("No lab values returned");
//       }

//       setLabValues(labData.lab_values);
//       setMessage(labData.message);
//       setPcosResult(labData.pcos_result);

//       setMultimodalData((prev) => ({
//         ...prev,
//         lab: labData,
//       }));

//     } catch (error) {
//       console.error("UPLOAD ERROR:", error);
//       alert("Failed to analyze lab report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------------------
//   // STEP 2: Multimodal Fusion
//   // ---------------------------
//   const handleFinalResult = async () => {
//     try {
//       setFinalLoading(true);

//       // 🔥 SAFETY CHECK
//       if (!multimodalData?.symptom || !multimodalData?.ultrasound || !multimodalData?.lab) {
//         alert("Missing symptom, ultrasound, or lab data");
//         setFinalLoading(false);
//         return;
//       }

//       const res = await fetch("http://127.0.0.1:5000/generate-final-result", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           symptom: multimodalData.symptom, // ✅ FIXED HERE
//           ultrasound: multimodalData.ultrasound,
//           lab: multimodalData.lab,
//         }),
//       });

//       const finalData = await res.json();

//       if (!res.ok) {
//         console.error("Backend Error:", finalData);
//         throw new Error(finalData.error || "Multimodal analysis failed");
//       }

//       console.log("Final Multimodal:", finalData);

//       setMultimodalData((prev) => ({
//         ...prev,
//         final: finalData,
//       }));

//     } catch (error) {
//       console.error("MULTIMODAL ERROR:", error);
//       alert("Failed to generate final result");
//     } finally {
//       setFinalLoading(false);
//     }
//   };

//   return (
//     <>
//       <div style={{ textAlign: "center", marginBottom: "40px" }}>
//         <div
//           style={{
//             display: "inline-block",
//             padding: "10px 22px",
//             background: "rgba(232, 93, 138, 0.1)",
//             border: "1px solid rgba(232, 93, 138, 0.3)",
//             borderRadius: "50px",
//             fontSize: "14px",
//             fontWeight: 600,
//             color: "#e85d8a",
//             marginBottom: "16px",
//           }}
//         >
//           🧪 Step 3: Lab Report Analysis
//         </div>

//         <h2
//           style={{
//             fontSize: "44px",
//             fontWeight: 900,
//             margin: "12px 0 20px",
//             background: "linear-gradient(135deg, #e85d8a, #f4a8c1)",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//           }}
//         >
//           Upload Your Lab Report
//         </h2>

//         <p style={{ fontSize: "16px", color: "#b0b0c8" }}>
//           Upload hormone test reports to enhance diagnostic accuracy using OCR.
//         </p>
//       </div>

//       <div
//         style={{
//           background:
//             "linear-gradient(135deg, rgba(232, 93, 138, 0.08), rgba(77, 155, 169, 0.08))",
//           border: "2px solid rgba(232, 93, 138, 0.2)",
//           borderRadius: "20px",
//           padding: "56px",
//         }}
//       >
//         <div
//           style={{
//             border: "2px dashed rgba(232, 93, 138, 0.35)",
//             borderRadius: "14px",
//             padding: "60px 20px",
//             textAlign: "center",
//             background: "rgba(232, 93, 138, 0.05)",
//           }}
//         >
//           <input
//             type="file"
//             accept="image/*,.pdf"
//             id="labInput"
//             style={{ display: "none" }}
//             onChange={(e) => setFile(e.target.files?.[0] || null)}
//           />

//           <label
//             htmlFor="labInput"
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               gap: "12px",
//               cursor: "pointer",
//             }}
//           >
//             <Upload size={42} color="#e85d8a" />
//             <div>
//               <div style={{ fontWeight: 700 }}>
//                 Click to upload or drag & drop
//               </div>
//               <div style={{ fontSize: "14px", color: "#7a7a8e" }}>
//                 PNG, JPG or PDF up to 10MB
//               </div>
//             </div>
//           </label>

//           {file && (
//             <div
//               style={{
//                 marginTop: "18px",
//                 color: "#10b981",
//                 display: "flex",
//                 justifyContent: "center",
//                 gap: "8px",
//                 fontWeight: 600,
//               }}
//             >
//               <CheckCircle size={18} />
//               {file.name}
//             </div>
//           )}
//         </div>

//         <button
//           onClick={handleUpload}
//           disabled={!file || loading}
//           style={{
//             marginTop: "28px",
//             width: "100%",
//             padding: "18px",
//             background: loading
//               ? "rgba(232, 93, 138, 0.3)"
//               : "linear-gradient(135deg, #e85d8a, #f4a8c1)",
//             border: "none",
//             borderRadius: "14px",
//             color: "#fff",
//             fontSize: "16px",
//             fontWeight: 700,
//             cursor: loading ? "not-allowed" : "pointer",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             gap: "12px",
//           }}
//         >
//           {loading ? <Loader size={20} /> : <Sparkles size={20} />}
//           {loading ? "Analyzing Lab Report..." : "Analyze Lab Report"}
//         </button>

//         {labValues && (
//           <div
//             style={{
//               marginTop: "32px",
//               background: "rgba(15, 15, 30, 0.6)",
//               border: "2px solid rgba(232, 93, 138, 0.3)",
//               borderRadius: "16px",
//               padding: "24px",
//             }}
//           >
//             <h4 style={{ color: "#e85d8a", marginBottom: "18px" }}>
//               Lab Analysis Summary
//             </h4>

//             <div><strong>FSH:</strong> {labValues.FSH}</div>
//             <div><strong>Testosterone:</strong> {labValues.Testosterone}</div>
//             <div style={{ marginTop: "12px", color: "#b0b0c8" }}>{message}</div>
//             <div style={{ marginTop: "12px", fontWeight: 600 }}>{pcosResult}</div>

//             <button
//               onClick={handleFinalResult}
//               disabled={finalLoading}
//               style={{
//                 marginTop: "20px",
//                 width: "100%",
//                 padding: "14px",
//                 background: "#6d28d9",
//                 border: "none",
//                 borderRadius: "12px",
//                 color: "#fff",
//                 fontWeight: 700,
//                 cursor: finalLoading ? "not-allowed" : "pointer",
//               }}
//             >
//               {finalLoading ? "Generating Final Result..." : "See Final Result"}
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// export default LabReportUpload;
import { Sparkles, Loader, Upload, CheckCircle } from "lucide-react";
import { useState } from "react";

function LabReportUpload({ setMultimodalData, multimodalData }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [finalLoading, setFinalLoading] = useState(false);

  const [labValues, setLabValues] = useState(null);
  const [message, setMessage] = useState("");
  const [pcosResult, setPcosResult] = useState("");

  // ---------------------------
  // STEP 1: Upload Lab Report
  // ---------------------------
  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a lab report");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);

      const labRes = await fetch("http://127.0.0.1:5000/upload-lab-report", {
        method: "POST",
        body: formData,
      });

      if (!labRes.ok) {
        throw new Error("Lab upload failed");
      }

      const labData = await labRes.json();
      console.log("Lab Data:", labData);

      if (!labData.lab_values) {
        throw new Error("No lab values returned");
      }

      setLabValues(labData.lab_values);
      setMessage(labData.message);
      setPcosResult(labData.pcos_result);

      setMultimodalData((prev) => ({
        ...prev,
        lab: labData,
      }));

    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      alert("Failed to analyze lab report");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // STEP 2: Multimodal Fusion
  // ---------------------------
  const handleFinalResult = async () => {
    try {
      setFinalLoading(true);

      // 🔥 SAFETY CHECK
      if (!multimodalData?.symptom || !multimodalData?.ultrasound || !multimodalData?.lab) {
        alert("Missing symptom, ultrasound, or lab data");
        setFinalLoading(false);
        return;
      }

      const res = await fetch("http://127.0.0.1:5000/generate-final-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptom: multimodalData.symptom, // ✅ FIXED HERE
          ultrasound: multimodalData.ultrasound,
          lab: multimodalData.lab,
        }),
      });

      const finalData = await res.json();

      if (!res.ok) {
        console.error("Backend Error:", finalData);
        throw new Error(finalData.error || "Multimodal analysis failed");
      }

      console.log("Final Multimodal:", finalData);

      setMultimodalData((prev) => ({
        ...prev,
        final: finalData,
      }));

    } catch (error) {
      console.error("MULTIMODAL ERROR:", error);
      alert("Failed to generate final result");
    } finally {
      setFinalLoading(false);
    }
  };

  return (
    <>
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
          Upload Your Lab Report
        </h2>

        <p style={{ fontSize: "16px", color: "#b0b0c8" }}>
          Upload hormone test reports to enhance diagnostic accuracy using OCR.
        </p>
      </div>

      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(232, 93, 138, 0.08), rgba(77, 155, 169, 0.08))",
          border: "2px solid rgba(232, 93, 138, 0.2)",
          borderRadius: "20px",
          padding: "56px",
        }}
      >
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

        {labValues && (
          <div
            style={{
              marginTop: "32px",
              background: "rgba(15, 15, 30, 0.6)",
              border: "2px solid rgba(232, 93, 138, 0.3)",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h4 style={{ color: "#e85d8a", marginBottom: "18px" }}>
              Lab Analysis Summary
            </h4>

            <div><strong>FSH:</strong> {labValues.FSH}</div>
            <div><strong>Testosterone:</strong> {labValues.Testosterone}</div>
            <div style={{ marginTop: "12px", color: "#b0b0c8" }}>{message}</div>
            <div style={{ marginTop: "12px", fontWeight: 600 }}>{pcosResult}</div>

           <button
  onClick={handleFinalResult}
  disabled={finalLoading}
  style={{
    marginTop: "28px",
    width: "100%",
    padding: "18px",
    background: finalLoading
      ? "rgba(232, 93, 138, 0.3)"
      : "linear-gradient(135deg, #e85d8a, #f4a8c1)",
    border: "none",
    borderRadius: "14px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 700,
    cursor: finalLoading ? "not-allowed" : "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    transition: "all 0.3s ease",
  }}
>
  {finalLoading ? <Loader size={20} /> : <Sparkles size={20} />}
  {finalLoading ? "Generating Final Result..." : "See Final Result"}
</button>

          </div>
        )}
      </div>
    </>


  );
}

export default LabReportUpload;
