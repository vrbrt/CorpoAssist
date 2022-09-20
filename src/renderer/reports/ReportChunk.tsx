import { useEffect, useMemo, useState } from 'react';
import './ReportChunk.css';

interface ProjectData {
  type: string;
  project?: string;
  title: string;
  details: string;
  badge?: string;
  tags: string[];
  subtasks: ProjectData[];
}

interface ReportBoxParams extends ProjectData {
  push: PushFn;
}

const ReportBox = ({
  type,
  project,
  title,
  details,
  badge,
  tags,
  subtasks,
  push,
}: ReportBoxParams) => {
  const sendReport = () => {
    window.electron.ipcRenderer.sendMessage('reportTime', [
      { title, type, details, project, tags },
    ]);
  };

  const onClickHandler = () => {
    if (subtasks?.length > 0) {
      push(subtasks);
    } else {
      sendReport();
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="reportOption" onClick={onClickHandler}>
      {badge && (
        <div className="optionBadge">
          <span>{badge}</span>
        </div>
      )}
      <div className="reportContainer">
        <p className="optionTitle">{title}</p>
        <p className="optionDescription">{details}</p>
        <div className="optionFooter">
          {tags?.map((tag) => (
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

const ReturnBox = ({ pop }: { pop: PopFn | undefined }) => {
  if (pop === undefined) {
    return null;
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="reportOption" onClick={pop}>
      <p id="returnToMain">←</p>
    </div>
  );
};

type PushFn = (head: ProjectData[]) => void;
type PopFn = () => void;

const ReportChunk = ({
  projects,
  push,
  pop,
}: {
  projects: ProjectData[];
  push: PushFn;
  pop: PopFn | undefined;
}) => {
  const resizeDialog = (width: number, height: number) => {
    window.electron.ipcRenderer.sendMessage('resizeDialog', [
      { width, height },
    ]);
  };

  const sizeClass = useMemo(() => {
    if (projects?.length > 5 + (pop ? 0 : 1)) {
      resizeDialog(895, 637);
      return 'grid3x3';
    }
    if (projects?.length > 3 + (pop ? 0 : 1)) {
      resizeDialog(895, 437);
      return 'grid3x2';
    }
    if (projects?.length > 0) {
      resizeDialog(600, 437);
    }
    return 'grid2x2';
  }, [projects, pop]);

  return (
    <div id="reportTimePanel" className={sizeClass}>
      <ReturnBox pop={pop} />
      {projects.map((project) => (
        <ReportBox
          type={project.type}
          project={project.project}
          title={project.title}
          details={project.details}
          tags={project.tags}
          badge={project.badge}
          subtasks={project.subtasks}
          push={push}
          key={project.title}
        />
      ))}
    </div>
  );
};

const ReportContainer = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [stack, setStack] = useState<ProjectData[][]>([]);
  useEffect(() => {
    window.electron.ipcRenderer.on('getProjects', (args) =>
      setProjects(args as ProjectData[])
    );
    window.electron.ipcRenderer.sendMessage('getProjects', []);
  }, []);

  useEffect(() => {
    setStack([projects]);
  }, [projects]);

  const pop = () => {
    if (stack.length > 1) {
      const [, ...tail] = stack;
      setStack(tail);
    }
  };
  const push = (head: ProjectData[]) => {
    setStack([head, ...stack]);
  };

  if (projects.length === 0) {
    return null;
  }

  return (
    <ReportChunk
      projects={stack[0]}
      push={push}
      pop={stack.length > 1 ? pop : undefined}
    />
  );
};

export default ReportContainer;
