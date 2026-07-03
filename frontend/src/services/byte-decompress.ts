import { type ProjectTemplate, type ConfigSaveTemplate } from './convert-light-file';
import {
    Mode,
    ModeNames,
    StructBlock,
    MODES_WITH_OPERAND,
    KEYWORDS,
    TYPES,
    OPERATORS,
    WHITESPACE_TOKENS,
} from './byte-dictionaries';

class ByteReader {
    private readonly bytes: Uint8Array;
    private readonly view: DataView;
    private offset = 0;

    constructor(bytes: Uint8Array) {
        this.bytes = bytes;
        this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    }

    get finished(): boolean {
        return this.offset >= this.bytes.length;
    }

    readUint8(): number {
        const value = this.bytes[this.offset];
        this.offset += 1;
        return value;
    }

    readFloat64(): number {
        const value = this.view.getFloat64(this.offset, true);
        this.offset += 8;
        return value;
    }

    readBool(): boolean {
        return this.readUint8() === 1;
    }

    readString(): string {
        const length = this.view.getUint32(this.offset, true);
        this.offset += 4;
        const slice = this.bytes.slice(this.offset, this.offset + length);
        this.offset += length;
        return new TextDecoder().decode(slice);
    }

    /** Lê o próximo byte de modo, e o operando (se aquele modo carregar um). */
    readMode(): { mode: Mode; operand?: number } {
        const mode = this.readUint8() as Mode;
        const operand = MODES_WITH_OPERAND.has(mode) ? this.readUint8() : undefined;
        return { mode, operand };
    }
}

/**
 * Lê o próximo byte de modo e GARANTE que é o esperado, com um erro claro se não for.
 * Isso troca "desync silencioso produzindo lixo" (o que aconteceria com um simples
 * reader.readMode() ignorado) por uma falha explícita apontando onde o formato
 * não bateu — essencial num parser binário posicional como este.
 */
function expectMode(reader: ByteReader, expected: Mode, context: string): { operand?: number } {
    const { mode, operand } = reader.readMode();
    if (mode !== expected) {
        throw new Error(
            `Arquivo .light corrompido ou fora do formato esperado: esperava ${ModeNames[expected]} em "${context}", encontrou ${ModeNames[mode] ?? mode}.`
        );
    }
    return { operand };
}

function readScriptTokens(reader: ByteReader): string {
    let script = '';
    while (true) {
        const { mode, operand } = reader.readMode();
        if (mode === Mode.SETRETURN) break;

        switch (mode) {
            case Mode.KEYWORD:
                script += KEYWORDS[operand!];
                break;
            case Mode.TYPE:
                script += TYPES[operand!];
                break;
            case Mode.OPERATOR:
                script += OPERATORS[operand!];
                break;
            case Mode.WHITESPACE:
                script += WHITESPACE_TOKENS[operand!];
                break;
            case Mode.RAW_STRING:
                script += reader.readString();
                break;
            default:
                throw new Error(`Byte de modo inesperado dentro do script: ${ModeNames[mode] ?? mode}`);
        }
    }
    return script;
}

function readConfigBlock(reader: ByteReader, block: StructBlock, context: string): ConfigSaveTemplate[] {
    expectMode(reader, Mode.STRUCT, `início do bloco ${context}`);
    expectMode(reader, Mode.RAW_NUMBER, `contagem de ${context}`);
    const count = reader.readFloat64();

    const entries: ConfigSaveTemplate[] = [];
    for (let i = 0; i < count; i++) {
        expectMode(reader, Mode.STRUCT, `entrada #${i} de ${context}`);
        expectMode(reader, Mode.RAW_NUMBER, `IDdirect da entrada #${i} de ${context}`);
        const IDdirect = reader.readFloat64();
        expectMode(reader, Mode.RAW_STRING, `pathNavigate da entrada #${i} de ${context}`);
        const pathNavigate = reader.readString();
        expectMode(reader, Mode.RAW_NUMBER, `contagem de configs da entrada #${i} de ${context}`);
        const configsCount = reader.readFloat64();

        const configs: string[] = [];
        for (let c = 0; c < configsCount; c++) {
            expectMode(reader, Mode.RAW_STRING, `config #${c} da entrada #${i} de ${context}`);
            configs.push(reader.readString());
        }
        expectMode(reader, Mode.SETRETURN, `fim da entrada #${i} de ${context}`);
        entries.push({ IDdirect, pathNavigate, configs });
    }
    expectMode(reader, Mode.SETRETURN, `fim do bloco ${context}`);
    void block;
    return entries;
}

