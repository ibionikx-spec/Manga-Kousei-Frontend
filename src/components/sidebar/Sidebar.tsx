import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  PenTool,
  Plus,
  LayoutGrid,
  LibraryBig,
  ClipboardCheck,
  CalendarDays,
  TrendingUp,
  CircleHelp,
  LogOut,
  BookOpen,
  Banknote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./Sidebar.scss";

interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export const Sidebar = () => {
  const { user, logout } = useAuth();

  const currentRole = user?.role || "";

  const menuConfig: Record<string, MenuItem[]> = {
    MANGAKA: [
      { path: "/dashboard", label: "Bảng điều khiển", icon: LayoutGrid },
      { path: "/manage", label: "Quản lý Tác phẩm", icon: LibraryBig },
      {
        path: "/approvals",
        label: "Không gian Phê duyệt",
        icon: ClipboardCheck,
      },
      { path: "/schedule", label: "Lịch trình Xuất bản", icon: CalendarDays },
      { path: "/reports", label: "Báo cáo Kinh doanh", icon: TrendingUp },
    ],
    ADMIN: [
      { path: "/dashboard", label: "Bảng điều khiển", icon: LayoutGrid },
      { path: "/approve", label: "Xét duyệt dự án mới", icon: ClipboardCheck },
      { path: "/rate", label: "Đánh giá & sinh tồn", icon: TrendingUp },
      { path: "/management", label: "Quản lý số tạp chí", icon: BookOpen },
      { path: "/finance", label: "Tài chính & hợp đồng", icon: Banknote },
    ],
  };

  const currentMenus = menuConfig[currentRole] || [];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-top">
        <div className="brand-logo">
          <div className="icon-wrapper">
            <PenTool size={20} color="white" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Manga Kousei</span>
            <span className="brand-subtitle">EDITORIAL BOARD</span>
          </div>
        </div>

        {currentRole === "MANGAKA" && (
          <button className="create-btn">
            <Plus size={18} />
            <span>Tạo Tác phẩm Mới</span>
          </button>
        )}

        <nav className="menu-nav">
          {currentMenus.map((menu, index) => {
            const Icon = menu.icon;
            return (
              <NavLink
                key={index}
                to={menu.path}
                className={({ isActive }) =>
                  `menu-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={20} className="menu-icon" />
                <span>{menu.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="divider"></div>

        <NavLink
          to="/support"
          className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
        >
          <CircleHelp size={20} className="menu-icon" />
          <span>Hỗ trợ</span>
        </NavLink>

        <button onClick={logout} className="menu-item logout-btn">
          <LogOut size={20} className="menu-icon" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
