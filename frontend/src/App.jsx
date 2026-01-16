import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ClusterAnalysis from './pages/ClusterAnalysis';
import Customers from './pages/Customers';
import Campaigns from './pages/Campaigns';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analysis" element={<ClusterAnalysis />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="container">
            <p>Customer Segmentation System © 2025 | Powered by ML Clustering</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
