import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Clock,
  ChevronRight,
  RefreshCw,
  InboxIcon,
  Eye,
  CalendarDays,
  Loader2,
} from "lucide-react";
import "./TantouDashboard.scss";
import {
  fetchInbox,
  fetchDashboardDeadlines,
} from "../../services/tantouService";
import type {
  InboxItem,
  DashboardDeadlineItem,
} from "../../services/tantouService";
import RecentActivityWidget from "../../components/activityLog/RecentActivityWidget";

export default function TantouDashboard() {
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [deadlines, setDeadlines] = useState<DashboardDeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const month = now.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    (async () => {
      try {
        const [inboxRes, deadlineRes] = await Promise.all([
          fetchInbox(),
          fetchDashboardDeadlines(),
        ]);
        setInbox(inboxRes);
        setDeadlines(deadlineRes);
      } catch (err) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pendingCount = inbox.filter((i) => i.status === "pending").length;

  if (loading) {
    return (
      <div className="td-page flex items-center justify-center h-64">
        <Loader2 className="animate-spin mr-2" size={20} />
        Đang tải dữ liệu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="td-page flex items-center justify-center h-64 text-red-500">
        <AlertTriangle size={18} className="mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="td-page">
      <div className="td-header">
        <div className="td-header__left">
          <h1>Tổng quan Tòa soạn</h1>
          <p>Theo dõi tiến độ và các mốc thời gian quan trọng.</p>
        </div>
        <div className="td-header__badge">
          <CalendarDays size={14} strokeWidth={2} />
          {month}
        </div>
      </div>

      <div className="td-grid">
        <div className="td-col td-col--left">
          <div className="td-card td-deadline">
            <div className="td-deadline__header">
              <AlertTriangle size={18} strokeWidth={2.5} />
              <span>Cảnh báo Deadline</span>
            </div>

            <div className="td-deadline__list">
              {deadlines.length === 0 ? (
                <p className="td-deadline__empty">
                  Không có deadline cần chú ý.
                </p>
              ) : (
                deadlines.map((d) => (
                  <div
                    key={d.deadlineId}
                    className={`td-dl-item td-dl-item--${d.labelType}`}
                  >
                    <div className="td-dl-item__top">
                      <span className="td-dl-item__badge">{d.label}</span>
                      <span className="td-dl-item__time">
                        <Clock size={11} strokeWidth={2} />
                        {d.timeTag}
                      </span>
                    </div>
                    <p className="td-dl-item__title">{d.title}</p>
                    <p className="td-dl-item__meta">
                      Tác giả: {d.author} &nbsp;·&nbsp; Series:{" "}
                      <em>{d.series}</em>
                    </p>
                  </div>
                ))
              )}
            </div>

            <button className="td-deadline__cta">
              Xem tất cả cảnh báo
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="td-card td-activity">
            <RecentActivityWidget />
          </div>
        </div>

        <div className="td-col td-col--right">
          <div className="td-card td-inbox">
            <div className="td-card__head">
              <div className="td-card__title">
                <InboxIcon size={15} strokeWidth={2} />
                Hộp thư Phê duyệt
              </div>
              {pendingCount > 0 && (
                <span className="td-inbox__badge">{pendingCount} Mới</span>
              )}
            </div>

            <div className="td-inbox__table">
              <div className="td-inbox__thead">
                <span>SERIES</span>
                <span>NỘI DUNG</span>
                <span>TRẠNG THÁI</span>
                <span>HÀNH ĐỘNG</span>
              </div>

              {inbox.length === 0 ? (
                <p className="td-inbox__empty">
                  Không có mục nào trong hộp thư.
                </p>
              ) : (
                inbox.map((item) => (
                  <div
                    key={`${item.itemType}-${item.id}`}
                    className="td-inbox__row"
                  >
                    <div className="td-inbox__series">
                      <span className="td-inbox__series-name">
                        {item.seriesTitle || "—"}
                      </span>
                      <span className="td-inbox__submitted">
                        Gửi bởi: {item.submittedBy}
                      </span>
                    </div>
                    <span className="td-inbox__content">{item.content}</span>
                    <span
                      className={`td-inbox__status td-inbox__status--${item.status}`}
                    >
                      {item.statusLabel}
                    </span>
                    <button
                      className={`td-inbox__action ${item.status === "approved" ? "td-inbox__action--text" : ""}`}
                      onClick={() => {
                        if (item.itemType === "manuscript") {
                          window.location.href = `/approvals/manuscript/${item.id}`;
                        } else if (item.itemType === "proposal") {
                          window.location.href = `proposal-review/${item.id}`;
                        }
                      }}
                    >
                      {item.status === "approved" ? (
                        "Chi tiết"
                      ) : (
                        <>
                          <Eye size={13} strokeWidth={2} /> Xem
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="td-card td-progress">
            <div className="td-card__head">
              <div className="td-card__title">Tình trạng Deadline Tháng</div>
              <button
                className="td-progress__refresh"
                title="Làm mới"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={14} strokeWidth={2} />
              </button>
            </div>
            <p className="td-progress__sub">
              Tổng hợp deadline theo tình trạng.
            </p>

            <div className="td-progress__list">
              {[
                {
                  label: "Quá hạn",
                  count: deadlines.filter((d) => d.labelType === "overdue")
                    .length,
                  color: "#dc2626",
                },
                {
                  label: "Đến hạn hôm nay",
                  count: deadlines.filter((d) => d.labelType === "due").length,
                  color: "#f59e0b",
                },
                {
                  label: "Sắp đến (3 ngày)",
                  count: deadlines.filter((d) => d.labelType === "soon").length,
                  color: "#1d4ed8",
                },
              ].map((p) => (
                <div key={p.label} className="td-progress__item">
                  <div className="td-progress__item-top">
                    <span className="td-progress__label">{p.label}</span>
                    <span className="td-progress__pct">{p.count} deadline</span>
                  </div>
                  <div className="td-progress__track">
                    <div
                      className="td-progress__fill"
                      style={{
                        width:
                          deadlines.length > 0
                            ? `${Math.round((p.count / deadlines.length) * 100)}%`
                            : "0%",
                        backgroundColor: p.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
