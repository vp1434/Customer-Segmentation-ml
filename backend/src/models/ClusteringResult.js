const mongoose = require('mongoose');

const clusteringResultSchema = new mongoose.Schema({
  Algorithm: {
    type: String,
    enum: ['kmeans', 'hierarchical', 'dbscan'],
    required: true
  },
  Parameters: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  Metrics: {
    silhouette_score: Number,
    davies_bouldin_score: Number,
    calinski_harabasz_score: Number,
    n_clusters: Number,
    n_samples: Number,
    n_noise_points: Number
  },
  ClusterProfiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster'
  }],
  Visualizations: {
    elbow_curve: String,
    clusters_2d: String,
    feature_distributions: String,
    cluster_profiles: String,
    correlation_heatmap: String
  },
  FeatureNames: [String],
  PCAVarianceExplained: [Number],
  Status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  ErrorMessage: String
}, {
  timestamps: true
});

// Index for recent results
clusteringResultSchema.index({ createdAt: -1 });
clusteringResultSchema.index({ Algorithm: 1, Status: 1 });

const ClusteringResult = mongoose.model('ClusteringResult', clusteringResultSchema);

module.exports = ClusteringResult;
