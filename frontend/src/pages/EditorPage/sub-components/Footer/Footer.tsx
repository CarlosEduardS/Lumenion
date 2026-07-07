import './Footer.css'
import * as FaIcons from 'react-icons/fa'

import { type StoredProject } from '../../../../services/project-store';

type Props = {
    project: StoredProject;
};

export default function Footer({ project: _project }: Props) {
    return (
        <div className="footer">
            <FaIcons.FaTerminal /> Terminal
        </div>
    )
}