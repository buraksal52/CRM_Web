import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getUserRole, getUsername } from '../utils/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import DarkModeToggle from '../components/DarkModeToggle';
import { useDarkMode } from '../hooks/useDarkMode';
import { showSuccess, showError, showInfo } from '../utils/toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const navigate = useNavigate();
  const userRole = getUserRole();
  const username = getUsername();
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalLeads: 0,
    openLeads: 0,
    wonLeads: 0,
    lostLeads: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch all data in parallel
      const [customersRes, leadsRes, tasksRes] = await Promise.all([
        api.get('/customers/'),
        api.get('/leads/'),
        api.get('/tasks/'),
      ]);

      // Calculate statistics from the responses
      const customers = customersRes.data;
      const leads = leadsRes.data;
      const tasks = tasksRes.data;

      setStats({
        totalCustomers: customers.length,
        activeCustomers: customers.filter(c => c.status === 'Active').length,
        totalLeads: leads.length,
        openLeads: leads.filter(l => l.status === 'Open').length,
        wonLeads: leads.filter(l => l.status === 'Won').length,
        lostLeads: leads.filter(l => l.status === 'Lost').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed === true).length,
        pendingTasks: tasks.filter(t => t.completed === false).length,
      });
    } catch (err) {
      if (err.response?.status === 401) {
        showError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError('Failed to load dashboard data');
        showError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    showInfo('Logged out successfully. See you soon! 👋');
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      {/* Modern Header with Gradient */}
      <div className="relative" style={{ 
        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.1)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)'
              }}>
                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  CRM Dashboard
                </h1>
                <p className="text-sm mt-1" style={{ color: '#cccccc' }}>
                  Welcome back, <span className="font-semibold" style={{ color: '#FFD700' }}>{username}</span>
                  {userRole && (
                    <span className="ml-2 px-3 py-1 text-xs font-bold rounded-full" style={{
                      background: userRole === 'admin' 
                        ? 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)'
                        : 'rgba(255, 215, 0, 0.2)',
                      color: userRole === 'admin' ? '#000' : '#FFD700',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}>
                      {userRole === 'admin' ? '⚡ ADMIN' : '👤 USER'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: 'rgba(255, 215, 0, 0.1)',
                  border: '2px solid #FFD700',
                  color: '#FFD700',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)';
                  e.currentTarget.style.color = '#000';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                  e.currentTarget.style.color = '#FFD700';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.2)';
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="px-6 py-4 rounded-xl mb-6 animate-pulse" style={{
            background: 'rgba(244, 67, 54, 0.1)',
            border: '2px solid rgba(244, 67, 54, 0.3)',
            color: '#ff6b6b',
            boxShadow: '0 0 20px rgba(244, 67, 54, 0.2)'
          }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Loading dashboard..." />
        ) : (
          <>
            {/* Summary Stats Cards - Modern Black & Yellow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Customers Card */}
              <div 
                className="group cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/customers')}
                style={{
                  background: 'rgba(26, 26, 26, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 215, 0, 0.2)',
                  boxShadow: '0 8px 32px rgba(255, 215, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 215, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 215, 0, 0.1)';
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold" style={{ color: '#cccccc' }}>Customers</h3>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)',
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }}>
                    <svg className="w-6 h-6" fill="none" stroke="#FFD700" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-5xl font-black mb-2" style={{ color: '#FFD700' }}>{stats.totalCustomers}</p>
                  <p className="text-sm" style={{ color: '#999999' }}>Total Customers</p>
                </div>
                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255, 215, 0, 0.1)' }}>
                  <span className="text-sm font-semibold" style={{ color: '#4ade80' }}>
                    ✓ {stats.activeCustomers} Active
                  </span>
                  <span className="text-sm" style={{ color: '#999999' }}>
                    {stats.totalCustomers - stats.activeCustomers} Inactive
                  </span>
                </div>
              </div>

              {/* Leads Card */}
              <div 
                className="group cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/leads')}
                style={{
                  background: 'rgba(26, 26, 26, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 215, 0, 0.2)',
                  boxShadow: '0 8px 32px rgba(255, 215, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 215, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 215, 0, 0.1)';
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold" style={{ color: '#cccccc' }}>Leads</h3>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)',
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }}>
                    <svg className="w-6 h-6" fill="none" stroke="#FFD700" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-5xl font-black mb-2" style={{ color: '#FFD700' }}>{stats.totalLeads}</p>
                  <p className="text-sm" style={{ color: '#999999' }}>Total Leads</p>
                </div>
                <div className="space-y-2 pt-4" style={{ borderTop: '1px solid rgba(255, 215, 0, 0.1)' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#60a5fa' }}>📂 Open:</span>
                    <span className="font-bold" style={{ color: '#fff' }}>{stats.openLeads}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#4ade80' }}>✓ Won:</span>
                    <span className="font-bold" style={{ color: '#fff' }}>{stats.wonLeads}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#f87171' }}>✗ Lost:</span>
                    <span className="font-bold" style={{ color: '#fff' }}>{stats.lostLeads}</span>
                  </div>
                </div>
              </div>

              {/* Tasks Card */}
              <div 
                className="group cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/tasks')}
                style={{
                  background: 'rgba(26, 26, 26, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 215, 0, 0.2)',
                  boxShadow: '0 8px 32px rgba(255, 215, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 215, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 215, 0, 0.1)';
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold" style={{ color: '#cccccc' }}>Tasks</h3>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)',
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }}>
                    <svg className="w-6 h-6" fill="none" stroke="#FFD700" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-5xl font-black mb-2" style={{ color: '#FFD700' }}>{stats.totalTasks}</p>
                  <p className="text-sm" style={{ color: '#999999' }}>Total Tasks</p>
                </div>
                <div className="pt-4" style={{ borderTop: '1px solid rgba(255, 215, 0, 0.1)' }}>
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="font-semibold" style={{ color: '#4ade80' }}>
                      ✓ {stats.completedTasks} Done
                    </span>
                    <span className="font-semibold" style={{ color: '#fb923c' }}>
                      ⏳ {stats.pendingTasks} Pending
                    </span>
                  </div>
                  {stats.totalTasks > 0 && (
                    <div>
                      <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                        <div
                          className="h-2.5 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(stats.completedTasks / stats.totalTasks) * 100}%`,
                            background: 'linear-gradient(90deg, #FFD700 0%, #FFC700 100%)',
                            boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-center mt-2" style={{ color: '#999999' }}>
                        {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% Complete
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions - Modern Style */}
            <div className="rounded-2xl p-6 mb-8" style={{
              background: 'rgba(26, 26, 26, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 215, 0, 0.2)',
              boxShadow: '0 8px 32px rgba(255, 215, 0, 0.1)'
            }}>
              <h2 className="text-2xl font-bold mb-6" style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ⚡ Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/customers')}
                  className="py-4 px-6 rounded-xl font-bold transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    color: '#FFD700'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)';
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                    e.currentTarget.style.color = '#FFD700';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  👥 Add New Customer
                </button>
                <button
                  onClick={() => navigate('/leads')}
                  className="py-4 px-6 rounded-xl font-bold transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    color: '#FFD700'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)';
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                    e.currentTarget.style.color = '#FFD700';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  📊 Create New Lead
                </button>
                <button
                  onClick={() => navigate('/tasks')}
                  className="py-4 px-6 rounded-xl font-bold transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    color: '#FFD700'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)';
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                    e.currentTarget.style.color = '#FFD700';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  ✓ Add New Task
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Overview Bar Chart */}
              <Card title="System Overview" subtitle="Total counts across all modules">
                <div className="h-64 sm:h-72">
                  <Bar
                    data={{
                      labels: ['Customers', 'Leads', 'Tasks'],
                      datasets: [
                        {
                          label: 'Total Count',
                          data: [stats.totalCustomers, stats.totalLeads, stats.totalTasks],
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',  // Blue for Customers
                            'rgba(34, 197, 94, 0.8)',   // Green for Leads
                            'rgba(168, 85, 247, 0.8)',  // Purple for Tasks
                          ],
                          borderColor: [
                            'rgb(59, 130, 246)',
                            'rgb(34, 197, 94)',
                            'rgb(168, 85, 247)',
                          ],
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        title: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                          titleFont: {
                            size: 14,
                          },
                          bodyFont: {
                            size: 13,
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-around text-xs sm:text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-300">Customers</span>
                      </div>
                      <p className="font-bold text-gray-800 dark:text-white mt-1">{stats.totalCustomers}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-300">Leads</span>
                      </div>
                      <p className="font-bold text-gray-800 dark:text-white mt-1">{stats.totalLeads}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-300">Tasks</span>
                      </div>
                      <p className="font-bold text-gray-800 dark:text-white mt-1">{stats.totalTasks}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Task Completion Doughnut Chart */}
              <Card title="Task Progress" subtitle="Completed vs Pending tasks">
                <div className="h-64 sm:h-72 flex items-center justify-center">
                  {stats.totalTasks > 0 ? (
                    <div className="w-full max-w-xs mx-auto">
                      <Doughnut
                        data={{
                          labels: ['Completed', 'Pending'],
                          datasets: [
                            {
                              label: 'Tasks',
                              data: [stats.completedTasks, stats.pendingTasks],
                              backgroundColor: [
                                'rgba(34, 197, 94, 0.8)',   // Green for Completed
                                'rgba(251, 146, 60, 0.8)',  // Orange for Pending
                              ],
                              borderColor: [
                                'rgb(34, 197, 94)',
                                'rgb(251, 146, 60)',
                              ],
                              borderWidth: 2,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: true,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                padding: 15,
                                font: {
                                  size: 12,
                                },
                              },
                            },
                            tooltip: {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              padding: 12,
                              titleFont: {
                                size: 14,
                              },
                              bodyFont: {
                                size: 13,
                              },
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.parsed || 0;
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = ((value / total) * 100).toFixed(1);
                                  return `${label}: ${value} (${percentage}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm">No tasks available</p>
                      <button
                        onClick={() => navigate('/tasks')}
                        className="mt-3 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm font-semibold"
                      >
                        Create your first task →
                      </button>
                    </div>
                  )}
                </div>
                {stats.totalTasks > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600 dark:text-gray-300">Completed</span>
                        </div>
                        <p className="font-bold text-lg text-gray-800 dark:text-white">{stats.completedTasks}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-gray-600 dark:text-gray-300">Pending</span>
                        </div>
                        <p className="font-bold text-lg text-gray-800 dark:text-white">{stats.pendingTasks}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {stats.totalTasks > 0 ? Math.round((stats.pendingTasks / stats.totalTasks) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
