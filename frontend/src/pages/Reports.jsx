import { useState, useEffect } from 'react';
import './Reports.css';

function Reports() {
  const [clusteringHistory, setClusteringHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    // Mock clustering history data
    setClusteringHistory([
      { id: 1, algorithm: 'K-Means', clusters: 5, date: '2025-12-21', silhouette: 0.68, samples: 200 },
      { id: 2, algorithm: 'Hierarchical', clusters: 4, date: '2025-12-20', silhouette: 0.62, samples: 200 },
      { id: 3, algorithm: 'DBSCAN', clusters: 6, date: '2025-12-19', silhouette: 0.71, samples: 200 },
    ]);
  }, []);

  const handleExport = (format) => {
    if (clusteringHistory.length === 0) {
      alert('No data to export!');
      return;
    }

    if (format === 'CSV') {
      exportAsCSV();
    } else if (format === 'JSON') {
      exportAsJSON();
    } else if (format === 'PDF') {
      exportAsPDF();
    }
  };

  const exportAsCSV = () => {
    const headers = ['Date', 'Algorithm', 'Clusters', 'Samples', 'Silhouette Score'];
    const rows = clusteringHistory.map(record => [
      record.date,
      record.algorithm,
      record.clusters,
      record.samples,
      record.silhouette
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    downloadFile(csvContent, 'clustering_history.csv', 'text/csv');
  };

  const exportAsJSON = () => {
    const jsonContent = JSON.stringify(clusteringHistory, null, 2);
    downloadFile(jsonContent, 'clustering_history.json', 'application/json');
  };

  const exportAsPDF = () => {
    // Create a simple HTML representation for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Clustering History Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #3b82f6; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #3b82f6; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Clustering History Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Algorithm</th>
              <th>Clusters</th>
              <th>Samples</th>
              <th>Silhouette Score</th>
            </tr>
          </thead>
          <tbody>
            ${clusteringHistory.map(record => `
              <tr>
                <td>${record.date}</td>
                <td>${record.algorithm}</td>
                <td>${record.clusters}</td>
                <td>${record.samples}</td>
                <td>${record.silhouette.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    downloadFile(htmlContent, 'clustering_history.html', 'text/html');
    alert('✅ HTML file downloaded! Open it in your browser and use Print > Save as PDF to convert to PDF.');
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleViewRecord = (record) => {
    // Show detailed view of clustering record
    const details = `
📊 Clustering Analysis Details

Date: ${record.date}
Algorithm: ${record.algorithm}
Number of Clusters: ${record.clusters}
Sample Size: ${record.samples}
Silhouette Score: ${record.silhouette.toFixed(2)}

${record.silhouette > 0.65 ? '✅ Good clustering quality!' : '⚠️ Moderate clustering quality'}
    `;
    alert(details);
  };

  const handleDownloadRecord = (record) => {
    // Download individual clustering record as JSON
    const recordData = {
      ...record,
      generatedOn: new Date().toISOString(),
      quality: record.silhouette > 0.65 ? 'Good' : 'Average'
    };

    const jsonContent = JSON.stringify(recordData, null, 2);
    downloadFile(jsonContent, `clustering_${record.algorithm}_${record.date}.json`, 'application/json');
  };

  return (
    <div className="reports-page">
      <div className="container">
        <div className="page-header">
          <h1><i className="fas fa-chart-line"></i> Reports & Analytics</h1>
          <p>View clustering history, analytics reports, and export data</p>
        </div>

        {/* Report Type Selection */}
        <div className="report-tabs">
          <button
            className={`tab-button ${selectedReport === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedReport('overview')}
          >
            <i className="fas fa-chart-pie"></i> Overview
          </button>
          <button
            className={`tab-button ${selectedReport === 'history' ? 'active' : ''}`}
            onClick={() => setSelectedReport('history')}
          >
            <i className="fas fa-history"></i> History
          </button>
          <button
            className={`tab-button ${selectedReport === 'performance' ? 'active' : ''}`}
            onClick={() => setSelectedReport('performance')}
          >
            <i className="fas fa-tachometer-alt"></i> Performance
          </button>
        </div>

        {/* Export Options */}
        <div className="card export-section">
          <h2><i className="fas fa-download"></i> Export Data</h2>
          <div className="export-buttons">
            <button className="export-btn csv" onClick={() => handleExport('CSV')}>
              <i className="fas fa-file-csv"></i> Export as CSV
            </button>
            <button className="export-btn json" onClick={() => handleExport('JSON')}>
              <i className="fas fa-file-code"></i> Export as JSON
            </button>
            <button className="export-btn pdf" onClick={() => handleExport('PDF')}>
              <i className="fas fa-file-pdf"></i> Export as PDF
            </button>
          </div>
        </div>

        {/* Clustering History */}
        {selectedReport === 'history' && (
          <div className="card">
            <h2><i className="fas fa-history"></i> Clustering History</h2>
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Algorithm</th>
                    <th>Clusters</th>
                    <th>Samples</th>
                    <th>Silhouette Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clusteringHistory.map((record) => (
                    <tr key={record.id}>
                      <td>{record.date}</td>
                      <td><span className="algorithm-tag">{record.algorithm}</span></td>
                      <td>{record.clusters}</td>
                      <td>{record.samples}</td>
                      <td>
                        <span className={`score ${record.silhouette > 0.65 ? 'good' : 'average'}`}>
                          {record.silhouette.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn"
                          onClick={() => handleViewRecord(record)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => handleDownloadRecord(record)}
                          title="Download Record"
                        >
                          <i className="fas fa-download"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        {selectedReport === 'overview' && (
          <div className="overview-grid">
            <div className="stat-card">
              <div className="stat-icon"><i className="fas fa-project-diagram"></i></div>
              <div className="stat-content">
                <h3>Total Analyses</h3>
                <p className="stat-value">{clusteringHistory.length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><i className="fas fa-layer-group"></i></div>
              <div className="stat-content">
                <h3>Avg Clusters</h3>
                <p className="stat-value">
                  {(clusteringHistory.reduce((sum, r) => sum + r.clusters, 0) / clusteringHistory.length).toFixed(1)}
                </p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><i className="fas fa-chart-line"></i></div>
              <div className="stat-content">
                <h3>Avg Silhouette</h3>
                <p className="stat-value">
                  {(clusteringHistory.reduce((sum, r) => sum + r.silhouette, 0) / clusteringHistory.length).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><i className="fas fa-users"></i></div>
              <div className="stat-content">
                <h3>Total Samples</h3>
                <p className="stat-value">200</p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {selectedReport === 'performance' && (
          <div className="card">
            <h2><i className="fas fa-tachometer-alt"></i> Performance Metrics</h2>
            <div className="performance-grid">
              <div className="metric">
                <h4>Best Silhouette Score</h4>
                <p className="metric-value good">0.71</p>
                <small>DBSCAN - Dec 19, 2025</small>
              </div>
              <div className="metric">
                <h4>Optimal Cluster Count</h4>
                <p className="metric-value">5</p>
                <small>Based on elbow method</small>
              </div>
              <div className="metric">
                <h4>Average Processing Time</h4>
                <p className="metric-value">2.3s</p>
                <small>Across all algorithms</small>
              </div>
              <div className="metric">
                <h4>Data Quality Score</h4>
                <p className="metric-value good">8.5/10</p>
                <small>Feature completeness</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
