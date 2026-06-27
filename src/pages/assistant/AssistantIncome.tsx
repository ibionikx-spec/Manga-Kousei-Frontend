import React, { useState } from "react";
import {
  Calendar,
  Wallet,
  CheckCircle2,
  Info,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  PenTool,
} from "lucide-react";
import styles from "./AssistantIncome.module.scss";

interface IncomeRecord {
  date: string;
  series: string;
  task: string;
  taskIcon: "tone" | "lineart" | "translation";
  unitPrice: number;
  total: number;
}

const incomeRecords: IncomeRecord[] = [
  {
    date: "24/10",
    series: "Sword Art Online: Project Alicization",
    task: "Dán tone Chương 42 (20 trang)",
    taskIcon: "tone",
    unitPrice: 50000,
    total: 1000000,
  },
  {
    date: "22/10",
    series: "Chainsaw Man",
    task: "Tỉa nét nền Chương 115 (15 trang)",
    taskIcon: "lineart",
    unitPrice: 70000,
    total: 1050000,
  },
  {
    date: "18/10",
    series: "Spy x Family",
    task: "Dịch SFX Chương 80 (25 trang)",
    taskIcon: "translation",
    unitPrice: 30000,
    total: 750000,
  },
  {
    date: "15/10",
    series: "Sword Art Online: Project Alicization",
    task: "Dán tone Chương 41 (18 trang)",
    taskIcon: "tone",
    unitPrice: 50000,
    total: 900000,
  },
];

const TOTAL_ROWS = 24;
const PAGE_SIZE = 4;
const TOTAL_PAGES = Math.ceil(TOTAL_ROWS / PAGE_SIZE);

const formatCurrency = (value: number): string => value.toLocaleString("vi-VN");

const renderTaskIcon = (type: IncomeRecord["taskIcon"]) => {
  switch (type) {
    case "tone":
      return <PenTool size={14} className={styles.taskIcon} />;
    case "lineart":
    case "translation":
    default:
      return <FileText size={14} className={styles.taskIcon} />;
  }
};

