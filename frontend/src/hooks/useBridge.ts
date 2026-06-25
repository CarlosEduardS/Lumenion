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
    
    // 1. Selecionar/Importar arquivo .light
    const SelectLightFile = async (): Promise<string> => {
        try {
            await aguardarDotNet();

            return await (window as any).DotNet.invokeMethodAsync(
                'Lumenion', 
                'AbrirSelecionadorDeArquivo'
            );
        } catch (error) {
            console.error("Erro na comunicação com o C# (Import):", error);
            return `Erro: ${error}`;
        }
    };

    // 2. Exportar o projeto atual para um arquivo .light
    const ExportLightFile = async (lightFile: any): Promise<string> => {
        try {
            await aguardarDotNet();

            // Enviando o objeto/dados do projeto para o C# processar e salvar
            // Certifique-se de ter um método correspondente no C# com [JSInvokable("ExportarArquivoProjeto")]
            return await (window as any).DotNet.invokeMethodAsync(
                'Lumenion', 
                'ExportarArquivoProjeto', 
                lightFile
            );
        } catch (error) {
            console.error("Erro na comunicação com o C# (Export):", error);
            return `Erro: ${error}`;
        }
    };

    return { SelectLightFile, ExportLightFile };
}