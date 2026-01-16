const mongoose = require('mongoose');

const clusterSchema = new mongoose.Schema({
  ClusterID: {
    type: Number,
    required: true,
    unique: true
  },
  Label: {
    type: String,
    required: true
  },
  Description: {
    type: String,
    default: ''
  },
  CustomerCount: {
    type: Number,
    default: 0
  },
  Size: {
    type: Number,
    default: 0
  },
  Percentage: {
    type: Number,
    default: 0
  },
  // Average feature values
  Features: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Marketing recommendations
  MarketingRecommendations: [{
    type: String
  }],
  // Metadata about clustering run
  Algorithm: {
    type: String,
    enum: ['kmeans', 'hierarchical', 'dbscan'],
    required: true
  },
  CreatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient lookups
clusterSchema.index({ ClusterID: 1, CreatedAt: -1 });

const Cluster = mongoose.model('Cluster', clusterSchema);

module.exports = Cluster;
