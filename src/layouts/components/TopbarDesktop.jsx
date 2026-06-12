import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import API from "@/services/index";
import token from "@/lib/utilities";

const TopbarDesktop = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("unread");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const dropdownRef = useRef(null);
  const scheduleTimeoutRef = useRef(null);

  const user = token.getUserData();
  const isAdmin = user?.role?.value === "admin";

  const unreadNotifications = useMemo(() => {
    return notifications.filter((item) => !Boolean(item.is_read));
  }, [notifications]);

  const readNotifications = useMemo(() => {
    return notifications.filter((item) => Boolean(item.is_read));
  }, [notifications]);

  const unreadCount = unreadNotifications.length;
  const visibleNotifications = activeTab === "unread" ? unreadNotifications : readNotifications;

  const fetchNotifications = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setIsLoadingNotifications(true);

      const res = await API.private.getNotifications();
      const data = res?.data?.data || res?.data || [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FetchNotifications Error:", err);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [isAdmin]);

  const getNextNotificationFetchDelay = () => {
    const now = new Date();
    const next = new Date(now);

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour < 8) {
      next.setHours(8, 0, 0, 0);
      return next.getTime() - now.getTime();
    }

    if (currentHour === 8) {
      const nextMinute = Math.ceil((currentMinute + 1) / 15) * 15;

      if (nextMinute < 60) {
        next.setHours(8, nextMinute, 0, 0);
        return next.getTime() - now.getTime();
      }

      next.setDate(next.getDate() + 1);
      next.setHours(8, 0, 0, 0);
      return next.getTime() - now.getTime();
    }

    next.setDate(next.getDate() + 1);
    next.setHours(8, 0, 0, 0);
    return next.getTime() - now.getTime();
  };

  const handleToggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
  };

  const handleRefreshNotifications = async (event) => {
    event.stopPropagation();
    await fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId) => {
    const notification = notifications.find((item) => Number(item.id) === Number(notificationId));

    if (!notification || notification.is_read) return;

    try {
      await API.private.markNotificationAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((item) => (Number(item.id) === Number(notificationId) ? { ...item, is_read: true } : item)),
      );
    } catch (err) {
      console.error("MarkNotificationAsRead Error:", err);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    const scheduleNextFetch = () => {
      const delay = getNextNotificationFetchDelay();

      scheduleTimeoutRef.current = setTimeout(async () => {
        await fetchNotifications();
        scheduleNextFetch();
      }, delay);
    };

    scheduleNextFetch();

    return () => {
      if (scheduleTimeoutRef.current) {
        clearTimeout(scheduleTimeoutRef.current);
      }
    };
  }, [fetchNotifications, isAdmin]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current || dropdownRef.current.contains(event.target)) return;
      setIsNotificationsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="hidden md:flex justify-end items-center bg-white shadow px-6 fixed top-0 right-0 left-16 z-30 h-16">
      {isAdmin && (
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="relative flex items-center justify-center text-gray-600 hover:text-accent transition-colors"
            aria-label="Notifications"
          >
            <Icon icon="mdi:bell" width={28} className="cursor-pointer" />

            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold shadow">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>

                <button
                  type="button"
                  onClick={handleRefreshNotifications}
                  disabled={isLoadingNotifications}
                  className="text-xs font-medium text-accent disabled:opacity-50"
                >
                  {isLoadingNotifications ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              <div className="grid grid-cols-2 p-2 gap-2 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveTab("unread")}
                  className={`h-8 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "unread"
                      ? "bg-accent text-white shadow"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Unread {unreadNotifications.length > 0 ? `(${unreadNotifications.length})` : ""}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("read")}
                  className={`h-8 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === "read" ? "bg-accent text-white shadow" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {isLoadingNotifications && notifications.length === 0 ? (
                  <div className="px-4 py-5 text-sm text-gray-500 text-center">Loading notifications...</div>
                ) : visibleNotifications.length === 0 ? (
                  <div className="px-4 py-5 text-sm text-gray-500 text-center">
                    {activeTab === "unread" ? "No unread notifications." : "No read notifications."}
                  </div>
                ) : (
                  visibleNotifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleMarkAsRead(item.id)}
                      className="w-full text-left px-4 py-2.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                            item.is_read ? "bg-gray-300" : "bg-accent"
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.title}</p>

                            {!item.is_read && (
                              <span className="text-[10px] font-semibold text-accent flex-shrink-0">New</span>
                            )}
                          </div>

                          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug line-clamp-1">{item.message}</p>

                          {item.created_at && (
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <Icon icon="mdi:account-circle" width={34} className="cursor-pointer text-gray-600 ml-4" />

      <div className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full ml-4 shadow">ENG</div>
    </div>
  );
};

export default TopbarDesktop;
