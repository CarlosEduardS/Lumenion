import { useEffect, useState } from 'react';
import './editor.css'
import SimpleLayout from '../../components/layout/simple-layout/simple-layout'

import Header from './sub-components/Header/Header'
import MainContent from './sub-components/MainContent/MainContent';
import Footer from './sub-components/Footer/Footer';
import LeftContent from './sub-components/LeftContent/LeftContent';
import RightContent from './sub-components/RightContent/RightContent';

import { type StoredProject, getProject } from '../../services/project-store';

type Props = {
  projectId?: string;
};

type ActiveGroup = 'terminal' | null;

export default function EditorPage({ projectId }: Props) {
  const [project, setProject] = useState<StoredProject | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeGroup, setActiveGroup] = useState<ActiveGroup>(null);

  const handleTradeGroup = (group: ActiveGroup) => {
    if (activeGroup === group) {
      setActiveGroup(null);
    } else {
      setActiveGroup(group);
    }
  };

  useEffect(() => {
    if (!projectId) {
      setNotFound(true);
      return;
    }

    const encontrado = getProject(Number(projectId));
    if (!encontrado) {
      setNotFound(true);
      return;
    }

    setProject(encontrado);
    setNotFound(false);
  }, [projectId]);

  if (notFound) {
    return (
      <div className="editor-not-found">
        <p>Não foi possível encontrar esse projeto. Ele pode ter sido apagado, ou o link está incorreto.</p>
      </div>
    );
  }

  if (!project) {
    return <div className="editor-loading">Carregando projeto...</div>;
  }

  return (
    <>
    <SimpleLayout
      HeaderContent={{ isVisible: true, content: <Header project={project} /> }}
      LeftContent={{ isVisible: true, content: <LeftContent project={project} /> }}
      RightContent={{ isVisible: true, content: <RightContent project={project} /> }}
      MainContent={{ isVisible: true, content: <MainContent project={project} /> }}
      FooterContent={{ isVisible: !!activeGroup, content: <Footer project={project} /> }}
    />
    <div className="footer-group-editor">
      <button onClick={() => handleTradeGroup('terminal')}>TERMINAL</button>
    </div>
    </>
  )
}