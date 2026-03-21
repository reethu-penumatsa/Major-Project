import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Diagnose from "./pages/Diagnose";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProgressTracker from "./pages/ProgressTracker";
import Profile from "./pages/Profile";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/diagnose" element={<Diagnose />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/progress" element={<ProgressTracker />} />
      </Routes>
    </Router>
  );
}

export default App;
