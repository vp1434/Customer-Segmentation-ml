import { useState, useEffect } from 'react';
import { customerAPI, clusteringAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clusterProfiles, setClusterProfiles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, profilesRes] = await Promise.all([
        customerAPI.getStatistics(),
        clusteringAPI.getProfiles().catch(() => ({ data: { data: { profiles: [] } } }))
      ]);

      setStats(statsRes.data.data);
      setClusterProfiles(profilesRes.data.data?.profiles || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleData = async () => {
    if (!confirm('Load sample customer data? This will add 200 sample customers.')) return;

    try {
      setLoading(true);
      await clusteringAPI.loadSampleData(false);
      alert('✅ Sample data loaded successfully!');
      fetchDashboardData();
    } catch (err) {
      alert('❌ Error loading sample data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const overall = stats?.overall || {};
  const clusters = stats?.clusters || [];

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Customer segmentation analytics and insights</p>
          </div>
          <button className="btn btn-load-data" onClick={handleLoadSampleData}>
            <i className="fas fa-download"></i> Load Sample Data
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-4">
          <div className="stat-card">
            <div className="stat-value">{overall.totalCustomers || 0}</div>
            <div className="stat-label">Total Customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{clusters.length}</div>
            <div className="stat-label">Active Segments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {overall.avgIncome ? `$${overall.avgIncome.toFixed(0)}k` : 'N/A'}
            </div>
            <div className="stat-label">Avg Annual Income</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {overall.avgSpending ? overall.avgSpending.toFixed(1) : 'N/A'}
            </div>
            <div className="stat-label">Avg Spending Score</div>
          </div>
        </div>

        {/* Cluster Distribution */}
        {clusters.length > 0 && (
          <div className="glass-card mt-lg">
            <h2 className="mb-md">Segment Distribution</h2>
            <div className="cluster-distribution">
              {clusters.map((cluster) => (
                <div key={cluster._id} className="cluster-item">
                  <div className="cluster-header">
                    <span className="badge badge-primary">
                      Cluster {cluster._id}
                    </span>
                    <span className="cluster-label">{cluster.label}</span>
                  </div>
                  <div className="cluster-count">{cluster.count} customers</div>
                  <div className="cluster-bar">
                    <div
                      className="cluster-bar-fill"
                      style={{ width: `${(cluster.count / overall.totalCustomers * 100)}%` }}
                    ></div>
                  </div>
                  <div className="cluster-percentage">
                    {((cluster.count / overall.totalCustomers * 100).toFixed(1))}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cluster Profiles */}
        {clusterProfiles.length > 0 && (
          <div className="glass-card mt-lg">
            <h2 className="mb-md">Segment Profiles</h2>
            <div className="grid grid-2">
              {clusterProfiles.map((profile) => (
                <div key={profile.ClusterID} className="card">
                  <div className="flex justify-between items-center mb-sm">
                    <h3>Cluster {profile.ClusterID}</h3>
                    <span className="badge badge-success">{profile.Size} customers</span>
                  </div>
                  <div className="profile-label mb-md">{profile.Label}</div>
                  <div className="profile-stats">
                    <div className="profile-stat">
                      <div className="profile-stat-label">Percentage</div>
                      <div className="profile-stat-value">{profile.Percentage}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="glass-card mt-lg">
          <h2 className="mb-md">Quick Actions</h2>
          <div className="grid grid-3">
            <a href="/analysis" className="action-card">
              <div className="action-icon"><i className="fas fa-microscope"></i></div>
              <div className="action-title">Run Analysis</div>
              <div className="action-desc">Perform clustering analysis</div>
            </a>
            <a href="/customers" className="action-card">
              <div className="action-icon"><i className="fas fa-users"></i></div>
              <div className="action-title">Manage Customers</div>
              <div className="action-desc">View and edit customer data</div>
            </a>
            <a href="/campaigns" className="action-card">
              <div className="action-icon"><i className="fas fa-bullseye"></i></div>
              <div className="action-title">Create Campaigns</div>
              <div className="action-desc">Target specific segments</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
