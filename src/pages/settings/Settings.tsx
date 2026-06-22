import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  Download,
  Eye,
  Globe2,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  MonitorCog,
  Moon,
  RotateCcw,
  Save,
  ShieldCheck,
  Smartphone,
  Sun,
  UserCog,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import "./Settings.scss";

type ThemeMode = "system" | "light" | "dark";
type DensityMode = "comfortable" | "compact";

interface SettingsState {
  theme: ThemeMode;
  density: DensityMode;
  language: string;
  timezone: string;
  weeklyDigest: boolean;
  reviewAlerts: boolean;
  paymentAlerts: boolean;
  securityAlerts: boolean;
  twoFactor: boolean;
  trustedDevice: boolean;
  sessionTimeout: number;
  dashboardLanding: string;
  autoSaveDrafts: boolean;
}

const defaultSettings: SettingsState = {
  theme: "system",
  density: "comfortable",
  language: "vi",
  timezone: "Asia/Ho_Chi_Minh",
  weeklyDigest: true,
  reviewAlerts: true,
  paymentAlerts: false,
  securityAlerts: true,
  twoFactor: false,
  trustedDevice: true,
  sessionTimeout: 30,
  dashboardLanding: "dashboard",
  autoSaveDrafts: true,
};

const storageKey = "manga-kousei-settings";

const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị viên",
  TANTOU: "Biên tập viên Tantou",
  MANGAKA: "Tác giả Mangaka",
  ASSISTANT: "Trợ lý sản xuất",
};

