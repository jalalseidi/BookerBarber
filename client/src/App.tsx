import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Layout } from "./components/Layout"
import { Home } from "./pages/Home"
import { Services } from "./pages/Services"
import { Barbers } from "./pages/Barbers"
import { Bookings } from "./pages/Bookings"
import { Booking } from "./pages/Booking"
import { WelcomePage } from "./pages/BlankPage"
import BarberDashboard from "./pages/BarberDashboard"
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"
import { CustomerOnlyRoute, BarberOnlyRoute } from "./components/RoleBasedRoute"
import "./i18n"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <Router>
          <Routes>
            {/* Welcome page - default route */}
            <Route path="/" element={<WelcomePage />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard routes */}
            <Route path="/barber-dashboard" element={
              <ProtectedRoute>
                <BarberOnlyRoute>
                  <BarberDashboard />
                </BarberOnlyRoute>
              </ProtectedRoute>
            } />
            
            {/* Layout-based routes - Customer only */}
            <Route path="/app" element={
              <ProtectedRoute>
                <CustomerOnlyRoute>
                  <Layout />
                </CustomerOnlyRoute>
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="services" element={<Services />} />
              <Route path="barbers" element={<Barbers />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="booking" element={<Booking />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App