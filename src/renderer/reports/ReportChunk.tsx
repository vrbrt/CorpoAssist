import { useEffect, useState } from 'react';
import './ReportChunk.css';

type ProjectData = {
  id: number;
  type: string;
  project?: string;
  title: string;
  details: string;
  badge?: string;
  tags: string[];
};

const ReportBox = ({
  id,
  type,
  project,
  title,
  details,
  badge,
  tags,
}: ProjectData) => {
  const sendReport = () => {
    window.electron.ipcRenderer.sendMessage('reportTime', [
      { id, type, project, tags },
    ]);
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="reportOption" onClick={sendReport}>
      {badge && (
        <div className="optionBadge">
          <span>{badge}</span>
        </div>
      )}
      <div className="reportContainer">
        <p className="optionTitle">{title}</p>
        <p className="optionDescription">{details}</p>
        <div className="optionFooter">
          {tags.map((tag) => (
            <div key={tag}>{tag}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

ReportBox.defaultProps = {
  project: '',
  badge: '',
};

const ReportChunk = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  useEffect(() => {
    window.electron.ipcRenderer.once('getProjects', (args) =>
      setProjects(args as ProjectData[])
    );
    window.electron.ipcRenderer.sendMessage('getProjects', []);
  }, []);

  return (
    <div id="reportTimePanel">
      {projects.map((project) => (
        <ReportBox
          id={project.id}
          type={project.type}
          project={project.project}
          title={project.title}
          details={project.details}
          tags={project.tags}
          badge={project.badge}
          key={project.id}
        />
      ))}
    </div>
  );
};

export default ReportChunk;
