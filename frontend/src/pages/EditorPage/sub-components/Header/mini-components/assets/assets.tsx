import ItensLayoutBase from '../../components/layout-itens-base/itens-layout';
import * as FaIcons from 'react-icons/fa'

export default function AssetsItens() {
    return (
        <ItensLayoutBase
            isVisible={true}
            content={
                <>
                    <button><FaIcons.FaFileImport size={24}/><h5>Importar Asset</h5></button>
                    <button><FaIcons.FaFolderOpen size={24}/><h5>Gerenciar Pasta</h5></button>
                </>
            }
        />
    );
}