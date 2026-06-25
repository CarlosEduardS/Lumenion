using Microsoft.Maui.Storage;
using Microsoft.JSInterop;

namespace Lumenion;

public class EngineService
{
    // O primeiro argumento do JSInvokable define o identificador exato que o JS vai procurar
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
    public static async Task<string> ExportarArquivoProjeto(object dadosDoProjeto)
    {
        try
        {
            // Aqui você adicionaria a lógica usando o FolderPicker ou SaveFileDialog do MAUI 
            // para salvar os dados recebidos em um arquivo físico .light
            return "Sucesso: Projeto exportado!";
        }
        catch (Exception ex)
        {
            return $"Erro ao exportar: {ex.Message}";
        }
    }
}