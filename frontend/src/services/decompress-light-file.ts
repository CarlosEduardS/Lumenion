export function decompressScript(compressedScript: string): string {
    return compressedScript
        // 1. PRIMEIRO: Restaurar formatação (Espaços, Tabs e Quebras de linha)
        .replace(/§/g, ' ')
        .replace(/¢/g, '\t')
        .replace(/£/g, '\n')

        // 2. SEGUNDO: Palavras menores e tipos (Ordem inversa do compressor)
        .replace(/I@/g, 'if')
        .replace(/I/g, 'int')
        .replace(/F\$/g, 'for')
        .replace(/U&/g, 'true')
        .replace(/%%/g, 'null')
        .replace(/&L/g, 'List')
        .replace(/B&/g, 'bool')
        .replace(/C\$/g, 'case')
        .replace(/EL@/g, 'else')

        // 3. TERCEIRO: Palavras maiores e completas
        .replace(/H\$/g, 'while')
        .replace(/C@S/g, 'class')
        .replace(/S&/g, 'false')
        .replace(/F##/g, 'float')
        .replace(/I%P/g, 'input')
        .replace(/T#R/g, 'string')
        .replace(/S\$/g, 'switch')
        .replace(/R@T/g, 'return')
        .replace(/F@C/g, 'function');
}

// Interface para sabermos o que foi extraído do arquivo bruto
export interface DecompressedProject {
    id: number;
    name: string;
    info: string;
    rawScript: string;
}

export function parseLightFile(rawContent: string): DecompressedProject {
    // Exemplo de formato: // LUMENION ENGINE LIGHT FILE v1.0\nID:17824...;NAME:33;INFO:Jogo RPG;\nSCRIPT:17824...[src/main.as]=>C@S§Player...
    
    // Divide as linhas do arquivo
    const lines = rawContent.split('\n');
    
    // Captura a linha de dados (ID, NAME, INFO)
    const dataLine = lines[1] || "";
    const idMatch = dataLine.match(/ID:(\d+);/);
    const nameMatch = dataLine.match(/NAME:(.*?);/);
    const infoMatch = dataLine.match(/INFO:(.*?);/);

    // Captura o script compactado após o '=>'
    const scriptLine = lines[2] || "";
    const scriptParts = scriptLine.split('=>');
    const compressedScript = scriptParts[1] || "";

    return {
        id: idMatch ? Number(idMatch[1]) : Date.now(),
        name: nameMatch ? nameMatch[1] : "Projeto Importado",
        info: infoMatch ? infoMatch[1] : "Sem informações",
        rawScript: decompressScript(compressedScript)
    };
}