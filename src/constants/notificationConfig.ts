export interface NotificationTypeConfig {
  color: string;
  iconBg: string;
  icon: string;
  tag: string;
  dotColor: string;
  urgent: boolean;
}

// Shared between the drawer and the toast system so colors/icons/tags are
// never duplicated. Datog gold is #c9900a (this feature's brand accent).
export const TYPE_CONFIG: Record<string, NotificationTypeConfig> = {
  new_customer: {
    color: '#2563eb', iconBg: '#eff6ff', icon: '👤', tag: 'NEW CUSTOMER', dotColor: '#2563eb', urgent: false,
  },
  new_order: {
    color: '#c9900a', iconBg: '#fffbeb', icon: '🛍️', tag: 'NEW ORDER', dotColor: '#c9900a', urgent: false,
  },
  // Order creation is stored under the legacy type 'order_created' (see
  // notificationService.js) — alias it to the same "new order" visuals.
  order_created: {
    color: '#c9900a', iconBg: '#fffbeb', icon: '🛍️', tag: 'NEW ORDER', dotColor: '#c9900a', urgent: false,
  },
  trial_reminder: {
    color: '#7c3aed', iconBg: '#f5f3ff', icon: '📅', tag: 'TRIAL TODAY', dotColor: '#7c3aed', urgent: false,
  },
  delivery_today: {
    color: '#f59e0b', iconBg: '#fffbeb', icon: '📦', tag: 'DELIVERY TODAY', dotColor: '#f59e0b', urgent: false,
  },
  delivery_overdue: {
    color: '#dc2626', iconBg: '#fff1f2', icon: '🚨', tag: 'DELIVERY OVERDUE', dotColor: '#dc2626', urgent: true,
  },
  // Legacy / secondary types — kept visible under "All" with sensible visuals
  order_status_updated: { color: '#16a34a', iconBg: '#f0fdf4', icon: '✅', tag: 'ORDER UPDATE', dotColor: '#16a34a', urgent: false },
  order_delivery_due:   { color: '#f59e0b', iconBg: '#fffbeb', icon: '🚚', tag: 'DELIVERY DUE', dotColor: '#f59e0b', urgent: false },
  invoice_created:      { color: '#16a34a', iconBg: '#f0fdf4', icon: '💰', tag: 'INVOICE', dotColor: '#16a34a', urgent: false },
  invoice_overdue:      { color: '#dc2626', iconBg: '#fff1f2', icon: '❗', tag: 'INVOICE OVERDUE', dotColor: '#dc2626', urgent: true },
  payment_received:     { color: '#16a34a', iconBg: '#f0fdf4', icon: '💳', tag: 'PAYMENT', dotColor: '#16a34a', urgent: false },
  payment_pending:      { color: '#f59e0b', iconBg: '#fffbeb', icon: '⏳', tag: 'PAYMENT PENDING', dotColor: '#f59e0b', urgent: false },
  low_stock_alert:      { color: '#dc2626', iconBg: '#fff1f2', icon: '⚠️', tag: 'LOW STOCK', dotColor: '#dc2626', urgent: true },
  job_card_assigned:    { color: '#2563eb', iconBg: '#eff6ff', icon: '📝', tag: 'JOB CARD', dotColor: '#2563eb', urgent: false },
  employee_created:     { color: '#2563eb', iconBg: '#eff6ff', icon: '👤', tag: 'EMPLOYEE', dotColor: '#2563eb', urgent: false },
};

export const DEFAULT_TYPE_CONFIG: NotificationTypeConfig = {
  color: '#94a3b8', iconBg: '#f1f5f9', icon: '🔔', tag: 'NOTIFICATION', dotColor: '#94a3b8', urgent: false,
};

export const getTypeConfig = (type: string): NotificationTypeConfig => TYPE_CONFIG[type] || DEFAULT_TYPE_CONFIG;
