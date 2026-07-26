import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import ToastContainer from './ToastContainer';

// Mounted once at the app root — renders active toasts and lets clicking a
// toast body open the shared Notification Drawer.
export default function GlobalToasts() {
  const { toasts, removeToast, openDrawer } = useNotifications() as any;

  return (
    <ToastContainer
      toasts={toasts}
      onRemove={removeToast}
      onOpenDrawer={() => openDrawer()}
    />
  );
}
