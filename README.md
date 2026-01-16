# Customer Segmentation System

A comprehensive full-stack application for customer segmentation using unsupervised machine learning clustering algorithms. The system includes a Python ML service, Node.js backend API, and modern React frontend with interactive visualizations.

## 🌟 Features

### Machine Learning
- **K-Means Clustering** with elbow method optimization
- **Hierarchical Clustering** with dendrogram visualization
- **DBSCAN** for density-based clustering
- Automatic cluster profiling and labeling
- PCA and t-SNE dimensionality reduction for visualization
- Comprehensive clustering metrics (Silhouette score, Davies-Bouldin, Calinski-Harabasz)

### Backend API
- RESTful API with Express.js
- MongoDB integration for data persistence
- Customer CRUD operations
- Clustering results management
- Real-time integration with ML service

### Frontend Application
- Premium dark theme with glassmorphism effects
- Interactive dashboards and analytics
- Real-time cluster visualizations
- Customer management interface
- Campaign targeting tools
- Fully responsive design

## 📋 Prerequisites

- **Python 3.8+** (for ML service)
- **Node.js 18+** (for backend and frontend)
- **MongoDB 6.0+** (local or cloud instance)

## 🚀 Installation & Setup

### 1. ML Service (Python)

```bash
cd ml-service

# Install dependencies
pip install -r requirements.txt

# Start the ML service
python app.py
```

The ML service will run on `http://localhost:5001`

### 2. Backend API (Node.js)

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file and set your MongoDB URI

# Start the server
npm run dev
```

The backend API will run on `http://localhost:5000`

### 3. Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod --dbpath /path/to/data
```

**Option B: MongoDB Atlas (Cloud)**
- Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Update `MONGODB_URI` in `backend/.env` with your connection string

## 📊 Usage Guide

### 1. Load Sample Data
- Navigate to the Dashboard
- Click "Load Sample Data" to import 200 sample customers

### 2. Run Clustering Analysis
- Go to the "Analysis" page
- Select clustering algorithm (K-Means, Hierarchical, or DBSCAN)
- Configure parameters
- Click "Show Elbow Method" to find optimal K (for K-Means)
- Click "Run Clustering" to perform analysis

### 3. View Results
- Review clustering metrics (Silhouette score, etc.)
- Explore 2D cluster visualizations
- Analyze feature distributions
- Review cluster profiles with automatic labels

### 4. Manage Customers
- View all customers in the "Customers" page
- Filter by cluster
- Add, edit, or delete customers
- View cluster assignments

### 5. Create Campaigns
- Navigate to "Campaigns"
- View segment-specific marketing recommendations
- Create targeted campaigns for specific clusters
- Export customer lists

## 🏗️ Project Structure

```
customer-segmentation/
├── ml-service/              # Python ML microservice
│   ├── app.py              # Flask API
│   ├── clustering.py       # Clustering algorithms
│   ├── preprocessing.py    # Data preprocessing
│   ├── visualization.py    # Plot generation
│   └── requirements.txt
│
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   └── config/         # Database config
│   └── package.json
│
├── frontend/                # React + Vite app
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API integration
│   │   └── index.css       # Premium CSS theme
│   └── package.json
│
└── data/                    # Data storage
    ├── raw/                # Original datasets
    ├── processed/          # Processed data
    └── models/             # Saved ML models
```

## 🔧 API Endpoints

### Customer API
- `GET /api/customers` - List customers with pagination
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/statistics` - Get customer statistics

### Clustering API
- `POST /api/clustering/run` - Run clustering analysis
- `GET /api/clustering/elbow` - Get elbow method data
- `GET /api/clustering/results/latest` - Get latest results
- `GET /api/clustering/profiles` - Get cluster profiles
- `POST /api/clustering/predict` - Predict cluster for new customer
- `POST /api/clustering/sample-data` - Load sample dataset

### ML Service API
- `POST /api/cluster` - Perform clustering
- `POST /api/elbow` - Compute elbow method
- `POST /api/predict` - Predict cluster
- `GET /api/sample-data` - Generate sample data
- `POST /api/visualizations` - Generate visualizations

## 📈 Clustering Metrics Explained

- **Silhouette Score** (0 to 1): Measures how well-separated clusters are. Higher is better. >0.5 is good.
- **Davies-Bouldin Index**: Lower values indicate better separation. <1.0 is good.
- **Calinski-Harabasz Score**: Higher values indicate better-defined clusters.

## 🎨 Technologies Used

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Axios for HTTP requests

### Frontend
- React 18
- React Router
- Axios
- Recharts / Chart.js
- Modern CSS with custom properties

### ML Service
- Python 3.8+
- Flask + Flask-CORS
- scikit-learn
- pandas, numpy
- matplotlib, seaborn

## 🐛 Troubleshooting

### ML Service Connection Error
- Ensure Python service is running on port 5001
- Check `ML_SERVICE_URL` in backend `.env`

### MongoDB Connection Error
- Verify MongoDB is running
- Check `MONGODB_URI` in backend `.env`
- Ensure network access if using MongoDB Atlas

### Frontend API Errors
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify `VITE_API_URL` is set correctly

## 📝 License

MIT License - Feel free to use this project for learning and comercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using ML, MongoDB, Node.js, and React**
