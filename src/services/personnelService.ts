import api from "./api";

interface ApiResp<T> {
  data: T;
  message: string;
}

export interface PersonnelUser {
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  roles: string[];
  createdAt: string;
}

export interface AssignmentItem {
  assignmentId: number;
  tantouId: number;
  tantouName: string;
  tantouAvatarUrl: string | null;
  mangakaId: number;
  mangakaName: string;
  mangakaAvatarUrl: string | null;
  assignedAt: string;
  isActive: boolean;
}

export interface CreateUserReq {
  fullName: string;
  email: string;
  password: string;
  roleName: "TANTOU" | "MANGAKA" | "ASSISTANT" | "ADMIN";
}

export const fetchUsersByRole = (role: string): Promise<PersonnelUser[]> =>
  api
    .get<
      ApiResp<PersonnelUser[]>
    >("/admin/personnel/users", { params: { role } })
    .then((r) => r.data.data ?? []);

export const createUser = (body: CreateUserReq): Promise<PersonnelUser> =>
  api
    .post<ApiResp<PersonnelUser>>("/admin/personnel/users", body)
    .then((r) => r.data.data);

export const fetchAssignments = (): Promise<AssignmentItem[]> =>
  api
    .get<ApiResp<AssignmentItem[]>>("/admin/personnel/assignments")
    .then((r) => r.data.data ?? []);

export const assignTantou = (
  tantouId: number,
  mangakaId: number,
): Promise<AssignmentItem> =>
  api
    .post<
      ApiResp<AssignmentItem>
    >("/admin/personnel/assignments", { tantouId, mangakaId })
    .then((r) => r.data.data);

export const removeAssignment = (assignmentId: number): Promise<void> =>
  api.delete(`/admin/personnel/assignments/${assignmentId}`);
