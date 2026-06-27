import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Link2,
  Link2Off,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import {
  fetchUsersByRole,
  createUser,
  fetchAssignments,
  assignTantou,
  removeAssignment,
  type PersonnelUser,
  type AssignmentItem,
  type CreateUserReq,
} from "../../services/personnelService";
import "./AdminPersonnel.scss";

type Tab = "TANTOU" | "MANGAKA" | "ASSISTANT" | "assignments";
type Role = "TANTOU" | "MANGAKA" | "ASSISTANT" | "ADMIN";

const ROLE_LABELS: Record<string, string> = {
  TANTOU: "Tantou",
  MANGAKA: "Mangaka",
  ASSISTANT: "Assistant",
  ADMIN: "Admin",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const getColor = (name: string) => {
  const colors = ["#0254b1", "#6366f1", "#16a34a", "#ea580c", "#db2777"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + h * 31;
  return colors[Math.abs(h) % colors.length];
};

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (u: PersonnelUser) => void;
}) {
  const [form, setForm] = useState<CreateUserReq>({
    fullName: "",
    email: "",
    password: "",
    roleName: "MANGAKA",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!form.fullName || !form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await createUser(form);
      onCreated(user);
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "Tạo tài khoản thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-modal-overlay" onClick={onClose}>
      <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ap-modal__header">
          <h2>Tạo tài khoản mới</h2>
          <button type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="ap-modal__body">
          {error && (
            <div className="ap-alert ap-alert--error">
              <AlertTriangle size={15} />
              {error}
            </div>
          )}

          <label className="ap-field">
            <span>Họ và tên *</span>
            <input
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
              placeholder="Nguyễn Văn A"
            />
          </label>
          <label className="ap-field">
            <span>Email *</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="email@example.com"
            />
          </label>
          <label className="ap-field">
            <span>Mật khẩu *</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="Tối thiểu 6 ký tự"
            />
          </label>
          <label className="ap-field">
            <span>Role *</span>
            <select
              value={form.roleName}
              onChange={(e) =>
                setForm((f) => ({ ...f, roleName: e.target.value as Role }))
              }
            >
              <option value="MANGAKA">Mangaka</option>
              <option value="TANTOU">Tantou</option>
              <option value="ASSISTANT">Assistant</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
        </div>

        <div className="ap-modal__footer">
          <button
            type="button"
            className="ap-btn ap-btn--ghost"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="ap-btn ap-btn--primary"
            onClick={submit}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={15} className="ap-spin" />
            ) : (
              <UserPlus size={15} />
            )}
            Tạo tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignModal({
  tantous,
  mangakas,
  onClose,
  onAssigned,
}: {
  tantous: PersonnelUser[];
  mangakas: PersonnelUser[];
  onClose: () => void;
  onAssigned: (a: AssignmentItem) => void;
}) {
  const [tantouId, setTantouId] = useState<number | "">("");
  const [mangakaId, setMangakaId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!tantouId || !mangakaId) {
      setError("Vui lòng chọn cả Tantou và Mangaka.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await assignTantou(Number(tantouId), Number(mangakaId));
      onAssigned(res);
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "Phân công thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-modal-overlay" onClick={onClose}>
      <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ap-modal__header">
          <h2>Phân công Tantou → Mangaka</h2>
          <button type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="ap-modal__body">
          {error && (
            <div className="ap-alert ap-alert--error">
              <AlertTriangle size={15} />
              {error}
            </div>
          )}
          <label className="ap-field">
            <span>Chọn Tantou *</span>
            <select
              value={tantouId}
              onChange={(e) => setTantouId(Number(e.target.value))}
            >
              <option value="">-- Chọn Tantou --</option>
              {tantous.map((t) => (
                <option key={t.userId} value={t.userId}>
                  {t.fullName} ({t.email})
                </option>
              ))}
            </select>
          </label>
          <label className="ap-field">
            <span>Chọn Mangaka *</span>
            <select
              value={mangakaId}
              onChange={(e) => setMangakaId(Number(e.target.value))}
            >
              <option value="">-- Chọn Mangaka --</option>
              {mangakas.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.fullName} ({m.email})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="ap-modal__footer">
          <button
            type="button"
            className="ap-btn ap-btn--ghost"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="ap-btn ap-btn--primary"
            onClick={submit}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={15} className="ap-spin" />
            ) : (
              <Link2 size={15} />
            )}
            Phân công
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPersonnel() {
  const [tab, setTab] = useState<Tab>("MANGAKA");
  const [users, setUsers] = useState<PersonnelUser[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [tantous, setTantous] = useState<PersonnelUser[]>([]);
  const [mangakas, setMangakas] = useState<PersonnelUser[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setSearch("");
    if (tab === "assignments") {
      Promise.all([
        fetchAssignments(),
        fetchUsersByRole("TANTOU"),
        fetchUsersByRole("MANGAKA"),
      ])
        .then(([a, t, m]) => {
          setAssignments(a);
          setTantous(t);
          setMangakas(m);
        })
        .finally(() => setLoading(false));
    } else {
      fetchUsersByRole(tab)
        .then(setUsers)
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredAssign = assignments.filter(
    (a) =>
      a.tantouName.toLowerCase().includes(search.toLowerCase()) ||
      a.mangakaName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleRemoveAssignment = async (id: number) => {
    if (!confirm("Bạn có chắc muốn hủy phân công này?")) return;
    try {
      await removeAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.assignmentId !== id));
      showToast("Đã hủy phân công thành công.");
    } catch {
      showToast("Hủy phân công thất bại.");
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: "MANGAKA", label: "Mangaka", icon: Users },
    { key: "TANTOU", label: "Tantou", icon: Users },
    { key: "ASSISTANT", label: "Assistant", icon: Users },
    { key: "assignments", label: "Phân công", icon: Link2 },
  ];

  return (
    <div className="ap-page">
      {toast && (
        <div className="ap-toast">
          <CheckCircle2 size={15} />
          {toast}
        </div>
      )}

      <div className="ap-header">
        <div className="ap-header__left">
          <h1>Quản lý Nhân sự</h1>
          <p>Tạo tài khoản và phân công nhân sự trong hệ thống.</p>
        </div>
        <div className="ap-header__actions">
          {tab === "assignments" ? (
            <button
              className="ap-btn ap-btn--primary"
              onClick={() => setShowAssign(true)}
            >
              <Link2 size={15} /> Phân công mới
            </button>
          ) : (
            <button
              className="ap-btn ap-btn--primary"
              onClick={() => setShowCreate(true)}
            >
              <UserPlus size={15} /> Tạo tài khoản
            </button>
          )}
        </div>
      </div>

      <div className="ap-tabs">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              className={`ap-tab ${tab === t.key ? "ap-tab--active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              <Icon size={15} />
              {t.label}
              {tab !== "assignments" &&
                t.key !== "assignments" &&
                tab === t.key && (
                  <span className="ap-tab__count">{users.length}</span>
                )}
            </button>
          );
        })}
      </div>

      <div className="ap-search">
        <Search size={15} className="ap-search__icon" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            tab === "assignments"
              ? "Tìm Tantou hoặc Mangaka..."
              : "Tìm theo tên hoặc email..."
          }
        />
        {search && (
          <button onClick={() => setSearch("")}>
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="ap-loading">
          <Loader2 size={22} className="ap-spin" /> Đang tải...
        </div>
      ) : tab === "assignments" ? (
        <div className="ap-card">
          <div className="ap-table-head">
            <span>TANTOU</span>
            <span>MANGAKA</span>
            <span>NGÀY PHÂN CÔNG</span>
            <span></span>
          </div>
          {filteredAssign.length === 0 ? (
            <div className="ap-empty">Chưa có phân công nào.</div>
          ) : (
            filteredAssign.map((a) => (
              <div key={a.assignmentId} className="ap-table-row">
                <div className="ap-user-cell">
                  <div
                    className="ap-avatar"
                    style={{ background: getColor(a.tantouName) }}
                  >
                    {a.tantouAvatarUrl ? (
                      <img src={a.tantouAvatarUrl} alt="" />
                    ) : (
                      getInitials(a.tantouName)
                    )}
                  </div>
                  <div>
                    <strong>{a.tantouName}</strong>
                    <span>Tantou</span>
                  </div>
                </div>
                <div className="ap-user-cell">
                  <ChevronRight size={16} className="ap-arrow" />
                  <div
                    className="ap-avatar"
                    style={{ background: getColor(a.mangakaName) }}
                  >
                    {a.mangakaAvatarUrl ? (
                      <img src={a.mangakaAvatarUrl} alt="" />
                    ) : (
                      getInitials(a.mangakaName)
                    )}
                  </div>
                  <div>
                    <strong>{a.mangakaName}</strong>
                    <span>Mangaka</span>
                  </div>
                </div>
                <span className="ap-date">{a.assignedAt}</span>
                <button
                  className="ap-btn ap-btn--danger-ghost"
                  onClick={() => handleRemoveAssignment(a.assignmentId)}
                >
                  <Link2Off size={14} /> Hủy
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="ap-grid">
          {filtered.length === 0 ? (
            <div className="ap-empty">Không tìm thấy kết quả.</div>
          ) : (
            filtered.map((u) => (
              <div key={u.userId} className="ap-user-card">
                <div
                  className="ap-user-card__avatar"
                  style={{ background: getColor(u.fullName) }}
                >
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt="" />
                  ) : (
                    getInitials(u.fullName)
                  )}
                </div>
                <div className="ap-user-card__info">
                  <strong>{u.fullName}</strong>
                  <span>{u.email}</span>
                  <div className="ap-role-badge">
                    {ROLE_LABELS[u.roles[0]] ?? u.roles[0]}
                  </div>
                </div>
                <div className="ap-user-card__meta">
                  <span>
                    Tham gia: {u.createdAt ? u.createdAt.split(" ")[0] : "—"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(u) => {
            if (tab === u.roles[0]) setUsers((prev) => [u, ...prev]);
            showToast(`Tạo tài khoản ${u.fullName} thành công!`);
          }}
        />
      )}
      {showAssign && (
        <AssignModal
          tantous={tantous}
          mangakas={mangakas}
          onClose={() => setShowAssign(false)}
          onAssigned={(a) => {
            setAssignments((prev) => [a, ...prev]);
            showToast(
              `Phân công ${a.tantouName} → ${a.mangakaName} thành công!`,
            );
          }}
        />
      )}
    </div>
  );
}
