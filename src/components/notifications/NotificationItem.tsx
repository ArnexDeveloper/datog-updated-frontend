import React from 'react';

interface NotificationData {
  _id?: string;
  title: string;
  message?: string;
  type: string;
  isRead?: boolean;
  timeAgo?: string;
  date?: string;
  createdAt?: string;
}

interface NotificationItemProps {
  notification?: NotificationData | null;
  alert?: NotificationData | null;
  onClick?: (data: NotificationData) => void;
  onMarkAsRead?: (ids: string[]) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, alert, onClick, onMarkAsRead }) => {
  const isAlert = !!alert;
  const data = notification || alert;

  if (!data) return null;

  const getIcon = () => {
    const icons: Record<string, string> = {
      order_created: '🛍️',
      order_status_updated: '✅',
      order_delivery_due: '🚚',
      invoice_created: '💰',
      invoice_overdue: '💰',
      payment_received: '💳',
      low_stock: '⚠️',
      employee_created: '👤',
      system_alert: '🔔'
    };
    return icons[data.type] || '📢';
  };

  const getTimeAgo = () => {
    if (isAlert) {
      const now = new Date();
      const date = new Date(data.date || data.createdAt || '');
      const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 0) return 'Today';
      if (diff === 1) return 'Yesterday';
      if (diff < 7) return `${diff} days ago`;
      return `${Math.ceil(diff / 7)} weeks ago`;
    }
    return data.timeAgo || 'Just now';
  };

  const handleClick = () => {
    onClick?.(data);
    if (!isAlert && !data.isRead && onMarkAsRead && data._id) {
      onMarkAsRead([data._id]);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`px-4 py-3 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 transition ${
        !isAlert && !data.isRead ? 'bg-blue-50' : ''
      }`}
    >
      <span className="text-xl">{getIcon()}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate">{data.title}</h4>
          <span className="text-xs text-gray-500">{getTimeAgo()}</span>
        </div>
        {data.message && (
          <p className="mt-1 text-sm text-gray-600">{data.message}</p>
        )}
      </div>
      {!isAlert && !data.isRead && (
        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
      )}
    </div>
  );
};

export default NotificationItem;
