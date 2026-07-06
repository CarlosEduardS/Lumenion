import './Footer.css'
import * as FaIcons from 'react-icons/fa'

import { type StoredProject } from '../../../../services/project-store';

export default function Footer(project : StoredProject) {
    return (
        <div className="footer">
            <FaIcons.FaTerminal /> Terminal
        </div>
    )
}