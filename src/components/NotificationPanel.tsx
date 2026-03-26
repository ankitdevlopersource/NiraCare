import React from 'react';
import { Bell, X, CheckCircle, AlertCircle, Clock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'otp_generated' | 'booking_completed';
  bookingType: 'hospital' | 'ambulance';
  isRead: boolean;
  otp?: string;
  createdAt: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

export default function NotificationPanel({ isOpen, onClose, notifications, onMarkAsRead }: NotificationPanelProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'booking_cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'otp_generated':
        return <Check className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return 'border-l-green-500 bg-green-50';
      case 'booking_cancelled':
        return 'border-l-red-500 bg-red-50';
      case 'otp_generated':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-orange-500 bg-orange-50';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-slate-600" />
                <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <Bell className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-slate-500 text-center font-medium">
                    No notifications yet
                  </p>
                  <p className="text-slate-400 text-sm text-center mt-1">
                    You'll see booking updates here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed mb-2">
                            {notification.message}
                          </p>
                          {notification.otp && (
                            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-2">
                              <p className="text-blue-800 font-bold text-sm">
                                OTP: <span className="text-blue-600">{notification.otp}</span>
                              </p>
                              <p className="text-blue-600 text-xs mt-1">
                                Use this OTP for pickup verification
                              </p>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                            {!notification.isRead && (
                              <button
                                onClick={() => onMarkAsRead(notification._id)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}