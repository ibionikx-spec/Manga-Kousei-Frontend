import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ConfirmDialog } from "../dialog/ConfirmDialog";
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
  Calendar,
  Users,
  LineChart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./Sidebar.scss";
import { useLogout } from "../../hooks/useLogout";

interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export const Sidebar = () => {
  const { user } = useAuth();
  const {
    showConfirmLogout,
    handleLogoutClick,
    handleConfirmLogout,
    handleCancelLogout,
  } = useLogout();

  const currentRole = user?.role || "";

  const menuConfig: Record<string, MenuItem[]> = {
    TANTOU: [
      { path: "tantou/dashboard", label: "Bảng điều khiển", icon: LayoutGrid },
      { path: "tantou/manage", label: "Quản lý Tác phẩm", icon: LibraryBig },
      {
        path: "tantou/approvals",
        label: "Không gian Phê duyệt",
        icon: ClipboardCheck,
      },
      {
        path: "tantou/schedule",
        label: "Lịch trình Xuất bản",
        icon: CalendarDays,
      },
      {
        path: "tantou/reports",
        label: "Báo cáo Kinh doanh",
        icon: TrendingUp,
      },
    ],
    ADMIN: [
      { path: "admin/dashboard", label: "Bảng điều khiển", icon: LayoutGrid },
      {
        path: "admin/approvals",
        label: "Xét duyệt dự án mới",
        icon: ClipboardCheck,
      },
      {
        path: "admin/survival",
        label: "Đánh giá & sinh tồn",
        icon: TrendingUp,
      },
      { path: "admin/magazines", label: "Quản lý số tạp chí", icon: BookOpen },
      {
        path: "admin/contracts",
        label: "Tài chính & hợp đồng",
        icon: Banknote,
      },
    ],
    MANGAKA: [
      {
        path: "mangaka/dashboard",
        label: "Bảng điều khiển",
        icon: LayoutGrid,
      },
      {
        path: "mangaka/series",
        label: "Tác phẩm",
        icon: BookOpen,
      },
      {
        path: "mangaka/schedule",
        label: "Lịch trình",
        icon: Calendar,
      },
      {
        path: "mangaka/assistants",
        label: "Nhân sự",
        icon: Users,
      },
      {
        path: "mangaka/reports",
        label: "Báo cáo",
        icon: LineChart,
      },
    ],
  };

  const currentMenus = menuConfig[currentRole] || [];

  return (
    <>
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

          {["MANGAKA", "TANTOU"].includes(currentRole) && (
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
            to="/setting"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <CircleHelp size={20} className="menu-icon" />
            <span>Cài đặt</span>
          </NavLink>

          <button onClick={handleLogoutClick} className="menu-item logout-btn">
            <LogOut size={20} className="menu-icon" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
      <ConfirmDialog
        isOpen={showConfirmLogout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </>
  );
};
