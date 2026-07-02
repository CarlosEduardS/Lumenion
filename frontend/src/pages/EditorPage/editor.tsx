import './editor.css'
import SimpleLayout from '../../components/layout/simple-layout/simple-layout'

interface EditorPageProps {
  projectId?: string;
}

export default function EditorPage({ projectId }: EditorPageProps) {
  return (
    <>
      <SimpleLayout
        HeaderContent={<div>Header</div>}
        LeftContent={<div>Left Sidebar</div>}
        RightContent={<div>Right Sidebar</div>}
        MainContent={<div>Main Content para o projeto {projectId ?? 'sem id'}</div>}
        FooterContent={<div>Footer</div>}
      />
    </>
  )
}