# Customer Segmentation Project - Quick Start

## Installation Steps

Run these commands in order:

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Install Python ML Dependencies
```bash
cd ml-service
pip install -r requirements.txt
```

## Starting the Application

You need to start all three services. Open **3 separate terminals**:

### Terminal 1: Start MongoDB
```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, skip this step
```

### Terminal 2: Start ML Service
```bash
cd ml-service
python app.py
```
ML Service runs on: http://localhost:5001

### Terminal 3: Start Backend API
```bash
cd backend
npm run dev
```
Backend API runs on: http://localhost:5000

### Terminal 4: Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

## First-Time Setup

1. Open the frontend at http://localhost:5173
2. Click "Load Sample Data" on the Dashboard to add 200 sample customers
3. Go to "Analysis" page
4. Click "Show Elbow Method" to find optimal K
5. Click "Run Clustering" to perform analysis
6. Explore the visualizations and segments!

## Environment Configuration

### Backend `.env`
```
MONGODB_URI=mongodb://localhost:27017/customer-segmentation
ML_SERVICE_URL=http://localhost:5001
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env` (optional)
```
VITE_API_URL=http://localhost:5000
```

Happy clustering! 🎯📊