function readStoredSettings() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(readStoredSettings);
  const [saved, setSaved] = useState(false);

  const userRole = user?.role || "USER";
  const displayName = user?.fullName || "Manga Kousei User";
  const enabledNotificationCount = [
    settings.weeklyDigest,
    settings.reviewAlerts,
    settings.paymentAlerts,
    settings.securityAlerts,
  ].filter(Boolean).length;

  const securityScore = useMemo(() => {
    let score = 58;
    if (settings.twoFactor) score += 24;
    if (settings.securityAlerts) score += 10;
    if (settings.sessionTimeout <= 30) score += 8;
    return Math.min(score, 100);
  }, [settings.securityAlerts, settings.sessionTimeout, settings.twoFactor]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!saved) return;

    const timerId = window.setTimeout(() => setSaved(false), 1800);
    return () => window.clearTimeout(timerId);
  }, [saved]);

  const updateSetting = <Key extends keyof SettingsState>(
    key: Key,
    value: SettingsState[Key]
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => setSaved(true);

  const handleReset = () => {
    setSettings(defaultSettings);
    setSaved(true);
  };

  return (
    <main className="settings-page">
      <section className="settings-hero">
        <div>
          <span className="settings-kicker">Cài đặt hệ thống</span>
          <h1>Không gian làm việc của {displayName}</h1>
          <p>
            Điều chỉnh trải nghiệm giao diện, thông báo, bảo mật và dữ liệu làm
            việc cho tài khoản {roleLabels[userRole] || userRole}.
          </p>
        </div>

        <div className="settings-hero__actions">
          <button className="settings-btn settings-btn--ghost" type="button" onClick={handleReset}>
            <RotateCcw size={17} />
            Khôi phục
          </button>
          <button className="settings-btn settings-btn--primary" type="button" onClick={handleSave}>
            {saved ? <Check size={17} /> : <Save size={17} />}
            {saved ? "Đã lưu" : "Lưu thay đổi"}
          </button>
        </div>
      </section>

      <section className="settings-summary" aria-label="Tổng quan cài đặt">
        <article>
          <span className="settings-summary__icon settings-summary__icon--blue">
            <MonitorCog size={20} />
          </span>
          <div>
            <strong>{settings.theme === "system" ? "Theo hệ thống" : settings.theme === "light" ? "Sáng" : "Tối"}</strong>
            <p>Chế độ giao diện</p>
          </div>
        </article>
        <article>
          <span className="settings-summary__icon settings-summary__icon--green">
            <Bell size={20} />
          </span>
          <div>
            <strong>{enabledNotificationCount}/4</strong>
            <p>Kênh thông báo đang bật</p>
          </div>
        </article>
        <article>
          <span className="settings-summary__icon settings-summary__icon--violet">
            <ShieldCheck size={20} />
          </span>
          <div>
            <strong>{securityScore}%</strong>
            <p>Điểm bảo mật tài khoản</p>
          </div>
        </article>
      </section>

      <section className="settings-grid">
        <article className="settings-panel settings-panel--wide">
          <div className="settings-panel__header">
            <div>
              <span className="settings-kicker">Giao diện</span>
              <h2>Hiển thị & thao tác</h2>
            </div>
            <LayoutDashboard size={20} />
          </div>

          <div className="settings-field">
            <label>Chế độ màu</label>
            <div className="settings-segmented" role="group" aria-label="Chế độ màu">
              <button
                className={settings.theme === "system" ? "active" : ""}
                type="button"
                onClick={() => updateSetting("theme", "system")}
              >
                <MonitorCog size={16} />
                Hệ thống
              </button>
              <button
                className={settings.theme === "light" ? "active" : ""}
                type="button"
                onClick={() => updateSetting("theme", "light")}
              >
                <Sun size={16} />
                Sáng
              </button>
              <button
                className={settings.theme === "dark" ? "active" : ""}
                type="button"
                onClick={() => updateSetting("theme", "dark")}
              >
                <Moon size={16} />
                Tối
              </button>
            </div>
          </div>

          <div className="settings-field">
            <label>Mật độ bảng điều khiển</label>
            <div className="settings-segmented" role="group" aria-label="Mật độ bảng điều khiển">
              <button
                className={settings.density === "comfortable" ? "active" : ""}
                type="button"
                onClick={() => updateSetting("density", "comfortable")}
              >
                Thoáng
              </button>
              <button
                className={settings.density === "compact" ? "active" : ""}
                type="button"
                onClick={() => updateSetting("density", "compact")}
              >
                Gọn
              </button>
            </div>
          </div>

          <div className="settings-two-col">
            <label className="settings-select">
              <span>Trang mở mặc định</span>
              <select
                value={settings.dashboardLanding}
                onChange={(event) => updateSetting("dashboardLanding", event.target.value)}
              >
                <option value="dashboard">Bảng điều khiển</option>
                <option value="approvals">Không gian xét duyệt</option>
                <option value="schedule">Lịch trình</option>
                <option value="reports">Báo cáo</option>
              </select>
            </label>

            <ToggleRow
              checked={settings.autoSaveDrafts}
              description="Tự lưu biểu mẫu đang soạn khi chuyển màn hình."
              icon={Save}
              label="Tự lưu bản nháp"
              onChange={(checked) => updateSetting("autoSaveDrafts", checked)}
            />
          </div>
        </article>

        <article className="settings-panel">
          <div className="settings-panel__header">
            <div>
              <span className="settings-kicker">Khu vực</span>
              <h2>Ngôn ngữ</h2>
            </div>
            <Globe2 size={20} />
          </div>

          <label className="settings-select">
            <span>Ngôn ngữ hiển thị</span>
            <select
              value={settings.language}
              onChange={(event) => updateSetting("language", event.target.value)}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </label>

          <label className="settings-select">
            <span>Múi giờ làm việc</span>
            <select
              value={settings.timezone}
              onChange={(event) => updateSetting("timezone", event.target.value)}
            >
              <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="UTC">UTC</option>
            </select>
          </label>
        </article>

        <article className="settings-panel settings-panel--wide">
          <div className="settings-panel__header">
            <div>
              <span className="settings-kicker">Thông báo</span>
              <h2>Kênh nhận tin</h2>
            </div>
            <Bell size={20} />
          </div>

          <div className="settings-toggle-list">
            <ToggleRow
              checked={settings.reviewAlerts}
              description="Nhận cảnh báo khi có bản name, dự án hoặc chương cần duyệt."
              icon={Eye}
              label="Nhắc xét duyệt"
              onChange={(checked) => updateSetting("reviewAlerts", checked)}
            />
            <ToggleRow
              checked={settings.weeklyDigest}
              description="Tóm tắt tiến độ, deadline và thay đổi quan trọng mỗi tuần."
              icon={Bell}
              label="Bản tin tuần"
              onChange={(checked) => updateSetting("weeklyDigest", checked)}
            />
            <ToggleRow
              checked={settings.paymentAlerts}
              description="Thông báo dòng tiền, hợp đồng, thanh toán và ngân sách."
              icon={Download}
              label="Tài chính & hợp đồng"
              onChange={(checked) => updateSetting("paymentAlerts", checked)}
            />
            <ToggleRow
              checked={settings.securityAlerts}
              description="Báo khi đăng nhập từ thiết bị mới hoặc thay đổi quyền truy cập."
              icon={LockKeyhole}
              label="Bảo mật"
              onChange={(checked) => updateSetting("securityAlerts", checked)}
            />
          </div>
        </article>

        <article className="settings-panel">
          <div className="settings-panel__header">
            <div>
              <span className="settings-kicker">Bảo mật</span>
              <h2>Phiên đăng nhập</h2>
            </div>
            <KeyRound size={20} />
          </div>

          <div className="settings-security-score">
            <div>
              <strong>{securityScore}%</strong>
              <span>Độ an toàn</span>
            </div>
            <div className="settings-security-score__bar" aria-hidden="true">
              <span style={{ width: `${securityScore}%` }} />
            </div>
          </div>

          <div className="settings-toggle-list">
            <ToggleRow
              checked={settings.twoFactor}
              description="Yêu cầu mã xác minh khi đăng nhập."
              icon={Smartphone}
              label="Xác thực hai lớp"
              onChange={(checked) => updateSetting("twoFactor", checked)}
            />
            <ToggleRow
              checked={settings.trustedDevice}
              description="Ghi nhớ thiết bị hiện tại trong lần đăng nhập sau."
              icon={UserCog}
              label="Thiết bị tin cậy"
              onChange={(checked) => updateSetting("trustedDevice", checked)}
            />
          </div>

          <label className="settings-range">
            <span>
              Tự đăng xuất sau <strong>{settings.sessionTimeout} phút</strong>
            </span>
            <input
              type="range"
              min="10"
              max="120"
              step="10"
              value={settings.sessionTimeout}
              onChange={(event) => updateSetting("sessionTimeout", Number(event.target.value))}
            />
          </label>
        </article>
      </section>
    </main>
  );
}

interface ToggleRowProps {
  checked: boolean;
  description: string;
  icon: typeof Bell;
  label: string;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ checked, description, icon: Icon, label, onChange }: ToggleRowProps) {
  return (
    <div className="settings-toggle-row">
      <span className="settings-toggle-row__icon">
        <Icon size={18} />
      </span>
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <button
        className={`settings-switch ${checked ? "settings-switch--on" : ""}`}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

export default Settings;
