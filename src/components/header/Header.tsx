import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useLogout } from "../../hooks/useLogout";
import { ConfirmDialog } from "../dialog/ConfirmDialog";
import {
  Search,
  CircleHelp,
  MessageSquareText,
  Bell,
  UserRound,
  LogOut,
  History,
  Settings,
  ShieldCheck,
  BookOpenCheck,
  Send,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationCount } from "../../hooks/useNotificationCount";
import {
  fetchMyNotifications,
  markAllRead,
  markOneRead,
  type NotificationItem,
} from "../../services/notificationService";
import { onNotification } from "../../services/notificationSocket";
import "./Header.scss";

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [activeUtility, setActiveUtility] = useState<
    "help" | "messages" | "notifications" | null
  >(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const utilityRef = useRef<HTMLDivElement>(null);

  const { count: notifCount, refresh: refreshCount } = useNotificationCount();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const {
    showConfirmLogout,
    handleLogoutClick,
    handleConfirmLogout,
    handleCancelLogout,
  } = useLogout();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
      if (
        utilityRef.current &&
        !utilityRef.current.contains(event.target as Node)
      ) {
        setActiveUtility(null);
      }
    };
    if (showPopup || activeUtility) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopup, activeUtility]);

  useEffect(() => {
    if (activeUtility !== "notifications") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotifLoading(true);
    fetchMyNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false));
  }, [activeUtility]);

  useEffect(() => {
    const unsubscribe = onNotification((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });
    return unsubscribe;
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    refreshCount();
  };

  const handleMarkOneRead = async (id: number) => {
    await markOneRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)),
    );
    refreshCount();
  };

  const handleProfileClick = () => {
    setShowPopup(false);
    setActiveUtility(null);
    navigate("/profile");
  };

  const handleActivityHistoryClick = () => {
    setShowPopup(false);
    setActiveUtility(null);
    navigate("/activity-history");
  };

  const goTo = (path: string) => {
    setActiveUtility(null);
    setShowPopup(false);
    navigate(path);
  };

  const role = user?.role;
  const reviewPath =
    role === "ADMIN"
      ? "/admin/proposal-review"
      : role === "TANTOU"
        ? "/tantou/proposal-review"
        : role === "MANGAKA"
          ? "/mangaka/series"
          : "/dashboard";
  const schedulePath =
    role === "TANTOU"
      ? "/tantou/schedule"
      : role === "MANGAKA"
        ? "/mangaka/schedule"
        : "/dashboard";

  const toggleUtility = (panel: "help" | "messages" | "notifications") => {
    setShowPopup(false);
    setActiveUtility((current) => (current === panel ? null : panel));
  };

  return (
    <header className="header-container">
      <div className="search-box">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm series, báo cáo..."
          className="search-input"
        />
      </div>

      <div className="header-right">
        <div className="icon-group" ref={utilityRef}>
          <button
            className={`icon-btn ${activeUtility === "help" ? "active" : ""}`}
            type="button"
            aria-label="Mở trợ giúp"
            onClick={() => toggleUtility("help")}
          >
            <CircleHelp size={22} strokeWidth={1.5} />
          </button>

          <button
            className={`icon-btn chat-btn ${activeUtility === "messages" ? "active" : ""}`}
            type="button"
            aria-label="Mở tin nhắn"
            onClick={() => toggleUtility("messages")}
          >
            <MessageSquareText size={22} strokeWidth={1.5} />
            <span className="red-dot"></span>
          </button>

          <button
            className={`icon-btn header-bell ${activeUtility === "notifications" ? "active" : ""}`}
            type="button"
            aria-label="Mở thông báo"
            onClick={() => toggleUtility("notifications")}
          >
            <Bell size={22} strokeWidth={1.5} />
            {notifCount > 0 && (
              <span className="header-bell__badge">
                {notifCount > 99 ? "99+" : notifCount}
              </span>
            )}
          </button>

          {activeUtility === "help" && (
            <div className="header-popover header-popover--utility">
              <div className="header-popover__header">
                <div>
                  <strong>Trợ giúp nhanh</strong>
                  <span>Các lối tắt thường dùng</span>
                </div>
              </div>
              <div className="header-action-list">
                <button type="button" onClick={() => goTo("/setting")}>
                  <Settings size={17} />
                  <span>Cài đặt hệ thống</span>
                </button>
                <button type="button" onClick={handleProfileClick}>
                  <ShieldCheck size={17} />
                  <span>Kiểm tra hồ sơ & bảo mật</span>
                </button>
                <button type="button" onClick={() => goTo(reviewPath)}>
                  <BookOpenCheck size={17} />
                  <span>Mở khu vực xét duyệt</span>
                </button>
              </div>
            </div>
          )}

          {activeUtility === "messages" && (
            <div className="header-popover header-popover--utility">
              <div className="header-popover__header">
                <div>
                  <strong>Hộp tin nội bộ</strong>
                  <span>3 trao đổi cần theo dõi</span>
                </div>
                <button type="button" aria-label="Soạn tin nhắn">
                  <Send size={16} />
                </button>
              </div>
              <div className="header-message-list">
                <button type="button" onClick={() => goTo(reviewPath)}>
                  <strong>Ban biên tập</strong>
                  <span>Có phản hồi mới trong luồng xét duyệt bản name.</span>
                  <time>5 phút trước</time>
                </button>
                <button type="button" onClick={() => goTo(schedulePath)}>
                  <strong>Lịch sản xuất</strong>
                  <span>Deadline tuần này đã được cập nhật.</span>
                  <time>31 phút trước</time>
                </button>
                <button type="button" onClick={() => goTo("/profile")}>
                  <strong>Hệ thống</strong>
                  <span>Hồ sơ tài khoản đã đồng bộ thành công.</span>
                  <time>Hôm qua</time>
                </button>
              </div>
            </div>
          )}

          {activeUtility === "notifications" && (
            <div className="header-popover header-popover--utility header-popover--notif">
              <div className="header-popover__header">
                <div>
                  <strong>Thông báo</strong>
                  <span>
                    {notifCount > 0
                      ? `${notifCount} chưa đọc`
                      : "Không có thông báo mới"}
                  </span>
                </div>
                {notifCount > 0 && (
                  <button
                    type="button"
                    className="header-notif__mark-all"
                    onClick={handleMarkAllRead}
                    title="Đánh dấu tất cả đã đọc"
                  >
                    <CheckCheck size={15} />
                  </button>
                )}
              </div>

              <div className="header-notif-list">
                {notifLoading ? (
                  <div className="header-notif__empty">
                    <Loader2 size={18} className="header-notif__spin" />
                    <span>Đang tải...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="header-notif__empty">
                    <Bell size={28} strokeWidth={1.2} />
                    <span>Chưa có thông báo nào</span>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.notificationId}
                      type="button"
                      className={`header-notif-item ${!notif.isRead ? "header-notif-item--unread" : ""}`}
                      onClick={() => {
                        if (!notif.isRead)
                          handleMarkOneRead(notif.notificationId);
                      }}
                    >
                      {!notif.isRead && (
                        <span className="header-notif-item__dot" />
                      )}
                      <span className="header-notif-item__body">
                        <strong>{notif.title}</strong>
                        <small>{notif.message}</small>
                        <time>{notif.createdAt}</time>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="divider"></div>

        <div className="user-profile-wrapper" ref={popupRef}>
          <div
            className="user-profile"
            onClick={() => setShowPopup((prev) => !prev)}
          >
            <div className="user-info">
              <span className="user-name">{user?.fullName || "Khách"}</span>
              <span className="user-role">{user?.role || "Chưa rõ"}</span>
            </div>
            <img
              src={
                user?.avatarUrl ??
                "https://ui-avatars.com/api/?name=User&background=4F6EF7&color=fff"
              }
              alt="User Avatar"
              className="user-avatar"
            />
          </div>

          {showPopup && (
            <div className="profile-popup">
              <div className="popup-header">
                <div className="popup-avatar-wrapper">
                  <img
                    src={
                      user?.avatarUrl ??
                      "https://ui-avatars.com/api/?name=User&background=4F6EF7&color=fff"
                    }
                    alt="User Avatar"
                    className="popup-avatar"
                  />
                </div>
                <div className="popup-user-info">
                  <span className="popup-user-name">
                    {user?.fullName || "Kousei Admin"}
                  </span>
                  <span className="popup-user-email">
                    {user?.email || "kousei.admin@hathong.vn"}
                  </span>
                  <span className="popup-user-role">
                    {user?.role || "ADMIN"}
                  </span>
                </div>
              </div>

              <div className="popup-divider" />

              <ul className="popup-menu">
                <li className="popup-menu-item" onClick={handleProfileClick}>
                  <UserRound size={16} strokeWidth={1.5} />
                  <span>Hồ sơ của bạn</span>
                </li>
                <li
                  className="popup-menu-item"
                  onClick={handleActivityHistoryClick}
                >
                  <History size={16} strokeWidth={1.5} />
                  <span>Lịch sử hoạt động</span>
                </li>
                <li
                  className="popup-menu-item popup-menu-item--danger"
                  onClick={handleLogoutClick}
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  <span>Đăng xuất</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmLogout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </header>
  );
};
