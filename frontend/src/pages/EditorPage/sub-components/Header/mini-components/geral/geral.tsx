import './geral.css'
import ItensLayoutBase from "../../components/layout-itens-base/itens-layout";
import * as FaIcons from 'react-icons/fa'

export default function GeralItens() {
    return (
        <ItensLayoutBase
        isVisible = {true}
        content = {
            <>
                <button><FaIcons.FaCube size={24}/><h5>Criar</h5></button>
                <button><FaIcons.FaArrowsAlt size={24}/><h5>Mover</h5></button>
                <button><FaIcons.FaRandom size={24}/><h5>Redimencionar</h5></button>
            </>
        }
        />
    )
}