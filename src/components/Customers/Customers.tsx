import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
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
    } catch (err) {
      setError('Failed to load customers');
      console.error('Error loading customers:', err);
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
    setShowAddForm(true);
  };

  const handleEditCustomer = (customer: any) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      gender: customer.gender,
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
    setShowAddForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingCustomer) {
        await apiService.updateCustomer(editingCustomer._id, formData);
      } else {
        await apiService.createCustomer(formData);
      }
      setShowAddForm(false);
      loadCustomers();
    } catch (err) {
      setError(editingCustomer ? 'Failed to update customer' : 'Failed to create customer');
      console.error('Error saving customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await apiService.deleteCustomer(customerId);
        loadCustomers();
      } catch (err) {
        setError('Failed to delete customer');
        console.error('Error deleting customer:', err);
      }
    }
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
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Address</h3>
                <div className="form-group">
                  <label htmlFor="address.street">Street Address</label>
                  <textarea
                    id="address.street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address.city">City</label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
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
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Preferences</h3>
                <div className="form-group">
                  <label htmlFor="preferences.specialInstructions">Special Instructions</label>
                  <textarea
                    id="preferences.specialInstructions"
                    name="preferences.specialInstructions"
                    value={formData.preferences.specialInstructions}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any special requirements or notes..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (editingCustomer ? 'Update Customer' : 'Add Customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;