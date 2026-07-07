import './geral.css'
import ItensLayoutBase from "../../components/layout-itens-base/itens-layout";
import * as FaIcons from 'react-icons/fa'

interface GeralItensProps {
    dimension: string;
}

export default function GeralItens({ dimension }: GeralItensProps) {

    const handleOpenProject = () => {
        const nextUrl = `/home`;
        window.history.pushState({}, '', nextUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    return (
        <ItensLayoutBase
        isVisible = {true}
        content = {
            <>
                <button onClick={handleOpenProject}>
                    <FaIcons.FaFolder size={24}/>
                    <h5>Sair e Salvar</h5>
                </button>
                <button><FaIcons.FaCube size={24}/><h5>Criar</h5></button>
                {dimension === '3D' ? (
                <>
                    <button><FaIcons.FaArrowsAlt size={24}/><h5>Mover</h5></button>
                    <button><FaIcons.FaRandom size={24}/><h5>Redimencionar</h5></button>
                </>
                ) : (
                <>
                    <button><FaIcons.FaArrowsAlt size={24}/><h5>Mover</h5></button>
                </>
                )}
            </>
        }
        />
    )
}