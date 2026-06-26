import { ArrowRight, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRecentLogs } from "../../hooks/useRecentLogs";
import {
  getActionIcon,
  getActionLabel,
  getCategoryVariant,
} from "./activityLogUtils";
import "./RecentActivityWidget.scss";

export default function RecentActivityWidget() {
  const { logs, loading } = useRecentLogs();
  const navigate = useNavigate();

  return (
    <div className="raw">
      <div className="raw__header">
        <div className="raw__title">
          <Activity size={16} aria-hidden />
          <span>Hoạt động gần đây</span>
        </div>
        <button
          className="raw__more"
          type="button"
          onClick={() => navigate("/activity-history")}
        >
          Xem tất cả <ArrowRight size={14} />
        </button>
      </div>

      <ul className="raw__list" aria-label="Hoạt động gần đây">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <li className="raw__item raw__item--skeleton" key={i} aria-hidden />
          ))}

        {!loading && logs.length === 0 && (
          <li className="raw__empty">Chưa có hoạt động nào.</li>
        )}

        {!loading &&
          logs.map((log) => {
            const Icon = getActionIcon(log.actionType);
            const label = getActionLabel(log.actionType);
            const variant = getCategoryVariant(log.category);

            return (
              <li className={`raw__item raw__item--${variant}`} key={log.logId}>
                <span className="raw__icon" aria-hidden>
                  <Icon size={15} />
                </span>
                <div className="raw__body">
                  <strong>{label}</strong>
                  <p>{log.detail}</p>
                </div>
                <time className="raw__time" dateTime={log.createdAt}>
                  {log.createdAt}
                </time>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
