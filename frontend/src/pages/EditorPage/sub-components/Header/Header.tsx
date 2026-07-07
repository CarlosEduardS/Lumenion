import './Header.css'
import * as FaIcons from 'react-icons/fa'
import { type StoredProject } from '../../../../services/project-store';
import { useState, useEffect, type ReactNode } from 'react';
import GeralItens from './mini-components/geral/geral';
import AmbienteItens from './mini-components/ambiente/ambiente';
import FisicaItens from './mini-components/fisica/fisica';
import AssetsItens from './mini-components/assets/assets';
import AudioItens from './mini-components/audio/audio';
import IluminacaoItens from './mini-components/iluminacao/iluminacao';
import CameraItens from './mini-components/camera/camera';
import ScriptItens from './mini-components/script/script';
import InputItens from './mini-components/input/input';
import RenderizacaoItens from './mini-components/renderizacao/renderizacao';

type PanelKey =
    | 'geral'
    | 'fisica'
    | 'ambiente'
    | 'iluminacao'
    | 'camera'
    | 'assets'
    | 'audio'
    | 'script'
    | 'input'
    | 'renderizacao';

type Props = {
    project: StoredProject;
};

// Painéis que só fazem sentido em 3D (skybox/iluminação de cena não se aplicam a 2D puro)
const PANELS_3D_ONLY: PanelKey[] = ['ambiente', 'iluminacao'];

export default function Header({ project }: Props) {
    const [activePanel, setActivePanel] = useState<PanelKey>('geral');
    const is3D = project.config.dimension === '3D';

    const panelComponents: Record<PanelKey, ReactNode> = {
        geral: <GeralItens dimension={project.config.dimension} />,
        fisica: <FisicaItens />,
        ambiente: <AmbienteItens />,
        iluminacao: <IluminacaoItens />,
        camera: <CameraItens />,
        assets: <AssetsItens />,
        audio: <AudioItens />,
        script: <ScriptItens scriptingMode={project.config.scriptingMode} />,
        input: <InputItens />,
        renderizacao: <RenderizacaoItens />,
    };

    // 🛡️ Se o projeto virar 2D enquanto um painel exclusivo de 3D estava aberto,
    // volta pra "Geral" em vez de deixar um painel escondido selecionado.
    useEffect(() => {
        if (!is3D && PANELS_3D_ONLY.includes(activePanel)) {
            setActivePanel('geral');
        }
    }, [is3D, activePanel]);

    return (
        <div className="header-component">
            <div className="body-buttons">
                <button onClick={() => setActivePanel('geral')}>
                    <FaIcons.FaHome size={24}/>
                    <h5>Geral</h5>
                </button>

                {/* Física existe tanto em 2D quanto em 3D (gravidade/colisão valem pros dois) */}
                <button onClick={() => setActivePanel('fisica')}>
                    <FaIcons.FaAtlas size={24}/>
                    <h5>Fisica</h5>
                </button>

                {/* Ambiente e Iluminação (skybox, luz de cena) só fazem sentido em 3D */}
                {is3D && (
                    <button onClick={() => setActivePanel('ambiente')}>
                        <FaIcons.FaCloudSun size={24}/>
                        <h5>Ambiente</h5>
                    </button>
                )}
                {is3D && (
                    <button onClick={() => setActivePanel('iluminacao')}>
                        <FaIcons.FaLightbulb size={24}/>
                        <h5>Iluminação</h5>
                    </button>
                )}

                <button onClick={() => setActivePanel('camera')}>
                    <FaIcons.FaVideo size={24}/>
                    <h5>Câmera</h5>
                </button>
                <button onClick={() => setActivePanel('assets')}>
                    <FaIcons.FaFolderOpen size={24}/>
                    <h5>Assets</h5>
                </button>
                <button onClick={() => setActivePanel('audio')}>
                    <FaIcons.FaVolumeUp size={24}/>
                    <h5>Áudio</h5>
                </button>
                <button onClick={() => setActivePanel('script')}>
                    <FaIcons.FaFileCode size={24}/>
                    <h5>Script</h5>
                </button>
                <button onClick={() => setActivePanel('input')}>
                    <FaIcons.FaGamepad size={24}/>
                    <h5>Input</h5>
                </button>
                <button onClick={() => setActivePanel('renderizacao')}>
                    <FaIcons.FaTv size={24}/>
                    <h5>Render</h5>
                </button>
            </div>
            <div className="hr"></div>
            <div className="body-itens">{panelComponents[activePanel]}</div>
        </div>
    )
}