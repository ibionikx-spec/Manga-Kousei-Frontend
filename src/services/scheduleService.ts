import api from './api';
import type { ScheduleEvent, ScheduleRequestParams } from '../types/schedule';

export const scheduleService = {
  getSchedule: async (params: ScheduleRequestParams): Promise<ScheduleEvent[]> => {
    const response = await api.get<ScheduleEvent[]>('/tantou/schedule', { params });
    return response.data;
  },
};