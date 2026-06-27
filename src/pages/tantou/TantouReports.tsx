import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Minus,
  ArrowUp,
  ArrowDown,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import "./TantouReports.scss";
import api from "../../services/api";

interface SeriesRankItem {
  seriesId: number;
  title: string;
  latestChapter: number | null;
  latestChapterTitle: string | null;
  voteCount: number;
  rating: number;
  chapterCount: number;
  mangakaName: string | null;
}

interface TantouStatsRes {
  totalSeries: number;
  publishedChapters: number;
  pendingReviewChapters: number;
  totalDeadlines: number;
  overdueDeadlines: number;
  submittedDeadlines: number;
}

interface ApiResponse<T> {
  data: T;
  message: string;
}

const fetchTantouStats = (): Promise<TantouStatsRes> =>
  api
    .get<ApiResponse<TantouStatsRes>>("/tantou/reports/stats")
    .then((r) => r.data.data);

const fetchTantouRanking = (): Promise<SeriesRankItem[]> =>
  api
    .get<ApiResponse<SeriesRankItem[]>>("/tantou/reports/ranking")
    .then((r) => r.data.data ?? []);

export default function TantouReports() {
  const [stats, setStats] = useState<TantouStatsRes | null>(null);
  const [ranking, setRanking] = useState<SeriesRankItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchTantouStats(), fetchTantouRanking()])
      .then(([s, r]) => {
        setStats(s);
        setRanking(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const onTimePct =
    stats && stats.totalDeadlines > 0
      ? Math.round(
          ((stats.totalDeadlines - stats.overdueDeadlines) /
            stats.totalDeadlines) *
            100,
        )
      : 0;

  const breakdown = stats
    ? [
        {
          label: "Đã nộp / tổng deadline",
          pct:
            stats.totalDeadlines > 0
              ? Math.round(
                  (stats.submittedDeadlines / stats.totalDeadlines) * 100,
                )
              : 0,
          color: "#1d4ed8",
        },
        {
          label: "Chương chờ duyệt",
          pct:
            stats.publishedChapters + stats.pendingReviewChapters > 0
              ? Math.round(
                  (stats.pendingReviewChapters /
                    (stats.publishedChapters + stats.pendingReviewChapters)) *
                    100,
                )
              : 0,
          color: "#f59e0b",
        },
        {
          label: "Deadline quá hạn",
          pct:
            stats.totalDeadlines > 0
              ? Math.round(
                  (stats.overdueDeadlines / stats.totalDeadlines) * 100,
                )
              : 0,
          color: "#dc2626",
        },
      ]
    : [];

  if (loading) {
    return (
      <div
        className="ttr-page"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
        }}
      >
        <Loader2
          size={24}
          className="animate-spin"
          style={{ marginRight: 8 }}
        />
        Đang tải báo cáo...
      </div>
    );
  }

  return (
    <div className="ttr-page">
      <div className="ttr-header">
        <div className="ttr-header__left">
          <h1>Tổng quan Sức khỏe Tác phẩm</h1>
          <p>Chỉ số sản xuất thực tế cho các Series bạn phụ trách</p>
        </div>
        <div className="ttr-header__right">
          <button className="ttr-btn ttr-btn--primary">
            <Download size={14} strokeWidth={2.25} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="ttr-stats">
        <div className="ttr-card ttr-stat">
          <div className="ttr-stat__head">
            <span className="ttr-stat__label">TỔNG SERIES PHỤ TRÁCH</span>
            <div className="ttr-stat__icon ttr-stat__icon--up">
              <BookOpen size={16} strokeWidth={2.25} />
            </div>
          </div>
          <div className="ttr-stat__value">{stats?.totalSeries ?? "—"}</div>
          <div className="ttr-stat__delta ttr-stat__delta--up">
            <CheckCircle2 size={13} strokeWidth={2.5} />
            {stats?.publishedChapters ?? 0} chương đã đăng
          </div>
          <div className="ttr-progress">
            <div
              className="ttr-progress__fill"
              style={{ width: `${onTimePct}%` }}
            />
          </div>
        </div>

        <div className="ttr-card ttr-stat">
          <div className="ttr-stat__head">
            <span className="ttr-stat__label">DEADLINE ĐÚNG HẠN</span>
            <div
              className={`ttr-stat__icon ${onTimePct >= 70 ? "ttr-stat__icon--up" : "ttr-stat__icon--down"}`}
            >
              <Eye size={16} strokeWidth={2.25} />
            </div>
          </div>
          <div className="ttr-stat__value">{onTimePct}%</div>
          <div className="ttr-stat__sub">
            <span
              className={`ttr-pill ${onTimePct >= 70 ? "ttr-pill--green" : ""}`}
            >
              {stats?.totalDeadlines ?? 0} deadline
            </span>
            tổng cộng
          </div>
        </div>

        <div className="ttr-card ttr-stat">
          <div className="ttr-stat__head">
            <span className="ttr-stat__label">CHƯƠNG CHỜ DUYỆT</span>
            <div
              className={`ttr-stat__icon ${(stats?.pendingReviewChapters ?? 0) > 0 ? "ttr-stat__icon--down" : "ttr-stat__icon--up"}`}
            >
              <Clock size={16} strokeWidth={2.25} />
            </div>
          </div>
          <div className="ttr-stat__value">
            {stats?.pendingReviewChapters ?? "—"}
          </div>
          <div
            className={`ttr-stat__delta ${(stats?.pendingReviewChapters ?? 0) > 0 ? "ttr-stat__delta--down" : ""}`}
          >
            {(stats?.pendingReviewChapters ?? 0) > 0 ? (
              <>
                <TrendingDown size={13} /> Cần xem xét
              </>
            ) : (
              <>
                <TrendingUp size={13} /> Không có tồn đọng
              </>
            )}
          </div>
          <div className="ttr-rank-row">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`ttr-rank-chip ${n === Math.min(4, Math.max(1, stats?.pendingReviewChapters ?? 0)) ? "ttr-rank-chip--active" : ""}`}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ttr-grid">
        <div className="ttr-card ttr-chart">
          <div className="ttr-chart__head">
            <h2>Tiến độ Deadline Thực tế</h2>
          </div>

          <div className="ttr-chart__body">
            <div className="ttr-bars">
              {breakdown.map((b) => (
                <div className="ttr-bar-col" key={b.label}>
                  <div
                    className="ttr-bar"
                    style={{ height: `${b.pct}%`, backgroundColor: b.color }}
                  />
                  <span className="ttr-bar-label">{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 16,
              padding: "0 4px",
            }}
          >
            {breakdown.map((b) => (
              <div
                key={b.label}
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}
                  >
                    {b.label}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>
                    {b.pct}%
                  </span>
                </div>
                <div className="ttr-breakdown__track">
                  <div
                    className="ttr-breakdown__fill"
                    style={{ width: `${b.pct}%`, backgroundColor: b.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ttr-side">
          <div className="ttr-card ttr-rankings">
            <div className="ttr-card__title">XẾP HẠNG SERIES (THEO VOTE)</div>
            <div className="ttr-rankings__list">
              {ranking.length === 0 ? (
                <div
                  style={{
                    padding: "20px 18px",
                    color: "#94a3b8",
                    fontSize: 13,
                  }}
                >
                  Chưa có dữ liệu xếp hạng.
                </div>
              ) : (
                ranking.slice(0, 5).map((r, idx) => (
                  <div
                    key={r.seriesId}
                    className={`ttr-rank-item ${idx === 0 ? "ttr-rank-item--highlight" : ""}`}
                  >
                    <span className="ttr-rank-item__num">#{idx + 1}</span>
                    <div className="ttr-rank-item__body">
                      <strong>{r.title}</strong>
                      <span>
                        {r.latestChapter != null
                          ? `Ch. ${r.latestChapter}`
                          : "—"}
                        {" · "}
                        {r.voteCount.toLocaleString()} vote
                        {r.rating > 0 ? ` · ⭐ ${r.rating.toFixed(1)}` : ""}
                      </span>
                    </div>
                    <div
                      className={`ttr-rank-item__trend ttr-rank-item__trend--${idx === 0 ? "up" : idx < 2 ? "flat" : "down"}`}
                    >
                      {idx === 0 ? (
                        <ArrowUp size={14} />
                      ) : idx < 2 ? (
                        <Minus size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="ttr-card ttr-rankings">
            <div className="ttr-card__title">TÓM TẮT SẢN XUẤT</div>
            <div className="ttr-breakdown__list">
              {[
                {
                  label: "Chương đã đăng",
                  value: stats?.publishedChapters ?? 0,
                  color: "#1d4ed8",
                },
                {
                  label: "Deadline đang chạy",
                  value: stats?.totalDeadlines ?? 0,
                  color: "#6366f1",
                },
                {
                  label: "Deadline quá hạn",
                  value: stats?.overdueDeadlines ?? 0,
                  color: "#dc2626",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="ttr-breakdown__row">
                    <span className="ttr-breakdown__label">{item.label}</span>
                    <span
                      className="ttr-breakdown__pct"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </span>
                  </div>
                  <div className="ttr-breakdown__track">
                    <div
                      className="ttr-breakdown__fill"
                      style={{
                        width:
                          stats && stats.totalDeadlines > 0
                            ? `${Math.min(100, Math.round((item.value / Math.max(stats.totalDeadlines, 1)) * 100))}%`
                            : "0%",
                        backgroundColor: item.color,
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
