import React, { useState } from "react";
import { apiService } from "../../services/api";

interface AdminNotificationComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface FormData {
  title: string;
  message: string;
  recipients: string;
  priority: string;
  sendInApp: boolean;
  sendEmail: boolean;
  sendWhatsapp: boolean;
}

interface Errors {
  title?: string;
  message?: string;
  channels?: string;
  submit?: string;
}

const MAX_MESSAGE_LENGTH = 500;

const INITIAL_FORM: FormData = {
  title: "",
  message: "",
  recipients: "all",
  priority: "low",
  sendInApp: true,
  sendEmail: true,
  sendWhatsapp: false,
};

// Scoped styles for the redesigned modal (all classes are prefixed "nc-").
const composerStyles = `
.nc-backdrop{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.nc-modal{background:#fff;border-radius:16px;max-width:520px;width:100%;max-height:calc(100vh - 32px);display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.3);overflow:hidden;font-family:inherit}
.nc-header{background:#1a1a1a;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.nc-header-left{display:flex;align-items:center;gap:12px}
.nc-icon{width:36px;height:36px;background:#c9900a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px}
.nc-title{font-size:15px;font-weight:600;color:#fff;line-height:1.2;margin:0}
.nc-subtitle{font-size:11px;color:rgba(255,255,255,0.4);margin:2px 0 0}
.nc-close{width:28px;height:28px;border-radius:50%;border:none;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.nc-close:hover{background:rgba(255,255,255,0.2)}
.nc-form{display:flex;flex-direction:column;min-height:0;flex:1}
.nc-body{padding:20px 24px;display:flex;flex-direction:column;gap:16px;overflow-y:auto}
.nc-label{display:block;margin-bottom:6px;font-size:11px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.07em}
.nc-input,.nc-textarea{width:100%;box-sizing:border-box;border:1.5px solid #e5e7eb;border-radius:8px;font-family:inherit;font-size:13px;color:#111827;background:#fff;transition:border-color .15s,box-shadow .15s}
.nc-input{height:40px;padding:0 12px}
.nc-textarea{min-height:90px;padding:10px 12px;resize:vertical;line-height:1.5;display:block}
.nc-input::placeholder,.nc-textarea::placeholder{color:#9ca3af}
.nc-input:focus,.nc-textarea:focus{outline:none;border-color:#c9900a;box-shadow:0 0 0 3px rgba(201,144,10,0.1)}
.nc-error{margin:4px 0 0;font-size:11px;color:#dc2626}
.nc-templates{display:flex;flex-wrap:wrap;gap:6px}
.nc-chip{padding:4px 10px;border:1.5px solid #e5e7eb;border-radius:20px;background:#fff;font-size:11px;font-weight:500;color:#374151;cursor:pointer;transition:border-color .15s,background .15s}
.nc-chip:hover{border-color:#c9900a;background:#fffbeb}
.nc-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.nc-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.nc-row{display:flex;gap:6px}
.nc-row>.nc-opt{flex:1}
.nc-pills{display:flex;flex-wrap:wrap;gap:8px}
.nc-opt{position:relative;display:block}
.nc-opt input{position:absolute;opacity:0;width:0;height:0;margin:0}
.nc-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:10px 8px;border:1.5px solid #e5e7eb;border-radius:10px;cursor:pointer;font-size:11px;color:#374151;text-align:center;line-height:1.2;transition:border-color .15s,background .15s,box-shadow .15s}
.nc-card-emoji{font-size:18px;line-height:1}
.nc-card:hover{border-color:#c9900a;background:#fffbeb}
.nc-opt input:checked+.nc-card{border-color:#c9900a;background:#fffbeb;box-shadow:0 0 0 3px rgba(201,144,10,0.1);color:#92400e;font-weight:600}
.nc-prio{display:flex;align-items:center;justify-content:center;gap:4px;padding:7px 6px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:11px;font-weight:600;color:#374151;cursor:pointer;white-space:nowrap;transition:border-color .15s,background .15s,color .15s}
.nc-prio.nc-low:hover,.nc-opt input:checked+.nc-prio.nc-low{border-color:#22c55e;background:#f0fdf4;color:#15803d}
.nc-prio.nc-medium:hover,.nc-opt input:checked+.nc-prio.nc-medium{border-color:#f59e0b;background:#fffbeb;color:#92400e}
.nc-prio.nc-high:hover,.nc-opt input:checked+.nc-prio.nc-high{border-color:#ef4444;background:#fff1f2;color:#991b1b}
.nc-pill{display:flex;align-items:center;gap:6px;padding:7px 14px;border:1.5px solid #e5e7eb;border-radius:20px;font-size:12px;font-weight:500;color:#374151;cursor:pointer;transition:border-color .15s,background .15s,color .15s}
.nc-pill:hover{border-color:#c9900a;background:#fffbeb}
.nc-pill .nc-dot{width:8px;height:8px;border-radius:50%;background:#e5e7eb;transition:background .15s,transform .15s}
.nc-opt input:checked+.nc-pill{border-color:#c9900a;background:#fffbeb;color:#92400e;font-weight:600}
.nc-opt input:checked+.nc-pill .nc-dot{background:#c9900a;transform:scale(1.2)}
.nc-opt input:focus-visible+.nc-card,.nc-opt input:focus-visible+.nc-prio,.nc-opt input:focus-visible+.nc-pill{outline:2px solid #c9900a;outline-offset:2px}
.nc-submit-error{padding:8px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;font-size:12px;color:#dc2626}
.nc-footer{padding:14px 24px;background:#fafafa;border-top:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0}
.nc-count{font-size:10px;color:#9ca3af}
.nc-actions{display:flex;gap:8px}
.nc-cancel{padding:8px 18px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:12px;font-weight:600;color:#6b7280;background:#fff;cursor:pointer;transition:border-color .15s}
.nc-cancel:hover{border-color:#9ca3af}
.nc-send{padding:8px 20px;border:none;border-radius:8px;font-size:12px;font-weight:700;color:#fff;background:#c9900a;cursor:pointer;transition:opacity .15s}
.nc-send:hover{opacity:0.9}
.nc-send:disabled{opacity:0.5;cursor:not-allowed}
@media (max-width:480px){.nc-grid2{grid-template-columns:1fr}.nc-body{padding:16px}.nc-header,.nc-footer{padding-left:16px;padding-right:16px}}
`;

