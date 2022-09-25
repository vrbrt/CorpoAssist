import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
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

  const hasSubtasks = subtasks?.length > 0;

  const onClickHandler = () => {
    if (hasSubtasks) {
      push(subtasks, {
        type,
        project,
        title,
        details,
        badge,
        tags,
        subtasks,
      } as ProjectData);
    } else {
      sendReport();
    }
  };

  const onNewSubtaskHanlder = (event: MouseEvent) => {
    event.stopPropagation();
    push([], {
      type,
      project,
      title,
      details,
      badge,
      tags,
      subtasks,
    } as ProjectData);
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
          {!hasSubtasks && (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <span className="addSubTask" onClick={onNewSubtaskHanlder}>
              +
            </span>
          )}
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

const removeEmptyFields = (data: { [x: string]: any }) => {
  const filteredObject: { [x: string]: any } = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== '' && data[key] !== null) {
      filteredObject[key] = data[key];
    }
  });
  return filteredObject;
};

type Inputs = {
  title: string;
  type: string;
  project: string;
  details: string;
  tags: string;
};

const NewBox = ({ parent }: { parent: ProjectData | undefined }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>();

  useEffect(() => {
    if (parent !== undefined) {
      const { title, type, project, details, tags } = parent;
      reset({ title, type, project, details, tags: tags?.join(', ') ?? [] });
    }
  }, [parent, reset]);

  const sendReport = (data: Inputs) => {
    const { tags, ...rest } = removeEmptyFields(data);
    window.electron.ipcRenderer.sendMessage('reportTime', [
      {
        parent,
        ...rest,
        tags: tags?.split(',').map((str: string) => str.trim()),
      },
    ]);
  };

  const createPosition = (data: Inputs) => {
    const { tags, ...rest } = removeEmptyFields(data);
    window.electron.ipcRenderer.sendMessage('createTask', [
      {
        parent,
        ...rest,
        tags: tags?.split(',').map((str: string) => str.trim()) ?? [],
      },
    ]);
  };

  const onSubmit = (data: Inputs) => {
    createPosition(data);
    sendReport(data);
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <form onSubmit={handleSubmit(onSubmit)} className="reportOption">
      <div className="optionBadge">
        <span>New</span>
      </div>
      <div className="reportContainer">
        <input
          className="optionTitle"
          placeholder="Title"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...register('title')}
        />
        <input
          className="optionType"
          placeholder="Type"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...register('type')}
        />
        <input
          className="optionProject"
          placeholder="Project"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...register('project')}
        />
        <input
          className="optionDescription"
          placeholder="Description"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...register('details')}
        />
        <div className="optionFooter">
          <input
            type="text"
            placeholder="Comma separated tags"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...register('tags')}
          />
          <input
            type="submit"
            className="saveNewTask"
            value="Save and report"
          />
        </div>
      </div>
    </form>
  );
};

type PushFn = (head: ProjectData[], parent: ProjectData) => void;
type PopFn = () => void;

const ReportChunk = ({
  projects,
  push,
  pop,
  parent,
}: {
  projects: ProjectData[];
  push: PushFn;
  pop: PopFn | undefined;
  parent: ProjectData;
}) => {
  const resizeDialog = (width: number, height: number) => {
    window.electron.ipcRenderer.sendMessage('resizeDialog', [
      { width, height },
    ]);
  };

  const sizeClass = useMemo(() => {
    if (projects?.length > 7 + (pop ? 0 : 1)) {
      resizeDialog(1190, 637);
      return 'grid4x3';
    }
    if (projects?.length > 4 + (pop ? 0 : 1)) {
      resizeDialog(895, 637);
      return 'grid3x3';
    }
    if (projects?.length > 2 + (pop ? 0 : 1)) {
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
      <NewBox parent={parent} />
    </div>
  );
};

const ReportContainer = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [stack, setStack] = useState<ProjectData[][]>([]);
  const [parentStack, setParentStack] = useState<ProjectData[]>([]);
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
    if (parentStack.length > 0) {
      const [, ...tail] = parentStack;
      setParentStack(tail);
    }
  };
  const push = (head: ProjectData[], parent: ProjectData) => {
    setParentStack([parent, ...parentStack]);
    setStack([head, ...stack]);
  };

  if (projects.length === 0) {
    return null;
  }

  return (
    <ReportChunk
      projects={stack[0]}
      parent={parentStack[0]}
      push={push}
      pop={stack.length > 1 ? pop : undefined}
    />
  );
};

export default ReportContainer;
