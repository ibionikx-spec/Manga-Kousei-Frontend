import { useEffect, useState } from "react";
import {
  Sparkles,
  Clock,
  ChevronRight,
  Users,
  BookOpen,
  ImageIcon,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  Tag,
  X,
  FileText,
  Search,
  Calendar,
} from "lucide-react";
import "./ProposalReview.scss";
import { formatDate, timeAgo } from "../../../utils/date";
import Section from "./Section";
import {
  fetchProposals,
  reopenProposal,
  reviewProposal,
} from "../../../services/tantouService";
import { getAvatarColor, getInitials } from "../../../utils";
import type {
  ProposalStatus,
  SeriesProposal,
} from "../../../types/SeriesProposal";
import { useNavigate, useParams } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOCK_PROPOSALS: SeriesProposal[] = [
  {
    proposal_id: 1,
    created_at: "2024-10-15T09:30:00",
    working_title: "Kiếm Khách Đêm",
    synopsis:
      "Trong thế giới sau Đại Hắc Ám, những kiếm khách lang thang bảo vệ khu định cư khỏi quái vật bóng tối. Kenji — một kiếm khách vô danh mang vết thương bí ẩn — phát hiện nguồn gốc của bóng tối chính là tổ chức đã tạo ra anh.",
    target_audience: "Seinen",
    name_summary:
      "Ch.1: Kenji cứu làng, gặp thám tử Aya. Flashback ký ức mờ nhạt về lò rèn kiếm.\nCh.2: Tìm đến di tích, phát hiện ký hiệu tổ chức Kurai trên vũ khí Kenji.\nCh.3: Phục kích của sát thủ. Kenji bộc lộ kỹ năng thực sự — Aya nhận ra anh không phải người thường.",
    sketch_image_url: null,
    status: "pending",
    rejection_reason: null,
    revision_feedback: null,
    mangaka: {
      user_id: 1,
      fullName: "Tanaka Ryo",
      avatarUrl:
        "https://i.pinimg.com/474x/45/e3/93/45e393cc1738649e63e2103b85cd7f8d.jpg",
    },
    genres: [
      { genre_id: 1, name: "Action" },
      { genre_id: 2, name: "Fantasy" },
    ],
    characters: [
      {
        character_id: 1,
        character_name: "Kenji Mori",
        role: "Nhân vật chính",
        description:
          "Kiếm khách trẻ tuổi mang ký ức bị xóa. Lạnh lùng nhưng không thể thờ ơ trước người yếu.",
      },
      {
        character_id: 2,
        character_name: "Aya Shirosaki",
        role: "Đồng hành",
        description:
          "Thám tử điều tra nguồn gốc bóng tối. Thông minh, sắc bén, ẩn chứa bí mật.",
      },
      {
        character_id: 3,
        character_name: "Lord Kurai",
        role: "Phản diện",
        description:
          "Lãnh chúa tổ chức tạo ra Kenji. Tin rằng bóng tối là sự tiến hóa tất yếu.",
      },
    ],
  },
  {
    proposal_id: 2,
    created_at: "2024-10-14T14:20:00",
    working_title: "Nữ Thần Rỗng",
    synopsis:
      "Một nữ thám tử tâm lý học đối mặt với kẻ giết người sao chép chính xác các vụ án từ tiểu thuyết trinh thám — mà cô là tác giả. Ranh giới giữa hư cấu và thực tại dần xóa mờ.",
    target_audience: "Josei",
    name_summary:
      "Ch.1: Hana nhận bản thảo của chính mình qua bưu điện — kèm ảnh hiện trường chưa công bố.\nCh.2: Vụ án thứ hai xảy ra, sao chép chương 7 cuốn tiểu thuyết cũ nhất của cô.",
    sketch_image_url: null,
    status: "pending",
    rejection_reason: null,
    revision_feedback: null,
    mangaka: {
      user_id: 2,
      fullName: "Inoue Saki",
      avatarUrl: null,
    },
    genres: [
      { genre_id: 3, name: "Mystery" },
      { genre_id: 4, name: "Thriller" },
    ],
    characters: [
      {
        character_id: 4,
        character_name: "Hana Kuroda",
        role: "Nhân vật chính",
        description:
          "Tác giả kiêm thám tử tâm lý. Nhạy cảm, khép kín, mắc chứng lo âu từ vụ án năm 17 tuổi.",
      },
      {
        character_id: 5,
        character_name: "Detective Ryo",
        role: "Hỗ trợ",
        description:
          "Cảnh sát già dặn, hoài nghi nhưng tôn trọng trực giác của Hana.",
      },
    ],
  },
  {
    proposal_id: 3,
    created_at: "2024-10-12T10:00:00",
    working_title: "Cỗ Máy Ước Mơ",
    synopsis:
      "Năm 2087, con người có thể bán giấc mơ như hàng hóa. Cậu bé nghèo Sora phát hiện mình có thể tạo ra những giấc mơ không thể mua được — giấc mơ về thế giới không có công nghệ.",
    target_audience: "Shounen",
    name_summary:
      "Ch.1: Sora lạc vào chợ giấc mơ ngầm, phát hiện người mua trả giá cao bất thường cho ký ức của mình.",
    sketch_image_url: null,
    status: "approved",
    rejection_reason: null,
    revision_feedback: null,
    mangaka: {
      user_id: 3,
      fullName: "Watanabe Jun",
      avatarUrl: null,
    },
    genres: [
      { genre_id: 5, name: "Sci-Fi" },
      { genre_id: 6, name: "Slice of Life" },
    ],
    characters: [
      {
        character_id: 6,
        character_name: "Sora Miki",
        role: "Nhân vật chính",
        description:
          "14 tuổi, con nhà nghèo, bán giấc mơ nhưng không thể ngủ. Hóm hỉnh, lạc quan vô lý.",
      },
    ],
  },
  {
    proposal_id: 4,
    created_at: "2024-10-10T08:45:00",
    working_title: "Gió Núi Trắng",
    synopsis:
      "Đội leo núi toàn những người thất bại ở môn thể thao khác cùng chinh phục những đỉnh núi không tên. Hài hước, ấm áp, đôi khi nguy hiểm.",
    target_audience: "Shounen",
    name_summary:
      "Ch.1: Ryuu gia nhập câu lạc bộ leo núi, phát hiện toàn bộ thành viên đều bị đuổi khỏi đội thể thao khác.",
    sketch_image_url: null,
    status: "rejected",
    rejection_reason:
      "Concept chưa đủ độc đáo so với các series thể thao hiện có. Cần tìm điểm nhấn riêng biệt hơn. Nên xem lại toàn bộ premise và tạo ra xung đột trung tâm rõ ràng hơn.",
    revision_feedback: null,
    mangaka: {
      user_id: 4,
      fullName: "Matsuda Ren",
      avatarUrl: null,
    },
    genres: [
      { genre_id: 7, name: "Sports" },
      { genre_id: 8, name: "Comedy" },
    ],
    characters: [
      {
        character_id: 7,
        character_name: "Ryuu",
        role: "Nhân vật chính",
        description:
          "Cựu vận động viên bơi lội, sợ độ cao nhưng đam mê núi vì không có nước ở trên đó.",
      },
    ],
  },
  {
    proposal_id: 5,
    created_at: "2024-10-09T16:10:00",
    working_title: "Hạt Giống Cuối Cùng",
    synopsis:
      "Một nhà thực vật học trẻ được giao nhiệm vụ bảo tồn loài cây duy nhất có thể tổng hợp thuốc chữa đại dịch mới. Nhưng con đường đến hạt giống cuối cùng dẫn qua vùng chiến sự cô chưa bao giờ đặt chân.",
    target_audience: "Seinen",
    name_summary: null,
    sketch_image_url:
      "https://i.pinimg.com/736x/f8/b0/20/f8b0209abdff14c6671fa5b7451bf1b1.jpg",
    status: "revision",
    rejection_reason: null,
    revision_feedback:
      "Ý tưởng hay nhưng cần phát triển thêm nhân vật phản diện. Motivation của bên muốn phá hủy hạt giống chưa thuyết phục. Hãy viết thêm ít nhất 1 chương phác thảo tập trung vào antagonist.",
    mangaka: {
      user_id: 5,
      fullName: "Fujita Mei",
      avatarUrl: null,
    },
    genres: [
      { genre_id: 9, name: "Adventure" },
      { genre_id: 3, name: "Mystery" },
    ],
    characters: [
      {
        character_id: 8,
        character_name: "Yuki Hara",
        role: "Nhân vật chính",
        description:
          "Nhà thực vật học 26 tuổi, người con duy nhất của gia đình nghèo. Cứng đầu, am hiểu thiên nhiên nhưng ngây thơ về thế giới người.",
      },
      {
        character_id: 9,
        character_name: "Captain Shen",
        role: "Dẫn đường",
        description:
          "Cựu binh bí ẩn. Nhận lệnh bảo vệ Yuki nhưng có agenda riêng.",
      },
    ],
  },
  {
    proposal_id: 6,
    created_at: "2024-10-09T16:10:00",
    working_title: "Hạt Giống Đầu Tiên",
    synopsis:
      "Một nhà thực vật học trẻ được giao nhiệm vụ bảo tồn loài cây duy nhất có thể tổng hợp thuốc chữa đại dịch mới. Nhưng con đường đến hạt giống cuối cùng dẫn qua vùng chiến sự cô chưa bao giờ đặt chân.",
    target_audience: "Seinen",
    name_summary: null,
    sketch_image_url: null,
    status: "revision",
    rejection_reason: null,
    revision_feedback:
      "Ý tưởng hay nhưng cần phát triển thêm nhân vật phản diện. Motivation của bên muốn phá hủy hạt giống chưa thuyết phục. Hãy viết thêm ít nhất 1 chương phác thảo tập trung vào antagonist.",
    mangaka: {
      user_id: 5,
      fullName: "Fujita Mei",
      avatarUrl: null,
    },
    genres: [
      { genre_id: 9, name: "Adventure" },
      { genre_id: 3, name: "Mystery" },
    ],
    characters: [
      {
        character_id: 8,
        character_name: "Yuki Hara",
        role: "Nhân vật chính",
        description:
          "Nhà thực vật học 26 tuổi, người con duy nhất của gia đình nghèo. Cứng đầu, am hiểu thiên nhiên nhưng ngây thơ về thế giới người.",
      },
      {
        character_id: 9,
        character_name: "Captain Shen",
        role: "Dẫn đường",
        description:
          "Cựu binh bí ẩn. Nhận lệnh bảo vệ Yuki nhưng có agenda riêng.",
      },
    ],
  },
];

const STATUS_META: Record<
  ProposalStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "CHỜ DUYỆT",
    className: "pr-badge--pending",
    icon: <Clock size={11} />,
  },
  approved: {
    label: "ĐÃ DUYỆT",
    className: "pr-badge--approved",
    icon: <CheckCircle2 size={11} />,
  },
  revision: {
    label: "CẦN SỬA",
    className: "pr-badge--revision",
    icon: <RotateCcw size={11} />,
  },
  rejected: {
    label: "TỪ CHỐI",
    className: "pr-badge--rejected",
    icon: <XCircle size={11} />,
  },
  pending_admin: {
    label: "CHỜ ADMIN",
    className: "pr-badge--pending-admin",
    icon: <Clock size={11} />,
  },
};

export default function ProposalReview() {
  const { proposalId } = useParams<{ proposalId?: string }>();
  const navigate = useNavigate();

  const [proposals, setProposals] = useState<SeriesProposal[]>([]);
  // const [selected, setSelected] = useState<SeriesProposal | null>(null);
  const selected = proposalId
    ? (proposals.find((p) => p.proposal_id === Number(proposalId)) ?? null)
    : null;
  const [filter, setFilter] = useState<ProposalStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [revisionText, setRevisionText] = useState("");
  const [rejectionText, setRejectionText] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!proposalId && proposals.length > 0 && !selected) {
      navigate(`/tantou/proposal-review/${proposals[0].proposal_id}`, {
        replace: true,
      });
    }
  }, [proposalId, proposals, selected, navigate]);

  useEffect(() => {
    const loadProposals = async () => {
      try {
        setLoading(true);
        const data = await fetchProposals();
        setProposals(data);
      } catch (err) {
        console.error("unsuccessful fetch data proposals", err);
      } finally {
        setLoading(false);
      }
    };
    loadProposals();
  }, []);

  const counts = {
    all: proposals.length,
    pending: proposals.filter((p) => p.status === "pending").length,
    pending_admin: proposals.filter((p) => p.status === "pending_admin").length,
    approved: proposals.filter((p) => p.status === "approved").length,
    revision: proposals.filter((p) => p.status === "revision").length,
    rejected: proposals.filter((p) => p.status === "rejected").length,
  };

  const visible = proposals.filter((p) => {
    const matchFilter = filter === "all" || p.status === filter;
    const matchSearch =
      p.working_title.toLowerCase().includes(search.toLowerCase()) ||
      p.mangaka.fullName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const approve = async (id: number) => {
    setSubmitting(true);
    try {
      await reviewProposal(id, { decision: "approve" });
      setProposals((prev) =>
        prev.map((p) =>
          p.proposal_id === id
            ? { ...p, status: "pending_admin", rejection_reason: null }
            : p,
        ),
      );
      setShowRejectForm(false);
      setShowRevisionForm(false);
    } catch (err) {
      console.error("Phê duyệt thất bại", err);
    } finally {
      setSubmitting(false);
    }
  };

  const sendRevision = async (id: number) => {
    if (!revisionText.trim()) return;
    setSubmitting(true);
    try {
      await reviewProposal(id, {
        decision: "revision",
        feedback: revisionText.trim(),
      });

      setProposals((prev) =>
        prev.map((p) =>
          p.proposal_id === id
            ? {
                ...p,
                status: "revision",
                revision_feedback: revisionText.trim(),
              }
            : p,
        ),
      );

      setRevisionText("");
      setShowRevisionForm(false);
    } catch (err) {
      console.error("Yêu cầu sửa thất bại", err);
    } finally {
      setSubmitting(false);
    }
  };

  const sendRejection = async (id: number) => {
    if (!rejectionText.trim()) return;
    setSubmitting(true);
    try {
      await reviewProposal(id, {
        decision: "reject",
        reason: rejectionText.trim(),
      });

      setProposals((prev) =>
        prev.map((p) =>
          p.proposal_id === id
            ? {
                ...p,
                status: "rejected",
                rejection_reason: rejectionText.trim(),
              }
            : p,
        ),
      );

      setRejectionText("");
      setShowRejectForm(false);
    } catch (err) {
      console.error("Từ chối thất bại", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReopen = async (id: number) => {
    setSubmitting(true);
    try {
      await reopenProposal(id);
      setProposals((prev) =>
        prev.map((p) =>
          p.proposal_id === id
            ? {
                ...p,
                status: "pending",
                rejection_reason: null,
                revision_feedback: null,
              }
            : p,
        ),
      );
    } catch (err) {
      console.error("Mở lại thất bại", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = (p: SeriesProposal) => {
    navigate(`/tantou/proposal-review/${p.proposal_id}`);

    setShowRejectForm(false);
    setShowRevisionForm(false);
    setRevisionText("");
    setRejectionText("");
  };

  return (
    <div className="pr-root">
      <div className="pr-list-col">
        <div className="pr-list-header">
          <div className="pr-list-header__top">
            <div className="pr-list-header__title">
              <Sparkles size={18} strokeWidth={1.75} />
              Đề xuất Series Mới
            </div>
            <span className="pr-new-badge">{counts.pending} mới</span>
          </div>
          <p className="pr-list-header__sub">
            Bản Name ý tưởng từ Mangaka gửi lên xét duyệt
          </p>

          <div className="pr-search">
            <Search size={15} className="pr-search__icon" />
            <input
              className="pr-search__input"
              placeholder="Tìm tên truyện, tác giả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="pr-filter-tabs">
          {(
            [
              "all",
              "pending",
              "pending_admin",
              "revision",
              "approved",
              "rejected",
            ] as const
          ).map((f) => (
            <button
              key={f}
              className={`pr-filter-tab ${filter === f ? "pr-filter-tab--on" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "Tất cả"
                : f === "pending"
                  ? "Chờ duyệt"
                  : f === "pending_admin"
                    ? "Chờ Admin"
                    : f === "revision"
                      ? "Cần sửa"
                      : f === "approved"
                        ? "Đã duyệt"
                        : "Từ chối"}
              <span className="pr-filter-tab__count">{counts[f]}</span>
            </button>
          ))}
        </div>

        <div className="pr-cards">
          {visible.length === 0 && (
            <div className="pr-cards__empty">
              <FileText size={28} strokeWidth={1} />
              <p>Không có đề xuất nào.</p>
            </div>
          )}

          {visible.map((p) => {
            const isActive = selected?.proposal_id === p.proposal_id;
            const sm = STATUS_META[p.status];
            return (
              <button
                key={p.proposal_id}
                className={`pr-card ${isActive ? "pr-card--active" : ""} pr-card--${p.status}`}
                onClick={() => openDetail(p)}
              >
                <div className="pr-card__bar" />

                <div className="pr-card__content">
                  <div className="pr-card__row1">
                    <span className="pr-card__title">{p.working_title}</span>
                    <span className={`pr-badge ${sm.className}`}>
                      {sm.icon}
                      {sm.label}
                    </span>
                  </div>

                  <div className="pr-card__row2">
                    <div className="pr-card__author">
                      {p.mangaka.avatarUrl ? (
                        <img
                          className="pr-avatar pr-avatar--sm"
                          src={p.mangaka.avatarUrl}
                          alt={p.mangaka.fullName}
                        />
                      ) : (
                        <div
                          className="pr-avatar pr-avatar--sm"
                          style={{
                            background: getAvatarColor(p.mangaka.fullName),
                          }}
                        >
                          {getInitials(p.mangaka.fullName)}
                        </div>
                      )}
                      <span>{p.mangaka.fullName}</span>
                    </div>
                    <span className="pr-card__date">
                      <Calendar size={11} />
                      {timeAgo(p.created_at)}
                    </span>
                  </div>

                  <div className="pr-card__genres">
                    {p.genres.map((g, index) => (
                      <span
                        key={g.genre_id ?? `genre-${index}`}
                        className="pr-genre-chip"
                      >
                        {g.name}
                      </span>
                    ))}
                    <span className="pr-audience-chip">
                      {p.target_audience}
                    </span>
                  </div>

                  <p className="pr-card__synopsis">{p.synopsis}</p>
                </div>

                <ChevronRight size={16} className="pr-card__arrow" />
              </button>
            );
          })}
        </div>
      </div>

      <div className={`pr-detail ${selected ? "pr-detail--open" : ""}`}>
        {!selected ? (
          <div className="pr-detail__empty">
            <div className="pr-detail__empty-icon">
              <Sparkles size={36} strokeWidth={1} />
            </div>
            <p>Chọn một đề xuất để xem chi tiết</p>
          </div>
        ) : (
          <>
            <div className="pr-detail__head">
              <div className="pr-detail__head-main">
                <div>
                  <div className="pr-detail__eyebrow">
                    ĐỀ XUẤT #{selected.proposal_id.toString().padStart(4, "0")}{" "}
                    · {formatDate(selected.created_at)}
                  </div>
                  <h2 className="pr-detail__title">{selected.working_title}</h2>
                </div>
                <button
                  className="pr-detail__close"
                  onClick={() => navigate("/tantou/proposal-review")}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="pr-detail__author-row">
                {selected.mangaka.avatarUrl ? (
                  <img
                    className="pr-avatar"
                    src={selected.mangaka.avatarUrl}
                    alt={selected.mangaka.fullName}
                  />
                ) : (
                  <div
                    className="pr-avatar"
                    style={{
                      background: getAvatarColor(selected.mangaka.fullName),
                    }}
                  >
                    {getInitials(selected.mangaka.fullName)}
                  </div>
                )}
                <div>
                  <div className="pr-detail__author-name">
                    {selected.mangaka.fullName}
                  </div>
                  <div className="pr-detail__author-role">Mangaka</div>
                </div>
                <span
                  className={`pr-badge pr-badge--lg ${STATUS_META[selected.status].className}`}
                >
                  {STATUS_META[selected.status].icon}
                  {STATUS_META[selected.status].label}
                </span>
              </div>

              <div className="pr-detail__chips">
                {selected.genres.map((g, index) => (
                  <span
                    key={g.genre_id ?? `genre-${index}`}
                    className="pr-genre-chip pr-genre-chip--lg"
                  >
                    <Tag size={11} /> {g.name}
                  </span>
                ))}
                <span className="pr-audience-chip pr-audience-chip--lg">
                  <Users size={11} /> {selected.target_audience}
                </span>
              </div>
            </div>

            <div className="pr-detail__body">
              <Section title="Tóm tắt cốt truyện" icon={<BookOpen size={13} />}>
                <p className="pr-text">{selected.synopsis}</p>
              </Section>

              {selected.name_summary && (
                <Section
                  title="Bản Name phác thảo"
                  icon={<FileText size={13} />}
                >
                  <div className="pr-name-summary">
                    {selected.name_summary.split("\n").map((line, i) => (
                      <div key={i} className="pr-name-summary__line">
                        <span className="pr-name-summary__dot" />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {selected.characters.length > 0 && (
                <Section
                  title={`Nhân vật (${selected.characters.length})`}
                  icon={<Users size={13} />}
                >
                  <div className="pr-characters">
                    {selected.characters.map((c, index) => (
                      <div
                        key={c.character_id ?? `char-${index}`}
                        className="pr-character"
                      >
                        <div className="pr-character__head">
                          <span className="pr-character__name">
                            {c.character_name}
                          </span>
                          <span className="pr-character__role">{c.role}</span>
                        </div>
                        {c.description && (
                          <p className="pr-character__desc">{c.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {selected.sketch_image_url ? (
                <Section title="Ảnh phác thảo" icon={<ImageIcon size={13} />}>
                  <div className="pr-sketch">
                    <img
                      src={selected.sketch_image_url}
                      alt="Phác thảo"
                      className="pr-sketch__img"
                    />
                  </div>
                </Section>
              ) : (
                <Section
                  title="Ảnh phác thảo"
                  icon={<ImageIcon size={13} />}
                  defaultOpen={false}
                >
                  <div className="pr-sketch pr-sketch--empty">
                    <ImageIcon size={24} strokeWidth={1} />
                    <span>Tác giả chưa đính kèm ảnh phác thảo</span>
                  </div>
                </Section>
              )}

              {selected.revision_feedback && (
                <div className="pr-prev-feedback pr-prev-feedback--revision">
                  <div className="pr-prev-feedback__label">
                    <RotateCcw size={12} /> Phản hồi yêu cầu sửa (trước đó)
                  </div>
                  <p>{selected.revision_feedback}</p>
                </div>
              )}
              {selected.rejection_reason && (
                <div className="pr-prev-feedback pr-prev-feedback--rejected">
                  <div className="pr-prev-feedback__label">
                    <XCircle size={12} /> Lý do từ chối
                  </div>
                  <p>{selected.rejection_reason}</p>
                </div>
              )}
            </div>

            {selected.status === "pending" || selected.status === "revision" ? (
              <div className="pr-detail__footer">
                {showRevisionForm && (
                  <div className="pr-feedback-form pr-feedback-form--revision">
                    <div className="pr-feedback-form__label">
                      <RotateCcw size={13} /> Yêu cầu chỉnh sửa
                    </div>
                    <textarea
                      className="pr-feedback-form__area"
                      rows={3}
                      placeholder="Mô tả cụ thể những gì tác giả cần chỉnh sửa hoặc bổ sung..."
                      value={revisionText}
                      onChange={(e) => setRevisionText(e.target.value)}
                      autoFocus
                    />
                    <div className="pr-feedback-form__actions">
                      <button
                        className="pr-btn pr-btn--ghost"
                        onClick={() => {
                          setShowRevisionForm(false);
                          setRevisionText("");
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        className="pr-btn pr-btn--revision"
                        onClick={() => sendRevision(selected.proposal_id)}
                        disabled={!revisionText.trim()}
                      >
                        <Send size={14} /> Gửi yêu cầu sửa
                      </button>
                    </div>
                  </div>
                )}

                {showRejectForm && (
                  <div className="pr-feedback-form pr-feedback-form--reject">
                    <div className="pr-feedback-form__label">
                      <XCircle size={13} /> Lý do từ chối
                    </div>
                    <textarea
                      className="pr-feedback-form__area"
                      rows={3}
                      placeholder="Giải thích lý do từ chối để tác giả hiểu và cải thiện trong lần sau..."
                      value={rejectionText}
                      onChange={(e) => setRejectionText(e.target.value)}
                      autoFocus
                    />
                    <div className="pr-feedback-form__actions">
                      <button
                        className="pr-btn pr-btn--ghost"
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectionText("");
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        className="pr-btn pr-btn--reject"
                        onClick={() => sendRejection(selected.proposal_id)}
                        disabled={!rejectionText.trim()}
                      >
                        <XCircle size={14} /> Xác nhận từ chối
                      </button>
                    </div>
                  </div>
                )}

                {!showRevisionForm && !showRejectForm && (
                  <div className="pr-detail__actions">
                    <button
                      className="pr-btn pr-btn--ghost pr-btn--icon"
                      onClick={() => setShowRejectForm(true)}
                    >
                      <XCircle size={16} strokeWidth={1.75} /> Từ chối
                    </button>
                    <button
                      className="pr-btn pr-btn--revision pr-btn--icon"
                      onClick={() => setShowRevisionForm(true)}
                    >
                      <RotateCcw size={15} strokeWidth={1.75} /> Yêu cầu sửa
                    </button>
                    <button
                      className="pr-btn pr-btn--approve pr-btn--icon"
                      disabled={submitting}
                      onClick={() => approve(selected.proposal_id)}
                    >
                      <CheckCircle2 size={16} strokeWidth={1.75} /> Phê duyệt
                    </button>
                  </div>
                )}
              </div>
            ) : selected.status === "pending_admin" ? (
              <div className="pr-detail__footer pr-detail__footer--decided">
                <span className="pr-badge pr-badge--lg pr-badge--pending-admin">
                  <Clock size={11} /> CHỜ ADMIN DUYỆT
                </span>
                <p className="pr-detail__footer-note">
                  Đề xuất đã được bạn phê duyệt và đang chờ Admin xét duyệt lần
                  cuối.
                </p>
                <button
                  className="pr-btn pr-btn--ghost"
                  disabled={submitting}
                  onClick={() => handleReopen(selected.proposal_id)}
                >
                  Mở lại xét duyệt
                </button>
              </div>
            ) : (
              <div className="pr-detail__footer pr-detail__footer--decided">
                <span
                  className={`pr-badge pr-badge--lg ${STATUS_META[selected.status].className}`}
                >
                  {STATUS_META[selected.status].icon}
                  {STATUS_META[selected.status].label}
                </span>
                {(selected.status === "rejected" ||
                  selected.status === "approved") && (
                  <button
                    className="pr-btn pr-btn--ghost"
                    disabled={submitting}
                    onClick={() => handleReopen(selected.proposal_id)}
                  >
                    Mở lại xét duyệt
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
