import { useState } from "react";

function Ultrasound() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!image) {
      setError("Please select an ultrasound image");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("image", image); // 🔑 must be "image"

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
      console.log("Ultrasound API response:", data);
      setResult(data);

    } catch (err) {
      console.error(err);
      setError("Error uploading image. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "40px" }}>
      <h2>Ultrasound PCOS Analysis</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "15px" }}>{error}</p>
      )}

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h3>
            PCOS Risk:{" "}
            <span style={{ color: result.risk === "HIGH" ? "red" : "green" }}>
              {result.risk}
            </span>
          </h3>

          <p>Confidence: {result.confidence}</p>

          {result.heatmap_url && (
            <img
              src={result.heatmap_url}
              alt="PCOS Heatmap"
              style={{
                width: "100%",
                marginTop: "20px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Ultrasound;
