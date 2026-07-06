import React from 'react';
import { IoCloseCircle } from 'react-icons/io5';
import { type ProjectConfig, type ProjectDimension, type ScriptingMode } from '../../../../services/project-store';
import './CreateWindow.css';

type Props = {
  editingProjectId: number | null;
  selectedImage: string | null;
  InputGameName: string;
  InputInfo: string;
  config: ProjectConfig;
  toggleWindow: () => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateConfig: <K extends keyof ProjectConfig>(key: K, value: ProjectConfig[K]) => void;
  handleSaveProject: () => void;
  setInputGameName: (s: string) => void;
  setInputInfo: (s: string) => void;
};

export default function CreateWindow(props: Props) {
  const { editingProjectId, selectedImage, InputGameName, InputInfo, config, toggleWindow, handleImageChange, updateConfig, handleSaveProject } = props;

  return (
    <>
      <header>
        <h2>{editingProjectId ? 'Editar projeto' : 'Criar um novo jogo'}</h2>
        <button onClick={toggleWindow} className='close-button'><IoCloseCircle size={35} color="#c6c6c6" /></button>
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
              onChange={(e) => props.setInputGameName(e.target.value)}
            />
            <input 
              type="text" 
              placeholder='Fale um pouco mais sobre esse jogo' 
              value={InputInfo}
              onChange={(e) => props.setInputInfo(e.target.value)}
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
  );
}
