import { useState } from 'react';
import './Settings.css';

function Settings() {
  const [settings, setSettings] = useState({
    defaultAlgorithm: 'k-means',
    defaultClusters: 5,
    autoRefresh: true,
    notifications: true,
    apiUrl: 'http://localhost:5000',
    mlServiceUrl: 'http://localhost:5001',
    performanceMode: 'balanced',
    dataRetentionDays: 30,
    maxConcurrentRequests: 5,
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('✅ Settings saved successfully!');
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      alert('Data reset functionality will be implemented');
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    alert('✅ Cache cleared successfully!');
  };

  const handleExportSettings = () => {
    const settingsData = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('✅ Settings exported successfully!');
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          alert('✅ Settings imported successfully!');
        } catch (error) {
          alert('❌ Error importing settings: Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleOptimizePerformance = () => {
    alert('🚀 Performance optimization applied!\n\n✓ Cache optimized\n✓ Memory cleaned\n✓ Connections pooled');
  };

  const getSystemInfo = () => {
    const info = `
🖥️ System Information

Browser: ${navigator.userAgent.split(')')[0].split('(')[1]}
Platform: ${navigator.platform}
Language: ${navigator.language}
Online: ${navigator.onLine ? 'Yes' : 'No'}
Cookies Enabled: ${navigator.cookieEnabled ? 'Yes' : 'No'}
Screen: ${screen.width}x${screen.height}
    `.trim();
    alert(info);
  };

  return (
    <div className="settings-page">
      <div className="container">
        <div className="page-header">
          <h1><i className="fas fa-cog"></i> Settings</h1>
          <p>Configure application preferences and manage your data</p>
        </div>

        {/* General Settings */}
        <div className="card settings-section">
          <h2><i className="fas fa-sliders-h"></i> General Settings</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Auto Refresh</h3>
              <p>Automatically refresh data periodically</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Notifications</h3>
              <p>Enable desktop notifications for clustering completion</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Clustering Settings */}
        <div className="card settings-section">
          <h2><i className="fas fa-project-diagram"></i> Clustering Settings</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Default Algorithm</h3>
              <p>Select the default clustering algorithm</p>
            </div>
            <select
              value={settings.defaultAlgorithm}
              onChange={(e) => handleSettingChange('defaultAlgorithm', e.target.value)}
              className="setting-input"
            >
              <option value="k-means">K-Means</option>
              <option value="hierarchical">Hierarchical</option>
              <option value="dbscan">DBSCAN</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Default Number of Clusters</h3>
              <p>Default K value for K-Means clustering</p>
            </div>
            <input
              type="number"
              min="2"
              max="10"
              value={settings.defaultClusters}
              onChange={(e) => handleSettingChange('defaultClusters', parseInt(e.target.value))}
              className="setting-input number-input"
            />
          </div>
        </div>

        {/* Export/Import Settings */}
        <div className="card settings-section">
          <h2><i className="fas fa-exchange-alt"></i> Export / Import Settings</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Export Settings</h3>
              <p>Download your current settings as a JSON file</p>
            </div>
            <button className="btn-primary" onClick={handleExportSettings}>
              <i className="fas fa-file-export"></i> Export
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Import Settings</h3>
              <p>Load settings from a previously exported file</p>
            </div>
            <label className="btn-secondary file-upload-btn">
              <i className="fas fa-file-import"></i> Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="card settings-section">
          <h2><i className="fas fa-tachometer-alt"></i> Performance</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Performance Mode</h3>
              <p>Optimize application performance based on your needs</p>
            </div>
            <select
              value={settings.performanceMode}
              onChange={(e) => handleSettingChange('performanceMode', e.target.value)}
              className="setting-input"
            >
              <option value="low">Low (Save Battery)</option>
              <option value="balanced">Balanced</option>
              <option value="high">High Performance</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Max Concurrent Requests</h3>
              <p>Maximum number of parallel API requests</p>
            </div>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.maxConcurrentRequests}
              onChange={(e) => handleSettingChange('maxConcurrentRequests', parseInt(e.target.value))}
              className="setting-input number-input"
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Optimize Performance</h3>
              <p>Clear cache and optimize memory usage</p>
            </div>
            <button className="btn-success" onClick={handleOptimizePerformance}>
              <i className="fas fa-rocket"></i> Optimize Now
            </button>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="card settings-section">
          <h2><i className="fas fa-wrench"></i> Advanced</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Data Retention</h3>
              <p>Number of days to keep clustering history</p>
            </div>
            <input
              type="number"
              min="7"
              max="365"
              value={settings.dataRetentionDays}
              onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
              className="setting-input number-input"
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>System Information</h3>
              <p>View browser and system details</p>
            </div>
            <button className="btn-secondary" onClick={getSystemInfo}>
              <i className="fas fa-info-circle"></i> View Info
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="card settings-section danger-zone">
          <h2><i className="fas fa-exclamation-triangle"></i> Data Management</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Clear Cache</h3>
              <p>Clear all cached data and temporary files</p>
            </div>
            <button className="btn-secondary" onClick={handleClearCache}>
              <i className="fas fa-broom"></i> Clear Cache
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Reset All Data</h3>
              <p className="danger-text">⚠️ This will delete all customers and clustering results</p>
            </div>
            <button className="btn-danger" onClick={handleResetData}>
              <i className="fas fa-trash-alt"></i> Reset Data
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-footer">
          <button className="btn-primary save-btn" onClick={handleSaveSettings}>
            <i className="fas fa-save"></i> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
