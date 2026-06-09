import { useNavigate } from "react-router-dom";
import { MapPinOff, ArrowLeft, Home, CornerLeftUp } from "lucide-react";
import "./NotFound.scss";
import { useAuth } from "../../hooks/useAuth";

export const NotFound = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const logoutAndGoHome = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="not-found-fullscreen">
      <div className="watermark">404</div>

      <div className="content-area">
        <MapPinOff className="icon-missing" size={72} strokeWidth={1} />
        <h1 className="title">Không tìm thấy trang</h1>
        <div className="divider-line"></div>

        <p className="description">
          Đường dẫn bạn đang cố truy cập không tồn tại hoặc đã bị gỡ bỏ.
          <br />
          Vui lòng kiểm tra lại <span style={{ color: "red" }}>
            đường dẫn
          </span>{" "}
          hoặc trở về hệ thống để tiếp tục công việc.
        </p>

        <div className="action-row">
          <button className="btn btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} strokeWidth={1.5} />
            <span>Quay lại</span>
          </button>

          <div className="home-action-wrapper">
            <button className="btn btn-home" onClick={() => logoutAndGoHome()}>
              <Home size={20} strokeWidth={1.5} />
              <span>Về Trang chủ</span>
            </button>
          </div>
        </div>
      </div>
      <div className="logout-note">
        <CornerLeftUp className="arrow-icon" size={16} strokeWidth={2} />
        <span className="note-text">
          Nếu bạn đã đăng nhập, chúng tôi sẽ đăng xuất bạn để đảm bảo an toàn.
        </span>
      </div>
    </div>
  );
};
