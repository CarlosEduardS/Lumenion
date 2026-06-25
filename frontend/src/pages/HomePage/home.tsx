import { useBridge } from '../../hooks/useBridge';

import SimpleLayout from '../../components/layout/simple-layout/simple-layout'
import './home.css'

export default function HomePage() {
  const { importProject } = useBridge();

  const handleImport = async () => {
      const result = await importProject("C:/meu/projeto");
      console.log(result);
  };

  return (
    <SimpleLayout
      HeaderContent={
        <>
          <div className="button-group">
            <button>Arquivos</button>
            <button>Alguma</button>
            <button>Coisa</button>
          </div>
          <h2>Lumenion</h2>
          <button className='right-button'>Configuracões</button>
        </>
      }
      LeftContent={
        <button onClick={handleImport}>Importar</button>
      }
      MainContent={
        <div className="home-main">
          <h1>Bem-vindo ao Lumenion</h1>
          <p>Este é o conteúdo principal da sua página.</p>
        </div>
      }
      RightContent={
        <div className="home-right">
          <p>Painel Lateral Direito</p>
          <span>Notificações ou Info adicionais</span>
        </div>
      }
      FooterContent={
        <div className="home-footer">
          <p>Terminal</p>
        </div>
      }
    />
  )
}