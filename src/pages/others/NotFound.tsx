import { useNavigate } from "react-router-dom";
import { MapPinOff, ArrowLeft, Home } from "lucide-react";
import "./NotFound.scss";

export const NotFound = () => {
  const navigate = useNavigate();

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

          <button className="btn btn-home" onClick={() => navigate("/")}>
            <Home size={20} strokeWidth={1.5} />
            <span>Về Trang chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
