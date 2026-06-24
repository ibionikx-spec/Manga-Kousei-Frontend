import api from "./api";

interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface PageRes {
  pageId: number;
  pageNumber: number;
  fileUrl: string;
  pageStatus: string;
  regionCount: number;
  taskCount: number;
  createdAt: string;
}

export interface TaskRes {
  taskId: number;
  taskTypeName: string;
  description: string | null;
  deadline: string;
  taskStatus: string;
  assignedToId: number | null;
  assignedToName: string | null;
  assignedToAvatarUrl: string | null;
  createdAt: string;
}

export interface RegionRes {
  regionId: number;
  x: number;
  y: number;
  width: number;
  height: number;
  regionTypeName: string;
  regionTypeId: number;
  note: string | null;
  tasks: TaskRes[];
}

export interface LookupItem {
  id: number;
  name: string;
}

export const fetchPages = (chapterId: number): Promise<PageRes[]> =>
  api
    .get<ApiResponse<PageRes[]>>(`/mangaka/chapters/${chapterId}/pages`)
    .then((r) => r.data.data ?? []);

export const createPage = (body: {
  chapterId: number;
  pageNumber: number;
  fileUrl: string;
}): Promise<PageRes> =>
  api
    .post<ApiResponse<PageRes>>("/mangaka/pages", body)
    .then((r) => r.data.data);

export const updatePage = (
  pageId: number,
  body: { fileUrl?: string; pageNumber?: number },
): Promise<PageRes> =>
  api
    .put<ApiResponse<PageRes>>(`/mangaka/pages/${pageId}`, body)
    .then((r) => r.data.data);

export const deletePage = (pageId: number): Promise<void> =>
  api.delete(`/mangaka/pages/${pageId}`);

export const fetchRegions = (pageId: number): Promise<RegionRes[]> =>
  api
    .get<ApiResponse<RegionRes[]>>(`/mangaka/pages/${pageId}/regions`)
    .then((r) => r.data.data ?? []);

export const createRegion = (body: {
  pageId: number;
  x: number;
  y: number;
  width: number;
  height: number;
  regionTypeId: number;
  note?: string;
}): Promise<RegionRes> =>
  api
    .post<ApiResponse<RegionRes>>("/mangaka/regions", body)
    .then((r) => r.data.data);

export const updateRegion = (
  regionId: number,
  body: {
    pageId: number;
    x: number;
    y: number;
    width: number;
    height: number;
    regionTypeId: number;
    note?: string;
  },
): Promise<RegionRes> =>
  api
    .put<ApiResponse<RegionRes>>(`/mangaka/regions/${regionId}`, body)
    .then((r) => r.data.data);

export const deleteRegion = (regionId: number): Promise<void> =>
  api.delete(`/mangaka/regions/${regionId}`);

export const createTask = (body: {
  regionId: number;
  taskTypeId: number;
  assignedTo: number;
  deadline: string;
  description?: string;
}): Promise<TaskRes> =>
  api
    .post<ApiResponse<TaskRes>>("/mangaka/tasks", body)
    .then((r) => r.data.data);

export const updateTask = (
  taskId: number,
  body: {
    regionId: number;
    taskTypeId: number;
    assignedTo: number;
    deadline: string;
    description?: string;
  },
): Promise<TaskRes> =>
  api
    .put<ApiResponse<TaskRes>>(`/mangaka/tasks/${taskId}`, body)
    .then((r) => r.data.data);

export const deleteTask = (taskId: number): Promise<void> =>
  api.delete(`/mangaka/tasks/${taskId}`);

export const fetchRegionTypes = (): Promise<LookupItem[]> =>
  api
    .get<ApiResponse<LookupItem[]>>("/region-types")
    .then((r) => r.data.data ?? []);

export const fetchTaskTypes = (): Promise<LookupItem[]> =>
  api
    .get<ApiResponse<LookupItem[]>>("/task-types")
    .then((r) => r.data.data ?? []);
