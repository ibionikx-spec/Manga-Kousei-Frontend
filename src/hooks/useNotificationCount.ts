import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { countPendingInvitations } from "../services/assistantAssignmentService";

export function useNotificationCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (user?.role !== "ASSISTANT") return;

    const fetch = async () => {
      try {
        const n = await countPendingInvitations();
        setCount(n);
      } catch {
        // ignore
      }
    };

    fetch();
    const interval = setInterval(fetch, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  return count;
}
