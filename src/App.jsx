import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import ChatWindow from "./components/ChatWindow";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      {/* <Header /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:roomCode" element={<ChatWindow />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
