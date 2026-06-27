import { useState, useCallback } from 'react';
export interface ScheduleFilters {
  from: string;
  to: string;
  status: string;
}
export const useScheduleFilters = (initialFilters?: Partial<ScheduleFilters>) => {
  const [filters, setFilters] = useState<ScheduleFilters>({
    from: initialFilters?.from || '',
    to: initialFilters?.to || '',
    status: initialFilters?.status || '',
  });
  const updateFilter = useCallback((key: keyof ScheduleFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  const resetFilters = useCallback(() => {
    setFilters({ from: '', to: '', status: '' });
  }, []);
  return { filters, updateFilter, resetFilters };
};