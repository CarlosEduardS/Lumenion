import ItensLayoutBase from '../../components/layout-itens-base/itens-layout';
import * as FaIcons from 'react-icons/fa'

export default function CameraItens() {
    return (
        <ItensLayoutBase
            isVisible={true}
            content={
                <>
                    <button><FaIcons.FaVideo size={24}/><h5>Adicionar Câmera</h5></button>
                    <button><FaIcons.FaCrosshairs size={24}/><h5>Configurar Foco</h5></button>
                </>
            }
        />
    );
}