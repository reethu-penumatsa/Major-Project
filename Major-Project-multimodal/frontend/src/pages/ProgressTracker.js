import { useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import "./ProgressTracker.css";
import { useNavigate } from "react-router-dom";
// Motivation quotes
const motivationQuotes = [
  { quote: "Small steps every day lead to big changes. You're doing amazing! 💪", author: "Your PCOS Coach" },
  { quote: "Your body is not broken. It just needs a little extra love and care. 🌷", author: "Wellness Reminder" },
  { quote: "Progress, not perfection. Every healthy choice counts! 🌟", author: "Daily Motivation" },
  { quote: "You are stronger than PCOS. Keep going, warrior! 🦋", author: "Self-Care Note" },
  { quote: "Healing is not linear. Be patient and kind to yourself. 🌸", author: "Gentle Reminder" },
  { quote: "Consistency beats intensity. Show up for yourself today. ☀️", author: "Fitness Wisdom" },
  { quote: "Nourish your body, calm your mind, move with joy. 🧘", author: "Holistic Health" },
  { quote: "Every meal is a chance to fuel your healing journey. 🥗", author: "Nutrition Tip" },
];

// Wellness recommendations
const wellnessRecommendations = [
  {
    icon: "😴",
    title: "Prioritize Sleep",
    desc: "Aim for 7–9 hours of quality sleep. Poor sleep raises cortisol and worsens insulin resistance.",
    action: "Set a consistent bedtime and avoid screens 1 hour before bed.",
  },
  {
    icon: "💧",
    title: "Stay Hydrated",
    desc: "Drink at least 8 glasses of water daily. Hydration supports hormone detoxification.",
    action: "Carry a water bottle and add lemon or cucumber for flavor.",
  },
  {
    icon: "🧘‍♀️",
    title: "Manage Stress",
    desc: "Chronic stress elevates androgens. Meditation and deep breathing help lower cortisol.",
    action: "Try 5 minutes of box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.",
  },
  {
    icon: "🚫",
    title: "Limit Sugar & Processed Food",
    desc: "Refined carbs spike insulin, triggering more androgen production and weight gain.",
    action: "Swap white bread for whole grain, soda for herbal tea.",
  },
  {
    icon: "☀️",
    title: "Get Vitamin D",
    desc: "Many women with PCOS are Vitamin D deficient, which affects mood and fertility.",
    action: "Spend 15 min in sunlight daily or take a Vitamin D3 supplement (consult doctor).",
  },
  {
    icon: "📝",
    title: "Track Your Symptoms",
    desc: "Logging symptoms helps you and your doctor identify patterns and triggers.",
    action: "Note energy levels, bloating, acne, and mood daily — even a quick rating helps.",
  },
];

// Symptom tracking options
const symptomOptions = [
  { key: "energy", label: "⚡ Energy Level", levels: ["Low", "Medium", "High"] },
  { key: "mood", label: "😊 Mood", levels: ["Stressed", "Okay", "Great"] },
  { key: "bloating", label: "🫧 Bloating", levels: ["Severe", "Mild", "None"] },
  { key: "acne", label: "✨ Skin/Acne", levels: ["Bad", "Some", "Clear"] },
  { key: "cravings", label: "🍫 Cravings", levels: ["Strong", "Moderate", "None"] },
  { key: "sleep", label: "😴 Sleep Quality", levels: ["Poor", "Fair", "Good"] },
];

const ProgressTracker = () => {
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();
  const [prevPeriod, setPrevPeriod] = useState("");
  const [currPeriod, setCurrPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState(null);
  const [cycleStatus, setCycleStatus] = useState("");
  const [dietChecks, setDietChecks] = useState([]);
const [exerciseChecks, setExerciseChecks] = useState([]);
const [history, setHistory] = useState([]);
const [symptoms, setSymptoms] = useState({});
const [waterGlasses, setWaterGlasses] = useState(0);
const [journalEntry, setJournalEntry] = useState("");
const [savedDays, setSavedDays] = useState([]);
const [activeTab, setActiveTab] = useState("dashboard");

  const today = new Date().toISOString().split("T")[0];

  // Random daily quote
  const dailyQuote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return motivationQuotes[dayOfYear % motivationQuotes.length];
  }, []);

  // Diet Plan
  const dietPlan = [
    { food: "🥣 Oats & Berries Bowl", nutrient: "Fiber + Antioxidants", benefit: "Improves insulin sensitivity and fights oxidative stress", tip: "Top with blueberries and a drizzle of honey for extra antioxidants." },
    { food: "🥬 Spinach & Avocado Salad", nutrient: "Iron + Healthy Fats", benefit: "Supports hormone balance and reduces fatigue", tip: "Add lemon dressing to boost iron absorption." },
    { food: "🫘 Flax Seed Smoothie", nutrient: "Omega-3 Fatty Acids", benefit: "Reduces inflammation and lowers androgen levels", tip: "Blend 1 tbsp ground flax seeds with banana and almond milk." },
    { food: "🍲 Lentil Soup", nutrient: "Plant Protein + Fiber", benefit: "Stabilizes blood sugar and keeps you full longer", tip: "Use turmeric and cumin for added anti-inflammatory benefits." },
    { food: "🐟 Grilled Salmon", nutrient: "Omega-3 + Vitamin D", benefit: "Reduces inflammation and supports mood regulation", tip: "Pair with steamed broccoli for a complete PCOS-friendly meal." },
    { food: "🥜 Handful of Walnuts", nutrient: "Healthy Fats + Magnesium", benefit: "Helps lower testosterone and improve insulin response", tip: "Great as an afternoon snack — aim for 7–10 walnuts." },
  ];

  // Exercise Plan
  const exercisePlan = [
    { name: "🚶‍♀️ Brisk Walking", duration: "30 minutes", burn: "~120 kcal", why: "Low-impact cardio that improves insulin sensitivity without spiking cortisol.", howTo: "Walk at a pace where you can talk but not sing. Swing your arms naturally." },
    { name: "🧘 Yoga & Stretching", duration: "20 minutes", burn: "~70 kcal", why: "Reduces stress hormones (cortisol) which directly worsen PCOS symptoms.", howTo: "Try poses like Child's Pose, Cat-Cow, and Butterfly Stretch. Focus on deep breathing." },
    { name: "🏋️ Strength Training", duration: "25 minutes", burn: "~150 kcal", why: "Builds lean muscle, which boosts metabolism and helps regulate blood sugar.", howTo: "Do bodyweight squats, lunges, push-ups, and planks. 3 sets of 12 reps each." },
    { name: "🚴 Cycling / Stationary Bike", duration: "20 minutes", burn: "~140 kcal", why: "Moderate cardio that's gentle on joints and helps with weight management.", howTo: "Maintain a steady, comfortable pace. Increase resistance gradually over weeks." },
  ];

  // Load saved days from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pcos_saved_days");
    if (saved) setSavedDays(JSON.parse(saved));
  }, []);

  // Cycle Calculation
  const calculateCycle = () => {
    if (!prevPeriod || !currPeriod) return;
    const d1 = new Date(prevPeriod);
    const d2 = new Date(currPeriod);
    const diff = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setCycleLength(days);
    if (days <= 35) setCycleStatus("Normal Cycle ✅");
    else setCycleStatus("Irregular Cycle (common in PCOS) ⚠️");
  };

  // Fetch History
  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/progress/${userId}`);
      const data = await res.json();
      setHistory(data);
    } catch {
      console.log("Backend not available — running in offline mode.");
    }
  };

  // Save Progress (local + remote)
  const saveProgress = async () => {
    const dietScore = dietChecks.filter(Boolean).length;
    const exerciseScore = exerciseChecks.filter(Boolean).length;

    const dayData = {
      date: today,
      diet_score: dietScore,
      diet_total: dietPlan.length,
      exercise_score: exerciseScore,
      exercise_total: exercisePlan.length,
      cycle_length: cycleLength,
      status: cycleStatus,
      symptoms: { ...symptoms },
      water: waterGlasses,
      journal: journalEntry,
      overall_score: Math.round(
        ((dietScore / dietPlan.length) * 40) +
        ((exerciseScore / exercisePlan.length) * 30) +
        ((waterGlasses / 8) * 15) +
        ((Object.values(symptoms).filter(v => v === 2).length / symptomOptions.length) * 15)
      ),
    };

    // Save to localStorage
    const existingDays = [...savedDays.filter((d) => d.date !== today), dayData];
    existingDays.sort((a, b) => a.date.localeCompare(b.date));
    setSavedDays(existingDays);
    localStorage.setItem("pcos_saved_days", JSON.stringify(existingDays));

    // Also try remote
    const data = {
      user_id: userId,
      date: today,
      period_start: prevPeriod,
      period_end: currPeriod,
      cycle_length: cycleLength,
      diet_score: dietScore,
      exercise_score: exerciseScore,
      status: cycleStatus,
    };

    try {
      await fetch("http://127.0.0.1:5000/api/progress/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // offline mode
    }

    alert("✅ Today's progress saved successfully!");
    fetchHistory();
  };

  // Stats
  const cycleStats = () => {
    if (history.length < 1) return null;
    const cycles = history.map((h) => h.cycle_length);
    const avg = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);

    return { avg, shortest: Math.min(...cycles), longest: Math.max(...cycles) };
  };
  const stats = cycleStats();

  const chartData = history.map((h, i) => ({
  cycle: i + 1,
  length: h.cycle_length
}));
    

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dietScore = dietChecks.filter(Boolean).length;
  const exerciseScore = exerciseChecks.filter(Boolean).length;
  const dietPercent = Math.round((dietScore / dietPlan.length) * 100);
  const exercisePercent = Math.round((exerciseScore / exercisePlan.length) * 100);
  const waterPercent = Math.min(100, Math.round((waterGlasses / 8) * 100));

  // Overall daily score
  const overallScore = Math.round(
    ((dietScore / dietPlan.length) * 40) +
    ((exerciseScore / exercisePlan.length) * 30) +
    ((waterGlasses / 8) * 15) +
    ((Object.values(symptoms).filter(v => v === 2).length / Math.max(1, symptomOptions.length)) * 15)
  );

  // Improvement chart data from saved days
  const improvementChartData = savedDays.slice(-14).map((d) => ({ 
    date: d.date.slice(5),
    diet: Math.round((d.diet_score / d.diet_total) * 100),
    exercise: Math.round((d.exercise_score / d.exercise_total) * 100),
    overall: d.overall_score,
    water: Math.min(100, Math.round((d.water / 8) * 100)),
  }));

  // Radar chart for today's wellness
  const radarData = [
    { subject: "Diet", value: dietPercent },
    { subject: "Exercise", value: exercisePercent },
    { subject: "Hydration", value: waterPercent },
    { subject: "Mood", value: symptoms.mood !== undefined ? (symptoms.mood + 1) * 33 : 0 },
    { subject: "Energy", value: symptoms.energy !== undefined ? (symptoms.energy + 1) * 33 : 0 },
    { subject: "Sleep", value: symptoms.sleep !== undefined ? (symptoms.sleep + 1) * 33 : 0 },
  ];

  // Pie chart for score breakdown
  const pieData = [
    { name: "Diet (40%)", value: Math.round((dietScore / dietPlan.length) * 40) },
    { name: "Exercise (30%)", value: Math.round((exerciseScore / exercisePlan.length) * 30) },
    { name: "Hydration (15%)", value: Math.round((waterGlasses / 8) * 15) },
    { name: "Wellness (15%)", value: Math.round((Object.values(symptoms).filter(v => v === 2).length / Math.max(1, symptomOptions.length)) * 15) },
  ];
  const pieColors = ["#d85c94", "#1e88e5", "#43a047", "#ff9800"];

  // Streak calculation
  const streak = useMemo(() => {
    let count = 0;
    const sorted = [...savedDays].sort((a, b) => b.date.localeCompare(a.date));
    const todayDate = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(todayDate);
      expected.setDate(expected.getDate() - i);
      const expStr = expected.toISOString().split("T")[0];
      if (sorted[i]?.date === expStr) count++;
      else break;
    }
    return count;
  }, [savedDays]);

  // Get improvement trend
  const getImprovementMessage = () => {
    if (savedDays.length < 2) return null;
    const recent = savedDays.slice(-3);
    const older = savedDays.slice(-6, -3);
    if (older.length === 0) return null;
    const recentAvg = recent.reduce((s, d) => s + d.overall_score, 0) / recent.length;
    const olderAvg = older.reduce((s, d) => s + d.overall_score, 0) / older.length;
    const diff = Math.round(recentAvg - olderAvg);
    if (diff > 5) return { type: "up", text: `Your score improved by ${diff}% compared to last period! 🎉` };
    if (diff < -5) return { type: "down", text: `Your score dipped by ${Math.abs(diff)}% — that's okay, tomorrow is a new start! 💛` };
    return { type: "same", text: "You're maintaining a steady pace. Consistency is key! 🌿" };
  };
  const improvement = getImprovementMessage();

  // Dynamic personalized recommendations
  const getPersonalizedTips = () => {
    const tips = [];
    if (dietPercent < 50) tips.push("🥗 Try adding at least one PCOS-friendly food to your next meal.");
    if (exercisePercent < 50) tips.push("🚶 Even a 10-minute walk counts! Start small and build up.");
    if (waterGlasses < 4) tips.push("💧 You're behind on water — try drinking a glass right now!");
    if (symptoms.mood === 0) tips.push("🧘 Feeling stressed? Try 3 deep breaths: inhale 4s, hold 4s, exhale 6s.");
    if (symptoms.sleep === 0) tips.push("😴 Poor sleep? Avoid caffeine after 2pm and try magnesium before bed.");
    if (symptoms.bloating === 0) tips.push("🫧 Bloating? Reduce dairy and gluten today, and try peppermint tea.");
    if (symptoms.acne === 0) tips.push("✨ Skin flaring up? Cut sugar today and apply a zinc-based treatment.");
    if (tips.length === 0) tips.push("🌟 You're doing great today! Keep up this amazing energy!");
    return tips;
  };

  return (
    <div className="pt-container">
      {/* Header */}
      <header className="pt-header" style={{ position: "relative" }}>
  
  {/* Back Button */}
  <button
    onClick={() => navigate("/")}
    style={{
      position: "absolute",
      left: "0",
      top: "0",
      padding: "8px 14px",
      background: "rgba(216, 92, 148, 0.15)",
      border: "1px solid rgba(216, 92, 148, 0.3)",
      borderRadius: "8px",
      color: "#d85c94",
      cursor: "pointer",
      fontWeight: 600,
      transition: "0.3s"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(216, 92, 148, 0.3)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "rgba(216, 92, 148, 0.15)";
    }}
  >
    ← Back Home
  </button>

  <h1>🌸 PCOS Progress Dashboard</h1>
  <p className="pt-subtitle">
    Track your diet, exercise, symptoms, and cycle — all in one place.
  </p>

  <span className="pt-date-badge">📅 Today: {today}</span>

  {streak > 0 && (
    <span className="pt-streak-badge">🔥 {streak}-day streak!</span>
  )}
</header>

      {/* Motivation Banner */}
      <section className="pt-motivation-banner">
        <div className="pt-quote-icon">💬</div>
        <blockquote className="pt-quote">{dailyQuote.quote}</blockquote>
        <cite className="pt-quote-author">— {dailyQuote.author}</cite>
      </section>

      {/* Tab Navigation */}
      <nav className="pt-tabs">
        <button
          className={`pt-tab ${activeTab === "dashboard" ? "pt-tab-active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          📋 Dashboard
        </button>
        <button
          className={`pt-tab ${activeTab === "insights" ? "pt-tab-active" : ""}`}
          onClick={() => setActiveTab("insights")}
        >
          📊 Insights & Graphs
        </button>
        <button
          className={`pt-tab ${activeTab === "journal" ? "pt-tab-active" : ""}`}
          onClick={() => setActiveTab("journal")}
        >
          📝 Journal & Tips
        </button>
      </nav>

      {/* ==================== DASHBOARD TAB ==================== */}
      {activeTab === "dashboard" && (
        <>
          {/* Overall Score Ring */}
          <section className="pt-section pt-score-section">
            <h2>🎯 Today's Overall Wellness Score</h2>
            <div className="pt-score-ring-container">
              <div className="pt-score-ring">
                <svg viewBox="0 0 120 120" className="pt-ring-svg">
                  <circle cx="60" cy="60" r="52" className="pt-ring-bg" />
                  <circle
                    cx="60" cy="60" r="52"
                    className="pt-ring-fill"
                    style={{
                      strokeDasharray: `${(overallScore / 100) * 327} 327`,
                    }}
                  />
                </svg>
                <div className="pt-ring-text">
                  <span className="pt-ring-value">{overallScore}</span>
                  <span className="pt-ring-label">/ 100</span>
                </div>
              </div>
              <div className="pt-score-breakdown">
                <div className="pt-score-item">
                  <span className="pt-score-dot" style={{ background: "#d85c94" }} />
                  Diet: {dietPercent}%
                </div>
                <div className="pt-score-item">
                  <span className="pt-score-dot" style={{ background: "#1e88e5" }} />
                  Exercise: {exercisePercent}%
                </div>
                <div className="pt-score-item">
                  <span className="pt-score-dot" style={{ background: "#43a047" }} />
                  Hydration: {waterPercent}%
                </div>
                <div className="pt-score-item">
                  <span className="pt-score-dot" style={{ background: "#ff9800" }} />
                  Wellness: {Object.values(symptoms).filter(v => v === 2).length}/{symptomOptions.length}
                </div>
              </div>
            </div>
            {improvement && (
              <div className={`pt-improvement-badge pt-improvement-${improvement.type}`}>
                {improvement.text}
              </div>
            )}
          </section>

          {/* Water Tracker */}
          <section className="pt-section pt-water-section">
            <h2>💧 Water Intake Tracker</h2>
            <p className="pt-section-desc">Aim for 8 glasses of water daily. Tap to add!</p>
            <div className="pt-water-glasses">
              {Array.from({ length: 8 }).map((_, i) => (
                <button
                  key={i}
                  className={`pt-water-glass ${i < waterGlasses ? "pt-water-filled" : ""}`}
                  onClick={() => setWaterGlasses(i + 1)}
                >
                  💧
                </button>
              ))}
            </div>
            <div className="pt-progress-bar-container">
              <div className="pt-progress-label">
                {waterGlasses} / 8 glasses <span className="pt-water-cheer">
                  {waterGlasses >= 8 ? "🎉 Fully hydrated!" : waterGlasses >= 5 ? "👍 Almost there!" : "Keep drinking!"}
                </span>
              </div>
              <div className="pt-progress-track">
                <div className="pt-progress-fill pt-water-fill" style={{ width: `${waterPercent}%` }} />
              </div>
            </div>
          </section>

          {/* Diet Section */}
          <section className="pt-section pt-diet-section">
            <h2>🍽️ Today's Recommended Diet</h2>
            <p className="pt-section-desc">
              These PCOS-friendly foods help regulate hormones, manage insulin, and reduce inflammation.
              Check off what you eat today!
            </p>
            <div className="pt-card-grid">
              {dietPlan.map((item, index) => (
                <label key={index} className={`pt-card pt-diet-card ${dietChecks[index] ? "pt-card-checked" : ""}`}>
                  <div className="pt-card-header">
                    <input type="checkbox" checked={!!dietChecks[index]} onChange={(e) => {
                      const updated = [...dietChecks];
                      updated[index] = e.target.checked;
                      setDietChecks(updated);
                    }} />
                    <strong>{item.food}</strong>
                  </div>
                  <span className="pt-nutrient-badge">{item.nutrient}</span>
                  <p className="pt-benefit">{item.benefit}</p>
                  <p className="pt-tip">💡 {item.tip}</p>
                </label>
              ))}
            </div>
            <div className="pt-progress-bar-container">
              <div className="pt-progress-label">
                Diet Progress: <strong>{dietScore} / {dietPlan.length}</strong>
              </div>
              <div className="pt-progress-track">
                <div className="pt-progress-fill pt-diet-fill" style={{ width: `${dietPercent}%` }} />
              </div>
            </div>
          </section>

          {/* Exercise Section */}
          <section className="pt-section pt-exercise-section">
            <h2>🏃‍♀️ Today's Exercise Plan</h2>
            <p className="pt-section-desc">
              Regular movement improves insulin resistance and lowers stress. Check off each activity as you complete it!
            </p>
            <div className="pt-card-grid">
              {exercisePlan.map((ex, index) => (
                <label key={index} className={`pt-card pt-exercise-card ${exerciseChecks[index] ? "pt-card-checked" : ""}`}>
                  <div className="pt-card-header">
                    <input type="checkbox" checked={!!exerciseChecks[index]} onChange={(e) => {
                      const updated = [...exerciseChecks];
                      updated[index] = e.target.checked;
                      setExerciseChecks(updated);
                    }} />
                    <strong>{ex.name}</strong>
                  </div>
                  <div className="pt-exercise-meta">
                    <span className="pt-duration-badge">⏱ {ex.duration}</span>
                    <span className="pt-burn-badge">🔥 {ex.burn}</span>
                  </div>
                  <p className="pt-benefit">{ex.why}</p>
                  <p className="pt-tip">🎯 How to: {ex.howTo}</p>
                </label>
              ))}
            </div>
            <div className="pt-progress-bar-container">
              <div className="pt-progress-label">
                Exercise Progress: <strong>{exerciseScore} / {exercisePlan.length}</strong>
              </div>
              <div className="pt-progress-track">
                <div className="pt-progress-fill pt-exercise-fill" style={{ width: `${exercisePercent}%` }} />
              </div>
            </div>
          </section>

          {/* Symptom Tracker */}
          <section className="pt-section pt-symptom-section">
            <h2>🩺 Daily Symptom Check-in</h2>
            <p className="pt-section-desc">
              How are you feeling today? Track your symptoms to identify patterns over time.
            </p>
            <div className="pt-symptom-grid">
              {symptomOptions.map((s) => (
                <div key={s.key} className="pt-symptom-card">
                  <div className="pt-symptom-label">{s.label}</div>
                  <div className="pt-symptom-levels">
                    {s.levels.map((level, li) => (
                      <button
                        key={li}
                        className={`pt-symptom-btn ${symptoms[s.key] === li ? `pt-symptom-btn-active-${li}` : ""}`}
                        onClick={() => setSymptoms({ ...symptoms, [s.key]: li })}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Cycle Section */}
          <section className="pt-section pt-cycle-section">
            <h2>📊 Cycle Health Summary</h2>
            <p className="pt-section-desc">
              Enter your last two period start dates to calculate your cycle length and check regularity.
            </p>
            <div className="pt-date-inputs">
              <div className="pt-input-group">
                <label>Previous Period Start</label>
                <input type="date" value={prevPeriod} onChange={(e) => setPrevPeriod(e.target.value)} />
              </div>
              <div className="pt-input-group">
                <label>Current Period Start</label>
                <input type="date" value={currPeriod} onChange={(e) => setCurrPeriod(e.target.value)} />
              </div>
              <button className="pt-btn pt-btn-analyze" onClick={calculateCycle}>
                Analyze Cycle
              </button>
            </div>
            {cycleLength && (
              <div className="pt-cycle-result">
                <p><strong>Cycle Length:</strong> {cycleLength} days</p>
                <p><strong>Status:</strong> {cycleStatus}</p>
              </div>
            )}
          </section>

          {/* Save */}
          <div className="pt-save-area">
            <button className="pt-btn pt-btn-save" onClick={saveProgress}>
              💾 Save Today's Progress
            </button>
          </div>
        </>
      )}

      {/* ==================== INSIGHTS TAB ==================== */}
      {activeTab === "insights" && (
        <>
          {/* Today's Wellness Radar */}
          <section className="pt-section">
            <h2>🕸️ Today's Wellness Radar</h2>
            <p className="pt-section-desc">A snapshot of how you're doing across all areas today.</p>
            <div className="pt-chart-wrapper">
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#f0e0ea" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#777", fontSize: 13 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Radar name="Today" dataKey="value" stroke="#d85c94" fill="#d85c94" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Score Breakdown Pie */}
          <section className="pt-section">
            <h2>🥧 Score Breakdown</h2>
            <p className="pt-section-desc">How your overall wellness score is calculated today.</p>
            <div className="pt-chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={pieColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Improvement Over Time */}
          {improvementChartData.length > 1 && (
            <section className="pt-section">
              <h2>📈 Improvement Over Time</h2>
              <p className="pt-section-desc">Your diet, exercise, hydration, and overall scores over recent days.</p>
              <div className="pt-chart-wrapper">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={improvementChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="overall" name="Overall" stroke="#b8336a" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="diet" name="Diet" stroke="#d85c94" strokeWidth={2} />
                    <Line type="monotone" dataKey="exercise" name="Exercise" stroke="#1e88e5" strokeWidth={2} />
                    <Line type="monotone" dataKey="water" name="Hydration" stroke="#43a047" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Daily Score Bar Chart */}
          {improvementChartData.length > 0 && (
            <section className="pt-section">
              <h2>📊 Daily Overall Score</h2>
              <p className="pt-section-desc">Compare your daily performance at a glance.</p>
              <div className="pt-chart-wrapper">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={improvementChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="overall" fill="#d85c94" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Cycle Stats & Trend */}
          {stats && (
            <section className="pt-section pt-stats-section">
              <h2>🔄 Cycle Statistics</h2>
              <div className="pt-stats-grid">
                <div className="pt-stat-card">
                  <span className="pt-stat-value">{stats.avg}</span>
                  <span className="pt-stat-label">Avg Days</span>
                </div>
                <div className="pt-stat-card">
                  <span className="pt-stat-value">{stats.shortest}</span>
                  <span className="pt-stat-label">Shortest</span>
                </div>
                <div className="pt-stat-card">
                  <span className="pt-stat-value">{stats.longest}</span>
                  <span className="pt-stat-label">Longest</span>
                </div>
              </div>
            </section>
          )}

          {chartData.length > 0 && (
            <section className="pt-section">
              <h2>📉 Cycle Length Trend</h2>
              <div className="pt-chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="length" stroke="#e07aaa" strokeWidth={2} dot={{ r: 5, fill: "#e07aaa" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {savedDays.length === 0 && chartData.length === 0 && (
            <section className="pt-section pt-empty-state">
              <div className="pt-empty-icon">📊</div>
              <h3>No data yet!</h3>
              <p>Start saving daily progress from the Dashboard tab to see your improvement charts here.</p>
            </section>
          )}
        </>
      )}

      {/* ==================== JOURNAL TAB ==================== */}
      {activeTab === "journal" && (
        <>
          {/* Personalized Tips */}
          <section className="pt-section pt-tips-section">
            <h2>🎯 Personalized Tips for You</h2>
            <p className="pt-section-desc">Based on your current progress, here's what we recommend right now.</p>
            <div className="pt-tips-list">
              {getPersonalizedTips().map((tip, i) => (
                <div key={i} className="pt-tip-card">{tip}</div>
              ))}
            </div>
          </section>

          {/* Wellness Recommendations */}
          <section className="pt-section pt-reco-section">
            <h2>💡 PCOS Wellness Recommendations</h2>
            <p className="pt-section-desc">
              Beyond diet and exercise — these lifestyle changes make a real difference.
            </p>
            <div className="pt-reco-grid">
              {wellnessRecommendations.map((rec, i) => (
                <div key={i} className="pt-reco-card">
                  <div className="pt-reco-icon">{rec.icon}</div>
                  <h3>{rec.title}</h3>
                  <p className="pt-reco-desc">{rec.desc}</p>
                  <p className="pt-reco-action">✅ {rec.action}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Journal */}
          <section className="pt-section pt-journal-section">
            <h2>📝 Daily Journal</h2>
            <p className="pt-section-desc">
              Write down how you feel, what you're grateful for, or any observations about your body today.
            </p>
            <textarea
              className="pt-journal-textarea"
              rows={5}
              placeholder="How are you feeling today? Any symptoms, wins, or thoughts to capture..."
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
            />
          </section>

          {/* Motivation Gallery */}
          <section className="pt-section pt-motivation-section">
            <h2>🌟 Daily Motivation & Affirmations</h2>
            <div className="pt-affirmation-grid">
              {motivationQuotes.map((q, i) => (
                <div key={i} className="pt-affirmation-card">
                  <p className="pt-affirmation-text">"{q.quote}"</p>
                  <span className="pt-affirmation-author">— {q.author}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Saved History */}
          {savedDays.length > 0 && (
            <section className="pt-section">
              <h2>📅 Your Progress History</h2>
              <div className="pt-history-list">
                {[...savedDays].reverse().slice(0, 10).map((d, i) => (
                  <div key={i} className="pt-history-item">
                    <span className="pt-history-date">{d.date}</span>
                    <span className="pt-history-score">Score: {d.overall_score}%</span>
                    <span className="pt-history-detail">
                      🍽 {d.diet_score}/{d.diet_total} &nbsp; 🏃 {d.exercise_score}/{d.exercise_total} &nbsp; 💧 {d.water}/8
                    </span>
                    {d.journal && <p className="pt-history-journal">📝 {d.journal}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Save from journal tab too */}
          <div className="pt-save-area">
            <button className="pt-btn pt-btn-save" onClick={saveProgress}>
              💾 Save Today's Progress
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressTracker;