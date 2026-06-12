import type {
  ProposalCharacterDTO,
  ProposalGenreDTO,
  SeriesProposalDTO,
} from "../types/dtos/SeriesProposalDto";
import type { ProposalStatus, SeriesProposal } from "../types/SeriesProposal";
import api from "./api";

export interface InboxItem {
  itemType: "manuscript" | "proposal";
  id: number;
  seriesTitle: string | null;
  content: string;
  submittedBy: string;
  submittedAt: string;
  status: string;
  statusLabel: string;
}

export interface DeadlineItem {
  id: number;
  label: string;
  labelType: string;
  timeTag: string;
  title: string;
  author: string;
  series: string;
}

export interface ActivityItem {
  id: number;
  done: boolean;
  title: string;
  meta: string;
}

export interface ProgressItem {
  label: string;
  pct: number;
  color: string;
}

export const fetchInbox = () =>
  api
    .get<ApiResponse<InboxItem[]>>("/tantou/inbox")
    .then((res) => {
      const data = res.data.data;

      return Array.isArray(data) ? data : [];
    })
    .catch(() => []);

// export const fetchDeadlines = () =>
//   api.get<DeadlineItem[]>("/tantou/deadlines").then((res) => res.data);

// export const fetchActivities = () =>
//   api.get<ActivityItem[]>("/tantou/activities").then((res) => res.data);

// export const fetchProgress = () =>
//   api.get<ProgressItem[]>("/tantou/progress").then((res) => res.data);

// type ProposalStatus = "pending" | "approved" | "revision" | "rejected";

export const fetchProposals = async (
  status?: string,
  search?: string,
): Promise<SeriesProposal[]> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (search) params.append("search", search);

  return api
    .get<ApiResponse<SeriesProposalDTO[]>>("/tantou/proposals", { params })
    .then((res) => {
      const rawData = res.data.data;
      if (!Array.isArray(rawData)) return [];

      console.log("data ne", rawData);

      return rawData.map(
        (item: SeriesProposalDTO): SeriesProposal => ({
          proposal_id: item.proposalId,
          created_at: item.createdAt,
          working_title: item.workingTitle,
          synopsis: item.synopsis,
          target_audience: item.targetAudience,
          name_summary: item.nameSummary || null,
          sketch_image_url: item.sketchImageUrl || null,
          status: validateStatus(item.status),
          rejection_reason: item.rejectionReason || null,
          revision_feedback: item.revisionFeedback || null,
          mangaka: {
            user_id: item.mangaka?.userId,
            fullName: item.mangaka?.fullName,
            avatarUrl: item.mangaka?.avatarUrl || null,
          },
          genres: (item.genres || []).map((g: ProposalGenreDTO) => ({
            genre_id: g.genre_id,
            name: g.name,
          })),
          characters: (item.characters || []).map(
            (c: ProposalCharacterDTO) => ({
              character_id: c.character_id,
              character_name: c.character_name,
              role: c.role,
              description: c.description || null,
            }),
          ),
        }),
      );
    });
};

function validateStatus(s: string): ProposalStatus {
  const valid: ProposalStatus[] = [
    "pending",
    "approved",
    "revision",
    "rejected",
  ];
  return valid.includes(s as ProposalStatus)
    ? (s as ProposalStatus)
    : "pending";
}
