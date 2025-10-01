import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../../services/api';
import './Fabrics.css';

const defaultForm = {
  name: '',
  type: 'cotton',
  color: '',
  colorCode: '',
  quantity: 0,
  unit: 'meter',
  pricePerUnit: 0,
  minStockLevel: 5
};

const Fabrics = () => {
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');

  const loadFabrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getFabrics({ search: query, limit: 50 });
      const items = res?.data?.data || res?.data || [];
      setFabrics(items);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load fabrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFabrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalInventoryValue = useMemo(() => {
    return fabrics.reduce((sum, f) => sum + (Number(f.quantity) * Number(f.pricePerUnit || 0)), 0);
  }, [fabrics]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await apiService.createFabric(form);
      setForm(defaultForm);
      await loadFabrics();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create fabric');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fabric?')) return;
    try {
      await apiService.deleteFabric(id);
      await loadFabrics();
    } catch (e) {
      alert(e?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="fabrics-page">
      <div className="page-header">
        <h2>Fabrics</h2>
        <div className="header-stats">
          <span>Total Items: {fabrics.length}</span>
          <span>Total Value: ₹{totalInventoryValue.toFixed(2)}</span>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search fabrics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={loadFabrics} disabled={loading}>Search</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="content-grid">
        <div className="list-card">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Color</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Price/Unit</th>
                  <th>Value</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {fabrics.map((f) => (
                  <tr key={f._id} className={f.isLowStock ? 'low-stock' : ''}>
                    <td>{f.name}</td>
                    <td>{f.type}</td>
                    <td>
                      <span className="color-dot" style={{ backgroundColor: f.colorCode || '#ccc' }} />
                      {f.color}
                    </td>
                    <td>{f.quantity}</td>
                    <td>{f.unit}</td>
                    <td>₹{Number(f.pricePerUnit || 0).toFixed(2)}</td>
                    <td>₹{(Number(f.quantity) * Number(f.pricePerUnit || 0)).toFixed(2)}</td>
                    <td>
                      <button className="danger" onClick={() => handleDelete(f._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="form-card">
          <h3>Add Fabric</h3>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-row">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['cotton','silk','wool','linen','polyester','rayon','denim','chiffon','georgette','crepe','satin','velvet','khadi','lycra','net','organza','taffeta','other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-row two">
              <div>
                <label>Color</label>
                <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              </div>
              <div>
                <label>Hex</label>
                <input value={form.colorCode} onChange={(e) => setForm({ ...form, colorCode: e.target.value })} placeholder="#RRGGBB" />
              </div>
            </div>
            <div className="form-row two">
              <div>
                <label>Quantity</label>
                <input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              </div>
              <div>
                <label>Unit</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  {['meter','yard','piece','kg','gram'].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row two">
              <div>
                <label>Price/Unit</label>
                <input type="number" min="0" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: Number(e.target.value) })} />
              </div>
              <div>
                <label>Min Stock</label>
                <input type="number" min="0" value={form.minStockLevel} onChange={(e) => setForm({ ...form, minStockLevel: Number(e.target.value) })} />
              </div>
            </div>

            <button type="submit" className="primary" disabled={creating}>{creating ? 'Saving...' : 'Add Fabric'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Fabrics;
