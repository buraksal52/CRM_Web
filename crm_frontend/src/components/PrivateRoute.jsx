import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    return !!token; // Returns true if token exists, false otherwise
  };

  // If authenticated, render the children (protected component)
  // Otherwise, redirect to login page
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
