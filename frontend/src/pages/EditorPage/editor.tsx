import './editor.css'
import SimpleLayout from '../../components/layout/simple-layout/simple-layout'

import Header from './sub-components/Header/Header'
import MainContent from './sub-components/MainContent/MainContent';
import Footer from './sub-components/Footer/Footer';
import LeftContent from './sub-components/LeftContent/LeftContent';
import RightContent from './sub-components/RightContent/RightContent';

import { type StoredProject } from '../../services/project-store';

export default function EditorPage( project : StoredProject) {
  return (
    <SimpleLayout
      HeaderContent={{ isVisible: true, content: Header(project) }}
      LeftContent={{ isVisible: true, content: LeftContent(project) }}
      RightContent={{ isVisible: true, content: RightContent(project) }}
      MainContent={{ isVisible: true, content: MainContent(project) }}
      FooterContent={{ isVisible: true, content: Footer(project) }}
    />
  )
}