using Microsoft.Maui.Storage;
using Microsoft.JSInterop;
using System.IO;
using System.Linq;
#if WINDOWS
using System.Runtime.InteropServices.WindowsRuntime;
#endif

namespace Lumenion;

public class EngineService
{
    [JSInvokable("AbrirSelecionadorDeArquivo")]
    public static async Task<byte[]?> AbrirSelecionadorDeArquivo()
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

        if (resultado == null)
        {
            // Usuário cancelou o seletor — o JS trata null como "importação cancelada"
            return null;
        }

        // 🌟 Agora lê BYTES crus do disco, não texto — o .light é binário de verdade
        return await File.ReadAllBytesAsync(resultado.FullPath);
    }

    [JSInvokable("ExportarArquivoProjeto")]
    public static async Task<string> ExportarArquivoProjeto(string nomeArquivo, byte[] conteudo)
    {
        if (conteudo == null || conteudo.Length == 0)
        {
            throw new InvalidOperationException("Dados de exportação inválidos: conteúdo vazio.");
        }

        string resultadoTxt = "Cancelado pelo usuário";

        // Garante a execução na thread visual principal (obrigatório pros pickers nativos)
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

            savePicker.SuggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.DocumentsLibrary;
            savePicker.FileTypeChoices.Add("Lumenion Light File", new System.Collections.Generic.List<string>() { ".light" });
            savePicker.SuggestedFileName = nomeArquivo;

            var arquivoAlvo = await savePicker.PickSaveFileAsync();

            if (arquivoAlvo != null)
            {
                // 🌟 Escreve BYTES crus no arquivo escolhido — nada de texto/ASCII
                await Windows.Storage.FileIO.WriteBufferAsync(arquivoAlvo, conteudo.AsBuffer());
                resultadoTxt = $"Sucesso: Arquivo salvo em {arquivoAlvo.Path}";
            }
#else
            resultadoTxt = "Plataforma não suportada nativamente para salvar arquivos.";
#endif
        });

        return resultadoTxt;
    }

    [JSInvokable("CriarPastaDoProjeto")]
    public static Task<string> CriarPastaDoProjeto(string nomeProjeto, string scriptingMode, string dimension)
    {
#if WINDOWS
        // Remove caracteres inválidos pra nome de pasta (ex: : / * ? não podem
        // estar no nome de uma pasta no Windows)
        var caracteresInvalidos = Path.GetInvalidFileNameChars();
        string nomeSanitizado = new string(nomeProjeto.Select(c => caracteresInvalidos.Contains(c) ? '_' : c).ToArray()).Trim();

        if (string.IsNullOrWhiteSpace(nomeSanitizado))
        {
            nomeSanitizado = "ProjetoSemNome";
        }

        // Projetos em C# e projetos em Lumen Script ficam em pastas separadas,
        // deixando espaço pra cada modo evoluir sem misturar estrutura de arquivos.
        string subPastaPorModo = scriptingMode == "csharp" ? "CSharp" : "LumenScript";

        string pastaBase = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
            "Lumenion Projects",
            subPastaPorModo,
            nomeSanitizado
        );

        // --- Estrutura comum, presente em qualquer projeto (2D ou 3D) ---
        // Inspirada no que Unity/Godot/Unreal/GameMaker já usam por padrão.
        Directory.CreateDirectory(pastaBase);
        Directory.CreateDirectory(Path.Combine(pastaBase, "Scripts"));
        Directory.CreateDirectory(Path.Combine(pastaBase, "Scenes"));
        Directory.CreateDirectory(Path.Combine(pastaBase, "Settings"));
        Directory.CreateDirectory(Path.Combine(pastaBase, "Assets"));
        Directory.CreateDirectory(Path.Combine(pastaBase, "Assets", "Audio"));
        Directory.CreateDirectory(Path.Combine(pastaBase, "Assets", "Fonts"));
        Directory.CreateDirectory(Path.Combine(pastaBase, "Assets", "Animations"));

        if (dimension == "3D")
        {
            // 3D: modelos, materiais, texturas e shaders — como em Unity/Unreal/Godot
            Directory.CreateDirectory(Path.Combine(pastaBase, "Assets", "Models"));
            Directory.CreateDirectory(Path.Combine(pastaBase, "Assets", "Materials"));
            Directory.CreateDirectory(Path.Combine(pastaBase, "Assets", "Textures"));
            Directory.CreateDirectory(Path.Combine(pastaBase, "Assets", "Shaders"));
        }
        else
        {
            // 2D: sprites e tilesets — como em GameMaker/Construct/Godot (modo 2D)
            Directory.CreateDirectory(Path.Combine(pastaBase, "Assets", "Sprites"));
            Directory.CreateDirectory(Path.Combine(pastaBase, "Assets", "Tilesets"));
        }

        return Task.FromResult(pastaBase);
#else
        throw new PlatformNotSupportedException("Criação de pasta de projeto ainda só é suportada no Windows.");
#endif
    }
}