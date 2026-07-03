export interface ProjectTemplate {
    ProjectID: number;
    ImgUrl: string;
    name: string;
    info: string;
    configProje: ConfigSaveTemplate[]; 
    configGame: ConfigSaveTemplate[]; 
    scripts: ScriptSaveTemplate[];
    metaData?: MetaDataTemplate;
    assetsMap?: AssetMapTemplate[];
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

export interface LightFileResult {
    fileName: string;
    content: string; 
    blob: Blob;      
}

// Dicionário Reverso de Compressão (Mapeia a palavra para os códigos numéricos separados por espaço)
const reverseBin: Record<string, string> = {
    'class': '1 1',
    'function': '1 2',
    'if': '1 3',
    'else': '1 4',
    'for': '1 5',
    'while': '1 6',
    'return': '1 7', 
    'public': '1 8',
    'private': '1 9',
    'protected': '1 10',
    'static': '1 11',
    'void': '1 12',
    'new': '1 13',
    'this': '1 14',
    'base': '1 15',
    'null': '1 16',
    'true': '1 17',
    'false': '1 18',
    'break': '1 19',
    'continue': '1 20',
    '\n': '1 21',
    '\t': '1 22',
    'int': '2 1',
    'float': '2 2',
    'double': '2 3',
    'string': '2 4',   
    'bool': '2 5',
    'char': '2 6',
    'object': '2 7',
    'decimal': '2 8',
    'long': '2 9',
    'short': '2 10',
    'byte': '2 11',
    'sbyte': '2 12',
    'uint': '2 13',
    'ulong': '2 14',
    'suint': '2 15',
    '+': '3 1',
    '-': '3 2',
    '*': '3 3',
    '/': '3 4',
    '%': '3 5',
    '++': '3 6',
    '--': '3 7',
    '==': '3 8',
    '!=': '3 9',
    '>': '3 10',
    '<': '3 11',
    '>=': '3 12',
    '<=': '3 13',
    '&&': '3 14',
    '||': '3 15',
    '!': '3 16',
};

function ConvertToFile(project: ProjectTemplate): LightFileResult {
    // 🛠️ INÍCIO DO DEBUG NO CONSOLE
    console.group(`🚀 [LUMENION BINARY COMPRESSOR] Iniciando compressão estruturada do projeto: "${project.name}"`);
    console.log("📦 Dados brutos do projeto:", project);

    let compressedContent = `// LUMENION ENGINE LIGHT FILE v1.0\n`;
    compressedContent += `ID:${project.ProjectID};NAME:${project.name};INFO:${project.info};\n`;

    project.scripts.forEach((s, index) => {
        console.group(`📝 Tokenizando Script [${index + 1}/${project.scripts.length}]: ID ${s.IDdirect} (${s.path})`);
        console.log("📄 Código C# Original:\n", s.script);

        // 🪄 Ajuste na Regex para capturar e isolar explicitamente \n e \t do resto dos espaços normais
        const tokens = s.script.split(/(\n|\t|\s+|==|!=|>=|<=|&&|\|\||\+\+|--|[+\-*/%><!(){}[\];.,])/g).filter(Boolean);
        
        // Traduz os tokens de texto para os pares numéricos (Modo + Token)
        const compressedTokens = tokens.map(token => {
            // Se for \n ou \t, não rodamos o .trim() para evitar que virem string vazia ""
            const isWhitespaceToken = token === '\n' || token === '\t';
            const keyToSearch = isWhitespaceToken ? token : token.trim();

            if (reverseBin[keyToSearch]) {
                // Substitui o token mapeado pelo correspondente da base binária
                return token.replace(keyToSearch, reverseBin[keyToSearch]);
            }
            return token;
        });

        // Junta tudo de volta em uma linha contínua, sem quebras reais de arquivo!
        let scriptMinified = compressedTokens.join('');
        
        console.log("⚡ Código Comprimido em Base Binária (Sem quebras de linha reais):\n", scriptMinified);
        console.groupEnd();

        compressedContent += `SCRIPT:${s.IDdirect}[${s.path}]=>${scriptMinified}\n`;
    });

    // Gera o Blob binário simulando o arquivo físico .light
    const blob = new Blob([compressedContent], { type: 'application/octet-stream' });
    const fileName = `${project.name.toLowerCase().replace(/\s+/g, '-')}.light`;

    console.log("💾 Estrutura Textual do Arquivo .light Pronta:\n", compressedContent);
    console.log(`🎯 Arquivo binário gerado com sucesso: ${fileName} (${blob.size} bytes)`);
    console.groupEnd(); // FIM DO DEBUG GLOBAL

    return {
        fileName,
        content: compressedContent,
        blob
    };
}

export default ConvertToFile;