/** Reconstrói o ProjectTemplate inteiro a partir dos bytes gerados por compressProjectToBytes. */
export function decompressBytesToProject(bytes: Uint8Array): ProjectTemplate {
    const reader = new ByteReader(bytes);

    // --- Cabeçalho ---
    expectMode(reader, Mode.STRUCT, 'PROJECT_HEADER');
    expectMode(reader, Mode.RAW_NUMBER, 'ProjectID');
    const ProjectID = reader.readFloat64();
    expectMode(reader, Mode.RAW_STRING, 'name');
    const name = reader.readString();
    expectMode(reader, Mode.RAW_STRING, 'info');
    const info = reader.readString();
    expectMode(reader, Mode.RAW_STRING, 'ImgUrl');
    const ImgUrl = reader.readString();
    expectMode(reader, Mode.SETRETURN, 'fim do PROJECT_HEADER');

    // --- Configs ---
    const configProje = readConfigBlock(reader, StructBlock.CONFIG_PROJE, 'CONFIG_PROJE');
    const configGame = readConfigBlock(reader, StructBlock.CONFIG_GAME, 'CONFIG_GAME');

    // --- Metadata (sempre presente no formato) ---
    expectMode(reader, Mode.STRUCT, 'METADATA');
    expectMode(reader, Mode.RAW_STRING, 'metaData.version');
    const version = reader.readString();
    expectMode(reader, Mode.RAW_NUMBER, 'metaData.lastModified');
    const lastModified = reader.readFloat64();
    expectMode(reader, Mode.RAW_STRING, 'metaData.author');
    const author = reader.readString();
    expectMode(reader, Mode.RAW_STRING, 'metaData.targetPlatform');
    const targetPlatform = reader.readString();
    expectMode(reader, Mode.SETRETURN, 'fim do METADATA');

    // --- Scripts ---
    expectMode(reader, Mode.STRUCT, 'SCRIPT_BLOCK');
    expectMode(reader, Mode.RAW_NUMBER, 'contagem de scripts');
    const scriptCount = reader.readFloat64();

    const scripts: ProjectTemplate['scripts'] = [];
    for (let i = 0; i < scriptCount; i++) {
        expectMode(reader, Mode.STRUCT, `SCRIPT_ENTRY #${i}`);
        expectMode(reader, Mode.RAW_NUMBER, `IDdirect do script #${i}`);
        const IDdirect = reader.readFloat64();
        expectMode(reader, Mode.RAW_STRING, `path do script #${i}`);
        const path = reader.readString();
        const script = readScriptTokens(reader);
        expectMode(reader, Mode.SETRETURN, `fim do SCRIPT_ENTRY #${i}`);
        scripts.push({ IDdirect, path, script });
    }
    expectMode(reader, Mode.SETRETURN, 'fim do SCRIPT_BLOCK');

    return {
        ProjectID,
        ImgUrl,
        name,
        info,
        configProje,
        configGame,
        scripts,
        metaData: {
            version,
            lastModified,
            author,
            // 🔎 O byte cru confia no conteúdo do arquivo aqui — se o .light for editado
            // à mão com um valor fora de 'desktop' | 'web' | 'mobile', isso passa direto.
            // Uma validação explícita é um bom próximo passo, mas não crítica agora.
            targetPlatform: targetPlatform as 'desktop' | 'web' | 'mobile',
        },
    };
}