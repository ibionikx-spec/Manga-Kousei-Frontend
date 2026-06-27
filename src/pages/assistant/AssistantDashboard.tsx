import React from "react";
import {
  BellRing,
  AlertTriangle,
  FileText,
  SquarePen,
  FolderOpen,
  Wallet,
  Clock,
  Hourglass,
  CheckCircle2,
  MoreHorizontal,
  Download,
  Upload,
  UserRoundSearch,
  Boxes,
  Pencil,
  Megaphone,
} from "lucide-react";
import styles from "./AssistantDashboard.module.scss";

interface Notification {
  icon: "edit" | "file";
  title: string;
  desc: string;
  time: string;
}

interface KanbanCard {
  tag: string;
  chapter: string;
  title: string;
  deadline?: string;
  submittedAt?: string;
  warning?: boolean;
  urgent?: boolean;
  done?: boolean;
  action?: "Tài nguyên" | "Nộp kết quả";
}

interface KanbanColumn {
  id: "todo" | "doing" | "review" | "done";
  label: string;
  count: number;
  cards: KanbanCard[];
}

interface Resource {
  icon: "user" | "layers" | "brush";
  label: string;
}

const notifications: Notification[] = [
  {
    icon: "edit",
    title: "Yêu cầu sửa đổi: 'Tones Page 12'",
    desc: "Giảm độ đậm của tone ở panel cuối xuống 20%.",
    time: "10p trước",
  },
  {
    icon: "file",
    title: "Tài liệu mới: 'Character Sheet Vol 3'",
    desc: "Đã thêm vào Kho tài nguyên.",
    time: "1h trước",
  },
];

const kanbanColumns: KanbanColumn[] = [
  {
    id: "todo",
    label: "CHỜ LÀM",
    count: 3,
    cards: [
      {
        tag: "KIỂM SÍ CUỐI CÙNG",
        chapter: "Chương 42",
        title: "Background Page 5",
        action: "Tài nguyên",
      },
    ],
  },
  {
    id: "doing",
    label: "ĐANG LÀM",
    count: 1,
    cards: [
      {
        tag: "KIỂM SÍ CUỐI CÙNG",
        chapter: "Chương 42",
        title: "Tones Page 12",
        deadline: "Hôm nay 18:00",
        warning: true,
        action: "Nộp kết quả",
      },
    ],
  },
  {
    id: "review",
    label: "CHỜ DUYỆT",
    count: 2,
    cards: [
      {
        tag: "KIỂM SÍ CUỐI CÙNG",
        chapter: "Chương 41",
        title: "Inking Page 18",
        submittedAt: "Đã nộp lúc 09:30",
        urgent: true,
      },
    ],
  },
  {
    id: "done",
    label: "HOÀN THÀNH",
    count: 14,
    cards: [
      {
        tag: "KIỂM SÍ CUỐI CÙNG",
        chapter: "Chương 41",
        title: "Tones Page 10",
        done: true,
      },
    ],
  },
];

const resources: Resource[] = [
  { icon: "user", label: "Character Sheets" },
  { icon: "layers", label: "3D Backgrounds" },
  { icon: "brush", label: "Custom Brushes" },
];

const renderNotifIcon = (type: Notification["icon"]) => {
  switch (type) {
    case "edit":
      return <SquarePen size={15} className={styles.notifIconEdit} />;
    case "file":
      return <FileText size={15} className={styles.notifIconFile} />;
    default:
      return null;
  }
};

const renderResourceIcon = (type: Resource["icon"]) => {
  switch (type) {
    case "user":
      return <UserRoundSearch size={22} />;
    case "layers":
      return <Boxes size={22} />;
    case "brush":
      return <Pencil size={22} />;
    default:
      return null;
  }
};

const DeadlineAlert: React.FC = () => (
  <div className={styles.deadlineAlert}>
    <div className={styles.deadlineTop}>
      <span className={styles.deadlineBadge}>
        <BellRing size={14} strokeWidth={2.5} className={styles.deadlineIcon} />
        DEADLINE GẤP (24H)
      </span>
    </div>
    <div className={styles.deadlineCount}>2</div>
    <div className={styles.deadlineLabel}>Trang cần nộp hôm nay</div>
    <div className={styles.deadlineDivider} />
    <button className={styles.deadlineLink}>Xem chi tiết →</button>
  </div>
);

const NotificationPanel: React.FC = () => (
  <div className={styles.notifPanel}>
    <div className={styles.notifHeader}>
      <Megaphone size={16} className={styles.notifBellIcon} />
      <span className={styles.notifTitle}>THÔNG BÁO TỪ MANGAKA</span>
      <span className={styles.notifBadge}>2 Mới</span>
    </div>
    <div className={styles.notifList}>
      {notifications.map((n, i) => (
        <div key={i} className={styles.notifItem}>
          <div className={styles.notifItemIconWrapper}>
            {renderNotifIcon(n.icon)}
          </div>
          <div className={styles.notifItemBody}>
            <div className={styles.notifItemTitle}>{n.title}</div>
            <div className={styles.notifItemDesc}>{n.desc}</div>
          </div>
          <span className={styles.notifTime}>{n.time}</span>
        </div>
      ))}
    </div>
  </div>
);

