import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const {
    notifications,
    alerts,
    counts,
    loading,
    actions: { fetchNotifications, markAsRead, markAllAsRead }
  } = useNotifications();

  const [loadingAction, setLoadingAction] = useState(false);
  const navigate = useNavigate();

  // Get recent items (combine notifications and alerts, limit to 10)
  const getRecentItems = () => {
    const allItems = [...(notifications || []), ...(alerts || [])];
    return allItems
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
      .slice(0, 10);
  };

  const recentItems = getRecentItems();

  const handleMarkAllAsRead = async () => {
    if (counts.totalUnread === 0) return;
    setLoadingAction(true);
    try {
      await markAllAsRead();
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRefresh = async () => {
    setLoadingAction(true);
    try {
      await fetchNotifications();
    } finally {
      setLoadingAction(false);
    }
  };

  const handleViewAll = () => {
    navigate('/notifications');
    onClose();
  };

  const formatTimeAgo = (date: any) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - notificationDate.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: any) => {
    const icons: Record<string, string> = {
      order_created: '🛍️',
      order_status_updated: '✅',
      order_delivery_due: '🚚',
      invoice_created: '💰',
      invoice_overdue: '❗',
      payment_received: '💳',
      low_stock_alert: '⚠️',
      employee_created: '👤',
      system_alert: '🔔',
      delivery_due: '🚚',
      low_stock: '⚠️'
    };
    return icons[type] || '📢';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-80 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-lg">
            🔔
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">Notifications</div>
            <div className="text-xs text-gray-500">
              {counts.totalUnread > 0 ? `${counts.totalUnread} unread` : 'All caught up!'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-b border-gray-200">
        <button
          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md disabled:opacity-50"
          onClick={handleRefresh}
          disabled={loadingAction}
        >
          <span className="mr-3">🔄</span>
          <span>Refresh</span>
          {loadingAction && <span className="ml-auto text-xs">...</span>}
        </button>

        {counts.totalUnread > 0 && (
          <button
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md disabled:opacity-50"
            onClick={handleMarkAllAsRead}
            disabled={loadingAction}
          >
            <span className="mr-3">✅</span>
            <span>Mark All Read</span>
            {loadingAction && <span className="ml-auto text-xs">...</span>}
          </button>
        )}
      </div>

      {/* Recent Notifications - Scrollable Section */}
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-4 text-sm text-gray-500">
            <span>Loading notifications...</span>
          </div>
        ) : recentItems.length === 0 ? (
          <div className="flex items-center justify-center p-4 text-sm text-gray-500">
            <span className="mr-2">📭</span>
            <span>No notifications</span>
          </div>
        ) : (
          recentItems.map((item, index) => (
            <button
              key={item._id || `alert-${index}`}
              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              onClick={() => {
                if (item._id && !item.isRead) {
                  markAsRead([item._id]);
                }
                onClose();
              }}
            >
              <div className="flex items-start">
                <span className="text-lg mr-3 mt-0.5">{getNotificationIcon(item.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </p>
                    {item._id && !item.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full ml-2"></div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                    {item.message && item.message.length > 60
                      ? `${item.message.substring(0, 60)}...`
                      : item.message || 'No message'
                    }
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTimeAgo(item.createdAt || item.date)}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        <button
          className="w-full flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
          onClick={handleViewAll}
        >
          <span className="mr-2">👁️</span>
          <span>View All Notifications</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;