import ItensLayoutBase from '../../components/layout-itens-base/itens-layout';
import * as FaIcons from 'react-icons/fa'

export default function IluminacaoItens() {
    return (
        <ItensLayoutBase
            isVisible={true}
            content={
                <>
                    <button><FaIcons.FaLightbulb size={24}/><h5>Adicionar Luz</h5></button>
                    <button><FaIcons.FaSun size={24}/><h5>Configurar Luz Global</h5></button>
                </>
            }
        />
    );
}