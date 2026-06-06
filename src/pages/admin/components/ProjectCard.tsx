export interface Project {
  id: number;
  title: string;
  code: string;
  creator: string;
  status: string;
  progress: number;
  isActive?: boolean;
}

interface ProjectCardProps {
  project: Project;
  isActive?: boolean;
}

export default function ProjectCard({ project, isActive }: ProjectCardProps) {
  return (
    <article className={`project-card ${isActive ? "active" : ""}`}>
      <div className="project-card__top">
        <div className="project-card__copy">
          <h3>{project.title}</h3>
          <p>
            ID: {project.code} &bull; Tác giả: {project.creator}
          </p>
        </div>
        <span className={isActive ? "status-ready" : "status-pending"}>
          {project.status}
        </span>
      </div>

      <div className="project-card__meta">
        <strong>Phiếu thuận hiện tại</strong>
        <b>{project.progress}%</b>
      </div>
      <div className="project-card__progress">
        <span style={{ width: `${project.progress}%` }} />
      </div>
    </article>
  );
}
