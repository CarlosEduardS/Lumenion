import ProjectCard from '../../../../components/project-card/project-card';
import './MainContent.css';
import { type StoredProject } from '../../../../services/project-store';

type Props = {
  projectsList: StoredProject[];
  handleOpenCreateWindow: () => void;
  handleOpenEditWindow: (p: StoredProject) => void;
  handleExportProject: (p: StoredProject) => Promise<void> | void;
  handleOpenProject: (p: StoredProject) => void;
};

export default function MainContent({ projectsList, handleOpenCreateWindow, handleOpenEditWindow, handleExportProject, handleOpenProject }: Props) {
  return (
    <div className="home-main">
      <div className="main-buttons">
        <button onClick={handleOpenCreateWindow}>Criar</button>
      </div>
      <div className="projects">
        {projectsList.map((project) => (
          <ProjectCard
            key={project.id}
            HTML={
              <>
                <img src={project.image} width={80} style={{ borderRadius: '6px', objectFit: 'cover' }} />
                <h4>{project.gameName}</h4>
                <p>{project.gameInfo}</p>
                <span className="project-meta">
                  {project.config.dimension} · {project.config.scriptingMode === 'csharp' ? 'C#' : 'Lumen Script'} · {project.config.resolutionWidth}x{project.config.resolutionHeight}
                </span>
                <div className="buttons">
                  <button onClick={() => handleOpenProject(project)}>Abrir Projeto</button>
                  <button onClick={() => handleOpenEditWindow(project)}>Editar Configuracões</button>
                  <button onClick={() => handleExportProject(project)}>Exportar Projeto</button>
                </div>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}
