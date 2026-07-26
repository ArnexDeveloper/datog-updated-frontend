import React, { useState, useEffect } from "react";
import { apiService } from "../../services/api";

interface CustomerNotificationComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints?: number;
  storeCredit?: number;
  dateOfBirth?: string;
  anniversary?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  trialDate?: string;
  deliveryDate?: string;
  payment?: { total?: number; balance?: number; status?: string };
}

type ActionType = "trial_reminder" | "payment_pending" | "credit_points_update" | "birthday_wish" | "anniversary_wish";

const ACTIONS: { type: ActionType; label: string; icon: string; needsOrder: boolean }[] = [
  { type: "trial_reminder", label: "Trial Reminder", icon: "👗", needsOrder: true },
  { type: "payment_pending", label: "Payment Pending", icon: "💳", needsOrder: true },
  { type: "credit_points_update", label: "Credit Points Update", icon: "🎁", needsOrder: false },
  { type: "birthday_wish", label: "Birthday Wish", icon: "🎂", needsOrder: false },
  { type: "anniversary_wish", label: "Anniversary Wish", icon: "💐", needsOrder: false },
];

const CustomerNotificationComposer: React.FC<CustomerNotificationComposerProps> = ({ isOpen, onClose, onSuccess }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [sendingType, setSendingType] = useState<ActionType | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      apiService
        .getCustomers({ isActive: "true", limit: 100 })
        .then((res) => setCustomers(res.data.data || []))
        .catch(() => setCustomers([]));
    } else {
      setSelectedCustomer(null);
      setPendingAction(null);
      setOrders([]);
      setSearchTerm("");
      setError("");
    }
  }, [isOpen]);

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return !term || c.name?.toLowerCase().includes(term) || c.phone?.includes(term);
  });

  const startAction = async (action: ActionType) => {
    setError("");
    const def = ACTIONS.find((a) => a.type === action);
    if (!def?.needsOrder) {
      await send(action);
      return;
    }

    setPendingAction(action);
    setOrdersLoading(true);
    try {
      const res = await apiService.getCustomerOrders(selectedCustomer!._id, { limit: 50 });
      const allOrders: Order[] = res.data.data || [];
      const relevant =
        action === "trial_reminder"
          ? allOrders.filter((o) => !!o.trialDate)
          : allOrders.filter((o) => (o.payment?.balance ?? 0) > 0);
      setOrders(relevant);
    } catch (err) {
      setError("Failed to load orders for this customer");
    } finally {
      setOrdersLoading(false);
    }
  };

  const send = async (action: ActionType, orderId?: string) => {
    if (!selectedCustomer) return;
    setSendingType(action);
    setError("");
    try {
      await apiService.sendCustomerNotification(selectedCustomer._id, { type: action, orderId });
      onSuccess(`${ACTIONS.find((a) => a.type === action)?.label} sent to ${selectedCustomer.name}`);
      setPendingAction(null);
      setOrders([]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send notification");
    } finally {
      setSendingType(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-800 text-sm">Notify Customer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">{error}</div>
          )}

          {!selectedCustomer && (
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or phone..."
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
              />
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {filteredCustomers.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => setSelectedCustomer(c)}
                    className="w-full text-left px-3 py-2 border rounded-md hover:bg-gray-50 transition text-sm"
                  >
                    <div className="font-medium text-gray-800">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.phone}</div>
                  </button>
                ))}
                {filteredCustomers.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No customers found</p>
                )}
              </div>
            </div>
          )}

          {selectedCustomer && !pendingAction && (
            <div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-xs text-blue-600 hover:underline mb-2"
              >
                ← Back to customer search
              </button>
              <div className="p-3 bg-gray-50 rounded-md mb-3">
                <div className="font-medium text-gray-800 text-sm">{selectedCustomer.name}</div>
                <div className="text-xs text-gray-500">{selectedCustomer.phone}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Loyalty Points: {selectedCustomer.loyaltyPoints || 0} · Store Credit: ₹
                  {selectedCustomer.storeCredit || 0}
                </div>
              </div>

              <div className="space-y-2">
                {ACTIONS.map((action) => (
                  <button
                    key={action.type}
                    type="button"
                    disabled={sendingType === action.type}
                    onClick={() => startAction(action.type)}
                    className="w-full flex items-center justify-between px-3 py-2 border rounded-md hover:bg-gray-50 transition text-sm disabled:opacity-50"
                  >
                    <span>
                      {action.icon} {action.label}
                    </span>
                    {sendingType === action.type ? (
                      <span className="text-xs text-gray-400">Sending...</span>
                    ) : (
                      <span className="text-xs text-blue-600">{action.needsOrder ? "Select order →" : "Send"}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedCustomer && pendingAction && (
            <div>
              <button
                type="button"
                onClick={() => {
                  setPendingAction(null);
                  setOrders([]);
                }}
                className="text-xs text-blue-600 hover:underline mb-2"
              >
                ← Back
              </button>
              <p className="text-xs text-gray-600 mb-2">
                Select the order to base this {ACTIONS.find((a) => a.type === pendingAction)?.label.toLowerCase()} on:
              </p>

              {ordersLoading && <p className="text-xs text-gray-400">Loading orders...</p>}

              {!ordersLoading && orders.length === 0 && (
                <p className="text-xs text-gray-400 py-4 text-center">
                  No eligible orders found for this customer.
                </p>
              )}

              <div className="space-y-1">
                {orders.map((o) => (
                  <button
                    key={o._id}
                    type="button"
                    disabled={sendingType === pendingAction}
                    onClick={() => send(pendingAction, o._id)}
                    className="w-full text-left px-3 py-2 border rounded-md hover:bg-gray-50 transition text-sm disabled:opacity-50"
                  >
                    <div className="font-medium text-gray-800">{o.orderNumber}</div>
                    {pendingAction === "trial_reminder" && o.trialDate && (
                      <div className="text-xs text-gray-500">
                        Trial: {new Date(o.trialDate).toLocaleDateString()}
                      </div>
                    )}
                    {pendingAction === "payment_pending" && (
                      <div className="text-xs text-gray-500">Balance Due: ₹{o.payment?.balance}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerNotificationComposer;
