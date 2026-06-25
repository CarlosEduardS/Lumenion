import { useState } from 'react';
import { IoCloseCircle } from 'react-icons/io5';
import { useBridge } from '../../hooks/useBridge'; 
import SimpleLayout from '../../components/layout/simple-layout/simple-layout';
import ProjectCard from '../../components/project-card/project-card';
import WindowCard from '../../components/window-card/window-card';
import './home.css';


type ActiveGroup = 'files' | 'extension' | null;

export default function HomePage() {
  // Estado para gerenciar qual grupo está ativo na aba esquerda
  const [activeGroup, setActiveGroup] = useState<ActiveGroup>(null);
  const [getWindow, setGetWindow] = useState<boolean>(false);
  
  // Extraindo os dois métodos de dentro do seu useBridge
  const { SelectLightFile, ExportLightFile } = useBridge();
  
  const toggleWindow = () => {
    setGetWindow(!getWindow);
  };

  // Função para alternar as abas. Se clicar no botão que já está aberto, ele fecha.
  const handleTradeGroup = (group: ActiveGroup) => {
    if (activeGroup === group) {
      setActiveGroup(null); // Fecha o painel lateral
    } else {
      setActiveGroup(group); // Abre o painel correspondente
    }
  };

  const handleImportarProjeto = async () => {
    const resultado = await SelectLightFile();
    console.log(resultado); 
  };

  const handleExportProject = async (project: any) => {
    const resultado = await ExportLightFile(project);
    console.log(resultado);
  };

  return (
    <>
    <SimpleLayout
      HeaderContent={
        <>
        <div className="button-group">
          <button 
            className={activeGroup === 'files' ? 'active-tab' : ''} 
            onClick={() => handleTradeGroup('files')}
          >
            Arquivos
          </button>
          <button 
            className={activeGroup === 'extension' ? 'active-tab' : ''} 
            onClick={() => handleTradeGroup('extension')}
          >
            Extensões
          </button>
        </div>
        <h2 className='title'>LUMENION</h2>
        <button>Configuracões</button>
        </>
      }
      LeftContent={
        /* O container detecta se há algum grupo ativo para disparar a transição do CSS */
        <div className={`left-sidebar-container ${activeGroup ? 'active' : ''}`}>
          {activeGroup === 'files' && (
            <div className="files_group animate-fade-in">
              <button onClick={handleImportarProjeto}>Importar</button>
            </div>
          )}
          {activeGroup === 'extension' && (
            <div className="extension_group animate-fade-in">
              <input type="search" placeholder='Nome da extensão'/>
              <button>Gerenciar</button>
            </div>
          )}
        </div>
      }
      MainContent={
        <div className="home-main">
          <div className="main-buttons">
            <button onClick={toggleWindow}>Criar</button>
            <button onClick={handleExportProject}>Exportar</button>
          </div>
          <div className="projects">
            <ProjectCard
              HTML={
                <>
                  <img src="" alt="Capa do Projeto" />
                  <h4>Nome do projeto</h4>
                  <p>Informacoes do projeto</p>
                  <div className="buttons">
                    <button>Editar</button>
                    <button>Configurar</button>
                  </div>
                </>
              }
            />
          </div>
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
    {getWindow && (
      <WindowCard
        HTML={
          <>
          <header>
            <h2>Criar um novo jogo</h2>
            <button onClick={toggleWindow} className='close-button'><IoCloseCircle size={30} color="#c6c6c6" /></button>
          </header>
          <div className="window-body">
            <div className="primery-place">
              <video src="assets/gifs/image-.gif" width={40}></video>
              <input type="text" placeholder='Qual vai ser o nome do projeto?' />
            </div>
            <button>hsadhgauh</button>
          </div>
          </>
        }
      />
    )}
    </>
  );
}