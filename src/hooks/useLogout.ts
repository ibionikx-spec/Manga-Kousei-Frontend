import { useState } from "react";
import { useAuth } from "./useAuth";

export const useLogout = () => {
  const { logout } = useAuth();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleLogoutClick = () => setShowConfirmLogout(true);

  const handleConfirmLogout = async () => {
    setShowConfirmLogout(false);
    await logout();
  };

  const handleCancelLogout = () => setShowConfirmLogout(false);

  return {
    showConfirmLogout,
    handleLogoutClick,
    handleConfirmLogout,
    handleCancelLogout,
  };
};
