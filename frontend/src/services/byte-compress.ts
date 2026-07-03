import { type ProjectTemplate, type ConfigSaveTemplate } from './convert-light-file';
import {
    Mode,
    StructBlock,
    KEYWORD_INDEX,
    TYPE_INDEX,
    OPERATOR_INDEX,
    WHITESPACE_INDEX,
} from './byte-dictionaries';

/**
 * ✍️ Buffer que cresce sozinho conforme escrevemos bytes — evita ter que
 * calcular o tamanho final do arquivo antes de começar a escrever.
 * Guarda os bytes num array comum e só vira Uint8Array no final (toBytes).
 */
class ByteWriter {
    private chunks: number[] = [];

    writeUint8(value: number): void {
        this.chunks.push(value & 0xff);
    }

    /**
     * Números sempre em 8 bytes (float64). Não separamos int/float/etc em tipos
     * diferentes de byte — simplifica o formato e o custo (7 bytes a mais por
     * número) é irrelevante perto do que se ganha comprimindo o código-fonte.
     */
    writeFloat64(value: number): void {
        const buffer = new ArrayBuffer(8);
        new DataView(buffer).setFloat64(0, value, true); // little-endian
        this.chunks.push(...new Uint8Array(buffer));
    }

    writeBool(value: boolean): void {
        this.writeUint8(value ? 1 : 0);
    }

    /**
     * String com TAMANHO PREFIXADO (4 bytes = quantidade de bytes UTF-8 que seguem),
     * em vez de "ler até encontrar o próximo byte de modo". Isso é proposital: um
     * formato posicional/ambíguo foi exatamente o que quebrou o parser de texto
     * anterior (parseLightFile só lia lines[1]/lines[2] fixos). Com tamanho
     * prefixado não existe ambiguidade possível.
     */
    writeString(value: string): void {
        const encoded = new TextEncoder().encode(value);
        const lengthBuffer = new ArrayBuffer(4);
        new DataView(lengthBuffer).setUint32(0, encoded.length, true);
        this.chunks.push(...new Uint8Array(lengthBuffer));
        this.chunks.push(...encoded);
    }

    writeMode(mode: Mode, operand?: number): void {
        this.writeUint8(mode);
        if (operand !== undefined) {
            this.writeUint8(operand);
        }
    }

    toBytes(): Uint8Array {
        return new Uint8Array(this.chunks);
    }
}

/** Tokeniza um script C# e escreve cada token como keyword/type/operator/whitespace/string cru. */
function writeScriptTokens(writer: ByteWriter, script: string): void {
    const tokens = script
        .split(/(\n|\t| +|==|!=|>=|<=|&&|\|\||\+\+|--|[+\-*/%><!(){}[\];.,])/g)
        .filter(Boolean);

    for (const token of tokens) {
        if (WHITESPACE_INDEX.has(token)) {
            writer.writeMode(Mode.WHITESPACE, WHITESPACE_INDEX.get(token)!);
        } else if (KEYWORD_INDEX.has(token)) {
            writer.writeMode(Mode.KEYWORD, KEYWORD_INDEX.get(token)!);
        } else if (TYPE_INDEX.has(token)) {
            writer.writeMode(Mode.TYPE, TYPE_INDEX.get(token)!);
        } else if (OPERATOR_INDEX.has(token)) {
            writer.writeMode(Mode.OPERATOR, OPERATOR_INDEX.get(token)!);
        } else {
            // Não é palavra reservada nem operador conhecido: nomes de variáveis,
            // literais de string, números como texto, etc. sobram como string crua.
            writer.writeMode(Mode.RAW_STRING);
            writer.writeString(token);
        }
    }
    writer.writeMode(Mode.SETRETURN);
}

function writeConfigBlock(writer: ByteWriter, block: StructBlock, entries: ConfigSaveTemplate[]): void {
    writer.writeMode(Mode.STRUCT, block);
    writer.writeMode(Mode.RAW_NUMBER);
    writer.writeFloat64(entries.length);

    for (const entry of entries) {
        writer.writeMode(Mode.STRUCT, StructBlock.CONFIG_ENTRY);
        writer.writeMode(Mode.RAW_NUMBER);
        writer.writeFloat64(entry.IDdirect);
        writer.writeMode(Mode.RAW_STRING);
        writer.writeString(entry.pathNavigate);
        writer.writeMode(Mode.RAW_NUMBER);
        writer.writeFloat64(entry.configs.length);
        for (const config of entry.configs) {
            writer.writeMode(Mode.RAW_STRING);
            writer.writeString(config);
        }
        writer.writeMode(Mode.SETRETURN);
    }
    writer.writeMode(Mode.SETRETURN);
}

/**
 * Codifica o projeto INTEIRO (não só os scripts) em bytes reais.
 * Ordem fixa e sempre determinística: HEADER -> CONFIG_PROJE -> CONFIG_GAME
 * -> METADATA -> SCRIPT_BLOCK. O metaData é sempre escrito (com valores padrão
 * se `project.metaData` vier undefined) para o decoder nunca precisar "adivinhar"
 * se um bloco opcional existe ou não — mesma lição do bug do parser antigo.
 */
export function compressProjectToBytes(project: ProjectTemplate): Uint8Array {
    const writer = new ByteWriter();

    // --- Cabeçalho do projeto ---
    writer.writeMode(Mode.STRUCT, StructBlock.PROJECT_HEADER);
    writer.writeMode(Mode.RAW_NUMBER);
    writer.writeFloat64(project.ProjectID);
    writer.writeMode(Mode.RAW_STRING);
    writer.writeString(project.name);
    writer.writeMode(Mode.RAW_STRING);
    writer.writeString(project.info);
    writer.writeMode(Mode.RAW_STRING);
    writer.writeString(project.ImgUrl);
    writer.writeMode(Mode.SETRETURN);

    // --- Configs (projeto e jogo compartilham o mesmo formato de bloco) ---
    writeConfigBlock(writer, StructBlock.CONFIG_PROJE, project.configProje);
    writeConfigBlock(writer, StructBlock.CONFIG_GAME, project.configGame);

    // --- Metadata (sempre presente no arquivo, com fallback se não vier no objeto) ---
    const metaData = project.metaData ?? {
        version: '0.0.0',
        lastModified: Date.now(),
        author: 'Desconhecido',
        targetPlatform: 'desktop' as const,
    };
    writer.writeMode(Mode.STRUCT, StructBlock.METADATA);
    writer.writeMode(Mode.RAW_STRING);
    writer.writeString(metaData.version);
    writer.writeMode(Mode.RAW_NUMBER);
    writer.writeFloat64(metaData.lastModified);
    writer.writeMode(Mode.RAW_STRING);
    writer.writeString(metaData.author);
    writer.writeMode(Mode.RAW_STRING);
    writer.writeString(metaData.targetPlatform);
    writer.writeMode(Mode.SETRETURN);

    // --- Scripts ---
    writer.writeMode(Mode.STRUCT, StructBlock.SCRIPT_BLOCK);
    writer.writeMode(Mode.RAW_NUMBER);
    writer.writeFloat64(project.scripts.length);
    for (const script of project.scripts) {
        writer.writeMode(Mode.STRUCT, StructBlock.SCRIPT_ENTRY);
        writer.writeMode(Mode.RAW_NUMBER);
        writer.writeFloat64(script.IDdirect);
        writer.writeMode(Mode.RAW_STRING);
        writer.writeString(script.path);
        writeScriptTokens(writer, script.script);
        writer.writeMode(Mode.SETRETURN);
    }
    writer.writeMode(Mode.SETRETURN);

    return writer.toBytes();
}