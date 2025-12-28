import { useState, useEffect } from 'react';
import { clusteringAPI } from '../services/api';
import './ClusterAnalysis.css';

function ClusterAnalysis() {
  const [algorithm, setAlgorithm] = useState('kmeans');
  const [params, setParams] = useState({
    n_clusters: 5,
    eps: 0.5,
    min_samples: 5,
    linkage: 'ward'
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [elbowData, setElbowData] = useState(null);
  const [showElbow, setShowElbow] = useState(false);

  const handleRunClustering = async () => {
    setLoading(true);
    try {
      const response = await clusteringAPI.runClustering(algorithm, params);
      setResults(response.data.data);
      alert('✅ Clustering completed successfully!');
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleShowElbow = async () => {
    setLoading(true);
    try {
      const response = await clusteringAPI.getElbowData(2, 11);
      setElbowData(response.data.data);
      setShowElbow(true);
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analysis-page">
      <div className="container">
        <h1>Cluster Analysis</h1>
        <p className="mb-lg">Configure and run clustering algorithms to segment customers</p>

        {/* Algorithm Selection */}
        <div className="glass-card mb-lg">
          <h2 className="mb-md">Algorithm Configuration</h2>

          <div className="input-group">
            <label>Clustering Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              <option value="kmeans">K-Means</option>
              <option value="hierarchical">Hierarchical</option>
              <option value="dbscan">DBSCAN</option>
            </select>
          </div>

          {algorithm === 'kmeans' && (
            <>
              <div className="input-group">
                <label>Number of Clusters (K)</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={params.n_clusters}
                  onChange={(e) => setParams({ ...params, n_clusters: parseInt(e.target.value) })}
                />
              </div>
              <button
                className="btn btn-secondary mb-md"
                onClick={handleShowElbow}
                disabled={loading}
              >
                <i className="fas fa-chart-line"></i> Show Elbow Method
              </button>
            </>
          )}

          {algorithm === 'hierarchical' && (
            <>
              <div className="input-group">
                <label>Number of Clusters</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={params.n_clusters}
                  onChange={(e) => setParams({ ...params, n_clusters: parseInt(e.target.value) })}
                />
              </div>
              <div className="input-group">
                <label>Linkage Method</label>
                <select
                  value={params.linkage}
                  onChange={(e) => setParams({ ...params, linkage: e.target.value })}
                >
                  <option value="ward">Ward</option>
                  <option value="complete">Complete</option>
                  <option value="average">Average</option>
                  <option value="single">Single</option>
                </select>
              </div>
            </>
          )}

          {algorithm === 'dbscan' && (
            <>
              <div className="input-group">
                <label>Epsilon (ε)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={params.eps}
                  onChange={(e) => setParams({ ...params, eps: parseFloat(e.target.value) })}
                />
              </div>
              <div className="input-group">
                <label>Min Samples</label>
                <input
                  type="number"
                  min="2"
                  value={params.min_samples}
                  onChange={(e) => setParams({ ...params, min_samples: parseInt(e.target.value) })}
                />
              </div>
            </>
          )}

          <button
            className="btn btn-primary btn-lg"
            onClick={handleRunClustering}
            disabled={loading}
          >
            {loading ? <><i className="fas fa-clock"></i> Processing...</> : <><i className="fas fa-rocket"></i> Run Clustering</>}
          </button>
        </div>

        {/* Elbow Method */}
        {showElbow && elbowData && (
          <div className="glass-card mb-lg">
            <h2 className="mb-md">Elbow Method Analysis</h2>
            <div className="visualization-container">
              <img
                src={`data:image/png;base64,${elbowData.elbow_plot}`}
                alt="Elbow Curve"
                className="visualization-img"
              />
            </div>
            <div className="elbow-data mt-md">
              <h3>Recommendation</h3>
              <p>
                Based on the elbow curve, the optimal number of clusters appears to be where
                the curve bends (the "elbow"). Look for the point where adding more clusters
                doesn't significantly reduce inertia. Also consider the silhouette scores.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <>
            {/* Metrics */}
            <div className="glass-card mb-lg">
              <h2 className="mb-md">Clustering Metrics</h2>
              <div className="grid grid-4">
                <div className="metric-card">
                  <div className="metric-value">{results.n_clusters}</div>
                  <div className="metric-label">Clusters</div>
                </div>
                {results.metrics.silhouette_score && (
                  <div className="metric-card">
                    <div className="metric-value">
                      {results.metrics.silhouette_score.toFixed(3)}
                    </div>
                    <div className="metric-label">Silhouette Score</div>
                  </div>
                )}
                {results.metrics.davies_bouldin_score && (
                  <div className="metric-card">
                    <div className="metric-value">
                      {results.metrics.davies_bouldin_score.toFixed(3)}
                    </div>
                    <div className="metric-label">Davies-Bouldin</div>
                  </div>
                )}
                {results.metrics.calinski_harabasz_score && (
                  <div className="metric-card">
                    <div className="metric-value">
                      {results.metrics.calinski_harabasz_score.toFixed(1)}
                    </div>
                    <div className="metric-label">Calinski-Harabasz</div>
                  </div>
                )}
              </div>
            </div>

            {/* Visualizations */}
            {results.visualizations && (
              <div className="glass-card mb-lg">
                <h2 className="mb-md">Cluster Visualizations</h2>

                {results.visualizations.clusters_2d && (
                  <div className="visualization-section">
                    <h3>2D Cluster Projection (PCA)</h3>
                    <div className="visualization-container">
                      <img
                        src={`data:image/png;base64,${results.visualizations.clusters_2d}`}
                        alt="2D Clusters"
                        className="visualization-img"
                      />
                    </div>
                  </div>
                )}

                {results.visualizations.feature_distributions && (
                  <div className="visualization-section">
                    <h3>Feature Distributions</h3>
                    <div className="visualization-container">
                      <img
                        src={`data:image/png;base64,${results.visualizations.feature_distributions}`}
                        alt="Feature Distributions"
                        className="visualization-img"
                      />
                    </div>
                  </div>
                )}

                {results.visualizations.cluster_profiles && (
                  <div className="visualization-section">
                    <h3>Cluster Profiles</h3>
                    <div className="visualization-container">
                      <img
                        src={`data:image/png;base64,${results.visualizations.cluster_profiles}`}
                        alt="Cluster Profiles"
                        className="visualization-img"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cluster Profiles */}
            <div className="glass-card">
              <h2 className="mb-md">Segment Profiles</h2>
              <div className="grid grid-2">
                {results.cluster_profiles.map((profile) => (
                  <div key={profile.ClusterID} className="card">
                    <div className="flex justify-between items-center mb-sm">
                      <h3>Cluster {profile.ClusterID}</h3>
                      <span className="badge badge-primary">
                        {profile.Size} customers ({profile.Percentage}%)
                      </span>
                    </div>
                    <div className="profile-title mb-md">{profile.Label}</div>

                    <div className="profile-features">
                      {Object.entries(profile)
                        .filter(([key]) => key.includes('_mean'))
                        .map(([key, value]) => (
                          <div key={key} className="feature-row">
                            <span className="feature-name">
                              {key.replace('_mean', '')}
                            </span>
                            <span className="feature-value">
                              {value.toFixed(2)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!results && !loading && (
          <div className="empty-state">
            <div className="empty-icon"><i className="fas fa-microscope"></i></div>
            <h3>No Analysis Results</h3>
            <p>Configure the parameters above and run clustering to see results</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClusterAnalysis;
