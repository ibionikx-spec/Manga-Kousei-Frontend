import { useEffect, useState } from "react";
import { Check, Clock, X } from "lucide-react";
import {
  fetchMyInvitations,
  respondToInvitation,
  type AssistantAssignmentRes,
} from "../../../services/assistantAssignmentService";
import { getAvatarColor, getInitials } from "../../../utils";
import { formatDate } from "../../../utils/date";
import "./AssistantInvitations.scss";

function MangakaAvatar({ name, url }: { name: string; url?: string | null }) {
  if (url) {
    return <img className="ai-avatar" src={url} alt={name} />;
  }
  return (
    <div
      className="ai-avatar ai-avatar--initials"
      style={{ background: getAvatarColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
}

export default function AssistantInvitations() {
  const [invitations, setInvitations] = useState<AssistantAssignmentRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<number | null>(null);

  useEffect(() => {
    fetchMyInvitations()
      .then(setInvitations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRespond = async (
    assignmentId: number,
    decision: "accept" | "reject",
  ) => {
    setResponding(assignmentId);
    try {
      const updated = await respondToInvitation(assignmentId, decision);
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.assignmentId === assignmentId ? { ...inv, ...updated } : inv,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setResponding(null);
    }
  };

  const pending = invitations.filter((i) => i.status === "pending");
  const responded = invitations.filter((i) => i.status !== "pending");

  return (
    <div className="ai-page">
      <div className="ai-header">
        <h1 className="ai-header__title">Lời mời cộng tác</h1>
        <p className="ai-header__sub">
          Các mangaka đã gửi lời mời cho bạn tham gia nhóm sản xuất
        </p>
      </div>

      {loading ? (
        <div className="ai-empty">Đang tải...</div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="ai-section">
              <div className="ai-section__label">
                <Clock size={13} /> Đang chờ phản hồi ({pending.length})
              </div>
              <div className="ai-list">
                {pending.map((inv) => (
                  <div
                    key={inv.assignmentId}
                    className="ai-card ai-card--pending"
                  >
                    <MangakaAvatar
                      name={inv.mangakaName}
                      url={inv.mangakaAvatarUrl}
                    />
                    <div className="ai-card__info">
                      <span className="ai-card__name">{inv.mangakaName}</span>
                      <span className="ai-card__meta">
                        <Clock size={11} /> Gửi lúc {formatDate(inv.invitedAt)}
                      </span>
                    </div>
                    <div className="ai-card__actions">
                      <button
                        className="ai-btn ai-btn--reject"
                        onClick={() =>
                          handleRespond(inv.assignmentId, "reject")
                        }
                        disabled={responding === inv.assignmentId}
                      >
                        <X size={13} /> Từ chối
                      </button>
                      <button
                        className="ai-btn ai-btn--accept"
                        onClick={() =>
                          handleRespond(inv.assignmentId, "accept")
                        }
                        disabled={responding === inv.assignmentId}
                      >
                        <Check size={13} />
                        {responding === inv.assignmentId
                          ? "Đang xử lý..."
                          : "Chấp nhận"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {responded.length > 0 && (
            <div className="ai-section">
              <div className="ai-section__label">Đã xử lý</div>
              <div className="ai-list">
                {responded.map((inv) => (
                  <div key={inv.assignmentId} className="ai-card">
                    <MangakaAvatar
                      name={inv.mangakaName}
                      url={inv.mangakaAvatarUrl}
                    />
                    <div className="ai-card__info">
                      <span className="ai-card__name">{inv.mangakaName}</span>
                      <span className="ai-card__meta">
                        {formatDate(inv.invitedAt)}
                      </span>
                    </div>
                    <span
                      className={`ai-status-badge ${
                        inv.status === "active"
                          ? "ai-status-badge--active"
                          : "ai-status-badge--rejected"
                      }`}
                    >
                      {inv.status === "active" ? (
                        <>
                          <Check size={11} /> Đã chấp nhận
                        </>
                      ) : (
                        <>
                          <X size={11} /> Đã từ chối
                        </>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pending.length === 0 && responded.length === 0 && (
            <div className="ai-empty">
              <Clock size={32} strokeWidth={1.25} />
              <span>Chưa có lời mời nào</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
