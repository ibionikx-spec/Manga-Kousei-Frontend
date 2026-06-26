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
import { fetchInbox } from "../../services/tantouService";

import type { InboxItem } from "../../services/tantouService";
import RecentActivityWidget from "../../components/activityLog/RecentActivityWidget";

const DEADLINES = [
  {
    id: 1,
    label: "QUÁ HẠN",
    labelType: "overdue",
    timeTag: "Hôm qua",
    title: "Bản Name - Chương 42",
    author: "Yamamoto",
    series: "Thợ Săn Mực",
  },
  {
    id: 2,
    label: "ĐẾN HẠN",
    labelType: "due",
    timeTag: "Hôm nay 18:00",
    title: "Genga - Chương 15",
    author: "Sato",
    series: "Thành phố Cát",
  },
  {
    id: 3,
    label: "SẮP ĐẾN",
    labelType: "soon",
    timeTag: "Ngày mai",
    title: "Tone - Chương 28",
    author: "Inoue",
    series: "Kiếm Khách Đêm",
  },
];

const PROGRESS = [
  { label: "Bản Name", pct: 80, color: "#1d4ed8" },
  { label: "Genga", pct: 45, color: "#1d4ed8" },
  { label: "Hoàn thiện & Typeset", pct: 20, color: "#1d4ed8" },
];

export default function TantouDashboard() {
  const [month] = useState("Tháng 10, 2023");
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [inboxRes] = await Promise.all([fetchInbox()]);

        setInbox(inboxRes);
      } catch (err) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    console.log(inbox);
  }, [inbox]);

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
              {DEADLINES.map((d) => (
                <div
                  key={d.id}
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
              ))}
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

              {inbox.map((item) => (
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
              ))}
            </div>
          </div>

          <div className="td-card td-progress">
            <div className="td-card__head">
              <div className="td-card__title">Tiến độ Phát hành Tháng</div>
              <button className="td-progress__refresh" title="Làm mới">
                <RefreshCw size={14} strokeWidth={2} />
              </button>
            </div>
            <p className="td-progress__sub">
              Tổng quan các đầu truyện đang chạy.
            </p>

            <div className="td-progress__list">
              {PROGRESS.map((p) => (
                <div key={p.label} className="td-progress__item">
                  <div className="td-progress__item-top">
                    <span className="td-progress__label">{p.label}</span>
                    <span className="td-progress__pct">{p.pct}%</span>
                  </div>
                  <div className="td-progress__track">
                    <div
                      className="td-progress__fill"
                      style={{ width: `${p.pct}%`, backgroundColor: p.color }}
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
