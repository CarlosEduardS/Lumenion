// 🌳 Espelha a classe FolderNode do C# — cada nó é uma pasta ou um arquivo.
export interface ProjectTreeNode {
    name: string;
    isDirectory: boolean;
    children: ProjectTreeNode[];
}

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

    // 3. Cria a pasta base do projeto no disco (Documents/Lumenion Projects/CSharp|LumenScript/<nome>),
    // com a árvore de pastas certa pro modo escolhido (2D ou 3D). Devolve o caminho completo criado.
    const CriarPastaDoProjeto = async (
        nomeProjeto: string,
        scriptingMode: 'csharp' | 'lumen',
        dimension: '2D' | '3D'
    ): Promise<string> => {
        await aguardarDotNet();

        return await (window as any).DotNet.invokeMethodAsync(
            'Lumenion',
            'CriarPastaDoProjeto',
            nomeProjeto,
            scriptingMode,
            dimension
        );
    };

    // 4. Lê a árvore de pastas/arquivos do projeto no disco, a partir do
    // folderPath salvo no StoredProject. Devolve null se a pasta não existir
    // mais (movida ou apagada), ou se o projeto não tiver folderPath salvo.
    const LerArvoreDoProjeto = async (caminhoPasta: string): Promise<ProjectTreeNode | null> => {
        await aguardarDotNet();

        return await (window as any).DotNet.invokeMethodAsync(
            'Lumenion',
            'LerArvoreDoProjeto',
            caminhoPasta
        );
    };

    return { SelectLightFile, ExportLightFile, CriarPastaDoProjeto, LerArvoreDoProjeto };
}