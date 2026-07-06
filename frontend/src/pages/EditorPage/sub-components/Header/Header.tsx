import './Header.css'
import * as FaIcons from 'react-icons/fa'

import { type StoredProject } from '../../../../services/project-store';

export default function Header(project : StoredProject) {
    return (
        <div className="header-component">
            <div className="body-buttons">
                <button><FaIcons.FaHome size={24}/><h5>Geral</h5></button>
                <button><FaIcons.FaCloudSun size={24}/><h5>Ambiente</h5></button>
                <button><FaIcons.FaAtlas size={24}/><h5>Fisica</h5></button>
            </div>
            <div className="body-itens"></div>
        </div>
    )
}