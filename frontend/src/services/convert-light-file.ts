import { type ProjectTemplate, type LightFileResult } from "./replace-word";

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