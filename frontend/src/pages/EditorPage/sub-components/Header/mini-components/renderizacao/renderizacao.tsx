import ItensLayoutBase from '../../components/layout-itens-base/itens-layout';
import * as FaIcons from 'react-icons/fa'

export default function RenderizacaoItens() {
    return (
        <ItensLayoutBase
            isVisible={true}
            content={
                <>
                    <button><FaIcons.FaTv size={24}/><h5>Config. Gráficos</h5></button>
                    <button><FaIcons.FaPaintBrush size={24}/><h5>Pipeline de Render</h5></button>
                </>
            }
        />
    );
}