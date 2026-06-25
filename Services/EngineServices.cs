// Services/EngineService.cs
namespace Lumenion;

public class EngineService
{
    [Microsoft.JSInterop.JSInvokable]
    public static Task<string> ImportProject(string path)
    {
        // sua lógica aqui
        Console.WriteLine($"Importando projeto: {path}");
        return Task.FromResult($"Projeto '{path}' importado com sucesso!");
    }
}