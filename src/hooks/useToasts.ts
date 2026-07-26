import { useState, useCallback } from 'react';

export interface ToastData {
  id: string;
  type: string;
  title: string;
  message?: string;
  referenceType?: 'order' | 'customer' | 'invoice';
  referenceId?: string;
  duration: number;
}

const MAX_TOASTS = 4;

export default function useToasts() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((notification: any) => {
    const toast: ToastData = {
      id: `${notification._id || Date.now()}-${Math.random()}`,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      referenceType: notification.referenceType,
      referenceId: notification.referenceId,
      duration: 5000,
    };

    setToasts(prev => {
      const updated = prev.length >= MAX_TOASTS ? prev.slice(1) : prev;
      return [...updated, toast];
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
