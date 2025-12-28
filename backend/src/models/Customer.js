const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  CustomerID: {
    type: Number,
    required: true,
    unique: true
  },
  Gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Other'
  },
  Age: {
    type: Number,
    required: true,
    min: 0,
    max: 120
  },
  AnnualIncome: {
    type: Number,
    required: true,
    min: 0
  },
  SpendingScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  ClusterID: {
    type: Number,
    default: null
  },
  ClusterLabel: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
customerSchema.index({ CustomerID: 1 });
customerSchema.index({ ClusterID: 1 });
customerSchema.index({ AnnualIncome: 1, SpendingScore: 1 });

// Virtual for full profile
customerSchema.virtual('profile').get(function () {
  return {
    id: this.CustomerID,
    demographics: {
      gender: this.Gender,
      age: this.Age
    },
    financial: {
      income: this.AnnualIncome,
      spending: this.SpendingScore
    },
    segment: {
      clusterId: this.ClusterID,
      label: this.ClusterLabel
    }
  };
});

// Instance method to update cluster assignment
customerSchema.methods.assignCluster = function (clusterId, clusterLabel) {
  this.ClusterID = clusterId;
  this.ClusterLabel = clusterLabel;
  return this.save();
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
