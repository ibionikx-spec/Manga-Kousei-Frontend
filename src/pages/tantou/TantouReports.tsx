import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  ChevronDown,
  Minus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import "./TantouReports.scss";

interface BarDatum {
  label: string;
  value: number;
  highlight?: boolean;
  tooltip?: string;
}

interface RankItem {
  rank: number;
  title: string;
  chapter: string;
  trend: "up" | "down" | "flat";
  highlight?: boolean;
}

interface BreakdownItem {
  label: string;
  pct: number;
  color: string;
}

const SALES_DATA: BarDatum[] = [
  { label: "Tháng 1", value: 48 },
  { label: "Tháng 2", value: 55 },
  { label: "Tháng 3", value: 76 },
  { label: "Tháng 4", value: 62 },
  {
    label: "Tháng 5",
    value: 100,
    highlight: true,
    tooltip: "Tháng 5: ¥380M (Phát hành Tập 5)",
  },
  { label: "Tháng 6", value: 84 },
  { label: "Tháng 7", value: 70 },
];

const ENGAGEMENT_DATA: BarDatum[] = [
  { label: "Tháng 1", value: 58 },
  { label: "Tháng 2", value: 62 },
  { label: "Tháng 3", value: 70 },
  { label: "Tháng 4", value: 66 },
  {
    label: "Tháng 5",
    value: 100,
    highlight: true,
    tooltip: "Tháng 5: 4.8M lượt xem (Phát hành Tập 5)",
  },
  { label: "Tháng 6", value: 92 },
  { label: "Tháng 7", value: 80 },
];

const TARGET_LINE = 60;

const RANKINGS: RankItem[] = [
  { rank: 1, title: "Phantom Drive", chapter: "Ch. 142", trend: "flat" },
  {
    rank: 2,
    title: "Soul Resonance",
    chapter: "Ch. 88",
    trend: "up",
    highlight: true,
  },
  { rank: 3, title: "Crimson Sky", chapter: "Ch. 21", trend: "down" },
];

const BREAKDOWN: BreakdownItem[] = [
  { label: "Đọc trên App", pct: 65, color: "#1d4ed8" },
  { label: "Đọc trên Web", pct: 25, color: "#6366f1" },
  { label: "Chia sẻ MXH", pct: 10, color: "#db2777" },
];

const RANK_OPTIONS = [1, 2, 3, 4];

