// Dicionário de Tradução Reversa Binário -> Código Real
const bin: Record<string, string> = {
    '1 1': 'class',
    '1 2': 'function',
    '1 3': 'if',
    '1 4': 'else',
    '1 5': 'for',
    '1 6': 'while',
    '1 7': 'return', 
    '1 8': 'public',
    '1 9': 'private',
    '1 10': 'protected',
    '1 11': 'static',
    '1 12': 'void',
    '1 13': 'new',
    '1 14': 'this',
    '1 15': 'base',
    '1 16': 'null',
    '1 17': 'true',
    '1 18': 'false',
    '1 19': 'break',
    '1 20': 'continue',
    '1 21': '\n', // 🔑 Corrigido: Código numérico retorna a quebra de linha real
    '1 22': '\t', // 🔑 Corrigido: Código numérico retorna o caractere Tab real
    '2 1': 'int',
    '2 2': 'float',
    '2 3': 'double',
    '2 4': 'string',   
    '2 5': 'bool',
    '2 6': 'char',
    '2 7': 'object',
    '2 8': 'decimal',
    '2 9': 'long',
    '2 10': 'short',
    '2 11': 'byte',
    '2 12': 'sbyte',
    '2 13': 'uint',
    '2 14': 'ulong',
    '2 15': 'suint',
    '3 1': '+',
    '3 2': '-',
    '3 3': '*',
    '3 4': '/',
    '3 5': '%',
    '3 6': '++',
    '3 7': '--',
    '3 8': '==',
    '3 9': '!=',
    '3 10': '>',
    '3 11': '<',
    '3 12': '>=',
    '3 13': '<=',
    '3 14': '&&',
    '3 15': '||',
    '3 16': '!',
};

export function decompressScript(compressedScript: string): string {
    if (!compressedScript) return "";

    // A Regex identifica padrões compostos (Dígito indicador 1-3 + Espaço + Índice numérico)
    // O modificador 'g' garante que todas as ocorrências do arquivo sejam traduzidas de uma vez só
    let restoredText = compressedScript.replace(/([123])\s+(\d+)/g, (match) => {
        // Se encontrar na nossa tabela 'bin', substitui. Caso contrário, preserva o token original.
        return bin[match] !== undefined ? bin[match] : match;
    });

    return restoredText;
}

export interface DecompressedProject {
    id: number;
    name: string;
    info: string;
    rawScript: string;
}

export function parseLightFile(rawContent: string): DecompressedProject {
    console.group("📂 [LUMENION BINARY DECOMPRESSOR] Lendo arquivo .light importado...");
    
    // Divide as linhas do arquivo
    const lines = rawContent.split('\n');
    
    // Captura a linha de metadados (ID, NAME, INFO) que está na linha index 1
    const dataLine = lines[1] || "";
    const idMatch = dataLine.match(/ID:(\d+);/);
    const nameMatch = dataLine.match(/NAME:(.*?);/);
    const infoMatch = dataLine.match(/INFO:(.*?);/);

    const id = idMatch ? Number(idMatch[1]) : Date.now();
    const name = nameMatch ? nameMatch[1] : "Projeto Importado";
    const info = infoMatch ? infoMatch[1] : "Sem informações";

    console.log(`📋 Metadados Identificados -> ID: ${id} | Nome: ${name}`);

    // Captura a linha com a cadeia tokenizada do script
    const scriptLine = lines[2] || "";
    const scriptParts = scriptLine.split('=>');
    const compressedScript = scriptParts[1] || "";

    console.group("⚡ Processando e traduzindo cadeia binária do script...");
    
    // Executa a tradução dos tokens numéricos voltando para a sintaxe legível
    const decompressedScript = decompressScript(compressedScript);
    
    console.groupEnd();
    console.groupEnd(); // FIM DO DEBUG GLOBAL

    return {
        id,
        name,
        info,
        rawScript: decompressedScript
    };
}

export { parseLightFile as base_decompress };