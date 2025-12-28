const axios = require('axios');
const Customer = require('../models/Customer');
const Cluster = require('../models/Cluster');
const ClusteringResult = require('../models/ClusteringResult');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// Run clustering analysis
exports.runClustering = async (req, res) => {
  try {
    const { algorithm = 'kmeans', params = {} } = req.body;

    // Get all customers from database
    const customers = await Customer.find({}).lean();

    if (customers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No customers found in database. Please add customers first.'
      });
    }

    // Prepare customer data for ML service
    const customerData = customers.map(c => ({
      CustomerID: c.CustomerID,
      Gender: c.Gender,
      Age: c.Age,
      AnnualIncome: c.AnnualIncome,
      SpendingScore: c.SpendingScore
    }));

    // Call ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/cluster`, {
      customers: customerData,
      algorithm,
      params
    });

    const mlData = mlResponse.data;

    // Save clustering result
    const clusteringResult = await ClusteringResult.create({
      Algorithm: algorithm,
      Parameters: params,
      Metrics: mlData.metrics,
      Visualizations: mlData.visualizations,
      FeatureNames: mlData.feature_names,
      PCAVarianceExplained: mlData.pca_variance_explained,
      Status: 'completed'
    });

    // Delete existing clusters before creating new ones to avoid duplicate key errors
    await Cluster.deleteMany({});

    // Save cluster profiles
    const clusterProfiles = [];
    for (const profile of mlData.cluster_profiles) {
      const cluster = await Cluster.create({
        ClusterID: profile.ClusterID,
        Label: profile.Label,
        Size: profile.Size,
        Percentage: profile.Percentage,
        Features: profile,
        Algorithm: algorithm
      });
      clusterProfiles.push(cluster._id);
    }

    clusteringResult.ClusterProfiles = clusterProfiles;
    await clusteringResult.save();

    // Update customer cluster assignments
    const bulkOps = mlData.customers_with_clusters.map(customer => ({
      updateOne: {
        filter: { CustomerID: customer.CustomerID },
        update: {
          $set: {
            ClusterID: customer.ClusterID,
            ClusterLabel: customer.ClusterLabel
          }
        }
      }
    }));

    await Customer.bulkWrite(bulkOps);

    res.json({
      success: true,
      data: {
        result_id: clusteringResult._id,
        algorithm,
        metrics: mlData.metrics,
        cluster_profiles: mlData.cluster_profiles,
        visualizations: mlData.visualizations,
        n_clusters: mlData.n_clusters
      }
    });

  } catch (error) {
    console.error('Clustering error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data
    });
  }
};

// Get elbow method data
exports.getElbowData = async (req, res) => {
  try {
    const { k_min = 2, k_max = 11 } = req.query;

    // Get customers
    const customers = await Customer.find({}).lean();

    if (customers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No customers found'
      });
    }

    const customerData = customers.map(c => ({
      CustomerID: c.CustomerID,
      Gender: c.Gender,
      Age: c.Age,
      AnnualIncome: c.AnnualIncome,
      SpendingScore: c.SpendingScore
    }));

    // Call ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/elbow`, {
      customers: customerData,
      k_min: parseInt(k_min),
      k_max: parseInt(k_max)
    });

    res.json({
      success: true,
      data: mlResponse.data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get latest clustering results
exports.getLatestResults = async (req, res) => {
  try {
    const { algorithm } = req.query;

    const filter = { Status: 'completed' };
    if (algorithm) {
      filter.Algorithm = algorithm;
    }

    const result = await ClusteringResult.findOne(filter)
      .sort({ createdAt: -1 })
      .populate('ClusterProfiles');

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'No clustering results found'
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all clustering history
exports.getClusteringHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const results = await ClusteringResult.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-Visualizations'); // Exclude large visualization data

    const total = await ClusteringResult.countDocuments();

    res.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get visualizations
exports.getVisualizations = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await ClusteringResult.findById(resultId);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found'
      });
    }

    res.json({
      success: true,
      data: {
        visualizations: result.Visualizations,
        algorithm: result.Algorithm,
        created: result.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Predict cluster for new customer
exports.predictCluster = async (req, res) => {
  try {
    const { customer, algorithm = 'kmeans' } = req.body;

    if (!customer) {
      return res.status(400).json({
        success: false,
        error: 'Customer data required'
      });
    }

    // Call ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/predict`, {
      customer,
      algorithm
    });

    res.json({
      success: true,
      data: mlResponse.data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get cluster profiles summary
exports.getClusterProfiles = async (req, res) => {
  try {
    const latestResult = await ClusteringResult.findOne({ Status: 'completed' })
      .sort({ createdAt: -1 })
      .populate('ClusterProfiles');

    if (!latestResult) {
      return res.status(404).json({
        success: false,
        error: 'No clustering results found'
      });
    }

    res.json({
      success: true,
      data: {
        algorithm: latestResult.Algorithm,
        metrics: latestResult.Metrics,
        profiles: latestResult.ClusterProfiles,
        created: latestResult.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Load sample data
exports.loadSampleData = async (req, res) => {
  try {
    // Get sample data from ML service
    const mlResponse = await axios.get(`${ML_SERVICE_URL}/api/sample-data`);
    const sampleCustomers = mlResponse.data.customers;

    // Clear existing customers (optional - based on query param)
    if (req.query.clearExisting === 'true') {
      await Customer.deleteMany({});
    }

    // Bulk insert sample customers
    const operations = sampleCustomers.map(customer => ({
      updateOne: {
        filter: { CustomerID: customer.CustomerID },
        update: { $set: customer },
        upsert: true
      }
    }));

    const result = await Customer.bulkWrite(operations);

    res.json({
      success: true,
      message: 'Sample data loaded successfully',
      stats: {
        inserted: result.upsertedCount,
        updated: result.modifiedCount,
        total: sampleCustomers.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
