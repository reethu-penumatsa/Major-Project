import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Loader } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user
        const userRes = await fetch(`http://127.0.0.1:5000/api/users/${userId}`);
        const userData = await userRes.json();
        setUser(userData);

        // Load local history (FULL DATA)
        const saved = JSON.parse(localStorage.getItem("pcos_saved_days")) || [];
        setProgressHistory(saved.reverse());

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div style={{ background: "#0f0f1e", color: "#fff", minHeight: "100vh" }}>

      {/* HEADER */}
      <header style={{
        padding: "24px 0",
        background: "rgba(15, 15, 30, 0.95)",
        backdropFilter: "blur(30px)",
        borderBottom: "1px solid rgba(232, 93, 138, 0.1)",
        position: "sticky",
        top: 0
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <button onClick={() => navigate("/")} style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            background: "rgba(232, 93, 138, 0.1)",
            border: "1px solid rgba(232, 93, 138, 0.2)",
            borderRadius: "8px",
            color: "#e85d8a",
            cursor: "pointer"
          }}>
            <ArrowLeft size={18}/> Back
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Heart size={26} color="#e85d8a" />
            <span style={{ fontWeight: 800 }}>PCOSight</span>
          </div>

          <div style={{ width: "100px" }} />
        </div>
      </header>

      {/* MAIN */}
      <main style={{ padding: "60px 40px", maxWidth: "1000px", margin: "0 auto" }}>

        {/* TITLE */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: 900,
            background: "linear-gradient(135deg, #e85d8a, #f4a8c1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Your Profile
          </h1>
          <p style={{ color: "#b0b0c8" }}>
            View your details and progress history
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center" }}>
            <Loader size={30} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <>
            {/* PROFILE CARD */}
            <div style={{
              background: "linear-gradient(135deg, rgba(232, 93, 138, 0.15), rgba(77, 155, 169, 0.15))",
              border: "2px solid rgba(232, 93, 138, 0.3)",
              borderRadius: "24px",
              padding: "40px",
              marginBottom: "50px",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "150px",
                height: "150px",
                background: "rgba(232,93,138,0.2)",
                filter: "blur(80px)"
              }} />

              {/* USER HEADER */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "30px"
              }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #e85d8a, #f4a8c1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "bold"
                }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>

                <div>
                  <h2 style={{ margin: 0 }}>
                    {user?.name || "User"}
                  </h2>
                  <p style={{ margin: 0, color: "#aaa" }}>
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* INFO GRID */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px"
              }}>
                <div style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(15,15,30,0.6)",
                  border: "1px solid rgba(232,93,138,0.2)"
                }}>
                  <p style={{ color: "#aaa", fontSize: "13px" }}>Joined</p>
                  <p>
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                <div style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(15,15,30,0.6)",
                  border: "1px solid rgba(232,93,138,0.2)"
                }}>
                  <p style={{ color: "#aaa", fontSize: "13px" }}>Last Activity</p>
                  <p>
                    {progressHistory[0]?.date || "No activity"}
                  </p>
                </div>
              </div>
            </div>

            {/* HISTORY */}
            <div style={{
              background: "linear-gradient(135deg, rgba(232, 93, 138, 0.08), rgba(77, 155, 169, 0.08))",
              border: "2px solid rgba(232, 93, 138, 0.2)",
              borderRadius: "20px",
              padding: "40px"
            }}>
              <h2 style={{ marginBottom: "30px" }}>📊 Progress Timeline</h2>

              {progressHistory.length > 0 ? (
                progressHistory.map((item, i) => (
                  <div key={i} style={{
                    marginBottom: "20px",
                    padding: "18px",
                    borderRadius: "12px",
                    background: "rgba(15,15,30,0.7)",
                    border: "1px solid rgba(232,93,138,0.2)"
                  }}>

                    <p style={{ color: "#aaa", fontSize: "13px" }}>
                      📅 {item.date}
                    </p>

                    <p style={{ fontWeight: "bold", color: "#e85d8a" }}>
                      ⭐ Score: {item.overall_score}
                    </p>

                    {/* Progress Bar */}
                    <div style={{
                      height: "8px",
                      background: "#333",
                      borderRadius: "6px",
                      margin: "6px 0 12px"
                    }}>
                      <div style={{
                        width: `${item.overall_score}%`,
                        background: "#e85d8a",
                        height: "100%",
                        borderRadius: "6px"
                      }} />
                    </div>

                    {item.cycle_length && (
                      <p>🩸 Cycle Length: {item.cycle_length} days</p>
                    )}

                    {item.status && (
                      <p>📊 Status: {item.status}</p>
                    )}

                    <p>🥗 Diet: {item.diet_score}/{item.diet_total}</p>
                    <p>🏃 Exercise: {item.exercise_score}/{item.exercise_total}</p>
                    <p>💧 Water: {item.water}/8 glasses</p>

                    {item.symptoms && (
                      <p>
                        🤒 Symptoms:{" "}
                        {Object.entries(item.symptoms)
                          .filter(([_, v]) => v > 0)
                          .map(([k]) => k)
                          .join(", ") || "None"}
                      </p>
                    )}

                    {item.journal && (
                      <p style={{ fontStyle: "italic", color: "#c0c0d8" }}>
                        📝 "{item.journal}"
                      </p>
                    )}

                  </div>
                ))
              ) : (
                <p>No history yet</p>
              )}
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Profile;
