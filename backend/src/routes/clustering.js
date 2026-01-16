const express = require('express');
const router = express.Router();
const clusteringController = require('../controllers/clusteringController');

// Clustering routes
router.post('/run', clusteringController.runClustering);
router.get('/elbow', clusteringController.getElbowData);
router.get('/results/latest', clusteringController.getLatestResults);
router.get('/results/history', clusteringController.getClusteringHistory);
router.get('/results/:resultId/visualizations', clusteringController.getVisualizations);
router.post('/predict', clusteringController.predictCluster);
router.get('/profiles', clusteringController.getClusterProfiles);
router.post('/sample-data', clusteringController.loadSampleData);

module.exports = router;
