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
} from "lucide-react";
import "./Header.scss";

export const Header = () => {
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
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
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

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
        <div className="icon-group">
          <button className="icon-btn">
            <CircleHelp size={22} strokeWidth={1.5} />
          </button>

          <button className="icon-btn chat-btn">
            <MessageSquareText size={22} strokeWidth={1.5} />
            <span className="red-dot"></span>
          </button>

          <button className="icon-btn">
            <Bell size={22} strokeWidth={1.5} />
          </button>
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

              {/* <button className="popup-manage-btn">Quản lý tài khoản</button> */}

              <div className="popup-divider" />

              <ul className="popup-menu">
                <li className="popup-menu-item">
                  <UserRound size={16} strokeWidth={1.5} />
                  <span>Hồ sơ của bạn</span>
                </li>
                <li className="popup-menu-item">
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
