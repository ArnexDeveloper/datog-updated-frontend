import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '../services/api';

// Initial state
const initialState = {
  notifications: [],
  alerts: [],
  counts: {
    totalUnread: 0,
    criticalUnread: 0
  },
  loading: false,
  error: null,
  lastFetch: null
};

// Action types
const NOTIFICATION_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  SET_COUNTS: 'SET_COUNTS',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload.notifications,
        alerts: action.payload.alerts,
        loading: false,
        lastFetch: new Date(),
        error: null
      };

    case NOTIFICATION_ACTIONS.SET_COUNTS:
      return {
        ...state,
        counts: action.payload
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          action.payload.includes(notification._id)
            ? { ...notification, isRead: true, status: 'read' }
            : notification
        ),
        counts: {
          ...state.counts,
          totalUnread: Math.max(0, state.counts.totalUnread - action.payload.length),
          criticalUnread: Math.max(0, state.counts.criticalUnread - action.payload.filter(id => {
            const notif = state.notifications.find(n => n._id === id);
            return notif?.priority === 'critical';
          }).length)
        }
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
          status: 'read'
        })),
        counts: {
          ...state.counts,
          totalUnread: 0,
          criticalUnread: 0
        }
      };

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        counts: {
          ...state.counts,
          totalUnread: state.counts.totalUnread + 1,
          criticalUnread: action.payload.priority === 'critical'
            ? state.counts.criticalUnread + 1
            : state.counts.criticalUnread
        }
      };

    case NOTIFICATION_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case NOTIFICATION_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext();

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Fetch notifications
  const fetchNotifications = async (params = {}) => {
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });

      const response = await apiService.getNotifications({
        limit: 50,
        ...params
      });

      if (response.data.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS,
          payload: response.data.data
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to fetch notifications'
      });
    }
  };

  // Fetch notification counts
  const fetchNotificationCounts = async () => {
    try {
      const response = await apiService.getNotificationCounts();
      if (response.data.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_COUNTS,
          payload: response.data.data
        });
      }
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  // Mark notifications as read
  const markAsRead = async (notificationIds) => {
    try {
      await apiService.markNotificationsAsRead(notificationIds);
      dispatch({
        type: NOTIFICATION_ACTIONS.MARK_AS_READ,
        payload: notificationIds
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: 'Failed to mark notifications as read'
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      dispatch({
        type: NOTIFICATION_ACTIONS.SET_ERROR,
        payload: 'Failed to mark all notifications as read'
      });
    }
  };

  // Add new notification (for real-time updates)
  const addNotification = (notification) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
      payload: notification
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ERROR });
  };

  // Auto-fetch notifications and counts on mount
  useEffect(() => {
    fetchNotifications();
    fetchNotificationCounts();

    // Set up periodic refresh (every 30 seconds)
    const interval = setInterval(() => {
      fetchNotificationCounts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Context value
  const value = {
    ...state,
    actions: {
      fetchNotifications,
      fetchNotificationCounts,
      markAsRead,
      markAllAsRead,
      addNotification,
      clearError
    }
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;