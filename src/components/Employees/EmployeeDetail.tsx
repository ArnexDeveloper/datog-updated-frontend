import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import CustomModal from './CustomModal';
import { apiService } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface JobStats {
  _id: string;
  count: number;
}

interface RecentJob {
  jobNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  order: {
    orderNumber: string;
  };
  status: string;
  deliveryDate: string;
}

interface EmployeeDetailData {
  employee: Employee;
  statistics: {
    jobStats: JobStats[];
    totalJobs: number;
    completedOnTime: number;
    onTimePercentage: number;
  };
  recentJobs: RecentJob[];
}

interface EmployeeDetailProps {
  employee: EmployeeDetailData;
  onClose: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
}

interface PermissionUpdateForm {
  permissions: string[];
}

const availablePermissions = [
  { value: 'orders', label: 'Orders Management' },
  { value: 'customers', label: 'Customer Management' },
  { value: 'measurements', label: 'Measurements' },
  { value: 'invoices', label: 'Invoice Management' },
  { value: 'employees', label: 'Employee Management' },
  { value: 'dashboard', label: 'Dashboard Access' },
  { value: 'settings', label: 'System Settings' }
];

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  employee,
  onClose,
  onEdit,
  onDeactivate
}) => {
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionForm, setPermissionForm] = useState<PermissionUpdateForm>({
    permissions: employee.employee.permissions
  });
  const [updating, setUpdating] = useState(false);

  const { actions } = useNotifications();
  const showNotification = (message, type) => {
    // Simple notification - could be enhanced with a proper toast system
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never logged in';
    const days = Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'urgent':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getJobStatsTotal = () => {
    return employee.statistics.jobStats.reduce((total, stat) => total + stat.count, 0);
  };

  const handlePermissionUpdate = async () => {
    setUpdating(true);
    try {
      await apiService.updateEmployeePermissions(
        employee.employee._id,
        permissionForm.permissions
      );
      showNotification('Permissions updated successfully', 'success');
      setShowPermissionModal(false);
      // Update local employee data
      employee.employee.permissions = permissionForm.permissions;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update permissions';
      showNotification(message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const togglePermission = (permission: string) => {
    const currentPermissions = permissionForm.permissions;
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];

    setPermissionForm({ permissions: newPermissions });
  };

  return (
    <>
      <div className="employee-detail">
        {/* Header */}
        <div className="employee-detail-header">
          <div className="employee-basic-info">
            <div className="employee-avatar">
              {employee.employee.name.charAt(0).toUpperCase()}
            </div>
            <div className="employee-info">
              <h2>{employee.employee.name}</h2>
              <p className="employee-email">{employee.employee.email}</p>
              <p className="employee-phone">{employee.employee.phone}</p>
              <div className="employee-status-info">
                <Badge variant={employee.employee.isActive ? 'default' : 'secondary'}>
                  {employee.employee.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <span className="last-login">
                  Last login: {formatLastLogin(employee.employee.lastLogin)}
                </span>
              </div>
            </div>
          </div>

          <div className="employee-actions">
            <Button variant="outline" onClick={onEdit}>
              Edit Employee
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPermissionModal(true)}
            >
              Manage Permissions
            </Button>
            {employee.employee.isActive && (
              <Button variant="destructive" onClick={onDeactivate}>
                Deactivate
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="overview" className="employee-detail-tabs">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Job Performance</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="overview-grid">
              {/* Statistics Cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Total Jobs</span>
                      <span className="stat-value">{employee.statistics.totalJobs}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Completed On Time</span>
                      <span className="stat-value">{employee.statistics.completedOnTime}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">On-Time Rate</span>
                      <span className="stat-value">{employee.statistics.onTimePercentage}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Workload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="job-status-breakdown">
                    {employee.statistics.jobStats.length > 0 ? (
                      employee.statistics.jobStats.map((stat) => (
                        <div key={stat._id} className="status-item">
                          <Badge variant={getStatusBadgeVariant(stat._id)}>
                            {stat._id.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="status-count">{stat.count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No active jobs</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Employee Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Employee Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="employee-info-grid">
                    <div className="info-item">
                      <span className="info-label">Employee ID</span>
                      <span className="info-value">{employee.employee._id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Role</span>
                      <span className="info-value">{employee.employee.role}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date Added</span>
                      <span className="info-value">{formatDate(employee.employee.createdAt)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Last Updated</span>
                      <span className="info-value">{formatDate(employee.employee.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {employee.recentJobs.length > 0 ? (
                  <div className="recent-jobs-list">
                    {employee.recentJobs.map((job, index) => (
                      <div key={index} className="job-item">
                        <div className="job-header">
                          <span className="job-number">{job.jobNumber}</span>
                          <Badge variant={getStatusBadgeVariant(job.status)}>
                            {job.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="job-details">
                          <div className="job-info">
                            <span className="customer-name">{job.customer.name}</span>
                            <span className="order-number">Order: {job.order.orderNumber}</span>
                          </div>
                          <div className="job-dates">
                            <span className="delivery-date">
                              Due: {formatDate(job.deliveryDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent jobs found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="permissions-display">
                  {employee.employee.permissions.length > 0 ? (
                    <div className="permissions-grid">
                      {employee.employee.permissions.map((permission) => {
                        const permissionData = availablePermissions.find(p => p.value === permission);
                        return (
                          <Badge key={permission} variant="default" className="permission-badge">
                            {permissionData?.label || permission}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No permissions assigned</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Permission Management Modal */}
      <CustomModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        title={`Manage Permissions for ${employee.employee.name}`}
        size="lg"
      >
        <div className="permission-management">
            <div className="permission-description">
              <p>Select the modules and features this employee can access:</p>
            </div>

            <div className="permissions-scrollable-container">
              <div className="permissions-list">
                {availablePermissions.map((permission) => (
                  <div
                    key={permission.value}
                    className={`permission-item ${
                      permissionForm.permissions.includes(permission.value) ? 'selected' : ''
                    }`}
                    onClick={() => togglePermission(permission.value)}
                  >
                    <div className="permission-item-content">
                      <input
                        type="checkbox"
                        checked={permissionForm.permissions.includes(permission.value)}
                        onChange={() => togglePermission(permission.value)}
                        className="permission-checkbox"
                      />
                      <div className="permission-info">
                        <span className="permission-label">{permission.label}</span>
                        <span className="permission-description-text">
                          {permission.value === 'orders' && 'View and manage customer orders'}
                          {permission.value === 'customers' && 'Manage customer information and profiles'}
                          {permission.value === 'measurements' && 'Record and manage customer measurements'}
                          {permission.value === 'invoices' && 'Generate and manage invoices'}
                          {permission.value === 'employees' && 'Manage team members (Admin only)'}
                          {permission.value === 'dashboard' && 'View analytics and reports dashboard'}
                          {permission.value === 'settings' && 'Configure system settings and preferences'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {permissionForm.permissions.length > 0 && (
              <div className="selected-permissions-summary">
                <h4>Selected Permissions ({permissionForm.permissions.length}):</h4>
                <div className="selected-permissions-list">
                  {permissionForm.permissions.map((permission) => {
                    const permissionData = availablePermissions.find(p => p.value === permission);
                    return (
                      <Badge key={permission} variant="default" className="selected-permission-badge">
                        {permissionData?.label || permission}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="permission-actions">
              <Button
                variant="outline"
                onClick={() => setShowPermissionModal(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePermissionUpdate}
                disabled={updating || permissionForm.permissions.length === 0}
              >
                {updating ? (
                  <>
                    <span className="spinner-small"></span>
                    Updating...
                  </>
                ) : (
                  'Update Permissions'
                )}
              </Button>
            </div>
          </div>
      </CustomModal>
    </>
  );
};

export default EmployeeDetail;