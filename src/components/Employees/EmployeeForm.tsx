import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import CustomSelect from './CustomSelect';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { apiService } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  permissions: string[];
  isActive: boolean;
}

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  permissions: string[];
  isActive: boolean;
}

const availablePermissions = [
  { value: 'orders', label: 'Orders Management', description: 'View and manage customer orders' },
  { value: 'customers', label: 'Customer Management', description: 'Manage customer information' },
  { value: 'measurements', label: 'Measurements', description: 'Record and manage measurements' },
  { value: 'invoices', label: 'Invoice Management', description: 'Generate and manage invoices' },
  { value: 'employees', label: 'Employee Management', description: 'Manage team members (Admin only)' },
  { value: 'dashboard', label: 'Dashboard Access', description: 'View analytics and reports' },
  { value: 'settings', label: 'System Settings', description: 'Configure system settings' }
];

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    password: '',
    permissions: employee?.permissions || [],
    isActive: employee?.isActive ?? true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { actions } = useNotifications();
  const showNotification = (message, type) => {
    // Simple notification - could be enhanced with a proper toast system
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = 'Name must be between 2 and 50 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!employee && !formData.password) {
      newErrors.password = 'Password is required for new employees';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = { ...formData };

      // Remove password if empty (for updates)
      if (employee && !submitData.password) {
        delete (submitData as any).password;
      }

      if (employee) {
        await apiService.updateEmployee(employee._id, submitData);
      } else {
        await apiService.createEmployee(submitData);
      }

      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message ||
        (employee ? 'Failed to update employee' : 'Failed to create employee');

      if (error.response?.data?.errors) {
        const validationErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          validationErrors[err.path || err.param] = err.msg;
        });
        setErrors(validationErrors);
      } else {
        showNotification(message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePermission = (permission: string) => {
    const currentPermissions = formData.permissions;
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];

    handleInputChange('permissions', newPermissions);
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      <div className="form-grid">
        <div className="form-group">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter employee's full name"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email address"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter phone number"
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <Label htmlFor="password">
            Password {employee ? '(leave blank to keep current)' : '*'}
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder={employee ? 'Enter new password (optional)' : 'Enter password'}
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        {employee && (
          <div className="form-group">
            <Label htmlFor="status">Status</Label>
            <CustomSelect
              value={formData.isActive ? 'active' : 'inactive'}
              onValueChange={(value) => handleInputChange('isActive', value === 'active')}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              placeholder="Select status"
            />
          </div>
        )}
      </div>

      <div className="permissions-section">
        <Label>Permissions *</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Select the modules this employee can access
        </p>

        <Card>
          <CardContent className="pt-4">
            <div className="permissions-grid">
              {availablePermissions.map((permission) => (
                <div
                  key={permission.value}
                  className={`permission-item ${
                    formData.permissions.includes(permission.value) ? 'selected' : ''
                  }`}
                  onClick={() => togglePermission(permission.value)}
                >
                  <div className="permission-header">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.value)}
                      onChange={() => togglePermission(permission.value)}
                      className="permission-checkbox"
                    />
                    <span className="permission-label">{permission.label}</span>
                  </div>
                  <p className="permission-description">{permission.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {errors.permissions && <span className="error-text">{errors.permissions}</span>}

        {formData.permissions.length > 0 && (
          <div className="selected-permissions">
            <p className="text-sm font-medium">Selected Permissions:</p>
            <div className="permissions-badges">
              {formData.permissions.map((permission) => {
                const permissionData = availablePermissions.find(p => p.value === permission);
                return (
                  <Badge key={permission} variant="default">
                    {permissionData?.label || permission}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-small"></span>
              {employee ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            employee ? 'Update Employee' : 'Create Employee'
          )}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;