import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getUserRole, getUsername } from '../utils/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';

function Dashboard() {
  const navigate = useNavigate();
  const userRole = getUserRole();
  const username = getUsername();
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
        navigate('/login');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">CRM Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome, <span className="font-semibold">{username}</span> 
              {userRole && (
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  userRole === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {userRole === 'admin' ? 'Admin' : 'User'}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Loading dashboard..." />
        ) : (
          <>
            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Customers Card */}
              <Card
                title="Customers"
                borderColor="border-blue-500"
                iconBgColor="bg-blue-100"
                iconColor="text-blue-500"
                hoverable
                onClick={() => navigate('/customers')}
                icon={
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              >
                <div className="mb-4">
                  <p className="text-3xl sm:text-4xl font-bold text-gray-800">{stats.totalCustomers}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Customers</p>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-green-600 font-semibold">
                    {stats.activeCustomers} Active
                  </span>
                  <span className="text-gray-500">
                    {stats.totalCustomers - stats.activeCustomers} Inactive
                  </span>
                </div>
              </Card>

              {/* Leads Card */}
              <Card
                title="Leads"
                borderColor="border-green-500"
                iconBgColor="bg-green-100"
                iconColor="text-green-500"
                hoverable
                onClick={() => navigate('/leads')}
                icon={
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              >
                <div className="mb-4">
                  <p className="text-3xl sm:text-4xl font-bold text-gray-800">{stats.totalLeads}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Leads</p>
                </div>
                <div className="space-y-1 text-xs sm:text-sm mb-2">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Open:</span>
                    <span className="font-semibold">{stats.openLeads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Won:</span>
                    <span className="font-semibold">{stats.wonLeads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Lost:</span>
                    <span className="font-semibold">{stats.lostLeads}</span>
                  </div>
                </div>
              </Card>

              {/* Tasks Card */}
              <Card
                title="Tasks"
                borderColor="border-purple-500"
                iconBgColor="bg-purple-100"
                iconColor="text-purple-500"
                hoverable
                onClick={() => navigate('/tasks')}
                icon={
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                }
              >
                <div className="mb-4">
                  <p className="text-3xl sm:text-4xl font-bold text-gray-800">{stats.totalTasks}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Tasks</p>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm mb-3">
                  <span className="text-green-600 font-semibold">
                    {stats.completedTasks} Completed
                  </span>
                  <span className="text-orange-500 font-semibold">
                    {stats.pendingTasks} Pending
                  </span>
                </div>
                {stats.totalTasks > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% Complete
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Quick Actions */}
            <Card title="Quick Actions" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <button
                  onClick={() => navigate('/customers')}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold py-3 px-4 rounded-lg transition text-sm sm:text-base"
                >
                  + Add New Customer
                </button>
                <button
                  onClick={() => navigate('/leads')}
                  className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-semibold py-3 px-4 rounded-lg transition text-sm sm:text-base"
                >
                  + Create New Lead
                </button>
                <button
                  onClick={() => navigate('/tasks')}
                  className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold py-3 px-4 rounded-lg transition text-sm sm:text-base"
                >
                  + Add New Task
                </button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
