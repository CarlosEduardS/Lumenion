import { useState, useEffect } from 'react';
import { IoCloseCircle } from 'react-icons/io5';
import { useBridge } from '../../hooks/useBridge';
import SimpleLayout from '../../components/layout/simple-layout/simple-layout';
import ProjectCard from '../../components/project-card/project-card';
import WindowCard from '../../components/window-card/window-card';
import './home.css';

import ConvertToFile, { type ProjectTemplate } from '../../services/convert-light-file';
import { parseLightFile } from '../../services/decompress-light-file';
import {
  type StoredProject,
  type ProjectConfig,
  type ProjectDimension,
  type ScriptingMode,
  defaultProjectConfig,
  saveProject,
  getAllProjects,
} from '../../services/project-store';

type ActiveGroup = 'files' | 'extension' | null;

/**
 * Reconstrói o ProjectConfig a partir das strings "chave=valor" salvas em
 * configProje/configGame (mesmo formato escrito em handleExportProject).
 * Qualquer campo ausente ou malformado cai no valor padrão — config é
 * cosmético, então aqui vale a pena ser tolerante em vez de lançar erro
 * (diferente do parser binário estrutural, que precisa ser estrito).
 */
function configFromProject(project: ProjectTemplate): ProjectConfig {
  const defaults = defaultProjectConfig();
  const flatConfigs = [...project.configProje, ...project.configGame]
    .flatMap((entry) => entry.configs);

  const readValue = (key: string): string | undefined =>
    flatConfigs.find((c) => c.startsWith(`${key}=`))?.split('=')[1];

  const resolution = readValue('resolution');
  const [resolutionWidth, resolutionHeight] = resolution
    ? resolution.split('x').map(Number)
    : [defaults.resolutionWidth, defaults.resolutionHeight];

  const dimension = readValue('dimension');
  const scriptingMode = readValue('scriptingMode');

  return {
    dimension: dimension === '2D' || dimension === '3D' ? dimension : defaults.dimension,
    scriptingMode: scriptingMode === 'csharp' || scriptingMode === 'lumen' ? scriptingMode : defaults.scriptingMode,
    resolutionWidth: Number.isFinite(resolutionWidth) ? resolutionWidth : defaults.resolutionWidth,
    resolutionHeight: Number.isFinite(resolutionHeight) ? resolutionHeight : defaults.resolutionHeight,
    vsync: readValue('vsync') === 'true',
    gravity: Number(readValue('gravity') ?? defaults.gravity),
    debugMode: readValue('debugMode') === 'true',
  };
}

