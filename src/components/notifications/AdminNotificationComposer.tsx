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
}

interface Errors {
  title?: string;
  message?: string;
  submit?: string;
}

const AdminNotificationComposer: React.FC<AdminNotificationComposerProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    message: "",
    recipients: "all",
  });

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
    { value: "all", label: "All Users" },
    { value: "employees", label: "Employees" },
    { value: "customers", label: "Customers" },
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
      message: template.message,
    });
  };

  const validateForm = () => {
    const newErrors: Errors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const notificationData = {
        ...formData,
        priority: "medium",
        type: "announcement",
        channels: ["in_app"],
      };

      const response = await apiService.sendBroadcastNotification(notificationData);

      if (response.data.success) {
        onSuccess("Message sent successfully!");
        onClose();
        setFormData({ title: "", message: "", recipients: "all" });
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || "Failed to send message" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-800 text-sm">Send Notification</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Quick Templates */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-600">Quick Templates</label>
            <div className="grid grid-cols-2 gap-2">
              {quickTemplates.map((template, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="text-left px-2 py-1 text-xs border rounded-md hover:bg-gray-50 transition"
                >
                  {template.title}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter message title..."
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type your message here..."
            />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-600">Send to</label>
            <div className="space-y-1">
              {recipientOptions.map((recipient) => (
                <label key={recipient.value} className="flex items-center text-sm text-gray-700">
                  <input
                    type="radio"
                    name="recipients"
                    value={recipient.value}
                    checked={formData.recipients === recipient.value}
                    onChange={(e) => handleInputChange("recipients", e.target.value)}
                    className="mr-2 h-3 w-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  {recipient.label}
                </label>
              ))}
            </div>
          </div>

          {/* Error */}
          {errors.submit && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 border rounded-md text-gray-600 text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminNotificationComposer;
