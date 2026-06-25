import { useState } from 'react';
import { useBridge } from '../../hooks/useBridge'; // Importando do arquivo original de hooks
import SimpleLayout from '../../components/layout/simple-layout/simple-layout';
import './home.css';
import ProjectCard from '../../components/project-card/project-card';

// Tipo para controlar qual aba está ativa (ou null se estiver fechada)
type ActiveGroup = 'files' | 'extension' | null;

export default function HomePage() {
  // Estado para gerenciar qual grupo está ativo na aba esquerda
  const [activeGroup, setActiveGroup] = useState<ActiveGroup>(null);
  
  // Extraindo os dois métodos de dentro do seu useBridge
  const { SelectLightFile, ExportLightFile } = useBridge();

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
        <h2>LUMENION</h2>
        <button>Configuracões</button>
        </>
      }
      LeftContent={
        /* O container detecta se há algum grupo ativo para disparar a transição do CSS */
        <div className={`left-sidebar-container ${activeGroup ? 'active' : ''}`}>
          {activeGroup === 'files' && (
            <div className="files_group animate-fade-in">
              <button onClick={handleExportProject}>Exportar</button>
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
            <button>Criar</button>
            <button onClick={handleImportarProjeto}>Importar</button>
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
  );
}