export default function HomePage() {
  const [activeGroup, setActiveGroup] = useState<ActiveGroup>(null);
  const [getWindow, setGetWindow] = useState<boolean>(false);

  // ⚡ null = criando um projeto novo. Número = editando o projeto daquele id.
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);

  // ⚡ Estados do formulário de criação/edição
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [InputGameName, setInputGameName] = useState<string>('');
  const [InputInfo, setInputInfo] = useState<string>('');
  const [config, setConfig] = useState<ProjectConfig>(defaultProjectConfig());

  // ⚡ Lista de projetos, carregada do storage (persistente por id)
  const [projectsList, setProjectsList] = useState<StoredProject[]>([]);

  const { SelectLightFile, ExportLightFile } = useBridge();

  // 📥 Carrega os projetos já salvos assim que a Home monta
  useEffect(() => {
    setProjectsList(getAllProjects());
  }, []);

  const resetForm = () => {
    setSelectedImage(null);
    setInputGameName('');
    setInputInfo('');
    setConfig(defaultProjectConfig());
    setEditingProjectId(null);
  };

  const toggleWindow = () => {
    const nextState = !getWindow;
    setGetWindow(nextState);
    if (!nextState) {
      resetForm();
    }
  };

  const handleTradeGroup = (group: ActiveGroup) => {
    if (activeGroup === group) {
      setActiveGroup(null);
    } else {
      setActiveGroup(group);
    }
  };

  const handleOpenCreateWindow = () => {
    resetForm();
    setGetWindow(true);
  };

  const handleOpenEditWindow = (project: StoredProject) => {
    setEditingProjectId(project.id);
    setSelectedImage(project.image === 'assets/pngs/image-static.png' ? null : project.image);
    setInputGameName(project.gameName);
    setInputInfo(project.gameInfo);
    setConfig(project.config);
    setGetWindow(true);
  };

  const handleImportarProjeto = async () => {
    try {
      // 1. Chama o C# que abre o Explorer e lê os BYTES do arquivo .light
      const bytesDoArquivo = await SelectLightFile();

      if (bytesDoArquivo === null) {
        console.log('Importação cancelada pelo usuário.');
        return;
      }

      console.log(`Arquivo .light importado (${bytesDoArquivo.byteLength} bytes)! Decodificando...`);

      // 2. Descompacta os bytes de volta pro projeto inteiro (header + configs + metadata + scripts)
      const projetoDecodificado = parseLightFile(bytesDoArquivo);

      // 3. Persiste no storage, agora restaurando a config REAL do arquivo
      // (antes, o formato de texto antigo não guardava configProje/configGame
      // de forma recuperável, então todo import caía na config padrão)
      const projetoImportado = saveProject({
        id: projetoDecodificado.ProjectID,
        image: projetoDecodificado.ImgUrl || 'assets/pngs/image-static.png',
        gameName: projetoDecodificado.name,
        gameInfo: projetoDecodificado.info,
        config: configFromProject(projetoDecodificado),
        createdAt: Date.now(),
      });

      console.group('🔓 PROJETO DESCOMPACTADO COM SUCESSO!');
      console.log('ID do Projeto:', projetoImportado.id);
      console.log('Nome:', projetoImportado.gameName);
      console.log('Scripts restaurados:', projetoDecodificado.scripts.map((s) => s.path));
      console.groupEnd();

      setProjectsList((listaAtual) => [projetoImportado, ...listaAtual.filter((p) => p.id !== projetoImportado.id)]);

    } catch (error) {
      console.error('Erro ao processar a importação do arquivo:', error);
      alert('Não foi possível importar esse arquivo .light — veja o console para detalhes.');
    }
  };

  const handleExportProject = async (project: StoredProject) => {
    console.group(`🎯 [HOME EXPORT TRIGGER] Iniciando processo de exportação na UI`);
    console.log("📥 Dados do projeto clicado recebidos da lista:", project);

    try {
      const { config } = project;

      const dadosDoProjeto: ProjectTemplate = {
        ProjectID: project.id,
        ImgUrl: project.image,
        name: project.gameName,
        info: project.gameInfo,
        configProje: [
          {
            IDdirect: project.id,
            pathNavigate: "root/project",
            configs: [
              `resolution=${config.resolutionWidth}x${config.resolutionHeight}`,
              `vsync=${config.vsync}`,
            ],
          }
        ],
        configGame: [
          {
            IDdirect: project.id,
            pathNavigate: "root/game",
            configs: [
              `gravity=${config.gravity}`,
              `debugMode=${config.debugMode}`,
              `dimension=${config.dimension}`,
              `scriptingMode=${config.scriptingMode}`,
            ],
          }
        ],
        // 📝 Ainda não existe editor de scripts (Fase 1/2 do roadmap), então o
        // conteúdo abaixo permanece um placeholder de exemplo até essa parte existir.
        scripts: [
          {
            IDdirect: project.id,
            path: config.scriptingMode === 'csharp' ? "src/Main.cs" : "src/main.lum",
            script:
            "class Player {\n\tint id\n\tstring name\n\tfloat speed\n\tbool isActive\n\n\tfunction start() {\n\t\tif (true) {\n\t\t\treturn true\n\t\t} else {\n\t\t\treturn false\n\t\t}\n\t}\n}"
          }
        ],
        metaData: {
          version: "1.0.0",
          lastModified: project.updatedAt,
          author: "Developer",
          targetPlatform: "desktop"
        }
      };

      console.log("🧱 Objeto estruturado do mapa Lumenion pronto para compactação:", dadosDoProjeto);

      // Executa a compressão binária real (Uint8Array, não mais texto)
      const arquivoGerado = ConvertToFile(dadosDoProjeto);

      console.group("📄 Detalhes do arquivo .light gerado na memória do React");
      console.log(`📌 Nome do Arquivo: ${arquivoGerado.fileName}`);
      console.log(`📌 Tamanho real do arquivo binário: ${arquivoGerado.content.byteLength} bytes`);
      console.groupEnd();

      console.log("🚀 Despachando bytes via Bridge IPC para o C#...");
      const resultadoBridge = await ExportLightFile(arquivoGerado.fileName, arquivoGerado.content);

      console.log("✅ Resposta de Sucesso da Bridge C#:", resultadoBridge);

    } catch (error) {
      console.error("❌ Falha crítica ao exportar o arquivo do projeto:", error);
      alert('Não foi possível exportar esse projeto — veja o console para detalhes.');
    } finally {
      console.groupEnd();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const updateConfig = <K extends keyof ProjectConfig>(key: K, value: ProjectConfig[K]) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const handleSaveProject = () => {
    if (!InputGameName.trim()) {
      alert("Por favor, digite o nome do projeto!");
      return;
    }

    const id = editingProjectId ?? Date.now();

    const projetoSalvo = saveProject({
      id,
      image: selectedImage || "assets/pngs/image-static.png",
      gameName: InputGameName,
      gameInfo: InputInfo || "Sem informações adicionais",
      config,
      createdAt: Date.now(), // saveProject preserva o createdAt original se o id já existir
    });

    setProjectsList((listaAtual) => {
      const semEsse = listaAtual.filter((p) => p.id !== id);
      return [projetoSalvo, ...semEsse];
    });

    toggleWindow();
  };

  const handleOpenProject = (project: StoredProject) => {
    const nextUrl = `/editor/${project.id}`;
    window.history.pushState({}, '', nextUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
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
            <button onClick={handleOpenCreateWindow}>Criar</button>
          </div>
          <div className="projects">
            {projectsList.map((project) => (
              <ProjectCard
              key={project.id}
              HTML={
                <>
                  <img src={project.image} width={80} style={{ borderRadius: '6px', objectFit: 'cover' }} />
                  <h4>{project.gameName}</h4>
                  <p>{project.gameInfo}</p>
                  <span className="project-meta">
                    {project.config.dimension} · {project.config.scriptingMode === 'csharp' ? 'C#' : 'Lumen Script'} · {project.config.resolutionWidth}x{project.config.resolutionHeight}
                  </span>
                  <div className="buttons">
                    <button onClick={() => handleOpenProject(project)}>Abrir Projeto</button>
                    <button onClick={() => handleOpenEditWindow(project)}>Editar Configuracões</button>
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
            <h2>{editingProjectId ? 'Editar projeto' : 'Criar um novo jogo'}</h2>
            <button onClick={toggleWindow} className='close-button'><IoCloseCircle size={30} color="#c6c6c6" /></button>
          </header>
          <div className="window-body">
            <div className="primery-place">
              <img src={selectedImage ? selectedImage : "assets/pngs/image-static.png"} width={120} height={120}/>
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
            <hr/>

            <div className="base-configs">
              <div className="config-section">
                <span className="config-label">Dimensão</span>
                <div className="game-dimension-button">
                  <button
                    type="button"
                    className={config.dimension === '3D' ? 'selected' : ''}
                    onClick={() => updateConfig('dimension', '3D' as ProjectDimension)}
                  >
                    <img src="/assets/pngs/3d.png" width={100}/>
                  </button>
                  <button
                    type="button"
                    className={config.dimension === '2D' ? 'selected' : ''}
                    onClick={() => updateConfig('dimension', '2D' as ProjectDimension)}
                  >
                    <img src="/assets/pngs/2d.png" width={100}/>
                  </button>
                </div>
              </div>

              <div className="config-section">
                <span className="config-label">Como você quer programar?</span>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-button ${config.scriptingMode === 'csharp' ? 'selected' : ''}`}
                    onClick={() => updateConfig('scriptingMode', 'csharp' as ScriptingMode)}
                  >
                    C# Direto
                  </button>
                  <button
                    type="button"
                    className={`toggle-button ${config.scriptingMode === 'lumen' ? 'selected' : ''}`}
                    onClick={() => updateConfig('scriptingMode', 'lumen' as ScriptingMode)}
                  >
                    Lumen Script
                  </button>
                </div>
                <span className="config-hint">
                  {config.scriptingMode === 'csharp'
                    ? 'Acesso total à engine, sem abstração — para quem já manja C#.'
                    : 'Linguagem simplificada, feita para aprender mais rápido.'}
                </span>
              </div>

              <div className="config-section">
                <span className="config-label">Resolução</span>
                <div className="config-row">
                  <input
                    type="number"
                    min={1}
                    value={config.resolutionWidth}
                    onChange={(e) => updateConfig('resolutionWidth', Number(e.target.value))}
                  />
                  <span className="config-separator">×</span>
                  <input
                    type="number"
                    min={1}
                    value={config.resolutionHeight}
                    onChange={(e) => updateConfig('resolutionHeight', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="config-section">
                <span className="config-label">Gravidade</span>
                <input
                  type="number"
                  step="0.1"
                  value={config.gravity}
                  onChange={(e) => updateConfig('gravity', Number(e.target.value))}
                />
              </div>

              <div className="config-section checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    checked={config.vsync}
                    onChange={(e) => updateConfig('vsync', e.target.checked)}
                  />
                  VSync
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={config.debugMode}
                    onChange={(e) => updateConfig('debugMode', e.target.checked)}
                  />
                  Debug Mode
                </label>
              </div>
            </div>

            <button onClick={handleSaveProject}>
              {editingProjectId ? 'Salvar Alterações' : 'Criar Projeto'}
            </button>
          </div>
          </>
        }
      />
    )}
    </>
  );
}