import React, { useEffect, useRef, useState } from 'react';
import { apiService } from '../../services/api';

// WhatsApp Web's QR expires every ~20-30s, so we keep re-fetching it while
// disconnected, and stop entirely once linked.
const POLL_INTERVAL_MS = 5000;

const WhatsAppTab = ({ isAdmin, showNotification }) => {
  const [connected, setConnected] = useState(null);
  const [phone, setPhone] = useState(null);
  const [name, setName] = useState(null);
  const [qr, setQr] = useState(null);
  const [message, setMessage] = useState('');
  const [disconnecting, setDisconnecting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const statusRes = await apiService.getWhatsAppStatus();
        const isConnected = !!statusRes?.data?.connected;
        if (cancelled) return;
        setConnected(isConnected);
        setPhone(statusRes?.data?.phone || null);
        setName(statusRes?.data?.name || null);

        if (isConnected) {
          setQr(null);
          timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
          return;
        }

        if (isAdmin) {
          const qrRes = await apiService.getWhatsAppQr();
          if (cancelled) return;
          setQr(qrRes?.data?.qr || null);
          setMessage(qrRes?.data?.message || '');
        }

        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAdmin]);

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect WhatsApp? You will need to scan the QR code again to reconnect.')) {
      return;
    }
    setDisconnecting(true);
    try {
      await apiService.disconnectWhatsApp();
      setConnected(false);
      setPhone(null);
      setName(null);
      setQr(null);
      showNotification?.('WhatsApp disconnected', 'success');
    } catch (e) {
      showNotification?.(e?.response?.data?.message || 'Failed to disconnect WhatsApp', 'error');
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="tab-panel">
      <h3>📱 WhatsApp Connection</h3>
      <p>Link a WhatsApp number here so invoice PDFs can be sent to customers automatically.</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 4px' }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: connected === null ? '#d1d5db' : connected ? '#16a34a' : '#dc2626'
        }} />
        <strong>{connected === null ? 'Checking…' : connected ? 'Connected' : 'Not connected'}</strong>
      </div>

      {connected === true && (
        <div style={{ margin: '6px 0 16px' }}>
          {phone && <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 6 }}>{phone}</div>}
          {name && <div style={{ fontSize: 12, color: '#64748b' }}>{name}</div>}
        </div>
      )}

      {connected === false && !isAdmin && (
        <p style={{ color: '#6b7280', fontSize: 13 }}>
          Ask an admin to link WhatsApp — scanning the QR code is restricted to admin accounts.
        </p>
      )}

      {connected === false && isAdmin && (
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          {qr ? (
            <img src={qr} alt="WhatsApp QR code" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8 }} />
          ) : (
            <div style={{ padding: 40, color: '#9ca3af', fontSize: 13 }}>
              {message || 'Generating QR code…'}
            </div>
          )}
          <ol style={{ textAlign: 'left', fontSize: 13, color: '#374151', marginTop: 12, paddingLeft: 18 }}>
            <li>Open WhatsApp on the phone you want to link</li>
            <li>Go to Settings → Linked Devices → Link a Device</li>
            <li>Scan the QR code above (refreshes automatically if it expires)</li>
          </ol>
        </div>
      )}

      {connected === true && (
        <>
          <p style={{ color: '#15803d', fontSize: 13 }}>
            WhatsApp is linked — invoices will be sent automatically after each order, and you can resend from any invoice's detail page.
          </p>
          {isAdmin && (
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              style={{
                border: '1px solid #fca5a5', background: '#fff', color: '#dc2626',
                borderRadius: 7, padding: '6px 14px', fontSize: 11, fontWeight: 500,
                cursor: disconnecting ? 'not-allowed' : 'pointer', opacity: disconnecting ? 0.6 : 1
              }}
            >
              {disconnecting ? 'Disconnecting…' : 'Disconnect'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default WhatsAppTab;
