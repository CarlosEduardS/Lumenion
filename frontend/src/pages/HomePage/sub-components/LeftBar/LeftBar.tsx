import ExtensionService from '../../../../services/extension';
import './LeftBar.css';

type Props = {
  activeGroup: 'files' | 'extension' | null;
  handleImportarProjeto: () => Promise<void> | void;
};

export default function LeftBar({ activeGroup, handleImportarProjeto }: Props) {
  const extensions = ExtensionService();

  return (
    <div className="left-sidebar-container">
      {activeGroup === 'files' && (
        <div className="files_group animate-fade-in">
          <button onClick={handleImportarProjeto}>Importar</button>
        </div>
      )}
      {activeGroup === 'extension' && (
        <div className="extension_group animate-fade-in">
          <input type="search" placeholder="Nome da extensão" />
          <div className="extension-list">
            {extensions.map((extension) => (
              <div key={extension.id} className="extension-item">
                <img src={extension.icon} alt={`${extension.name} icon`}/>
                <p>{extension.name}</p>
              </div>
            ))}
          </div>
          <button>Gerenciar</button>
        </div>
      )}
    </div>
  );
}
