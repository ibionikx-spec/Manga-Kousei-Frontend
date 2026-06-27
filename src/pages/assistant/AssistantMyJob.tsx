import React, { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Circle,
  Clock3,
  Download,
  Upload,
  Eye,
  CheckCircle2,
  FolderOpen,
  AlertTriangle,
} from "lucide-react";
import styles from "./AssistantMyJob.module.scss";

type TaskStatus = "todo" | "doing" | "review" | "done";
type TaskPriority = "urgent" | "high" | "normal";

interface Task {
  id: number;
  title: string;
  project: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: string;
  deadlineUrgent?: boolean;
  progress?: number;
  reviewedAt?: string;
}

interface ColumnConfig {
  id: TaskStatus;
  label: string;
  colorClass: string;
}

const tasks: Task[] = [
  {
    id: 1,
    title: "Chương 42 - Background Trang 5",
    project: "KIẾM SĨ CUỐI CÙNG",
    description:
      "Vẽ cảnh thành phố đổ nát theo góc nhìn từ trên cao xuống. Tham khảo...",
    priority: "urgent",
    status: "todo",
    deadline: "18:00 hôm nay",
    deadlineUrgent: true,
  },
  {
    id: 2,
    title: "Chương 12 - Dán Tone",
    project: "HỌC VIỆN PHÁP THUẬT",
    description: "Dán tone cho các cảnh chiến đấu ở trang 10-15.",
    priority: "normal",
    status: "todo",
    deadline: "Ngày mai",
  },
  {
    id: 3,
    title: "Chương 42 - Đi nét nhân vật phụ",
    project: "KIẾM SĨ CUỐI CÙNG",
    description: "Đi nét sạch cho đám đông ở background trang 2-3.",
    priority: "urgent",
    status: "doing",
    deadline: "15:00 hôm nay",
    deadlineUrgent: true,
    progress: 60,
  },
  {
    id: 4,
    title: "Chương 41 - Đổ bóng",
    project: "KIẾM SĨ CUỐI CÙNG",
    description: "Đổ bóng toàn bộ trang theo bảng màu đã duyệt.",
    priority: "normal",
    status: "review",
  },
  {
    id: 5,
    title: "Chương 40 - Background",
    project: "KIẾM SĨ CUỐI CÙNG",
    description: "Background hoàn chỉnh đã được duyệt.",
    priority: "normal",
    status: "done",
    reviewedAt: "Hôm qua",
  },
];

const columns: ColumnConfig[] = [
  { id: "todo", label: "Chờ làm", colorClass: "dotGray" },
  { id: "doing", label: "Đang làm", colorClass: "dotBlue" },
  { id: "review", label: "Chờ duyệt", colorClass: "dotPurple" },
  { id: "done", label: "Hoàn thành", colorClass: "dotGreen" },
];

const priorityLabel: Record<TaskPriority, string> = {
  urgent: "Gấp",
  high: "Ưu tiên",
  normal: "Thường",
};

const priorityClass: Record<TaskPriority, string> = {
  urgent: styles.priorityUrgent,
  high: styles.priorityHigh,
  normal: styles.priorityNormal,
};

const badgeCountClass: Record<TaskStatus, string> = {
  todo: styles.badgeGray,
  doing: styles.badgeBlue,
  review: styles.badgePurple,
  done: styles.badgeGreen,
};

const dotClass: Record<string, string> = {
  dotGray: styles.dotGray,
  dotBlue: styles.dotBlue,
  dotPurple: styles.dotPurple,
  dotGreen: styles.dotGreen,
};

const PageHeader: React.FC<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
}> = ({ searchTerm, onSearchChange }) => (
  <div className={styles.pageHeader}>
    <div className={styles.pageHeaderText}>
      <h1 className={styles.pageTitle}>Công việc của tôi</h1>
      <p className={styles.pageSubtitle}>
        Quản lý và cập nhật tiến độ các task được giao.
      </p>
    </div>
    <div className={styles.pageHeaderActions}>
      <div className={styles.searchBox}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Tìm kiếm task..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <button className={styles.filterButton}>
        <SlidersHorizontal size={16} />
        Lọc
      </button>
    </div>
  </div>
);

const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
  <div className={styles.taskCard}>
    <div className={styles.taskCardTop}>
      <span className={styles.taskTag}>{task.project}</span>
      <span
        className={`${styles.priorityBadge} ${priorityClass[task.priority]}`}
      >
        {task.priority === "urgent" && <AlertTriangle size={11} />}
        {priorityLabel[task.priority]}
      </span>
    </div>

    <h3 className={styles.taskTitle}>{task.title}</h3>
    <p className={styles.taskDescription}>{task.description}</p>

    {task.status === "doing" && typeof task.progress === "number" && (
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${task.progress}%` }}
          />
        </div>
        <span className={styles.progressLabel}>{task.progress}%</span>
      </div>
    )}

    {task.deadline && (
      <div
        className={`${styles.deadline} ${
          task.deadlineUrgent ? styles.deadlineUrgent : ""
        }`}
      >
        <Clock3 size={13} />
        Hạn: {task.deadline}
      </div>
    )}

    {task.status === "review" && (
      <div className={styles.reviewBadge}>
        <Eye size={13} />
        Trưởng nhóm đang duyệt
      </div>
    )}

    {task.status === "done" && task.reviewedAt && (
      <div className={styles.doneBadge}>
        <CheckCircle2 size={13} />
        Đã duyệt ({task.reviewedAt})
      </div>
    )}

    {(task.status === "todo" || task.status === "doing") && (
      <div className={styles.actions}>
        <button className={styles.btnOutline}>
          <Download size={14} />
          Tải tài nguyên
        </button>
        {task.status === "doing" && (
          <button className={styles.btnPrimary}>
            <Upload size={14} />
            Nộp kết quả
          </button>
        )}
      </div>
    )}
  </div>
);

const BoardColumn: React.FC<{ column: ColumnConfig; tasks: Task[] }> = ({
  column,
  tasks,
}) => (
  <div className={styles.column}>
    <div className={styles.columnHeader}>
      <span className={styles.columnLabel}>
        <Circle
          size={9}
          className={dotClass[column.colorClass]}
          fill="currentColor"
        />
        {column.label}
      </span>
      <span className={`${styles.columnCount} ${badgeCountClass[column.id]}`}>
        {tasks.length}
      </span>
    </div>

    <div className={styles.columnBody}>
      {tasks.length === 0 ? (
        <div className={styles.emptyState}>
          <FolderOpen size={22} className={styles.emptyIcon} />
          <span className={styles.emptyText}>Không có task</span>
        </div>
      ) : (
        tasks.map((task) => <TaskCard key={task.id} task={task} />)
      )}
    </div>
  </div>
);

const MyTasksBoard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={styles.page}>
      <PageHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className={styles.board}>
        {columns.map((col) => (
          <BoardColumn
            key={col.id}
            column={col}
            tasks={filteredTasks.filter((t) => t.status === col.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MyTasksBoard;
