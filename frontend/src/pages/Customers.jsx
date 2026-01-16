import { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import './Customers.css';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filterCluster, setFilterCluster] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [page, filterCluster]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filterCluster) params.clusterId = filterCluster;

      const response = await customerAPI.getAll(params);
      setCustomers(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;

    try {
      await customerAPI.delete(id);
      alert('✅ Customer deleted');
      fetchCustomers();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());

        // Skip header row
        const dataLines = lines.slice(1);

        const customers = dataLines.map((line, index) => {
          const [CustomerID, Gender, Age, AnnualIncome, SpendingScore] = line.split(',').map(val => val.trim());

          return {
            CustomerID: parseInt(CustomerID) || (1000 + index),
            Gender,
            Age: parseInt(Age),
            AnnualIncome: parseInt(AnnualIncome),
            SpendingScore: parseInt(SpendingScore)
          };
        }).filter(c => c.Age && c.AnnualIncome && c.SpendingScore);

        if (customers.length === 0) {
          alert('❌ No valid customer data found in CSV');
          return;
        }

        // Import customers via API
        setLoading(true);
        await customerAPI.bulkImport(customers);
        alert(`✅ Successfully imported ${customers.length} customers!`);
        fetchCustomers();

        // Reset file input
        event.target.value = '';
      } catch (err) {
        alert('❌ Error importing CSV: ' + err.message);
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="customers-page">
      <div className="container">
        <div className="page-header mb-lg">
          <div>
            <h1>Customer Management</h1>
            <p>View and manage customer data</p>
          </div>
          <div className="flex gap-md">
            <label className="btn btn-primary csv-upload-btn">
              <i className="fas fa-file-csv"></i> Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                style={{ display: 'none' }}
              />
            </label>
            <select
              value={filterCluster}
              onChange={(e) => setFilterCluster(e.target.value)}
              className="filter-select"
            >
              <option value="">All Clusters</option>
              <option value="0">Cluster 0</option>
              <option value="1">Cluster 1</option>
              <option value="2">Cluster 2</option>
              <option value="3">Cluster 3</option>
              <option value="4">Cluster 4</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading customers...</p>
          </div>
        ) : (
          <>
            <div className="glass-card">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Income ($k)</th>
                      <th>Spending Score</th>
                      <th>Cluster</th>
                      <th>Label</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id}>
                        <td>{customer.CustomerID}</td>
                        <td>{customer.Gender}</td>
                        <td>{customer.Age}</td>
                        <td>${customer.AnnualIncome}k</td>
                        <td>
                          <span className="badge badge-primary">
                            {customer.SpendingScore}
                          </span>
                        </td>
                        <td>
                          {customer.ClusterID !== null ? (
                            <span className="badge badge-success">
                              {customer.ClusterID}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <span className="cluster-label-text">
                            {customer.ClusterLabel || '-'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(customer.CustomerID)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="pagination mt-lg">
              <button
                className="btn btn-secondary"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
                ({pagination.total} total)
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= pagination.pages}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Customers;
