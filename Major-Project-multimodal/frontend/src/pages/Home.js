import { ArrowRight, Heart, Shield, Zap, Users, Lock, CheckCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const userId = localStorage.getItem("user_id");

  const logout = () => {
    localStorage.removeItem("user_id");
    // optionally remove other session items
    navigate("/");
    window.location.reload();
  };

  const goTo = (path) => {
    const userId = localStorage.getItem("user_id");
    if (userId) navigate(path);
    else navigate("/login", { state: { from: path } });
  };

  return (
    <div style={{ background: "#0f0f1e", color: "#fff", minHeight: "100vh", overflow: "hidden" }}>
      {/* Navigation */}
      <nav style={{
        padding: "24px 0",
        background: "rgba(15, 15, 30, 0.95)",
        backdropFilter: "blur(30px)",
        borderBottom: "1px solid rgba(232, 93, 138, 0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "28px", fontWeight: 800 }}>
            <Heart style={{ width: 36, height: 36, color: "#e85d8a" }} />
            <span style={{ background: "linear-gradient(135deg, #e85d8a, #f4a8c1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              PCOSight
            </span>
          </div>
          {userId ? (
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                onClick={() => navigate("/profile")}
                style={{
                  padding: "10px 18px",
                  background: "transparent",
                  border: "1px solid rgba(232, 93, 138, 0.2)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Profile
              </button>
              <button
                onClick={logout}
                style={{
                  padding: "10px 18px",
                  background: "rgba(232, 93, 138, 0.12)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/register")}
              style={{
                padding: "14px 32px",
                background: "linear-gradient(135deg, #e85d8a, #f4a8c1)",
                border: "none",
                borderRadius: "12px",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 24px rgba(232, 93, 138, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-4px)";
                e.target.style.boxShadow = "0 12px 32px rgba(232, 93, 138, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 24px rgba(232, 93, 138, 0.3)";
              }}
            >
              Sign Up 
            </button>
          )}
          
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: "120px 40px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Animated Background */}
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle at 20% 50%, rgba(232, 93, 138, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(77, 155, 169, 0.15) 0%, transparent 50%)",
          animation: "float 20s ease-in-out infinite",
          zIndex: 0
        }} />

        <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "rgba(232, 93, 138, 0.1)",
            border: "1px solid rgba(232, 93, 138, 0.3)",
            borderRadius: "50px",
            marginBottom: "32px",
            fontSize: "14px",
            fontWeight: 600,
            animation: "slideInDown 0.8s ease-out"
          }}>
            ✨ Intelligent PCOS Detection
          </div>

          <h1 style={{
            fontSize: "72px",
            fontWeight: 900,
            lineHeight: 1.2,
            marginBottom: "24px",
            background: "linear-gradient(135deg, #e85d8a 0%, #f4a8c1 50%, #4d9ba9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "slideInUp 0.8s ease-out 0.1s both"
          }}>
            Take Control of Your Health
          </h1>

          <p style={{
            fontSize: "22px",
            color: "#b0b0c8",
            maxWidth: "700px",
            margin: "0 auto 40px",
            lineHeight: 1.7,
            animation: "slideInUp 0.8s ease-out 0.2s both"
          }}>
            AI-powered symptom analysis, multi-stage screening, and personalized insights. Understand your PCOS risk in minutes.
          </p>

          <div style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            flexWrap: "wrap",
            animation: "slideInUp 0.8s ease-out 0.3s both"
          }}>
            <button
              onClick={() => goTo("/diagnose")}
              style={{
                padding: "18px 44px",
                background: "linear-gradient(135deg, #e85d8a, #f4a8c1)",
                border: "none",
                borderRadius: "12px",
                color: "#fff",
                fontWeight: 700,
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.3s ease",
                boxShadow: "0 12px 32px rgba(232, 93, 138, 0.4)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-6px)";
                e.target.style.boxShadow = "0 16px 48px rgba(232, 93, 138, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 12px 32px rgba(232, 93, 138, 0.4)";
              }}
            >
              Get Free Assessment <ArrowRight size={20} />
            </button>

            <button
              onClick={() => goTo("/progress")}
              style={{
                padding: "18px 44px",
                background: "linear-gradient(135deg, #e85d8a, #f4a8c1)",
                border: "none",
                borderRadius: "12px",
                color: "#fff",
                fontWeight: 700,
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.3s ease",
                boxShadow: "0 12px 32px rgba(232, 93, 138, 0.4)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-6px)";
                e.target.style.boxShadow = "0 16px 48px rgba(232, 93, 138, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 12px 32px rgba(232, 93, 138, 0.4)";
              }}
            >
              Track Your Progress <ArrowRight size={20} />
            </button>

            <button
  onClick={() => {
    document.getElementById("learn-more")?.scrollIntoView({ behavior: "smooth" });
  }}
  style={{
    padding: "18px 44px",
    background: "transparent",
    border: "2px solid rgba(232, 93, 138, 0.5)",
    borderRadius: "12px",
    color: "#e85d8a",
    fontWeight: 700,
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease"
  }}
>
  Learn More
</button>

          </div>
        </div>

        {/* Hero Illustration */}
        <div style={{
          marginTop: "80px",
          position: "relative",
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "float 3s ease-in-out infinite"
        }}>
          <div style={{
            width: "300px",
            height: "300px",
            background: "linear-gradient(135deg, rgba(232, 93, 138, 0.2), rgba(77, 155, 169, 0.2))",
            borderRadius: "50%",
            filter: "blur(40px)"
          }} />
          <Heart style={{
            position: "absolute",
            width: 150,
            height: 150,
            color: "#e85d8a",
            opacity: 0.4,
            animation: "pulse 2s ease-in-out infinite"
          }} />
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: "80px 40px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "40px",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {[
          { number: "1M+", label: "Women Worldwide" },
          { number: "70%", label: "Undiagnosed Cases" },
          { number: "50%", label: "Insulin Resistant" }
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              padding: "40px",
              background: "linear-gradient(135deg, rgba(232, 93, 138, 0.08), rgba(77, 155, 169, 0.08))",
              border: "1px solid rgba(232, 93, 138, 0.2)",
              borderRadius: "16px",
              textAlign: "center",
              transition: "all 0.4s ease",
              cursor: "pointer",
              animation: `slideInUp 0.6s ease-out ${idx * 0.1}s both`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-12px)";
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(232, 93, 138, 0.15), rgba(77, 155, 169, 0.15))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(232, 93, 138, 0.08), rgba(77, 155, 169, 0.08))";
            }}
          >
            <div style={{ fontSize: "48px", fontWeight: 900, background: "linear-gradient(135deg, #e85d8a, #f4a8c1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "12px" }}>
              {stat.number}
            </div>
            <div style={{ color: "#b0b0c8" }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section id="learn-more" style={{
  padding: "100px 40px",
  background: "linear-gradient(180deg, rgba(232, 93, 138, 0.05) 0%, transparent 100%)"
}}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2 style={{ fontSize: "48px", fontWeight: 900, marginBottom: "16px" }}>
              Why PCOSight?
            </h2>
            <p style={{ fontSize: "20px", color: "#b0b0c8" }}>
              Complete PCOS diagnosis in three intelligent steps
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px"
          }}>
            {[
              {
                icon: Zap,
                title: "AI Analysis",
                desc: "Machine learning evaluates your symptoms instantly"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Bank-level encryption protects your health data"
              },
              {
                icon: CheckCircle,
                title: "Multi-Stage",
                desc: "Comprehensive screening with ultrasound & lab reports"
              }
            ].map((feature, idx) => {
              const IconComp = feature.icon;
              return (
                <div
                  key={idx}
                  style={{
                    padding: "40px",
                    background: "linear-gradient(135deg, rgba(30, 30, 50, 0.8), rgba(30, 30, 50, 0.5))",
                    border: "1px solid rgba(232, 93, 138, 0.2)",
                    borderRadius: "16px",
                    transition: "all 0.4s ease",
                    cursor: "pointer",
                    animation: `slideInUp 0.6s ease-out ${idx * 0.15}s both`,
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-12px)";
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(232, 93, 138, 0.1), rgba(77, 155, 169, 0.1))";
                    e.currentTarget.style.borderColor = "rgba(232, 93, 138, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(30, 30, 50, 0.8), rgba(30, 30, 50, 0.5))";
                    e.currentTarget.style.borderColor = "rgba(232, 93, 138, 0.2)";
                  }}
                >
                  <div style={{
                    width: "60px",
                    height: "60px",
                    background: "linear-gradient(135deg, #e85d8a, #f4a8c1)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px"
                  }}>
                    <IconComp size={32} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "12px" }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: "#b0b0c8", lineHeight: 1.6 }}>
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Symptoms Grid */}
      <section style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "48px", fontWeight: 900, textAlign: "center", marginBottom: "60px" }}>
          Common PCOS Symptoms
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "24px"
        }}>
          {[
            "Irregular Periods", "Weight Gain", "Acne", "Hair Growth",
            "Infertility", "Fatigue", "Dark Patches", "Mood Changes"
          ].map((symptom, idx) => (
            <div
              key={idx}
              style={{
                padding: "28px 24px",
                background: "linear-gradient(135deg, rgba(77, 155, 169, 0.1), rgba(232, 93, 138, 0.1))",
                border: "1px solid rgba(232, 93, 138, 0.2)",
                borderRadius: "12px",
                textAlign: "center",
                fontWeight: 600,
                transition: "all 0.3s ease",
                cursor: "pointer",
                animation: `slideInUp 0.4s ease-out ${idx * 0.05}s both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(232, 93, 138, 0.2), rgba(77, 155, 169, 0.2))";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(77, 155, 169, 0.1), rgba(232, 93, 138, 0.1))";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {symptom}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: "120px 40px",
        textAlign: "center",
        background: "linear-gradient(135deg, #e85d8a 0%, #4d9ba9 100%)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "48px", fontWeight: 900, marginBottom: "24px" }}>
            Start Your Assessment Now
          </h2>
          <p style={{ fontSize: "20px", marginBottom: "40px", opacity: 0.95 }}>
            Join thousands of women taking control of their reproductive health today.
          </p>
          <button
            onClick={() => goTo("/diagnose")}
            style={{
              padding: "18px 48px",
              background: "#fff",
              border: "none",
              borderRadius: "12px",
              color: "#e85d8a",
              fontWeight: 800,
              fontSize: "17px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
            }}
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "40px",
        textAlign: "center",
        borderTop: "1px solid rgba(232, 93, 138, 0.1)",
        color: "#7a7a8e",
        fontSize: "14px"
      }}>
        © 2026 PCOSight | AI-Powered PCOS Diagnosis | Not a medical diagnosis
      </footer>

      <style>{`
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
