import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { showSuccess, showError } from '../utils/toast';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login/', {
        username: formData.username,
        password: formData.password,
      });

      // Store tokens in localStorage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      // Fetch user information including role
      try {
        const userResponse = await api.get('/user/me/');
        localStorage.setItem('user_role', userResponse.data.role);
        localStorage.setItem('user_id', userResponse.data.id);
        localStorage.setItem('username', userResponse.data.username);
      } catch (userErr) {
        console.error('Failed to fetch user info:', userErr);
      }

      showSuccess(`Welcome back, ${formData.username}! 👋`);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      // Handle error
      let errorMessage;
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else {
        errorMessage = 'An error occurred. Please try again.';
      }
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
    }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-10" style={{
          background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-10" style={{
          background: 'radial-gradient(circle, #FFC700 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 6s ease-in-out infinite reverse'
        }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Glass Card */}
        <div className="rounded-3xl p-8 md:p-10" style={{
          background: 'rgba(26, 26, 26, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 215, 0, 0.2)',
          boxShadow: '0 20px 60px rgba(255, 215, 0, 0.2)'
        }}>
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
            }}>
              <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <h2 className="text-4xl font-black text-center mb-3" style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome Back
          </h2>
          <p className="text-center mb-8" style={{ color: '#999999' }}>
            Login to your CRM account
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl animate-pulse" style={{
              background: 'rgba(244, 67, 54, 0.1)',
              border: '2px solid rgba(244, 67, 54, 0.3)',
              color: '#ff6b6b'
            }}>
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block font-bold mb-2"
                style={{ color: '#FFD700' }}
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: 'rgba(255, 215, 0, 0.05)',
                  border: '2px solid rgba(255, 215, 0, 0.2)',
                  color: '#ffffff',
                  outline: 'none'
                }}
                placeholder="Enter your username"
                onFocus={(e) => {
                  e.target.style.borderColor = '#FFD700';
                  e.target.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-bold mb-2"
                style={{ color: '#FFD700' }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: 'rgba(255, 215, 0, 0.05)',
                  border: '2px solid rgba(255, 215, 0, 0.2)',
                  color: '#ffffff',
                  outline: 'none'
                }}
                placeholder="Enter your password"
                onFocus={(e) => {
                  e.target.style.borderColor = '#FFD700';
                  e.target.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-black text-lg transition-all duration-200 hover:scale-105"
              style={{
                background: loading 
                  ? 'rgba(255, 215, 0, 0.3)'
                  : 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)',
                color: '#000',
                border: 'none',
                boxShadow: loading ? 'none' : '0 0 30px rgba(255, 215, 0, 0.4)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '⏳ Logging in...' : '⚡ Login'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p style={{ color: '#999999' }}>
              Don't have an account?{' '}
              <a
                href="/register"
                className="font-bold transition-colors duration-200"
                style={{ color: '#FFD700' }}
                onMouseEnter={(e) => e.target.style.color = '#FFC700'}
                onMouseLeave={(e) => e.target.style.color = '#FFD700'}
              >
                Register here →
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Glow */}
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-3/4 h-20 rounded-full opacity-20" style={{
          background: 'radial-gradient(ellipse, #FFD700 0%, transparent 70%)',
          filter: 'blur(30px)'
        }}></div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default Login;
