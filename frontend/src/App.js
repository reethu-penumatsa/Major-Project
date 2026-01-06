import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Diagnose from "./pages/Diagnose";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diagnose" element={<Diagnose />} />
      </Routes>
    </Router>
  );
}

export default App;
