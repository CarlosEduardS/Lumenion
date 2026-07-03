import { compressProjectToBytes } from './byte-compress';

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

/** Resultado do arquivo .light gerado — agora `content` é binário real, não texto. */
export interface LightFileResult {
    fileName: string;
    content: Uint8Array;
    blob: Blob;
}

function ConvertToFile(project: ProjectTemplate): LightFileResult {
    console.group(`🚀 [LUMENION BYTE COMPRESSOR] Comprimindo projeto inteiro: "${project.name}"`);
    console.log('📦 Dados brutos do projeto:', project);

    const content = compressProjectToBytes(project);

    const blob = new Blob([content.slice()], { type: 'application/octet-stream' });
    const fileName = `${project.name.toLowerCase().replace(/\s+/g, '-')}.light`;

    console.log(`🎯 Arquivo binário gerado: ${fileName} (${content.byteLength} bytes)`);
    console.groupEnd();

    return { fileName, content, blob };
}

export default ConvertToFile;