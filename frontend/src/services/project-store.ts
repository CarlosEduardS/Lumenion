// 💾 Camada de persistência dos projetos, indexada por ID.
//
// Hoje usa localStorage como storage local rápido (o WebView2 do MAUI suporta
// normalmente, já que é um browser real embutido). Quando a Fase 0 do roadmap
// (compressão real de verdade + parser multi-script) estiver pronta, a leitura
// pode passar a vir do próprio arquivo .light via useBridge — a INTERFACE
// pública (saveProject/getProject/getAllProjects/deleteProject) pode continuar
// exatamente igual, só troca a implementação por dentro.

const STORAGE_KEY = 'lumenion:projects';

export type ProjectDimension = '2D' | '3D';
export type ScriptingMode = 'csharp' | 'lumen';

export interface ProjectConfig {
    dimension: ProjectDimension;
    scriptingMode: ScriptingMode;
    resolutionWidth: number;
    resolutionHeight: number;
    vsync: boolean;
    gravity: number;
    debugMode: boolean;
}

export interface StoredProject {
    id: number;
    image: string;
    gameName: string;
    gameInfo: string;
    config: ProjectConfig;
    createdAt: number;
    updatedAt: number;
}

export function defaultProjectConfig(): ProjectConfig {
    return {
        dimension: '2D',
        scriptingMode: 'csharp',
        resolutionWidth: 1920,
        resolutionHeight: 1080,
        vsync: true,
        gravity: 9.8,
        debugMode: false,
    };
}

function readAll(): Record<number, StoredProject> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        console.error('Falha ao ler projetos salvos do storage:', error);
        return {};
    }
}

function writeAll(data: Record<number, StoredProject>): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Falha ao salvar projetos no storage:', error);
    }
}

/** Cria ou atualiza um projeto, sempre indexado pelo mesmo `id`. Preserva createdAt original em edições. */
export function saveProject(project: Omit<StoredProject, 'updatedAt'>): StoredProject {
    const all = readAll();
    const existing = all[project.id];

    const toSave: StoredProject = {
        ...project,
        createdAt: existing?.createdAt ?? project.createdAt,
        updatedAt: Date.now(),
    };

    all[project.id] = toSave;
    writeAll(all);
    return toSave;
}

export function getProject(id: number): StoredProject | undefined {
    return readAll()[id];
}

export function getAllProjects(): StoredProject[] {
    return Object.values(readAll()).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteProject(id: number): void {
    const all = readAll();
    delete all[id];
    writeAll(all);
}