import ItensLayoutBase from '../../components/layout-itens-base/itens-layout';
import * as FaIcons from 'react-icons/fa'

export default function AudioItens() {
    return (
        <ItensLayoutBase
            isVisible={true}
            content={
                <>
                    <button><FaIcons.FaVolumeUp size={24}/><h5>Configurar Áudio</h5></button>
                    <button><FaIcons.FaMusic size={24}/><h5>Importar Trilha</h5></button>
                </>
            }
        />
    );
}