export default function TantouReports() {
  const [chartTab, setChartTab] = useState<"sales" | "engagement">("sales");
  const data = chartTab === "sales" ? SALES_DATA : ENGAGEMENT_DATA;

  return (
    <div className="ttr-page">
      <div className="ttr-header">
        <div className="ttr-header__left">
          <h1>Tổng quan Sức khỏe Tác phẩm</h1>
          <p>Chỉ số hiệu suất Quý 3/2023 cho các Series hàng đầu</p>
        </div>
        <div className="ttr-header__right">
          <button className="ttr-btn ttr-btn--outline">
            Tất cả Series
            <ChevronDown size={14} strokeWidth={2.25} />
          </button>
          <button className="ttr-btn ttr-btn--primary">
            <Download size={14} strokeWidth={2.25} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="ttr-stats">
        <div className="ttr-card ttr-stat">
          <div className="ttr-stat__head">
            <span className="ttr-stat__label">TỔNG DOANH THU BẢN IN</span>
            <div className="ttr-stat__icon ttr-stat__icon--up">
              <TrendingUp size={16} strokeWidth={2.25} />
            </div>
          </div>
          <div className="ttr-stat__value">¥1.2B</div>
          <div className="ttr-stat__delta ttr-stat__delta--up">
            <TrendingUp size={13} strokeWidth={2.5} />
            +14% so với quý trước
          </div>
          <div className="ttr-progress">
            <div className="ttr-progress__fill" style={{ width: "72%" }} />
          </div>
        </div>

        <div className="ttr-card ttr-stat">
          <div className="ttr-stat__head">
            <span className="ttr-stat__label">
              LƯỢT XEM KỸ THUẬT SỐ (HÀNG TUẦN)
            </span>
            <div className="ttr-stat__icon ttr-stat__icon--neutral">
              <Eye size={16} strokeWidth={2.25} />
            </div>
          </div>
          <div className="ttr-stat__value">4.8M</div>
          <div className="ttr-stat__sub">
            <span className="ttr-pill ttr-pill--green">+8.2%</span>
            độc giả hoạt động
          </div>
        </div>

        <div className="ttr-card ttr-stat">
          <div className="ttr-stat__head">
            <span className="ttr-stat__label">XẾP HẠNG TẠP CHÍ TRUNG BÌNH</span>
            <div className="ttr-stat__icon ttr-stat__icon--down">
              <TrendingDown size={16} strokeWidth={2.25} />
            </div>
          </div>
          <div className="ttr-stat__value">#3.2</div>
          <div className="ttr-stat__delta ttr-stat__delta--down">
            Giảm từ #2.8 tháng trước
          </div>
          <div className="ttr-rank-row">
            {RANK_OPTIONS.map((n) => (
              <div
                key={n}
                className={`ttr-rank-chip ${n === 3 ? "ttr-rank-chip--active" : ""}`}
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
            <h2>Xu hướng Hiệu suất</h2>
            <div className="ttr-tabs">
              <button
                className={`ttr-tabs__btn ${chartTab === "sales" ? "ttr-tabs__btn--active" : ""}`}
                onClick={() => setChartTab("sales")}
              >
                Doanh số
              </button>
              <button
                className={`ttr-tabs__btn ${chartTab === "engagement" ? "ttr-tabs__btn--active" : ""}`}
                onClick={() => setChartTab("engagement")}
              >
                Tương tác
              </button>
            </div>
          </div>

          <div className="ttr-chart__body">
            <div
              className="ttr-chart__target"
              style={{ bottom: `${TARGET_LINE}%` }}
            >
              <span className="ttr-chart__target-label">Mục tiêu</span>
            </div>

            <div className="ttr-bars">
              {data.map((d) => (
                <div className="ttr-bar-col" key={d.label}>
                  {d.highlight && d.tooltip && (
                    <div className="ttr-bar-tooltip">{d.tooltip}</div>
                  )}
                  <div
                    className={`ttr-bar ${d.highlight ? "ttr-bar--highlight" : ""}`}
                    style={{ height: `${d.value}%` }}
                  />
                  <span className="ttr-bar-label">
                    {d.label.replace("Tháng ", "T")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ttr-side">
          <div className="ttr-card ttr-rankings">
            <div className="ttr-card__title">BẢNG XẾP HẠNG TẠP CHÍ TUẦN</div>
            <div className="ttr-rankings__list">
              {RANKINGS.map((r) => (
                <div
                  key={r.rank}
                  className={`ttr-rank-item ${r.highlight ? "ttr-rank-item--highlight" : ""}`}
                >
                  <span className="ttr-rank-item__num">#{r.rank}</span>
                  <div className="ttr-rank-item__body">
                    <strong>{r.title}</strong>
                    <span>{r.chapter}</span>
                  </div>
                  <span
                    className={`ttr-rank-item__trend ttr-rank-item__trend--${r.trend}`}
                  >
                    {r.trend === "up" && (
                      <ArrowUp size={15} strokeWidth={2.5} />
                    )}
                    {r.trend === "down" && (
                      <ArrowDown size={15} strokeWidth={2.5} />
                    )}
                    {r.trend === "flat" && (
                      <Minus size={15} strokeWidth={2.5} />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="ttr-card ttr-breakdown">
            <div className="ttr-card__title">PHÂN TÁCH TƯƠNG TÁC</div>
            <div className="ttr-breakdown__list">
              {BREAKDOWN.map((b) => (
                <div className="ttr-breakdown__item" key={b.label}>
                  <div className="ttr-breakdown__row">
                    <span className="ttr-breakdown__label">{b.label}</span>
                    <span className="ttr-breakdown__pct">{b.pct}%</span>
                  </div>
                  <div className="ttr-breakdown__track">
                    <div
                      className="ttr-breakdown__fill"
                      style={{ width: `${b.pct}%`, background: b.color }}
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
