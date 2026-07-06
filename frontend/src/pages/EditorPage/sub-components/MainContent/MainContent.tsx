import './MainContent.css'
import { type StoredProject } from '../../../../services/project-store';

export default function MainContent( project: StoredProject) {
    return (
        <div>Main Content para o projeto {project.id ?? 'sem id'}</div>
    )
}