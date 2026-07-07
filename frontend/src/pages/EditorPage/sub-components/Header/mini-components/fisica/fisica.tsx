import ItensLayoutBase from '../../components/layout-itens-base/itens-layout';
import * as FaIcons from 'react-icons/fa'

export default function FisicaItens() {
    return (
        <ItensLayoutBase
            isVisible={true}
            content={
                <>
                    <button><FaIcons.FaCog /><h5>Configurar física</h5></button>
                </>
            }
        />
    );
}
