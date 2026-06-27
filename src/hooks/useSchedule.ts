/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../services/scheduleService';
import type { ScheduleEvent, ScheduleRequestParams } from '../types/schedule';

interface UseScheduleResult {
  events: ScheduleEvent[];
  loading: boolean;
  error: Error | null;
  refetch: (newParams?: Partial<ScheduleRequestParams>) => void;
}
export const useSchedule = (initialParams: ScheduleRequestParams): UseScheduleResult => {
  const [params, setParams] = useState<ScheduleRequestParams>(initialParams);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchSchedule = useCallback(async (fetchParams: ScheduleRequestParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await scheduleService.getSchedule(fetchParams);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule(params);
  }, [params, fetchSchedule]);

  const refetch = useCallback((newParams?: Partial<ScheduleRequestParams>) => {
    if (newParams) {
      setParams(prev => ({ ...prev, ...newParams }));
    } else {
      fetchSchedule(params);
    }
  }, [params, fetchSchedule]);

  return { events, loading, error, refetch };
};