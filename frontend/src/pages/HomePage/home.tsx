import { useState } from 'react';
import { IoCloseCircle } from 'react-icons/io5';
import { useBridge } from '../../hooks/useBridge'; 
import SimpleLayout from '../../components/layout/simple-layout/simple-layout';
import ProjectCard from '../../components/project-card/project-card';
import WindowCard from '../../components/window-card/window-card';
import './home.css';

import ConvertToFile, { type ProjectTemplate } from '../../services/convert-light-file';
import { parseLightFile } from '../../services/decompress-light-file';

type ActiveGroup = 'files' | 'extension' | null;

// 💡 Definição do formato que cada projeto criado terá
interface Project {
  id: number;
  image: string;
  projectName: string;
  gameName: string;
}

export default function HomePage() {
  const [activeGroup, setActiveGroup] = useState<ActiveGroup>(null);
  const [getWindow, setGetWindow] = useState<boolean>(false);
  
  // ⚡ Estados para armazenar os dados atuais do formulário de criação
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [InputGameName, setInputGameName] = useState<string>('');
  const [InputInfo, setInputInfo] = useState<string>('');

  // ⚡ Estado que guarda a lista de todos os projetos que você criou
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  
  const { SelectLightFile, ExportLightFile } = useBridge();
  
  const toggleWindow = () => {
    setGetWindow(!getWindow);
    if (getWindow) {
      // Limpa os campos ao fechar a janela
      setSelectedImage(null);
      setInputGameName('');
      setInputInfo('');
    }
  };

  const handleTradeGroup = (group: ActiveGroup) => {
    if (activeGroup === group) {
      setActiveGroup(null);
    } else {
      setActiveGroup(group);
    }
  };

  const handleImportarProjeto = async () => {
    try {
      // 1. Chama o C# que abre o Explorer e lê o arquivo .light
      const resultadoBruto = await SelectLightFile();
      
      // Se o usuário fechou o explorer ou deu erro
      if (resultadoBruto === "Cancelado" || resultadoBruto.startsWith("Erro:")) {
        console.log("Importação interrompida ou falhou:", resultadoBruto);
        return;
      }

      console.log("Arquivo .light importado com sucesso! Iniciando parse...");

      // 2. Roda o descompressor reverso na string bruta do arquivo
      const dadosExtraidos = parseLightFile(resultadoBruto);

      // 3. Monta o objeto do projeto no formato que o seu card espera
      const projetoImportado: Project = {
        id: dadosExtraidos.id,
        image: "assets/pngs/image-static.png", // Imagem padrão (ou você pode mapear no futuro)
        projectName: dadosExtraidos.name,
        gameName: dadosExtraidos.info
      };

      // ==========================================
      // 🔬 ÁREA DE TESTE: VEJA O CÓDIGO FONTE RESTAURADO
      // ==========================================
      console.group("🔓 PROJETO DESCOMPACTADO COM SUCESSO!");
      console.log("ID do Projeto:", dadosExtraidos.id);
      console.log("Nome:", dadosExtraidos.name);
      console.log("Script Original Restaurado:\n", dadosExtraidos.rawScript);
      console.groupEnd();
      // ==========================================

      // 4. Adiciona o novo card na lista do estado do React
      setProjectsList((listaAtual) => [...listaAtual, projetoImportado]);

    } catch (error) {
      console.error("Erro ao processar a importação do arquivo:", error);
    }
  };

  const handleExportProject = async (project: Project) => {
    try {
      // console.log("Iniciando exportação do projeto:", project.projectName);

      const dadosDoProjeto: ProjectTemplate = {
        ProjectID: project.id,
        ImgUrl: project.image,
        name: project.projectName,
        info: project.gameName,
        configProje: [
          { IDdirect: project.id, pathNavigate: "root/project", configs: ["resolution=1920x1080", "vsync=true"] }
        ],
        configGame: [
          { IDdirect: project.id, pathNavigate: "root/game", configs: ["gravity=9.8", "debugMode=false"] }
        ],
        scripts: [
          { 
            IDdirect: project.id, 
            path: "src/main.as", 
            script: 
            "class Player {\n\tint id\n\tstring name\n\tfloat speed\n\tbool isActive\n\tList inventory\n\n\tfunction start() {\n\t\tif (true) {\n\t\t\tinput = 'Lumenion'\n\t\t} else if (false) {\n\t\t\tinput = null\n\t\t} else {\n\t\t\tinput = 'Empty'\n\t\t}\n\n\t\twhile (isActive) {\n\t\t\tfor (int i = 0; i < 10; i++) {\n\t\t\t\tswitch (case) {\n\t\t\t\t\treturn true\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}"
          }
        ],
        metaData: {
          version: "1.0.0",
          lastModified: Date.now(),
          author: "Developer",
          targetPlatform: "desktop"
        }
      };

      // Executa a conversão
      const arquivoGerado = ConvertToFile(dadosDoProjeto);

      // ==========================================
      // 🧪 ÁREA DE TESTE: VEJA NO CONSOLE DO NAVEGADOR
      // ==========================================
      // console.group("🔬 INSPEÇÃO DO ARQUIVO .LIGHT");
      // console.log("Nome do Arquivo final:", arquivoGerado.fileName);
      // console.log("Conteúdo Compactado Bruto:\n", arquivoGerado.content);
      // console.groupEnd();
      // ==========================================

      // Executa a ponte do IPC (useBridge)
      const resultadoBridge = await ExportLightFile({
        name: arquivoGerado.fileName,
        content: arquivoGerado.content
      });
      console.log("Resposta da Bridge:", resultadoBridge);

    } catch (error) {
      console.error("Falha ao exportar o arquivo do projeto:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  // ⚡ Função disparada ao clicar no botão "Criar Projeto"
  const handleCreateProject = () => {
    // Evita criar projetos sem nome
    if (!InputGameName.trim()) {
      alert("Por favor, digite o nome do projeto!");
      return;
    }

    const novoProjeto: Project = {
      id: Date.now(), // Gera um ID único simples usando o timestamp
      image: selectedImage || "assets/pngs/image-static.png", // Imagem padrão caso não escolha nenhuma
      projectName: InputGameName,
      gameName: InputInfo || "Sem informações adicionais"
    };

    // Adiciona o novo projeto na lista existente
    setProjectsList([...projectsList, novoProjeto]);

    // Fecha a janela e limpa os campos
    toggleWindow();
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
          </div>
          <div className="projects">
            {projectsList.map((project) => (
              <ProjectCard
              key={project.id}
              HTML={
                <>
                  <img src={project.image} width={80} style={{ borderRadius: '6px', objectFit: 'cover' }} />
                  <h4>{project.projectName}</h4>
                  <p>{project.gameName}</p>
                  <div className="buttons">
                    <button>Abrir Projeto</button>
                    <button>Editar Configuracões</button>
                    <button onClick={() => handleExportProject(project)}>Exportar Projeto</button>
                  </div>
                </>
                }
              />
            ))}
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
              <img src={selectedImage ? selectedImage : "assets/pngs/image-static.png"} width={120}/>
              <div className="main-inputs">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
                <input 
                  type="text" 
                  placeholder='Qual vai ser o nome do jogo?' 
                  value={InputGameName}
                  onChange={(e) => setInputGameName(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder='Fale um pouco mais sobre esse jogo' 
                  value={InputInfo}
                  onChange={(e) => setInputInfo(e.target.value)}
                />
              </div>
            </div>
            {/* ⚡ Vincula a função ao botão do modal */}
            <button onClick={handleCreateProject}>Criar Projeto</button>
          </div>
          </>
        }
      />
    )}
    </>
  );
}