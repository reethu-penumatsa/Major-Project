import {
    Activity,
    AlertCircle,
    ArrowRight,
    Brain,
    Calendar,
    CheckCircle2,
    Heart,
    Shield,
    Sparkles,
    Stethoscope,
    TrendingUp,
    Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const symptoms = [
  { icon: Calendar, text: "Irregular or missed periods" },
  { icon: Activity, text: "Unexplained weight changes" },
  { icon: AlertCircle, text: "Acne and oily skin" },
  { icon: TrendingUp, text: "Excess facial or body hair" },
  { icon: Heart, text: "Difficulty conceiving" },
  { icon: Brain, text: "Mood changes and fatigue" },
];

const stats = [
  { value: "1 in 10", label: "Women affected globally" },
  { value: "70%", label: "Cases go undiagnosed" },
  { value: "50%", label: "Experience insulin resistance" },
];

const features = [
  {
    icon: Stethoscope,
    title: "AI-Powered Analysis",
    description: "Our intelligent system analyzes your symptoms using advanced machine learning algorithms.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your health data is encrypted and never shared. Your privacy is our priority.",
  },
  {
    icon: Brain,
    title: "Explainable Results",
    description: "Get clear, understandable insights about your risk factors and next steps.",
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="gradient-hero" style={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <section style={{ padding: "48px 0 80px", overflow: "hidden" }}>
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
            <div className="animate-fade-up">
              <span className="badge badge-primary" style={{ marginBottom: "24px" }}>
                <Sparkles style={{ width: 16, height: 16 }} />
                AI-Powered Health Insights
              </span>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 700, marginBottom: "24px" }}>
                Take Control of Your{" "}
                <span className="text-gradient">Reproductive Health</span>
              </h1>
              <p className="text-muted" style={{ fontSize: "18px", marginBottom: "32px", maxWidth: "500px" }}>
                PCOSight uses artificial intelligence to help you understand your symptoms 
                and take proactive steps toward early PCOS detection.
              </p>
              <div className="flex gap-4" style={{ flexWrap: "wrap" }}>
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate("/diagnose")}
                >
                  Start Free Assessment
                  <ArrowRight style={{ width: 20, height: 20 }} />
                </button>
                <button className="btn btn-outline btn-lg">
                  Learn More
                </button>
              </div>
            </div>
            <div className="animate-fade-up" style={{ position: "relative", animationDelay: "0.3s" }}>
              <div style={{ 
                position: "relative", 
                borderRadius: "24px", 
                overflow: "hidden",
                background: "linear-gradient(135deg, rgba(212, 99, 138, 0.1) 0%, rgba(90, 154, 168, 0.1) 100%)",
                height: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Heart style={{ width: 120, height: 120, color: "var(--primary-light)", opacity: 0.5 }} />
              </div>
              <div className="floating-card animate-float">
                <div className="flex items-center gap-3">
                  <div className="icon-box icon-box-accent">
                    <Users style={{ width: 24, height: 24 }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--text-dark)" }}>10,000+</p>
                    <p className="text-muted" style={{ fontSize: "14px" }}>Women helped</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-alt" style={{ padding: "64px 0" }}>
        <div className="container">
          <div className="grid grid-cols-3" style={{ gap: "32px" }}>
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <p style={{ 
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)", 
                  fontWeight: 700, 
                  color: "var(--primary)",
                  marginBottom: "8px"
                }}>
                  {stat.value}
                </p>
                <p className="text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is PCOS Section */}
      <section className="section">
        <div className="container">
          <div className="text-center" style={{ maxWidth: "700px", margin: "0 auto 64px" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 700, marginBottom: "16px" }}>
              Understanding PCOS
            </h2>
            <p className="text-muted" style={{ fontSize: "18px" }}>
              Polycystic Ovary Syndrome is a hormonal condition affecting women of reproductive age. 
              Understanding its symptoms is the first step toward better health.
            </p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {symptoms.map((symptom, index) => (
              <div 
                key={index}
                className="card animate-fade-up"
                style={{ 
                  padding: "24px",
                  animationDelay: `${index * 0.1}s`,
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div className="flex items-center gap-4">
                  <div className="icon-box icon-box-primary">
                    <symptom.icon style={{ width: 24, height: 24 }} />
                  </div>
                  <p style={{ fontWeight: 500 }}>{symptom.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Early Detection Section */}
      <section className="section section-secondary">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 700, marginBottom: "24px" }}>
                Why Early Detection Matters
              </h2>
              <p className="text-muted" style={{ marginBottom: "24px" }}>
                Early diagnosis of PCOS can help prevent serious long-term health complications 
                and improve quality of life significantly.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  "Reduces risk of Type 2 diabetes",
                  "Prevents cardiovascular complications",
                  "Improves fertility outcomes",
                  "Better mental health management",
                  "Enables lifestyle interventions",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 style={{ width: 20, height: 20, color: "var(--accent)", flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="card"
                  style={{ padding: "24px", transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "var(--shadow-elevated)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "var(--shadow-card)"}
                >
                  <div className="flex gap-4" style={{ alignItems: "flex-start" }}>
                    <div className="icon-box icon-box-accent">
                      <feature.icon style={{ width: 24, height: 24 }} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600, marginBottom: "8px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {feature.title}
                      </h3>
                      <p className="text-muted" style={{ fontSize: "14px" }}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div 
            className="card text-center" 
            style={{ padding: "64px 48px" }}
          >
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 700, marginBottom: "16px" }}>
              Ready to Take the First Step?
            </h2>
            <p className="text-muted" style={{ maxWidth: "600px", margin: "0 auto 32px" }}>
              Our AI-powered assessment takes just a few minutes and provides personalized 
              insights about your health. Start your journey to better understanding today.
            </p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => navigate("/diagnose")}
            >
              Start Free Assessment
              <ArrowRight style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="flex justify-between items-center" style={{ flexWrap: "wrap", gap: "16px" }}>
            <div className="flex items-center gap-2">
              <Heart style={{ width: 24, height: 24, color: "var(--primary)" }} />
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "20px" }}>
                PCOSight
              </span>
            </div>
            <p className="text-muted" style={{ fontSize: "14px" }}>
              © 2026 PCOSight. For educational purposes. Consult a healthcare provider for medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;