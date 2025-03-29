import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, CreditCard, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { getUserNotifications } from "@/data/mockData";
import { Notification } from "@/types";

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const notifications = getUserNotifications(user?.id || "");
  
  // Mark notifications as read (in a real app, this would call an API)
  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === "appointment" && notification.relatedId) {
      navigate("/appointments");
    } else if (notification.type === "message" && notification.relatedId) {
      navigate(`/chat/${notification.relatedId.split('-')[1]}`);
    } else if (notification.type === "payment" && notification.relatedId) {
      navigate(`/payment-checkout/${notification.relatedId}`);
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      
      // If today, display time
      if (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      ) {
        return format(date, "h:mm a");
      }
      
      // If yesterday
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
      ) {
        return "Yesterday";
      }
      
      // Otherwise, display date
      return format(date, "MMM d");
    } catch (e) {
      return timestamp;
    }
  };
  
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-purple-500" />;
      case "system":
        return <Bell className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <AppLayout title="Notifications">
      <div className="divide-y">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <button
              key={notification.id}
              className={`w-full p-4 flex items-start text-left focus:outline-none ${
                !notification.read ? "bg-blue-50" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="bg-white p-2 rounded-full border mr-3">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{notification.title}</h3>
                <p className="text-gray-600 text-sm mt-0.5">{notification.message}</p>
              </div>
              
              <div className="text-xs text-gray-500 ml-3 mt-1">
                {formatTimestamp(notification.timestamp)}
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">You have no notifications</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
