import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import './JobCards.css';

const JobCards = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [showCreateJobCard, setShowCreateJobCard] = useState(false);
  
  const openPdf = async (id) => {
    try {
      const res = await apiService.getJobCardPDF(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to generate PDF');
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getJobCards({ ...filters, limit: 50 });
      const items = res?.data?.data || res?.data || [];
      setJobs(items);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load job cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await apiService.updateJobCardStatus(id, status);
      await loadJobs();
    } catch (e) {
      alert(e?.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <div className="jobcards-page">
      <div className="page-header">
        <h2>Job Cards</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateJobCard(true)}
        >
          Create Job Card
        </button>
      </div>

      <div className="toolbar">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {['assigned','cutting','stitching','finishing','trial','ready','delivered','on_hold'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priority</option>
          {['low','medium','high','urgent'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <button onClick={loadJobs} disabled={loading}>Apply</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="list-card">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Garment</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Delivery</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j._id}>
                  <td>{j.jobNumber}</td>
                  <td>{j.garment?.name} ({j.garment?.type}) ×{j.garment?.quantity}</td>
                  <td>{j.assignedTo?.name || '-'}</td>
                  <td>
                    <select value={j.status} onChange={(e) => updateStatus(j._id, e.target.value)}>
                      {['assigned','cutting','stitching','finishing','trial','ready','delivered','on_hold'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>{j.deliveryDate ? new Date(j.deliveryDate).toLocaleDateString() : '-'}</td>
                  <td>
                    <button className="btn" onClick={() => openPdf(j._id)}>PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Simple Create Job Card Modal */}
      {showCreateJobCard && (
        <div className="modal-overlay" onClick={() => setShowCreateJobCard(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create Job Card</h3>
            <p>Job cards are typically generated from orders using the "Job Cards" button in the Orders table.</p>
            <p>To create a job card:</p>
            <ol>
              <li>Go to Orders</li>
              <li>Find the order you want to create job cards for</li>
              <li>Click the "Job Cards" button in the Actions column</li>
            </ol>
            <div className="modal-actions">
              <button onClick={() => setShowCreateJobCard(false)}>Close</button>
              <button onClick={() => {
                setShowCreateJobCard(false);
                window.location.href = '/orders';
              }}>Go to Orders</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCards;
