export function useBridge() {
    const importProject = async (path: string): Promise<string> => {
        return await (window as any).DotNet.invokeMethodAsync(
            'Lumenion',           // namespace do projeto
            'ImportProject',      // nome do método [JSInvokable]
            path                  // argumento
        );
    };

    return { importProject };
}