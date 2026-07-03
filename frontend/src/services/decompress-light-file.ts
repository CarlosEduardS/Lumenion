import { decompressBytesToProject } from './byte-decompress';
import { type ProjectTemplate } from './convert-light-file';

/**
 * Lê os bytes de um arquivo .light e devolve o ProjectTemplate completo
 * (header, configs, metadata e scripts — não só nome/info/script como o
 * formato de texto antigo devolvia).
 */
export function parseLightFile(rawContent: Uint8Array): ProjectTemplate {
    console.group('📂 [LUMENION BYTE DECOMPRESSOR] Lendo arquivo .light importado...');

    const project = decompressBytesToProject(rawContent);

    console.log(`📋 Metadados identificados -> ID: ${project.ProjectID} | Nome: ${project.name}`);
    console.log(`📜 Scripts encontrados: ${project.scripts.length}`);
    console.groupEnd();

    return project;
}

export { parseLightFile as base_decompress };