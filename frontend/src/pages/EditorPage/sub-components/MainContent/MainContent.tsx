import './MainContent.css'
import { type StoredProject } from '../../../../services/project-store';

type Props = {
    project: StoredProject;
};

export default function MainContent({ project }: Props) {
    return (
        <div>Main Content para o projeto {project.gameName} (id: {project.id})</div>
    )
}