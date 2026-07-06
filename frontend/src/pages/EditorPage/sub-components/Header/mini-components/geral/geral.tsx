import './geral.css'
import ItensLayoutBase from "../../components/layout-itens-base/itens-layout";

export default function GeralItens() {
    return (
        <ItensLayoutBase
        isVisible = {true}
        content = {
            <>
                <button>Criar</button>
            </>
        }
        />
    )
}