import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { showError } from '../utils/toast';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function Dashboard() {
  const navigate = useNavigate();
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
      const [customersRes, leadsRes, tasksRes] = await Promise.all([
        api.get('/customers/'),
        api.get('/leads/'),
        api.get('/tasks/'),
      ]);

      // Handle both paginated and non-paginated responses
      const customers = customersRes.data.results || customersRes.data || [];
      const leads = leadsRes.data.results || leadsRes.data || [];
      const tasks = tasksRes.data.results || tasksRes.data || [];

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

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading dashboard..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="fade-in-up">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome back! Here is what is happening with your business today.
          </p>
        </div>

        {error && (
          <div className="fade-in" style={{
            padding: '1rem',
            marginBottom: '2rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--border-radius)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div className="card scale-in" style={{ padding: '1.5rem', cursor: 'pointer' }}
            onClick={() => navigate('/customers')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                  CUSTOMERS
                </p>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                  {stats.totalCustomers}
                </h2>
              </div>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: 'rgba(30, 64, 175, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '1.75rem', height: '1.75rem', color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: '600' }}>
                {stats.activeCustomers} Active
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                {stats.totalCustomers - stats.activeCustomers} Inactive
              </span>
            </div>
          </div>

          <div className="card scale-in" style={{ padding: '1.5rem', cursor: 'pointer', animationDelay: '0.1s' }}
            onClick={() => navigate('/leads')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                  LEADS
                </p>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                  {stats.totalLeads}
                </h2>
              </div>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '1.75rem', height: '1.75rem', color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Open: {stats.openLeads}</span>
              <span style={{ color: 'var(--success)', fontWeight: '600' }}>Won: {stats.wonLeads}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>Lost: {stats.lostLeads}</span>
            </div>
          </div>

          <div className="card scale-in" style={{ padding: '1.5rem', cursor: 'pointer', animationDelay: '0.2s' }}
            onClick={() => navigate('/tasks')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                  TASKS
                </p>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                  {stats.totalTasks}
                </h2>
              </div>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '1.75rem', height: '1.75rem', color: 'var(--warning)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--success)', fontWeight: '600' }}>Completed: {stats.completedTasks}</span>
                <span style={{ color: 'var(--warning)', fontWeight: '600' }}>Pending: {stats.pendingTasks}</span>
              </div>
              {stats.totalTasks > 0 && (
                <div>
                  <div style={{ width: '100%', height: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '1rem', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(stats.completedTasks / stats.totalTasks) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)',
                      borderRadius: '1rem',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem', textAlign: 'center' }}>
                    {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% Complete
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          <div className="card fade-in" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              System Overview
            </h3>
            <div style={{ height: '300px' }}>
              <Bar
                data={{
                  labels: ['Customers', 'Leads', 'Tasks'],
                  datasets: [{
                    label: 'Total Count',
                    data: [stats.totalCustomers, stats.totalLeads, stats.totalTasks],
                    backgroundColor: ['rgba(30, 64, 175, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)'],
                    borderColor: ['var(--primary)', 'var(--success)', 'var(--warning)'],
                    borderWidth: 2,
                    borderRadius: 8,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'var(--border-color)' } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>

          <div className="card fade-in" style={{ padding: '1.5rem', animationDelay: '0.1s' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Task Progress
            </h3>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stats.totalTasks > 0 ? (
                <Doughnut
                  data={{
                    labels: ['Completed', 'Pending'],
                    datasets: [{
                      data: [stats.completedTasks, stats.pendingTasks],
                      backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)'],
                      borderColor: ['var(--success)', 'var(--warning)'],
                      borderWidth: 2,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { padding: 20, font: { size: 12 } } },
                    },
                  }}
                />
              ) : (
                <p style={{ color: 'var(--text-tertiary)' }}>No tasks available</p>
              )}
            </div>
          </div>
        </div>

        <div className="card fade-in" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/customers')}
              style={{ padding: '1rem', justifyContent: 'center' }}
            >
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Customer
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/leads')}
              style={{ padding: '1rem', justifyContent: 'center' }}
            >
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Lead
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/tasks')}
              style={{ padding: '1rem', justifyContent: 'center' }}
            >
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
