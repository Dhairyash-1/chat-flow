import { Routes, Route } from "react-router-dom"
import ChatDashboard from "./pages/ChatDashboard"
// EF6448-ORANGE F6F6F6
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ChatDashboard />} />
      </Routes>
    </>
  )
}

export default App
