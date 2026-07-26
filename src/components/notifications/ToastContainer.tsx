import React from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import type { ToastData } from '../../hooks/useToasts';

interface Props {
  toasts: ToastData[];
  onRemove: (id: string) => void;
  onOpenDrawer: (referenceType?: string, referenceId?: string) => void;
}

export default function ToastContainer({ toasts, onRemove, onOpenDrawer }: Props) {
  return createPortal(
    <div style={{
      position: 'fixed',
      top: 12,
      right: 12,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
      width: 295,
    }}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} onOpenDrawer={onOpenDrawer} />
      ))}
    </div>,
    document.body
  );
}