const AdminNotificationComposer: React.FC<AdminNotificationComposerProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // Quick templates for common messages
  const quickTemplates = [
    { title: "Welcome Message", message: "Welcome to our platform! We're excited to have you join us." },
    { title: "Holiday Greetings", message: "Wishing you and your family a wonderful holiday season!" },
    { title: "System Update", message: "We've updated our system with new features. Check them out!" },
    { title: "Maintenance Notice", message: "Scheduled maintenance will occur this weekend. Thank you for your patience." },
  ];

  const recipientOptions = [
    { value: "all", label: "All Users", emoji: "👥" },
    { value: "employees", label: "Employees", emoji: "👷" },
    { value: "customers", label: "Customers", emoji: "🛍️" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low", emoji: "🟢" },
    { value: "medium", label: "Medium", emoji: "🟡" },
    { value: "high", label: "High", emoji: "🔴" },
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof Errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const applyTemplate = (template: { title: string; message: string }) => {
    setFormData({
      ...formData,
      title: template.title,
      message: template.message.slice(0, MAX_MESSAGE_LENGTH),
    });
  };

  const handleChannelToggle = (field: "sendInApp" | "sendEmail" | "sendWhatsapp", checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
    if (errors.channels) setErrors((prev) => ({ ...prev, channels: undefined }));
  };

  const validateForm = () => {
    const newErrors: Errors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    if (!formData.sendInApp && !formData.sendEmail && !formData.sendWhatsapp) {
      newErrors.channels = "Select at least one delivery method";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const channels: string[] = [];
      if (formData.sendInApp) channels.push("in_app");
      if (formData.sendEmail) channels.push("email");
      if (formData.sendWhatsapp) channels.push("whatsapp");

      const notificationData = {
        title: formData.title,
        message: formData.message,
        recipients: formData.recipients,
        priority: formData.priority,
        type: "announcement",
        channels,
      };

      const response = await apiService.sendBroadcastNotification(notificationData);

      if (response.data.success) {
        onSuccess("Message sent successfully!");
        onClose();
        setFormData(INITIAL_FORM);
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || "Failed to send message" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="nc-backdrop">
      <style>{composerStyles}</style>
      <div className="nc-modal">
        {/* Header */}
        <div className="nc-header">
          <div className="nc-header-left">
            <div className="nc-icon">🔔</div>
            <div>
              <h2 className="nc-title">Send Notification</h2>
              <p className="nc-subtitle">Broadcast to customers or staff</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="nc-close" aria-label="Close">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="nc-form">
          <div className="nc-body">
            {/* Quick Templates */}
            <div>
              <label className="nc-label">Quick Templates</label>
              <div className="nc-templates">
                {quickTemplates.map((template, index) => (
                  <button key={index} type="button" onClick={() => applyTemplate(template)} className="nc-chip">
                    {template.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="nc-label" htmlFor="nc-title-input">Title</label>
              <input
                id="nc-title-input"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="nc-input"
                placeholder="e.g. Order ready for pickup"
              />
              {errors.title && <p className="nc-error">{errors.title}</p>}
            </div>

            {/* Message */}
            <div>
              <label className="nc-label" htmlFor="nc-message-input">Message</label>
              <textarea
                id="nc-message-input"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={4}
                className="nc-textarea"
                placeholder="Type your message here..."
              />
              {errors.message && <p className="nc-error">{errors.message}</p>}
            </div>

            {/* Recipients + Priority */}
            <div className="nc-grid2">
              <div>
                <span className="nc-label">Send to</span>
                <div className="nc-grid3">
                  {recipientOptions.map((recipient) => (
                    <div key={recipient.value} className="nc-opt">
                      <input
                        type="radio"
                        id={`nc-recipient-${recipient.value}`}
                        name="recipients"
                        value={recipient.value}
                        checked={formData.recipients === recipient.value}
                        onChange={(e) => handleInputChange("recipients", e.target.value)}
                      />
                      <label htmlFor={`nc-recipient-${recipient.value}`} className="nc-card">
                        <span className="nc-card-emoji">{recipient.emoji}</span>
                        <span>{recipient.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="nc-label">Priority</span>
                <div className="nc-row">
                  {priorityOptions.map((p) => (
                    <div key={p.value} className="nc-opt">
                      <input
                        type="radio"
                        id={`nc-priority-${p.value}`}
                        name="priority"
                        value={p.value}
                        checked={formData.priority === p.value}
                        onChange={(e) => handleInputChange("priority", e.target.value)}
                      />
                      <label htmlFor={`nc-priority-${p.value}`} className={`nc-prio nc-${p.value}`}>
                        <span>{p.emoji}</span>
                        <span>{p.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Channels */}
            <div>
              <span className="nc-label">Deliver via</span>
              <div className="nc-pills">
                <div className="nc-opt">
                  <input
                    type="checkbox"
                    id="nc-channel-inapp"
                    checked={formData.sendInApp}
                    onChange={(e) => handleChannelToggle("sendInApp", e.target.checked)}
                  />
                  <label htmlFor="nc-channel-inapp" className="nc-pill">
                    <span className="nc-dot" />
                    🔔 In-app
                  </label>
                </div>
                <div className="nc-opt">
                  <input
                    type="checkbox"
                    id="nc-channel-email"
                    checked={formData.sendEmail}
                    onChange={(e) => handleChannelToggle("sendEmail", e.target.checked)}
                  />
                  <label htmlFor="nc-channel-email" className="nc-pill">
                    <span className="nc-dot" />
                    📧 Email
                  </label>
                </div>
                <div className="nc-opt">
                  <input
                    type="checkbox"
                    id="nc-channel-whatsapp"
                    checked={formData.sendWhatsapp}
                    onChange={(e) => handleChannelToggle("sendWhatsapp", e.target.checked)}
                  />
                  <label htmlFor="nc-channel-whatsapp" className="nc-pill">
                    <span className="nc-dot" />
                    📱 WhatsApp
                  </label>
                </div>
              </div>
              {errors.channels && <p className="nc-error">{errors.channels}</p>}
            </div>

            {/* Error */}
            {errors.submit && <div className="nc-submit-error">{errors.submit}</div>}
          </div>

          {/* Footer */}
          <div className="nc-footer">
            <span className="nc-count">
              {formData.message.length} / {MAX_MESSAGE_LENGTH} characters
            </span>
            <div className="nc-actions">
              <button type="button" onClick={onClose} className="nc-cancel">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="nc-send">
                {loading ? "Sending..." : "Send Notification →"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminNotificationComposer;
