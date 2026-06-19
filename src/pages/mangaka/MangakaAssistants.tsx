import { useEffect, useRef, useState } from "react";
import {
  Check,
  Clock,
  Search,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  deactivateAssistant,
  fetchActiveAssistants,
  fetchPendingInvitations,
  inviteAssistant,
  searchAssistants,
  type AssistantAssignmentRes,
  type AssistantSearchRes,
} from "../../services/assistantAssignmentService";
import { getAvatarColor, getInitials } from "../../utils";
import { formatDate } from "../../utils/date";
import "./MangakaAssistants.scss";

function Avatar({
  name,
  url,
  size = 40,
}: {
  name: string;
  url?: string | null;
  size?: number;
}) {
  if (url) {
    return (
      <img
        className="ma-avatar"
        src={url}
        alt={name}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="ma-avatar ma-avatar--initials"
      style={{ width: size, height: size, background: getAvatarColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
}

function SearchResultItem({
  result,
  onInvite,
  inviting,
}: {
  result: AssistantSearchRes;
  onInvite: (id: number) => void;
  inviting: boolean;
}) {
  const rel = result.relationshipStatus;
  const canInvite = rel === null || rel === "rejected" || rel === "inactive";

  return (
    <div className="ma-search-item">
      <Avatar name={result.fullName} url={result.avatarUrl} size={36} />
      <div className="ma-search-item__info">
        <span className="ma-search-item__name">{result.fullName}</span>
        <span className="ma-search-item__email">{result.email}</span>
      </div>
      {rel === "pending" && (
        <span className="ma-rel-badge ma-rel-badge--pending">
          <Clock size={11} /> Đang chờ
        </span>
      )}
      {rel === "active" && (
        <span className="ma-rel-badge ma-rel-badge--active">
          <Check size={11} /> Đang cộng tác
        </span>
      )}
      {canInvite && (
        <button
          className="ma-invite-btn"
          onClick={() => onInvite(result.userId)}
          disabled={inviting}
        >
          <UserPlus size={13} />
          {inviting ? "Đang gửi..." : "Mời"}
        </button>
      )}
    </div>
  );
}

type Tab = "active" | "pending";

export default function MangakaAssistants() {
  const [tab, setTab] = useState<Tab>("active");
  const [actives, setActives] = useState<AssistantAssignmentRes[]>([]);
  const [pendings, setPendings] = useState<AssistantAssignmentRes[]>([]);
  const [loading, setLoading] = useState(true);

  const [showSearch, setShowSearch] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<AssistantSearchRes[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [deactivating, setDeactivating] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([fetchActiveAssistants(), fetchPendingInvitations()])
      .then(([a, p]) => {
        setActives(a);
        setPendings(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!keyword.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const results = await searchAssistants(keyword);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [keyword]);

  const handleInvite = async (assistantId: number) => {
    setInviting(assistantId);
    try {
      const result = await inviteAssistant(assistantId);
      setPendings((prev) => [result, ...prev]);

      setSearchResults((prev) =>
        prev.map((r) =>
          r.userId === assistantId
            ? { ...r, relationshipStatus: "pending" }
            : r,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setInviting(null);
    }
  };

  const handleDeactivate = async (assignmentId: number) => {
    setDeactivating(assignmentId);
    try {
      await deactivateAssistant(assignmentId);
      setActives((prev) => prev.filter((a) => a.assignmentId !== assignmentId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeactivating(null);
    }
  };

  return (
    <section className="mangaka-assistants">
      <header className="assistants-hero">
        <div>
          <h1>Quản lý Nhân sự</h1>
          <p>
            {actives.length} trợ lý đang cộng tác · {pendings.length} lời mời
            đang chờ
          </p>
        </div>
        <button
          className="invite-button"
          type="button"
          onClick={() => {
            setShowSearch(true);
            setTimeout(() => searchRef.current?.focus(), 100);
          }}
        >
          <UserPlus size={16} />
          Mời trợ lý mới
        </button>
      </header>

      {showSearch && (
        <div className="ma-search-panel">
          <div className="ma-search-panel__head">
            <span>Tìm kiếm trợ lý</span>
            <button
              className="ma-search-panel__close"
              onClick={() => {
                setShowSearch(false);
                setKeyword("");
                setSearchResults([]);
              }}
            >
              <X size={15} />
            </button>
          </div>
          <div className="ma-search-box">
            <Search size={15} className="ma-search-box__icon" />
            <input
              ref={searchRef}
              placeholder="Nhập tên hoặc email trợ lý..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            {searching && <span className="ma-search-spinner" />}
          </div>
          {searchResults.length > 0 && (
            <div className="ma-search-results">
              {searchResults.map((r) => (
                <SearchResultItem
                  key={r.userId}
                  result={r}
                  onInvite={handleInvite}
                  inviting={inviting === r.userId}
                />
              ))}
            </div>
          )}
          {keyword.trim() && !searching && searchResults.length === 0 && (
            <div className="ma-search-empty">Không tìm thấy trợ lý nào</div>
          )}
        </div>
      )}

      <div className="ma-tabs">
        <button
          className={`ma-tab ${tab === "active" ? "ma-tab--on" : ""}`}
          onClick={() => setTab("active")}
        >
          <Users size={14} /> Đang cộng tác
          <span className="ma-tab__count">{actives.length}</span>
        </button>
        <button
          className={`ma-tab ${tab === "pending" ? "ma-tab--on" : ""}`}
          onClick={() => setTab("pending")}
        >
          <Clock size={14} /> Đang chờ phản hồi
          <span className="ma-tab__count">{pendings.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="ma-empty">Đang tải danh sách...</div>
      ) : tab === "active" ? (
        actives.length === 0 ? (
          <div className="ma-empty">
            <Users size={32} strokeWidth={1.25} />
            <span>Chưa có trợ lý nào đang cộng tác</span>
          </div>
        ) : (
          <div className="assistant-grid">
            {actives.map((a) => (
              <article key={a.assignmentId} className="assistant-card">
                <div className="assistant-card__top">
                  <Avatar
                    name={a.assistantName}
                    url={a.assistantAvatarUrl}
                    size={48}
                  />
                  <div className="assistant-card__info">
                    <h3>{a.assistantName}</h3>
                    <span className="assistant-card__email">
                      {a.assistantEmail}
                    </span>
                    <span className="ma-active-badge">● Đang cộng tác</span>
                  </div>
                  <button
                    className="ma-remove-btn"
                    title="Ngắt cộng tác"
                    onClick={() => handleDeactivate(a.assignmentId)}
                    disabled={deactivating === a.assignmentId}
                  >
                    {deactivating === a.assignmentId ? (
                      "..."
                    ) : (
                      <UserMinus size={15} />
                    )}
                  </button>
                </div>
                <div className="assistant-card__footer">
                  <span className="ma-joined-at">
                    <Check size={11} /> Tham gia{" "}
                    {formatDate(a.respondedAt ?? a.invitedAt)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )
      ) : pendings.length === 0 ? (
        <div className="ma-empty">
          <Clock size={32} strokeWidth={1.25} />
          <span>Không có lời mời nào đang chờ</span>
        </div>
      ) : (
        <div className="assistant-grid">
          {pendings.map((p) => (
            <article
              key={p.assignmentId}
              className="assistant-card assistant-card--pending"
            >
              <div className="assistant-card__top">
                <Avatar
                  name={p.assistantName}
                  url={p.assistantAvatarUrl}
                  size={48}
                />
                <div className="assistant-card__info">
                  <h3>{p.assistantName}</h3>
                  <span className="assistant-card__email">
                    {p.assistantEmail}
                  </span>
                  <span className="ma-pending-badge">
                    <Clock size={11} /> Chờ phản hồi
                  </span>
                </div>
              </div>
              <div className="assistant-card__footer">
                <span className="ma-sent-at">
                  Đã mời lúc {formatDate(p.invitedAt)}
                </span>
                <button
                  className="ma-cancel-btn"
                  onClick={() => handleDeactivate(p.assignmentId)}
                  disabled={deactivating === p.assignmentId}
                >
                  <X size={12} /> Huỷ lời mời
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