const MonthSelector: React.FC<{
  label: string;
  onPrev: () => void;
  onNext: () => void;
}> = ({ label, onPrev, onNext }) => (
  <div className={styles.monthSelector}>
    <Calendar size={16} className={styles.monthSelectorIcon} />
    <span className={styles.monthSelectorLabel}>{label}</span>
    <div className={styles.monthSelectorNav}>
      <button
        className={styles.monthSelectorBtn}
        onClick={onPrev}
        aria-label="Tháng trước"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        className={styles.monthSelectorBtn}
        onClick={onNext}
        aria-label="Tháng sau"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

const PageHeader: React.FC<{
  monthLabel: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}> = ({ monthLabel, onPrevMonth, onNextMonth }) => (
  <div className={styles.header}>
    <div className={styles.headerText}>
      <span className={styles.breadcrumb}>KỲ LƯƠNG / PAYMENT PERIOD</span>
      <h1 className={styles.title}>Thu nhập</h1>
    </div>
    <MonthSelector
      label={monthLabel}
      onPrev={onPrevMonth}
      onNext={onNextMonth}
    />
  </div>
);

const TotalIncomeCard: React.FC = () => (
  <div className={styles.statCard}>
    <div className={styles.statCardTop}>
      <span className={styles.statCardTitle}>TỔNG THU NHẬP DỰ KIẾN</span>
      <span className={`${styles.statCardIcon} ${styles.statCardIconPrimary}`}>
        <Wallet size={18} />
      </span>
    </div>
    <div className={styles.statCardValue}>
      14,500,000<span className={styles.statCardUnit}> VND</span>
    </div>
    <div className={`${styles.statCardSub} ${styles.statCardSubSuccess}`}>
      +12% so với tháng trước
    </div>
  </div>
);

const CompletedTasksCard: React.FC = () => {
  const completed = 128;
  const target = 160;
  const percent = Math.min(100, Math.round((completed / target) * 100));

  return (
    <div className={styles.statCard}>
      <div className={styles.statCardTop}>
        <span className={styles.statCardTitle}>SỐ TASK ĐÃ HOÀN THÀNH</span>
        <span
          className={`${styles.statCardIcon} ${styles.statCardIconSuccess}`}
        >
          <CheckCircle2 size={18} />
        </span>
      </div>
      <div className={styles.statCardValue}>
        {completed}
        <span className={styles.statCardUnit}> trang bản thảo</span>
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const PaymentStatusCard: React.FC = () => (
  <div className={styles.statCard}>
    <div className={styles.statCardTop}>
      <span className={styles.statCardTitle}>TRẠNG THÁI THANH TOÁN</span>
      <span className={`${styles.statCardIcon} ${styles.statCardIconNeutral}`}>
        <Info size={18} />
      </span>
    </div>
    <div className={styles.paymentStatus}>
      <span className={styles.paymentStatusBadge}>
        <span className={styles.paymentStatusDot} />
        Đang chờ đối soát
      </span>
    </div>
    <div className={styles.statCardSub}>Dự kiến thanh toán vào 05/11/2023</div>
  </div>
);

const StatisticsCards: React.FC = () => (
  <div className={styles.statsGrid}>
    <TotalIncomeCard />
    <CompletedTasksCard />
    <PaymentStatusCard />
  </div>
);

const IncomeTable: React.FC<{ records: IncomeRecord[] }> = ({ records }) => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Ngày HT</th>
          <th>Tên Series</th>
          <th>Tên Task</th>
          <th className={styles.tableNum}>Đơn Giá (VND)</th>
          <th className={styles.tableNum}>Thành Tiền (VND)</th>
        </tr>
      </thead>
      <tbody>
        {records.map((row, index) => (
          <tr key={index}>
            <td>{row.date}</td>
            <td className={styles.tableSeries}>{row.series}</td>
            <td>
              <span className={styles.tableTask}>
                {renderTaskIcon(row.taskIcon)}
                {row.task}
              </span>
            </td>
            <td className={styles.tableNum}>{formatCurrency(row.unitPrice)}</td>
            <td className={`${styles.tableNum} ${styles.tableTotal}`}>
              {formatCurrency(row.total)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  totalRows: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, totalRows, pageSize, onPageChange }) => {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalRows);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>
        Hiển thị {from}-{to} / {totalRows} dòng
      </span>
      <div className={styles.paginationControls}>
        <button
          className={styles.paginationBtn}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            className={`${styles.paginationPage} ${
              page === currentPage ? styles.paginationPageActive : ""
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className={styles.paginationBtn}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Trang sau"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const DetailTableSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className={styles.detailSection}>
      <div className={styles.detailSectionHeader}>
        <h2 className={styles.detailSectionTitle}>Bảng kê chi tiết</h2>
        <button className={styles.exportLink}>
          <Download size={14} />
          Xuất PDF
        </button>
      </div>

      <IncomeTable records={incomeRecords} />

      <Pagination
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
        totalRows={TOTAL_ROWS}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

const IncomeDashboard: React.FC = () => {
  const [monthLabel, setMonthLabel] = useState("Tháng 10, 2023");

  const shiftMonth = (delta: number) => {
    const match = monthLabel.match(/Tháng (\d+), (\d+)/);
    if (!match) return;

    let month = parseInt(match[1], 10) + delta;
    let year = parseInt(match[2], 10);

    if (month < 1) {
      month = 12;
      year -= 1;
    } else if (month > 12) {
      month = 1;
      year += 1;
    }

    setMonthLabel(`Tháng ${month}, ${year}`);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        monthLabel={monthLabel}
        onPrevMonth={() => shiftMonth(-1)}
        onNextMonth={() => shiftMonth(1)}
      />
      <StatisticsCards />
      <DetailTableSection />
    </div>
  );
};

export default IncomeDashboard;
