import { BrowserRouter, Route, Routes } from "react-router-dom";

import Diagnose from "./pages/Diagnose";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProgressTracker from "./pages/ProgressTracker";
import Register from "./pages/Register";
import Ultrasound from "./pages/Ultrasound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diagnose" element={<Diagnose />} />
        <Route path="/ultrasound" element={<Ultrasound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/progress" element={<ProgressTracker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;