using Microsoft.Maui.Storage;
using Microsoft.JSInterop;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.IO;

namespace Lumenion;

public class ExportPayload
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;
}

public class EngineService
{
    [JSInvokable("AbrirSelecionadorDeArquivo")]
    public static async Task<string> AbrirSelecionadorDeArquivo()
    {
        try
        {
            var opcoesDeFiltro = new PickOptions
            {
                PickerTitle = "Selecione o arquivo do Lumenion (.light)",
                FileTypes = new FilePickerFileType(new Dictionary<DevicePlatform, IEnumerable<string>>
                {
                    { DevicePlatform.WinUI, new[] { ".light" } },
                    { DevicePlatform.Android, new[] { "application/octet-stream" } },
                    { DevicePlatform.iOS, new[] { "com.lumenion.light" } }
                })
            };

            var resultado = await FilePicker.Default.PickAsync(opcoesDeFiltro);

            if (resultado != null)
            {
                // 🌟 A MÁGICA NATIVA: Lê todo o conteúdo de texto do arquivo .light selecionado
                string conteudoDoArquivo = await File.ReadAllTextAsync(resultado.FullPath, Encoding.UTF8);
                
                // Retornamos o conteúdo bruto diretamente para o JavaScript processar
                return conteudoDoArquivo;
            }

            return "Cancelado";
        }
        catch (Exception ex)
        {
            return $"Erro: {ex.Message}";
        }
    }

    [JSInvokable("ExportarArquivoProjeto")]
    public static async Task<string> ExportarArquivoProjeto(System.Text.Json.JsonElement dadosDoProjeto)
    {
        try
        {
            // 1. Deserializa o payload recebido do JavaScript
            var payload = dadosDoProjeto.Deserialize<ExportPayload>();
            if (payload == null || string.IsNullOrEmpty(payload.Content))
            {
                return "Erro: Dados de exportação inválidos.";
            }

            string resultadoTxt = "Cancelado pelo usuário";

            // 2. Garante a execução na thread visual principal
            await MainThread.InvokeOnMainThreadAsync(async () =>
            {
    #if WINDOWS
                // Criando o seletor nativo do WinUI 3
                var savePicker = new Windows.Storage.Pickers.FileSavePicker();
                
                // 🌟 CRÍTICO para WinUI 3: Captura o ponteiro (handle) da janela ativa do MAUI
                var window = Microsoft.Maui.Controls.Application.Current?.Windows[0].Handler?.PlatformView as Microsoft.UI.Xaml.Window;
                if (window != null)
                {
                    var windowHandle = WinRT.Interop.WindowNative.GetWindowHandle(window);
                    WinRT.Interop.InitializeWithWindow.Initialize(savePicker, windowHandle);
                }

                // Configurando as opções do arquivo
                savePicker.SuggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.DocumentsLibrary;
                savePicker.FileTypeChoices.Add("Lumenion Light File", new System.Collections.Generic.List<string>() { ".light" });
                savePicker.SuggestedFileName = payload.Name;

                // Abre a janela nativa do Windows Explorer
                var arquivoAlvo = await savePicker.PickSaveFileAsync();
                
                if (arquivoAlvo != null)
                {
                    // Escreve o texto compacto diretamente no arquivo escolhido
                    await Windows.Storage.FileIO.WriteTextAsync(arquivoAlvo, payload.Content);
                    resultadoTxt = $"Sucesso: Arquivo salvo em {arquivoAlvo.Path}";
                }
    #else
                resultadoTxt = "Plataforma não suportada nativamente para salvar arquivos.";
    #endif
            });

            return resultadoTxt;
        }
        catch (Exception ex)
        {
            return $"Erro interno no C#: {ex.Message}";
        }
    }
}