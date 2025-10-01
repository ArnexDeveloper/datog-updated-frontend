import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import CustomModal from './CustomModal';
import { Label } from '../ui/label';
import CustomSelect from './CustomSelect';
import { apiService } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';
import EmployeeForm from './EmployeeForm';
import EmployeeDetail from './EmployeeDetail';
import './Employees.css';

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  workload: {
    activeJobs: number;
    completedJobs: number;
  };
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

interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  workloadDistribution: Array<{
    employeeName: string;
    activeJobs: number;
    urgentJobs: number;
  }>;
  performanceMetrics: Array<{
    employeeName: string;
    completedJobs: number;
    avgCompletionTime: number;
  }>;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetailData | null>(null);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { actions } = useNotifications();
  const showNotification = (message, type) => {
    // Simple notification - could be enhanced with a proper toast system
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  // Add escape key handler to close modals
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        forceCloseAllModals();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        isActive: statusFilter === 'all' ? 'all' : statusFilter === 'active',
        sortBy,
        sortOrder
      };

      const response = await apiService.getEmployees(params);
      setEmployees(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      showNotification('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getEmployeeStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch employee stats:', error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleEmployeeClick = async (employee: Employee) => {
    try {
      const response = await apiService.getEmployee(employee._id);
      setSelectedEmployee(response.data.data);
      setShowEmployeeDetail(true);
    } catch (error) {
      console.error('Failed to fetch employee details:', error);
      showNotification('Failed to load employee details', 'error');
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowEditEmployee(true);
  };

  const handleDeactivateEmployee = async (employeeId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this employee?')) {
      return;
    }

    try {
      await apiService.deactivateEmployee(employeeId);
      showNotification('Employee deactivated successfully', 'success');
      fetchEmployees();
      fetchStats();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to deactivate employee';
      showNotification(message, 'error');
    }
  };

  const handleEmployeeAdded = () => {
    setShowAddEmployee(false);
    fetchEmployees();
    fetchStats();
    showNotification('Employee added successfully', 'success');
  };

  const forceCloseAllModals = () => {
    setShowAddEmployee(false);
    setShowEditEmployee(false);
    setShowEmployeeDetail(false);
    setEditingEmployee(null);
    setSelectedEmployee(null);
  };

  const handleEmployeeUpdated = () => {
    setShowEditEmployee(false);
    setEditingEmployee(null);
    fetchEmployees();
    fetchStats();
    showNotification('Employee updated successfully', 'success');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    const days = Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getWorkloadBadgeColor = (activeJobs: number) => {
    if (activeJobs === 0) return 'secondary';
    if (activeJobs <= 3) return 'default';
    if (activeJobs <= 6) return 'destructive';
    return 'destructive';
  };

  return (
    <div className="employees-container">
      <div className="employees-header">
        <div>
          <h1>Employee Management</h1>
          <p className="text-muted-foreground">Manage your team members and their permissions</p>
        </div>
        <div className="employees-header-actions">
          <Button onClick={() => setShowAddEmployee(true)}>
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <span className="h-4 w-4">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
              <span className="h-4 w-4">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEmployees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Active Jobs</CardTitle>
              <span className="h-4 w-4">📋</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.workloadDistribution.reduce((total, emp) => total + emp.activeJobs, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
              <span className="h-4 w-4">⏱️</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.performanceMetrics.length > 0
                  ? Math.round(stats.performanceMetrics.reduce((sum, emp) => sum + emp.avgCompletionTime, 0) / stats.performanceMetrics.length)
                  : 0} days
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="employees-filters">
            <div className="search-container">
              <Input
                placeholder="Search employees by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filters-row">
              <div className="filter-group">
                <Label htmlFor="status-filter">Status</Label>
                <CustomSelect
                  value={statusFilter}
                  onValueChange={handleStatusFilter}
                  options={[
                    { value: 'all', label: 'All Employees' },
                    { value: 'active', label: 'Active Only' },
                    { value: 'inactive', label: 'Inactive Only' }
                  ]}
                  placeholder="Select status"
                />
              </div>

              <div className="filter-group">
                <Label htmlFor="sort-by">Sort By</Label>
                <CustomSelect
                  value={sortBy}
                  onValueChange={setSortBy}
                  options={[
                    { value: 'name', label: 'Name' },
                    { value: 'email', label: 'Email' },
                    { value: 'createdAt', label: 'Date Added' },
                    { value: 'lastLogin', label: 'Last Login' }
                  ]}
                  placeholder="Sort by"
                />
              </div>

              <div className="filter-group">
                <Label htmlFor="sort-order">Order</Label>
                <CustomSelect
                  value={sortOrder}
                  onValueChange={setSortOrder}
                  options={[
                    { value: 'asc', label: 'Ascending' },
                    { value: 'desc', label: 'Descending' }
                  ]}
                  placeholder="Sort order"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employees ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              Loading employees...
            </div>
          ) : employees.length === 0 ? (
            <div className="empty-state">
              <p>No employees found</p>
              {searchTerm && (
                <p className="text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="employees-grid">
                {employees.map((employee) => (
                  <div
                    key={employee._id}
                    className="employee-card"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    <div className="employee-card-header">
                      <div className="employee-info">
                        <h3>{employee.name}</h3>
                        <p>{employee.email}</p>
                        <p className="phone">{employee.phone}</p>
                      </div>
                      <div className="employee-status">
                        <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    <div className="employee-card-body">
                      <div className="workload-info">
                        <div className="workload-item">
                          <span className="workload-label">Active Jobs:</span>
                          <Badge variant={getWorkloadBadgeColor(employee.workload.activeJobs)}>
                            {employee.workload.activeJobs}
                          </Badge>
                        </div>
                        <div className="workload-item">
                          <span className="workload-label">Completed:</span>
                          <span>{employee.workload.completedJobs}</span>
                        </div>
                      </div>

                      <div className="permissions-info">
                        <div className="permissions-count">
                          Permissions: {employee.permissions.length}
                        </div>
                        <div className="permissions-preview">
                          {employee.permissions.slice(0, 3).map((perm) => (
                            <Badge key={perm} variant="outline" className="permission-badge">
                              {perm}
                            </Badge>
                          ))}
                          {employee.permissions.length > 3 && (
                            <span className="more-permissions">
                              +{employee.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="employee-metadata">
                        <div className="metadata-item">
                          <span>Last Login:</span>
                          <span>{formatLastLogin(employee.lastLogin)}</span>
                        </div>
                        <div className="metadata-item">
                          <span>Added:</span>
                          <span>{formatDate(employee.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="employee-card-actions">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEmployee(employee);
                        }}
                      >
                        Edit
                      </Button>
                      {employee.isActive && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeactivateEmployee(employee._id);
                          }}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <Button
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>

                  <span className="pagination-info">
                    Page {currentPage} of {pagination.pages} ({pagination.total} total)
                  </span>

                  <Button
                    variant="outline"
                    disabled={currentPage >= pagination.pages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
      <CustomModal
        isOpen={showAddEmployee}
        onClose={() => setShowAddEmployee(false)}
        title="Add New Employee"
        size="md"
      >
        <EmployeeForm
          onSuccess={handleEmployeeAdded}
          onCancel={() => setShowAddEmployee(false)}
        />
      </CustomModal>

      {/* Edit Employee Modal */}
      <CustomModal
        isOpen={showEditEmployee}
        onClose={() => {
          setShowEditEmployee(false);
          setEditingEmployee(null);
        }}
        title="Edit Employee"
        size="md"
      >
        {editingEmployee && (
          <EmployeeForm
            employee={editingEmployee}
            onSuccess={handleEmployeeUpdated}
            onCancel={() => {
              setShowEditEmployee(false);
              setEditingEmployee(null);
            }}
          />
        )}
      </CustomModal>

      {/* Employee Detail Modal */}
      <CustomModal
        isOpen={showEmployeeDetail}
        onClose={() => setShowEmployeeDetail(false)}
        title="Employee Details"
        size="xl"
      >
        {selectedEmployee && (
          <EmployeeDetail
            employee={selectedEmployee}
            onClose={() => setShowEmployeeDetail(false)}
            onEdit={() => {
              setEditingEmployee(selectedEmployee.employee);
              setShowEmployeeDetail(false);
              setShowEditEmployee(true);
            }}
            onDeactivate={() => {
              handleDeactivateEmployee(selectedEmployee.employee._id);
              setShowEmployeeDetail(false);
            }}
          />
        )}
      </CustomModal>
    </div>
  );
};

export default Employees;