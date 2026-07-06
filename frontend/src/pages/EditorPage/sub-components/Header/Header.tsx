import './Header.css'
import * as FaIcons from 'react-icons/fa'

import { type StoredProject } from '../../../../services/project-store';
import { useState, type ReactNode } from 'react';
import GeralItens from './mini-components/geral/geral';
import AmbienteItens from './mini-components/ambiente/ambiente';
import FisicaItens from './mini-components/fisica/fisica';

type PanelKey = 'geral' | 'ambiente' | 'fisica';

const panelComponents: Record<PanelKey, ReactNode> = {
    geral: <GeralItens />,
    ambiente: <AmbienteItens />,
    fisica: <FisicaItens />,
};

export default function Header(_project: StoredProject) {
    const [activePanel, setActivePanel] = useState<PanelKey>('geral');

    return (
        <div className="header-component">
            <div className="body-buttons">
                <button onClick={() => setActivePanel('geral')}>
                    <FaIcons.FaHome size={24}/>
                    <h5>Geral</h5>
                </button>
                <button onClick={() => setActivePanel('ambiente')}>
                    <FaIcons.FaCloudSun size={24}/>
                    <h5>Ambiente</h5>
                </button>
                <button onClick={() => setActivePanel('fisica')}>
                    <FaIcons.FaAtlas size={24}/>
                    <h5>Fisica</h5>
                </button>
            </div>
            <div className="hr"></div>
            <div className="body-itens">{panelComponents[activePanel]}</div>
        </div>
    )
}