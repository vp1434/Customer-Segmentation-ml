import { useState, useEffect } from 'react';
import { clusteringAPI } from '../services/api';
import './Campaigns.css';

function Campaigns() {
  const [clusterProfiles, setClusterProfiles] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClusterProfiles();
  }, []);

  const fetchClusterProfiles = async () => {
    setLoading(true);
    try {
      const response = await clusteringAPI.getProfiles();
      setClusterProfiles(response.data.data.profiles || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCampaignRecommendations = (profile) => {
    const label = profile.Label?.toLowerCase() || '';

    if (label.includes('premium') || label.includes('high spenders')) {
      return [
        '<i class="fas fa-gift"></i> Exclusive VIP offers and early access',
        '<i class="fas fa-gem"></i> Premium product launches',
        '<i class="fas fa-star"></i> Luxury brand collaborations',
        '<i class="fas fa-plane"></i> High-value reward programs'
      ];
    } else if (label.includes('savers') || label.includes('careful')) {
      return [
        '<i class="fas fa-dollar-sign"></i> Budget-friendly promotions',
        '<i class="fas fa-tag"></i> Value pack deals',
        '<i class="fas fa-envelope"></i> Discount coupons and cashback',
        '<i class="fas fa-bolt"></i> Flash sales notifications'
      ];
    } else if (label.includes('active') || label.includes('splurgers')) {
      return [
        '<i class="fas fa-shopping-bag"></i> New arrival notifications',
        '<i class="fas fa-percent"></i> Seasonal sale alerts',
        '<i class="fas fa-credit-card"></i> Loyalty point bonuses',
        '<i class="fas fa-mobile-alt"></i> Mobile app exclusive deals'
      ];
    } else {
      return [
        '<i class="fas fa-bullhorn"></i> General promotional offers',
        '<i class="fas fa-calendar-alt"></i> Seasonal campaigns',
        '<i class="fas fa-bell"></i> New product launches',
        '<i class="fas fa-paper-plane"></i> Newsletter subscriptions'
      ];
    }
  };

  return (
    <div className="campaigns-page">
      <div className="container">
        <h1>Campaign Targeting</h1>
        <p className="mb-lg">Create targeted marketing campaigns for customer segments</p>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading segments...</p>
          </div>
        ) : clusterProfiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="fas fa-bullseye"></i></div>
            <h3>No Segments Available</h3>
            <p>Run cluster analysis first to create customer segments</p>
            <a href="/analysis" className="btn btn-primary mt-md">
              Go to Analysis
            </a>
          </div>
        ) : (
          <div className="grid grid-2">
            {clusterProfiles.map((profile) => (
              <div key={profile.ClusterID} className="campaign-card glass-card">
                <div className="campaign-header">
                  <div className="flex justify-between items-center">
                    <h2>Cluster {profile.ClusterID}</h2>
                    <span className="badge badge-success">
                      {profile.Size} customers
                    </span>
                  </div>
                  <div className="campaign-label">{profile.Label}</div>
                  <div className="campaign-stats">
                    <span className="stat-item">
                      <i className="fas fa-chart-pie"></i> {profile.Percentage}% of total
                    </span>
                  </div>
                </div>

                <div className="campaign-recommendations">
                  <h3><i className="fas fa-bullhorn"></i> Campaign Ideas</h3>
                  <ul className="recommendations-list">
                    {getCampaignRecommendations(profile).map((rec, idx) => (
                      <li key={idx} dangerouslySetInnerHTML={{ __html: rec }}></li>
                    ))}
                  </ul>
                </div>

                <div className="campaign-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedCluster(profile)}
                  >
                    <i className="fas fa-clipboard-list"></i> Create Campaign
                  </button>
                  <a
                    href={`/customers?cluster=${profile.ClusterID}`}
                    className="btn btn-secondary btn-sm"
                  >
                    <i className="fas fa-users"></i> View Customers
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCluster && (
          <div className="modal-overlay" onClick={() => setSelectedCluster(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Create Campaign</h2>
              <p className="mb-md">
                Targeting: <strong>{selectedCluster.Label}</strong>
                ({selectedCluster.Size} customers)
              </p>

              <div className="input-group">
                <label>Campaign Name</label>
                <input type="text" placeholder="e.g., Summer Sale 2024" />
              </div>

              <div className="input-group">
                <label>Message</label>
                <textarea
                  rows="4"
                  placeholder="Enter your campaign message..."
                ></textarea>
              </div>

              <div className="flex gap-md justify-between mt-lg">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedCluster(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    alert('Campaign created! (Demo mode)');
                    setSelectedCluster(null);
                  }}
                >
                  <i className="fas fa-rocket"></i> Launch Campaign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Campaigns;
