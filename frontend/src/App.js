import { BrowserRouter, Route, Routes } from "react-router-dom";
import Diagnose from "./pages/Diagnose";
import Home from "./pages/Home";
import Ultrasound from "./pages/Ultrasound";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/diagnose" element={<Diagnose />} />
      <Route path="/ultrasound" element={<Ultrasound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
