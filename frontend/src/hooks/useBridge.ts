// Função única para verificar e aguardar o Blazor carregar (evita repetição)
const aguardarDotNet = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if ((window as any).DotNet) {
            resolve();
            return;
        }

        let tentativas = 0;
        const intervalo = setInterval(() => {
            tentativas++;
            if ((window as any).DotNet) {
                clearInterval(intervalo);
                resolve();
            } else if (tentativas > 50) { // 5 segundos de limite
                clearInterval(intervalo);
                reject(new Error("A ponte 'DotNet' do Blazor demorou muito para responder. Verifique se o script blazor.webview.js está no index.html."));
            }
        }, 100);
    });
};

export function useBridge() {

    // 1. Selecionar/Importar arquivo .light — agora devolve os bytes crus do
    // arquivo (ou null se o usuário cancelou o seletor).
    const SelectLightFile = async (): Promise<Uint8Array | null> => {
        await aguardarDotNet();

        const resultado = await (window as any).DotNet.invokeMethodAsync(
            'Lumenion',
            'AbrirSelecionadorDeArquivo'
        );

        // O C# devolve null quando o usuário cancela o seletor de arquivo.
        // JSInterop marshala byte[] como um array de números / Uint8Array.
        return resultado ? new Uint8Array(resultado) : null;
    };

    // 2. Exportar o projeto atual para um arquivo .light — manda os bytes
    // como parâmetro solto (não dentro de um objeto), pra manter o transporte
    // binário eficiente em vez de virar base64 dentro de um JSON.
    const ExportLightFile = async (fileName: string, content: Uint8Array): Promise<string> => {
        await aguardarDotNet();

        return await (window as any).DotNet.invokeMethodAsync(
            'Lumenion',
            'ExportarArquivoProjeto',
            fileName,
            content
        );
    };

    return { SelectLightFile, ExportLightFile };
}