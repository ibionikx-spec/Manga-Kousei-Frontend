import ProjectDetail from "./components/ProjectDetail";
import ProjectCard, { type Project } from "./components/ProjectCard";
import "./AdminApprovals.scss";

const pendingProjects: Project[] = [
  {
    id: 1,
    title: "Huyết Chiến Thành Shinjuku",
    code: "#SHJ-042",
    creator: "Kuro-san",
    status: "Sẵn sàng",
    progress: 82,
    isActive: true,
  },
  {
    id: 2,
    title: "Mùa Hạ Không Màu",
    code: "#SUM-009",
    creator: "Aoki Yuki",
    status: "Chờ duyệt",
    progress: 45,
  },
  {
    id: 3,
    title: "Cyberpunk: DaLat 2077",
    code: "#CPK-112",
    creator: "V-Studio",
    status: "Chờ duyệt",
    progress: 12,
  },
];

export default function AdminApprovals() {
  return (
    <div className="review-shell">
      <div className="review-workspace">
        <main className="review-main">
          <section className="review-queue">
            <div className="queue-heading">
              <h2>Đang chờ duyệt</h2>
              <span>3 Dự án</span>
            </div>
            <div className="queue-list">
              {pendingProjects.map((project) => (
                <ProjectCard
                  isActive={project.isActive}
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
          </section>

          <ProjectDetail />
        </main>
      </div>
    </div>
  );
}
