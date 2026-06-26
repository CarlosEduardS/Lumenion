export interface ProjectTemplate {
    ProjectID: number;
    ImgUrl: string;
    name: string;
    info: string;
    configProje: ConfigSaveTemplate[]; 
    configGame: ConfigSaveTemplate[]; 
    scripts: ScriptSaveTemplate[];
    metaData?: MetaDataTemplate;      // ➕ Interface complementar
    assetsMap?: AssetMapTemplate[];   // ➕ Interface complementar
}

export interface ScriptSaveTemplate {
    IDdirect: number; 
    path: string; 
    script: string; 
}

export interface ConfigSaveTemplate {
    IDdirect: number;
    pathNavigate: string;
    configs: string[];
}

// ➕ Interfaces complementares para estender o sistema no futuro
export interface MetaDataTemplate {
    version: string;
    lastModified: number;
    author: string;
    targetPlatform: 'desktop' | 'web' | 'mobile';
}

export interface AssetMapTemplate {
    assetId: string;
    type: 'audio' | 'texture' | 'font' | 'prefab';
    localPath: string;
}

// Interface que define o retorno padrão do arquivo compactado
export interface LightFileResult {
    fileName: string;
    content: string; // Conteúdo textual compactado pronto para ser salvo em disco
    blob: Blob;      // O arquivo empacotado em binário puro
}

function ConvertToFile(project: ProjectTemplate): LightFileResult {
    // 💡 Base da compactação solicitada (ex: substituir quebras de linha e minificar palavras-chave)
    let compressedContent = `// LUMENION ENGINE LIGHT FILE v1.0\n`;
    compressedContent += `ID:${project.ProjectID};NAME:${project.name};INFO:${project.info};\n`;

    // Exemplo do seu dicionário de tokens (Compactação)
    // function -> F@C22, etc.
    project.scripts.forEach(s => {
        let scriptMinified = s.script
            .replace(/else/g, 'EL@')
            .replace(/if/g, 'I@')
            .replace(/true/g, 'U&')
            .replace(/false/g, 'S&')
            .replace(/class/g, 'C@S')
            .replace(/function/g, 'F@C')
            .replace(/return/g, 'R@T')
            .replace(/for/g, 'F$')
            .replace(/while/g, 'H$')
            .replace(/switch/g, 'S$')
            .replace(/case/g, 'C$')
            .replace(/input/g, 'I%P')
            .replace(/string/g, 'T#R')
            .replace(/int/g, 'I')
            .replace(/float/g, 'F##')
            .replace(/bool/g, 'B&')
            .replace(/List/g, '&L')
            .replace(/null/g, '%%')
            
            .replace(/ /g, '§')
            .replace(/\t/g, '¢')
            .replace(/\n/g, '£');
        
        compressedContent += `SCRIPT:${s.IDdirect}[${s.path}]=>${scriptMinified}\n`;
    });

    // Gera o Blob binário simulando o arquivo físico .light
    const blob = new Blob([compressedContent], { type: 'application/octet-stream' });
    const fileName = `${project.name.toLowerCase().replace(/\s+/g, '-')}.light`;

    return {
        fileName,
        content: compressedContent,
        blob
    };
}

export default ConvertToFile;