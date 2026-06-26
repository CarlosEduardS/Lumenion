using Microsoft.Maui.Storage;
using Microsoft.JSInterop;
using System.Text;
using System.Text.Json.Serialization;
using CommunityToolkit.Maui.Storage; // 🌟 Necessário para salvar arquivos de forma nativa

namespace Lumenion;

// Estrutura para receber o JSON mapeado do JS
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
                return $"Sucesso: {resultado.FullPath}";
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
            // 1. Deserializa o payload recebido do JavaScript de forma segura
            var payload = dadosDoProjeto.Deserialize<ExportPayload>();
            if (payload == null || string.IsNullOrEmpty(payload.Content))
            {
                return "Erro: Dados de exportação inválidos.";
            }

            // 2. Converte a string criptografada/compactada em um Stream de Bytes
            byte[] fileBytes = Encoding.UTF8.GetBytes(payload.Content);
            using var stream = new MemoryStream(fileBytes);

            // 3. Abre a janela nativa do Windows Explorer ("Salvar Como")
            // Passando o nome sugerido gerado pela sua aplicação (ex: meu-jogo.light)
            var resultadoSalvar = await FileSaver.Default.SaveAsync(payload.Name, stream, CancellationToken.None);

            if (resultadoSalvar.IsSuccessful)
            {
                return $"Sucesso: Arquivo salvo em {resultadoSalvar.FilePath}";
            }

            return "Cancelado pelo usuário";
        }
        catch (Exception ex)
        {
            return $"Erro ao exportar: {ex.Message}";
        }
    }
}