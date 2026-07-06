import ItensLayoutBase from '../../components/layout-itens-base/itens-layout';

export default function AmbienteItens() {
    return (
        <ItensLayoutBase
            isVisible={true}
            content={
                <>
                    <button>Configurar ambiente</button>
                </>
            }
        />
    );
}