const KanbanCardComponent: React.FC<{ card: KanbanCard; colId: string }> = ({
  card,
  colId,
}) => (
  <div
    className={`${styles.kanbanCard} ${card.action === "Nộp kết quả" ? styles.kanbanCardActiveStyle : ""} ${card.done ? styles.kanbanCardDone : ""}`}
  >
    <div className={styles.kanbanCardTop}>
      <span className={styles.kanbanTag}>{card.tag}</span>
      {card.warning && (
        <AlertTriangle
          size={15}
          strokeWidth={2.5}
          className={styles.kanbanWarning}
        />
      )}
      {card.urgent && (
        <Hourglass
          size={15}
          strokeWidth={2.5}
          className={styles.kanbanUrgentIcon}
        />
      )}
      {colId === "todo" && (
        <MoreHorizontal size={16} className={styles.kanbanMenu} />
      )}
    </div>

    {card.done ? (
      <div className={styles.titleWrapper}>
        <div className={styles.kanbanDoneCheckRow}>
          {card.done && (
            <CheckCircle2
              size={16}
              strokeWidth={2.5}
              className={styles.innerDoneIcon}
            />
          )}
          <div className={`${styles.kanbanTitle} ${styles.kanbanTitleDone}`}>
            {card.title}
          </div>
        </div>
        <div className={styles.kanbanChapterDone}>{card.chapter}</div>
      </div>
    ) : (
      <div className={styles.titleWrapper}>
        <div className={styles.kanbanChapter}>{card.chapter}</div>
        <div className={styles.kanbanTitle}>{card.title}</div>
      </div>
    )}

    {card.deadline && (
      <div className={styles.kanbanDeadline}>
        <Clock size={12} strokeWidth={2.5} className={styles.kanbanClockIcon} />
        Hạn: {card.deadline}
      </div>
    )}
    {card.submittedAt && (
      <div className={styles.kanbanSubmitted}>{card.submittedAt}</div>
    )}
    {card.action && (
      <button
        className={`${styles.kanbanAction} ${colId === "doing" ? styles.kanbanActionPrimary : styles.kanbanActionSecondary}`}
      >
        {card.action === "Nộp kết quả" ? (
          <Upload size={13} strokeWidth={2.5} />
        ) : (
          <Download size={13} strokeWidth={2.5} />
        )}
        {card.action}
      </button>
    )}
  </div>
);

const KanbanBoard: React.FC = () => (
  <section className={styles.kanbanSection}>
    <div className={styles.kanbanSectionHeader}>
      <h2 className={styles.sectionTitle}>Tiến độ công việc</h2>
      <button className={styles.kanbanFullscreen}>Mở toàn màn hình</button>
    </div>
    <div className={styles.kanbanWrapperContainer}>
      <div className={styles.circleBgDecoration} />

      <div className={styles.kanbanBoard}>
        {kanbanColumns.map((col) => (
          <div
            key={col.id}
            className={`${styles.kanbanCol} ${styles[`kanbanCol_${col.id}`]}`}
          >
            <div className={styles.kanbanColHeader}>
              <span
                className={`${styles.kanbanColLabel} ${styles[`kanbanColLabel_${col.id}`]}`}
              >
                {col.label}
              </span>
              <span
                className={`${styles.kanbanColCount} ${styles[`kanbanColCount_${col.id}`]}`}
              >
                {col.count}
              </span>
            </div>
            <div className={styles.kanbanCards}>
              {col.cards.map((card, i) => (
                <KanbanCardComponent key={i} card={card} colId={col.id} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ResourceVault: React.FC = () => (
  <div className={styles.resourceCard}>
    <div className={styles.resourceHeader}>
      <FolderOpen size={18} className={styles.resourceIcon} />
      <h3 className={styles.resourceTitle}>Kho tài nguyên</h3>
      <button className={styles.resourceLink}>Xem tất cả</button>
    </div>
    <div className={styles.resourceGrid}>
      {resources.map((r, i) => (
        <button key={i} className={styles.resourceItem}>
          <div className={styles.resourceItemIcon}>
            {renderResourceIcon(r.icon)}
          </div>
          <span className={styles.resourceItemLabel}>{r.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const IncomeCard: React.FC = () => (
  <div className={styles.incomeCard}>
    <div className={styles.incomeHeader}>
      <Wallet size={18} className={styles.incomeIcon} />
      <h3 className={styles.incomeTitle}>Thu nhập tháng này</h3>
    </div>
    <div className={styles.incomeLabel}>DỰ KIẾN NHẬN</div>
    <div className={styles.incomeMain}>
      <div className={styles.incomeAmount}>¥45,000</div>
      <div className={styles.incomeBreakdown}>
        <span>14 Task x ¥3,000</span>
        <span className={styles.incomeBonus}>+ Thưởng tiến độ</span>
      </div>
    </div>
    <div className={styles.incomeTrack}>
      <div className={styles.incomeFill} style={{ width: "60%" }} />
    </div>
    <div className={styles.incomeGoal}>Mục tiêu: ¥75,000</div>
  </div>
);

const MangakaDashboard: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Bảng điều khiển</h1>
        <p className={styles.pageSubtitle}>
          Chào buổi sáng, đây là tóm tắt công việc của bạn hôm nay.
        </p>
      </div>

      <div className={styles.topRow}>
        <DeadlineAlert />
        <NotificationPanel />
      </div>

      <KanbanBoard />

      <div className={styles.bottomRow}>
        <ResourceVault />
        <IncomeCard />
      </div>
    </div>
  );
};

export default MangakaDashboard;
