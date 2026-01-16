# Customer Segmentation - MongoDB Setup Guide

## MongoDB Installation Options

### Option 1: Local MongoDB (Recommended for Development)

#### Windows
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer (MSI file)
3. Choose "Complete" installation
4. Install MongoDB as a Windows Service (check the box)
5. MongoDB will start automatically

**Verify Installation:**
```bash
mongo --version
```

**Default Connection String:**
```
mongodb://localhost:27017/customer-segmentation
```

### Option 2: MongoDB Atlas (Cloud - Free Tier Available)

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Wait for cluster to be created (2-3 minutes)
5. Click "Connect" → "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Update `backend/.env` file:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/customer-segmentation?retryWrites=true&w=majority
```

**Important:** Add your IP address to the whitelist (or use 0.0.0.0/0 for development)

## Verifying MongoDB Connection

### Method 1: Using MongoDB Compass (GUI)
1. Download from: https://www.mongodb.com/try/download/compass
2. Connect using your connection string
3. You should see the `customer-segmentation` database after running the app

### Method 2: Using Command Line
```bash
# Local MongoDB
mongo

# MongoDB Atlas
mongo "mongodb+srv://cluster0.xxxxx.mongodb.net/customer-segmentation" --username <your-username>
```

## Database Schema

The application will automatically create these collections:

### customers
```javascript
{
  CustomerID: Number,
  Gender: String,
  Age: Number,
  AnnualIncome: Number,
  SpendingScore: Number,
  ClusterID: Number,
  ClusterLabel: String,
  createdAt: Date,
  updatedAt: Date
}
```

### clusters
```javascript
{
  ClusterID: Number,
  Label: String,
  Description: String,
  Size: Number,
  Percentage: Number,
  Features: Object,
  Algorithm: String,
  createdAt: Date,
  updatedAt: Date
}
```

### clusteringresults
```javascript
{
  Algorithm: String,
  Parameters: Object,
  Metrics: Object,
  Visualizations: Object,
  FeatureNames: Array,
  Status: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### Connection Refused
- Ensure MongoDB service is running
- Check if port 27017 is available
- Try: `net start MongoDB` (Windows) or `sudo systemctl start mongod` (Linux)

### Authentication Failed
- Verify username and password in connection string
- Check database user permissions in MongoDB Atlas
- Ensure IP whitelist includes your IP

### Database Not Found
- The database will be created automatically when first data is inserted
- No need to manually create the database

## Sample Data

The application includes a "Load Sample Data" feature that will:
- Generate 200 sample customers
- Insert them into MongoDB
- Ready for clustering analysis

## MongoDB Commands Reference

```javascript
// Show all databases
show dbs

// Use customer segmentation database
use customer-segmentation

// Show collections
show collections

// Count customers
db.customers.countDocuments()

// Find all customers in cluster 0
db.customers.find({ ClusterID: 0 })

// Get statistics
db.customers.aggregate([
  {
    $group: {
      _id: null,
      avgAge: { $avg: "$Age" },
      avgIncome: { $avg: "$AnnualIncome" },
      total: { $sum: 1 }
    }
  }
])

// Delete all data (reset)
db.customers.deleteMany({})
db.clusters.deleteMany({})
db.clusteringresults.deleteMany({})
```

## Backup & Restore

### Backup
```bash
mongodump --db customer-segmentation --out ./backup
```

### Restore
```bash
mongorestore --db customer-segmentation ./backup/customer-segmentation
```

---

**Need Help?** Check the main [README.md](file:///c:/Users/user/Desktop/cs/customer-segmentation/README.md) for more information.
