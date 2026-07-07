import ItensLayoutBase from '../../components/layout-itens-base/itens-layout';
import * as FaIcons from 'react-icons/fa'

interface ScriptItensProps {
    scriptingMode: 'csharp' | 'lumen';
}

export default function ScriptItens({ scriptingMode }: ScriptItensProps) {
    return (
        <ItensLayoutBase
            isVisible={true}
            content={
                <>
                    <p>Modo de script: {scriptingMode === 'csharp' ? 'C# Direto' : 'Lumen Script'}</p>
                    <button><FaIcons.FaFileCode size={24}/><h5>Novo Script</h5></button>
                    <button><FaIcons.FaEdit size={24}/><h5>Abrir Editor</h5></button>
                </>
            }
        />
    );
}