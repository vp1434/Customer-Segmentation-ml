const Customer = require('../models/Customer');

// Get all customers with pagination
exports.getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};

    // Optional filters
    if (req.query.clusterId) {
      filter.ClusterID = parseInt(req.query.clusterId);
    }
    if (req.query.gender) {
      filter.Gender = req.query.gender;
    }

    const customers = await Customer.find(filter)
      .limit(limit)
      .skip(skip)
      .sort({ CustomerID: 1 });

    const total = await Customer.countDocuments(filter);

    res.json({
      success: true,
      data: customers,
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

// Get single customer
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      CustomerID: parseInt(req.params.id)
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const { CustomerID, Gender, Age, AnnualIncome, SpendingScore } = req.body;

    // Check if customer already exists
    const exists = await Customer.findOne({ CustomerID });
    if (exists) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID already exists'
      });
    }

    const customer = await Customer.create({
      CustomerID,
      Gender,
      Age,
      AnnualIncome,
      SpendingScore
    });

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { CustomerID: parseInt(req.params.id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      CustomerID: parseInt(req.params.id)
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Bulk import customers
exports.bulkImport = async (req, res) => {
  try {
    const { customers } = req.body;

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid customers data'
      });
    }

    // Use bulkWrite for efficient upsert
    const operations = customers.map(customer => ({
      updateOne: {
        filter: { CustomerID: customer.CustomerID },
        update: { $set: customer },
        upsert: true
      }
    }));

    const result = await Customer.bulkWrite(operations);

    res.json({
      success: true,
      message: 'Bulk import completed',
      stats: {
        inserted: result.upsertedCount,
        updated: result.modifiedCount,
        total: customers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get customer statistics
exports.getStatistics = async (req, res) => {
  try {
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          avgAge: { $avg: '$Age' },
          avgIncome: { $avg: '$AnnualIncome' },
          avgSpending: { $avg: '$SpendingScore' },
          minAge: { $min: '$Age' },
          maxAge: { $max: '$Age' },
          minIncome: { $min: '$AnnualIncome' },
          maxIncome: { $max: '$AnnualIncome' }
        }
      }
    ]);

    const clusterStats = await Customer.aggregate([
      {
        $match: { ClusterID: { $ne: null } }
      },
      {
        $group: {
          _id: '$ClusterID',
          count: { $sum: 1 },
          label: { $first: '$ClusterLabel' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {},
        clusters: clusterStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
