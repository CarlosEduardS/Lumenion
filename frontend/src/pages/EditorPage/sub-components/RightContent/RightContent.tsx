import './RightContent.css'
import { type StoredProject } from '../../../../services/project-store';

type Props = {
    project: StoredProject;
};

export default function RightContent({ project: _project }: Props) {
    return (
        <div className="right-main">

        </div>
    )
}