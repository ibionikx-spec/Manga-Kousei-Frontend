import api from "./api";

interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface AssistantAssignmentRes {
  assignmentId: number;
  assistantId: number;
  assistantName: string;
  assistantAvatarUrl: string | null;
  assistantEmail: string;
  mangakaId: number;
  mangakaName: string;
  mangakaAvatarUrl: string | null;
  status: "pending" | "active" | "rejected" | "inactive";
  invitedAt: string;
  respondedAt: string | null;
}

export interface AssistantSearchRes {
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  relationshipStatus: string | null;
}

export const searchAssistants = (
  keyword: string,
): Promise<AssistantSearchRes[]> =>
  api
    .get<
      ApiResponse<AssistantSearchRes[]>
    >(`/mangaka/assistants/search?keyword=${encodeURIComponent(keyword)}`)
    .then((r) => r.data.data ?? []);

export const inviteAssistant = (
  assistantId: number,
): Promise<AssistantAssignmentRes> =>
  api
    .post<
      ApiResponse<AssistantAssignmentRes>
    >("/mangaka/assistants/invite", { assistantId })
    .then((r) => r.data.data);

export const fetchActiveAssistants = (): Promise<AssistantAssignmentRes[]> =>
  api
    .get<ApiResponse<AssistantAssignmentRes[]>>("/mangaka/assistants/active")
    .then((r) => r.data.data ?? []);

export const fetchPendingInvitations = (): Promise<AssistantAssignmentRes[]> =>
  api
    .get<ApiResponse<AssistantAssignmentRes[]>>("/mangaka/assistants/pending")
    .then((r) => r.data.data ?? []);

export const deactivateAssistant = (assignmentId: number): Promise<void> =>
  api.delete(`/mangaka/assistants/${assignmentId}`);

export const fetchMyInvitations = (): Promise<AssistantAssignmentRes[]> =>
  api
    .get<ApiResponse<AssistantAssignmentRes[]>>("/assistant/invitations")
    .then((r) => r.data.data ?? []);

export const countPendingInvitations = (): Promise<number> =>
  api
    .get<ApiResponse<number>>("/assistant/invitations/count")
    .then((r) => r.data.data ?? 0);

export const respondToInvitation = (
  assignmentId: number,
  decision: "accept" | "reject",
): Promise<AssistantAssignmentRes> =>
  api
    .patch<
      ApiResponse<AssistantAssignmentRes>
    >(`/assistant/invitations/${assignmentId}/respond`, { decision })
    .then((r) => r.data.data);
