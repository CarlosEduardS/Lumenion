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


export function base_compress(project_data: ProjectTemplate){

    return project_data
}

export function base_decompress(rawContent: string){
    
    return rawContent
}
