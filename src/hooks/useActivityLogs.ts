import { useState, useEffect, useCallback } from "react";
import { fetchMyLogs } from "../services/activityLogService";
import type {
  ActivityLogItem,
  LogCategory,
  PagedResponse,
} from "../services/activityLogService";

interface UseActivityLogsParams {
  category: LogCategory | "all";
  page: number;
  size?: number;
}

interface State {
  data: PagedResponse<ActivityLogItem> | null;
  loading: boolean;
  error: string | null;
}

const INITIAL: State = { data: null, loading: true, error: null };

export function useActivityLogs({
  category,
  page,
  size = 20,
}: UseActivityLogsParams) {
  const [state, setState] = useState<State>(INITIAL);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    fetchMyLogs({ category, page, size })
      .then((result) => {
        if (!cancelled) setState({ data: result, loading: false, error: null });
      })
      .catch(() => {
        if (!cancelled)
          setState({
            data: null,
            loading: false,
            error: "Không thể tải lịch sử hoạt động.",
          });
      });

    return () => {
      cancelled = true;
    };
  }, [category, page, size, tick]);

  return { ...state, refresh };
}
