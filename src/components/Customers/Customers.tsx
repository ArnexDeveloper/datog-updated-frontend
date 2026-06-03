import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [profileCustomer, setProfileCustomer] = useState<any>(null);
  const [creditData, setCreditData] = useState<{ storeCredit: number; loyaltyPoints: number; transactions: any[] } | null>(null);
  const [creditLoading, setCreditLoading] = useState(false);
  const [addCreditAmount, setAddCreditAmount] = useState('');
  const [addCreditDesc, setAddCreditDesc] = useState('');
  const [addCreditLoading, setAddCreditLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    isActive: 'all',
    gender: 'all'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    dateOfBirth: '',
    anniversary: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    preferences: {
      preferredFabrics: [],
      specialInstructions: ''
    }
  });

  useEffect(() => {
    loadCustomers();
  }, [filters]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        isActive: filters.isActive,
        gender: filters.gender !== 'all' ? filters.gender : undefined
      };
      const response = await apiService.getCustomers(params);
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (err: any) {
      console.error('Error loading customers:', err);

      // Extract detailed error message
      let errorMessage = 'Failed to load customers';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers();
  };

  const handleAddCustomer = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: 'male',
      dateOfBirth: '',
      anniversary: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      preferences: {
        preferredFabrics: [],
        specialInstructions: ''
      }
    });
    setEditingCustomer(null);
    setError(null);
    setSuccess(null);
    setActiveTab('basic');
    setShowAddForm(true);
  };

  const handleEditCustomer = (customer: any) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      gender: customer.gender,
      dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '',
      anniversary: customer.anniversary ? new Date(customer.anniversary).toISOString().split('T')[0] : '',
      address: customer.address || {
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      preferences: customer.preferences || {
        preferredFabrics: [],
        specialInstructions: ''
      }
    });
    setEditingCustomer(customer);
    setError(null);
    setSuccess(null);
    setActiveTab('basic');
    setShowAddForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null); // Clear previous errors

      // Clean the data - remove optional fields if they're empty
      const cleanedData = { ...formData };

      // Remove email if empty
      if (!cleanedData.email || cleanedData.email.trim() === '') {
        delete cleanedData.email;
      }

      // Remove dateOfBirth if empty
      if (!cleanedData.dateOfBirth || cleanedData.dateOfBirth.trim() === '') {
        delete cleanedData.dateOfBirth;
      }

      // Remove anniversary if empty
      if (!cleanedData.anniversary || cleanedData.anniversary.trim() === '') {
        delete cleanedData.anniversary;
      }

      if (editingCustomer) {
        await apiService.updateCustomer(editingCustomer._id, cleanedData);
        setSuccess('Customer updated successfully!');
      } else {
        await apiService.createCustomer(cleanedData);
        setSuccess('Customer created successfully!');
      }
      setError(null); // Clear any errors on success
      loadCustomers();

      // Close modal after showing success message for 1.5 seconds
      setTimeout(() => {
        setShowAddForm(false);
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error('Error saving customer:', err);

      // Extract detailed error message from the response
      let errorMessage = editingCustomer ? 'Failed to update customer' : 'Failed to create customer';

      if (err.response?.data) {
        // If there's a message from the backend, use it
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }

        // If there are validation errors, format them nicely
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          const validationErrors = err.response.data.errors
            .map((e: any) => `${e.path}: ${e.msg}`)
            .join(', ');
          errorMessage = `Validation Error: ${validationErrors}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await apiService.deleteCustomer(customerId);
        setSuccess('Customer deleted successfully!');
        setError(null);
        loadCustomers();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        console.error('Error deleting customer:', err);

        // Extract detailed error message
        let errorMessage = 'Failed to delete customer';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setSuccess(null);
      }
    }
  };

  const openProfile = async (customer: any) => {
    setProfileCustomer(customer);
    setCreditData(null);
    setCreditLoading(true);
    setAddCreditAmount('');
    setAddCreditDesc('');
    try {
      const res = await (apiService as any).getCustomerCredit(customer._id);
      if (res.data.success) setCreditData(res.data.data);
    } catch { setCreditData({ storeCredit: 0, loyaltyPoints: 0, transactions: [] }); }
    finally { setCreditLoading(false); }
  };

  const handleAddCredit = async () => {
    if (!addCreditAmount || parseFloat(addCreditAmount) <= 0 || !profileCustomer) return;
    try {
      setAddCreditLoading(true);
      const res = await (apiService as any).addManualCredit(profileCustomer._id, {
        amount: parseFloat(addCreditAmount),
        description: addCreditDesc || 'Manual credit'
      });
      if (res.data.success) {
        setAddCreditAmount('');
        setAddCreditDesc('');
        const refresh = await (apiService as any).getCustomerCredit(profileCustomer._id);
        if (refresh.data.success) setCreditData(refresh.data.data);
      }
    } catch { setError('Failed to add credit'); }
    finally { setAddCreditLoading(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="customers-loading">
        <div className="spinner"></div>
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="customers">
      <div className="customers-header">
        <h1>Customer Management</h1>
        <button className="btn btn-primary" onClick={handleAddCustomer}>
          + Add Customer
        </button>
      </div>

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess(null)} className="alert-close">×</button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="customers-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>

        <div className="filters">
          <select
            value={filters.isActive}
            onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select
            value={filters.gender}
            onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
            className="filter-select"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Total Orders</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer._id}>
                <td className="customer-name">{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td className="gender">
                  {customer.gender?.charAt(0).toUpperCase() + customer.gender?.slice(1) || 'N/A'}
                </td>
                <td>{customer.totalOrders || 0}</td>
                <td>
                  <span className={`status ${customer.isActive ? 'active' : 'inactive'}`}>
                    {customer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm"
                      style={{ background: '#065f46', color: '#fff', border: 'none' }}
                      onClick={() => openProfile(customer)}
                    >
                      Profile
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditCustomer(customer)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteCustomer(customer._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Card Layout */}
        <div className="customers-mobile-cards">
          {customers.map(customer => (
            <div key={customer._id} className="customer-mobile-card">
              <div className="customer-mobile-header">
                <div className="customer-mobile-info">
                  <h3>{customer.name}</h3>
                  <p>{customer.phone}</p>
                </div>
                <div className="customer-mobile-status">
                  <span className={`status ${customer.isActive ? 'active' : 'inactive'}`}>
                    {customer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="customer-mobile-details">
                <div className="customer-mobile-detail">
                  <span className="label">Email</span>
                  <span className="value">{customer.email || 'N/A'}</span>
                </div>
                <div className="customer-mobile-detail">
                  <span className="label">Gender</span>
                  <span className="value">
                    {customer.gender?.charAt(0).toUpperCase() + customer.gender?.slice(1) || 'N/A'}
                  </span>
                </div>
                <div className="customer-mobile-detail">
                  <span className="label">Orders</span>
                  <span className="value">{customer.totalOrders || 0}</span>
                </div>
              </div>

              <div className="customer-mobile-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleEditCustomer(customer)}
                >
                  Edit Customer
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteCustomer(customer._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {customers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No customers found</h3>
            <p>Start by adding your first customer</p>
            <button className="btn btn-primary" onClick={handleAddCustomer}>
              Add Customer
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
            </div>

            <form onSubmit={handleFormSubmit} className="customer-form">
              {success && (
                <div className="alert alert-success">
                  {success}
                  <button type="button" onClick={() => setSuccess(null)} className="alert-close">×</button>
                </div>
              )}
              {error && (
                <div className="alert alert-error">
                  {error}
                  <button type="button" onClick={() => setError(null)} className="alert-close">×</button>
                </div>
              )}

              <div className="modal-tabs">
                <button type="button" className={`modal-tab ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>
                  Basic Info
                </button>
                <button type="button" className={`modal-tab ${activeTab === 'address' ? 'active' : ''}`} onClick={() => setActiveTab('address')}>
                  Address & Dates
                </button>
                <button type="button" className={`modal-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                  Notes
                </button>
              </div>

              {activeTab === 'basic' && (
                <div className="tab-panel">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name <span className="required">*</span></label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="gender">Gender</label>
                      <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number <span className="required">*</span></label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="customer@example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'address' && (
                <div className="tab-panel">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dateOfBirth">Date of Birth <span className="optional-label">(Optional)</span></label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="anniversary">Anniversary <span className="optional-label">(Optional)</span></label>
                      <input
                        type="date"
                        id="anniversary"
                        name="anniversary"
                        value={formData.anniversary}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="address.street">Street Address</label>
                    <textarea
                      id="address.street"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="House/Flat No., Building Name, Street"
                    />
                  </div>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label htmlFor="address.city">City</label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address.state">State</label>
                      <input
                        type="text"
                        id="address.state"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        placeholder="State"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address.pincode">Pincode</label>
                      <input
                        type="text"
                        id="address.pincode"
                        name="address.pincode"
                        value={formData.address.pincode}
                        onChange={handleInputChange}
                        placeholder="400001"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="tab-panel">
                  <div className="form-group">
                    <label htmlFor="preferences.specialInstructions">Special Instructions</label>
                    <textarea
                      id="preferences.specialInstructions"
                      name="preferences.specialInstructions"
                      value={formData.preferences.specialInstructions}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Any special requirements, fabric preferences, or notes..."
                    />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                {activeTab !== 'basic' && (
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveTab(activeTab === 'notes' ? 'address' : 'basic')}>
                    ← Prev
                  </button>
                )}
                {activeTab !== 'notes' && (
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveTab(activeTab === 'basic' ? 'address' : 'notes')}>
                    Next →
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (editingCustomer ? 'Update Customer' : 'Add Customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Customer Credit Profile Modal ── */}
      {profileCustomer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{profileCustomer.name}</h2>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{profileCustomer.phone}{profileCustomer.email ? ` · ${profileCustomer.email}` : ''}</p>
              </div>
              <button onClick={() => setProfileCustomer(null)}
                style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', color: '#374151' }}>
                Close
              </button>
            </div>

            <div style={{ padding: '16px 20px' }}>
              {creditLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>Loading credit data…</div>
              ) : (
                <>
                  {/* Hero cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {/* Loyalty Points */}
                    <div style={{ background: '#1d4ed8', borderRadius: 10, padding: '14px 16px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', right: -10, top: -10, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 3 }}>Loyalty Points Balance</div>
                      <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1 }}>
                        {creditData?.loyaltyPoints ?? profileCustomer.loyaltyPoints ?? 0}{' '}
                        <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.8 }}>pts</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 5, padding: '3px 9px', fontSize: 10, display: 'inline-block', marginTop: 6 }}>
                        = ₹{creditData?.loyaltyPoints ?? profileCustomer.loyaltyPoints ?? 0} discount
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 7, paddingTop: 7, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        Earn 1.5 pts per ₹100 spent
                      </div>
                    </div>
                    {/* Store Credit */}
                    <div style={{ background: '#065f46', borderRadius: 10, padding: '14px 16px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', right: -10, top: -10, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 3 }}>Store Credit Balance</div>
                      <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1 }}>
                        ₹{(creditData?.storeCredit ?? profileCustomer.storeCredit ?? 0).toFixed(2)}
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 5, padding: '3px 9px', fontSize: 10, display: 'inline-block', marginTop: 6 }}>
                        Ready to use at checkout
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 7, paddingTop: 7, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        Never expires · No conditions
                      </div>
                    </div>
                  </div>

                  {/* History tables */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* Points History (computed from totalSpent for display) */}
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, padding: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                        ⭐ Points Summary
                      </div>
                      <div style={{ fontSize: 12, color: '#374151' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f3f4f6' }}>
                          <span style={{ color: '#6b7280' }}>Total Spent</span>
                          <span style={{ fontWeight: 600 }}>₹{(profileCustomer.totalSpent || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f3f4f6' }}>
                          <span style={{ color: '#6b7280' }}>Total Orders</span>
                          <span style={{ fontWeight: 600 }}>{profileCustomer.totalOrders || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                          <span style={{ color: '#6b7280' }}>Current Points</span>
                          <span style={{ fontWeight: 700, color: '#2563eb' }}>{creditData?.loyaltyPoints ?? 0} pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Credit History */}
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, padding: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                        💳 Credit History
                      </div>
                      {creditData?.transactions && creditData.transactions.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                          <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                              {['Date', 'Type', 'Amount', 'Balance'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '5px 6px', color: '#6b7280', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {creditData.transactions.map((tx: any) => (
                              <tr key={tx._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '5px 6px', color: '#374151' }}>{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                <td style={{ padding: '5px 6px', color: '#374151', fontSize: 10 }}>
                                  {tx.transactionType === 'credit_added' ? 'Added' : tx.transactionType === 'credit_used' ? 'Used' : 'Refund'}
                                </td>
                                <td style={{ padding: '5px 6px' }}>
                                  <span style={{ background: tx.transactionType === 'credit_used' ? '#fee2e2' : '#dcfce7', color: tx.transactionType === 'credit_used' ? '#dc2626' : '#15803d', fontSize: 10, padding: '1px 6px', borderRadius: 3, fontWeight: 600 }}>
                                    {tx.transactionType === 'credit_used' ? '−' : '+'}₹{Math.abs(tx.amount).toFixed(0)}
                                  </span>
                                </td>
                                <td style={{ padding: '5px 6px', fontWeight: 600, color: '#374151' }}>₹{(tx.balanceAfter || 0).toFixed(0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', padding: '10px 0' }}>No credit transactions yet</p>
                      )}

                      {/* Add Manual Credit */}
                      <div style={{ marginTop: 12, borderTop: '1px solid #e5e7eb', paddingTop: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6 }}>+ Add Manual Credit</div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                          <input
                            type="number"
                            placeholder="Amount (₹)"
                            value={addCreditAmount}
                            onChange={e => setAddCreditAmount(e.target.value)}
                            style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 6, padding: '5px 8px', fontSize: 11 }}
                          />
                          <input
                            type="text"
                            placeholder="Reason (optional)"
                            value={addCreditDesc}
                            onChange={e => setAddCreditDesc(e.target.value)}
                            style={{ flex: 2, border: '1px solid #d1d5db', borderRadius: 6, padding: '5px 8px', fontSize: 11 }}
                          />
                        </div>
                        <button
                          onClick={handleAddCredit}
                          disabled={!addCreditAmount || parseFloat(addCreditAmount) <= 0 || addCreditLoading}
                          style={{ width: '100%', background: addCreditAmount && parseFloat(addCreditAmount) > 0 ? '#065f46' : '#9ca3af', color: '#fff', border: 'none', borderRadius: 6, padding: '6px', fontSize: 11, fontWeight: 600, cursor: addCreditAmount ? 'pointer' : 'not-allowed' }}
                        >
                          {addCreditLoading ? 'Adding…' : '+ Add Credit'}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;