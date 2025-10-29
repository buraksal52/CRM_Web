import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Leads from './pages/Leads'
import Tasks from './pages/Tasks'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Success
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              background: '#059669',
              color: '#fff',
            },
          },
          // Error
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: '#dc2626',
              color: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/customers" 
          element={
            <PrivateRoute>
              <Customers />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/leads" 
          element={
            <PrivateRoute>
              <Leads />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <PrivateRoute>
              <Tasks />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  )
}

export default App
