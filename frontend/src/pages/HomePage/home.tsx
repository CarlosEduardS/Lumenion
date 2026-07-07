import { useState, useEffect } from 'react';
import { useBridge } from '../../hooks/useBridge';
import SimpleLayout from '../../components/layout/simple-layout/simple-layout';
import WindowCard from '../../components/window-card/window-card';
import './home.css';

import ConvertToFile, { type ProjectTemplate } from '../../services/convert-light-file';
import { parseLightFile } from '../../services/decompress-light-file';
import {
  type StoredProject,
  type ProjectConfig,
  defaultProjectConfig,
  saveProject,
  getAllProjects,
} from '../../services/project-store';

import LeftBar from './sub-components/LeftBar/LeftBar';
import MainContent from './sub-components/MainContent/MainContent';
import CreateWindow from './sub-components/CreateWindows/CreateWindow';

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

  const { SelectLightFile, ExportLightFile, CriarPastaDoProjeto } = useBridge();

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

  const handleSaveProject = async () => {
    if (!InputGameName.trim()) {
      alert("Por favor, digite o nome do projeto!");
      return;
    }

    const isNovoProjeto = editingProjectId === null;
    const id = editingProjectId ?? Date.now();

    // 📁 A pasta base só é criada UMA vez, no momento da criação — editar um
    // projeto existente não deve gerar (ou mover) pasta nenhuma.
    let folderPath: string | undefined;
    if (isNovoProjeto) {
      try {
        folderPath = await CriarPastaDoProjeto(InputGameName, config.scriptingMode);
        console.log(`📁 Pasta do projeto criada em: ${folderPath}`);
      } catch (error) {
        // Falha ao criar a pasta não deve impedir salvar o projeto — só avisa.
        console.error('Não foi possível criar a pasta base do projeto:', error);
        alert('O projeto foi salvo, mas não foi possível criar a pasta no disco. Veja o console para detalhes.');
      }
    }

    const projetoSalvo = saveProject({
      id,
      image: selectedImage || "assets/pngs/image-static.png",
      gameName: InputGameName,
      gameInfo: InputInfo || "Sem informações adicionais",
      config,
      createdAt: Date.now(), // saveProject preserva o createdAt original se o id já existir
      ...(folderPath ? { folderPath } : {}),
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
      HeaderContent={{ isVisible: true, content: (
        <>
        <div className="home-button-group">
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
        <button id="config-button-home">Configuracões</button>
        </>
      ) }}
      LeftContent={{ isVisible: !!activeGroup, content: (
        <LeftBar
          activeGroup={activeGroup}
          handleImportarProjeto={handleImportarProjeto}
        />
      ) }}
      MainContent={{ isVisible: true, content: (
        <MainContent
          projectsList={projectsList}
          handleOpenCreateWindow={handleOpenCreateWindow}
          handleOpenEditWindow={handleOpenEditWindow}
          handleExportProject={handleExportProject}
          handleOpenProject={handleOpenProject}
        />
      ) }}
      RightContent={{ isVisible: false, content: (<></>)}}
      FooterContent={{ isVisible: false, content: (<></>) }}
    />
    {getWindow && (
      <WindowCard
        HTML={
          <CreateWindow
            editingProjectId={editingProjectId}
            selectedImage={selectedImage}
            InputGameName={InputGameName}
            InputInfo={InputInfo}
            config={config}
            toggleWindow={toggleWindow}
            handleImageChange={handleImageChange}
            updateConfig={updateConfig}
            handleSaveProject={handleSaveProject}
            setInputGameName={setInputGameName}
            setInputInfo={setInputInfo}
          />
        }
      />
    )}
    </>
  );
}