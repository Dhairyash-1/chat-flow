import { Routes, Route } from "react-router-dom"
import ChatDashboard from "./pages/ChatDashboard"
import SignInPage from "./pages/SignInPage"
import SignUpPage from "./pages/SignUpPage"
import ProtectedRoute from "./components/ProtectedRoute"
import NotFoundPage from "./pages/NotFoundPage"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// EF6448-ORANGE F6F6F6
function App() {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-screen flex items-center justify-center">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ChatDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </div>
    </QueryClientProvider>
  )
}

export default App
