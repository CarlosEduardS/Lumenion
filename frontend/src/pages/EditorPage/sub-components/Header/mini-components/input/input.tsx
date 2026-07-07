import ItensLayoutBase from '../../components/layout-itens-base/itens-layout';
import * as FaIcons from 'react-icons/fa'

export default function InputItens() {
    return (
        <ItensLayoutBase
            isVisible={true}
            content={
                <>
                    <button><FaIcons.FaGamepad size={24}/><h5>Mapear Controle</h5></button>
                    <button><FaIcons.FaKeyboard size={24}/><h5>Mapear Teclado</h5></button>
                </>
            }
        />
    );
}