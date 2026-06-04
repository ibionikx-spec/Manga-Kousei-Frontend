import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { Search, CircleHelp, MessageSquareText, Bell } from "lucide-react";
import "./Header.scss";

export const Header = () => {
  const { user } = useAuth();

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

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user?.fullName || "Khách"}</span>
            <span className="user-role">{user?.role || "Chưa rõ"}</span>
          </div>
          <img
            src="https://ui-avatars.com/api/?name=User&background=random"
            alt="User Avatar"
            className="user-avatar"
          />
        </div>
      </div>
    </header>
  );
};
