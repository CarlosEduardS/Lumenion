// 📖 Tabelas e modos compartilhados entre o compressor e o descompressor.
//
// Regra de ouro: qualquer mudança aqui é feita UMA vez, num lugar só, lida
// pelos dois lados. O formato de texto anterior tinha dois dicionários
// separados (`reverseBin` em convert-light-file.ts e `bin` em
// decompress-light-file.ts) que precisavam ser mantidos sincronizados à mão —
// aqui isso não é mais possível por construção.

export const Mode = { // enum
    /** Encerra o "modo" atual e volta a esperar um novo byte de modo. Não tem operando. */
    SETRETURN: 0,
    /** Palavra reservada do C# (class, function, if...). Operando = índice em KEYWORDS. */
    KEYWORD: 1,
    /** Tipo primitivo do C# (int, float, string...). Operando = índice em TYPES. */
    TYPE: 2,
    /** Operador (+, -, ==...). Operando = índice em OPERATORS. */
    OPERATOR: 3,
    /** Início de um bloco estrutural do projeto. Operando = índice em StructBlock. */
    STRUCT: 4,
    /** String crua: os 4 bytes seguintes são o tamanho (uint32 LE), depois vem o UTF-8. */
    RAW_STRING: 5,
    /** Número cru: os 8 bytes seguintes são um float64 (LE). */
    RAW_NUMBER: 6,
    /** Booleano cru: o 1 byte seguinte é 0 ou 1. */
    RAW_BOOL: 7,
    /** Espaço em branco dentro de um script. Operando = índice em WHITESPACE_TOKENS. */
    WHITESPACE: 8,
} as const;

export type Mode = (typeof Mode)[keyof typeof Mode];

// Reverse map: número → nome do modo (para mensagens de erro)
export const ModeNames: Record<Mode, string> = {
    [Mode.SETRETURN]: 'SETRETURN',
    [Mode.KEYWORD]: 'KEYWORD',
    [Mode.TYPE]: 'TYPE',
    [Mode.OPERATOR]: 'OPERATOR',
    [Mode.STRUCT]: 'STRUCT',
    [Mode.RAW_STRING]: 'RAW_STRING',
    [Mode.RAW_NUMBER]: 'RAW_NUMBER',
    [Mode.RAW_BOOL]: 'RAW_BOOL',
    [Mode.WHITESPACE]: 'WHITESPACE',
};

/** Modos que carregam 1 byte de operando logo em seguida ao byte de modo. */
export const MODES_WITH_OPERAND = new Set<Mode>([
    Mode.KEYWORD,
    Mode.TYPE,
    Mode.OPERATOR,
    Mode.STRUCT,
    Mode.WHITESPACE,
]);

export const StructBlock = {
    PROJECT_HEADER: 0,
    CONFIG_PROJE: 1,
    CONFIG_GAME: 2,
    METADATA: 3,
    SCRIPT_BLOCK: 4,
    SCRIPT_ENTRY: 5,
    CONFIG_ENTRY: 6,
} as const;

export type StructBlock = (typeof StructBlock)[keyof typeof StructBlock];

// Reverse map: número → nome do bloco estrutural (para mensagens de erro)
export const StructBlockNames: Record<StructBlock, string> = {
    [StructBlock.PROJECT_HEADER]: 'PROJECT_HEADER',
    [StructBlock.CONFIG_PROJE]: 'CONFIG_PROJE',
    [StructBlock.CONFIG_GAME]: 'CONFIG_GAME',
    [StructBlock.METADATA]: 'METADATA',
    [StructBlock.SCRIPT_BLOCK]: 'SCRIPT_BLOCK',
    [StructBlock.SCRIPT_ENTRY]: 'SCRIPT_ENTRY',
    [StructBlock.CONFIG_ENTRY]: 'CONFIG_ENTRY',
};

export const KEYWORDS = [
    'class', 'function', 'if', 'else', 'for', 'while', 'return',
    'public', 'private', 'protected', 'static', 'void', 'new',
    'this', 'base', 'null', 'true', 'false', 'break', 'continue',
] as const;

export const TYPES = [
    'int', 'float', 'double', 'string', 'bool', 'char', 'object',
    'decimal', 'long', 'short', 'byte', 'sbyte', 'uint', 'ulong',
] as const;

export const OPERATORS = [
    '+', '-', '*', '/', '%', '++', '--', '==', '!=', '>', '<', '>=', '<=', '&&', '||', '!',
] as const;

export const WHITESPACE_TOKENS = ['\n', '\t', ' '] as const;

// Índices reversos (token -> código), montados uma vez a partir das tabelas acima.
export const KEYWORD_INDEX = new Map<string, number>(KEYWORDS.map((word, i) => [word, i]));
export const TYPE_INDEX = new Map<string, number>(TYPES.map((word, i) => [word, i]));
export const OPERATOR_INDEX = new Map<string, number>(OPERATORS.map((word, i) => [word, i]));
export const WHITESPACE_INDEX = new Map<string, number>(WHITESPACE_TOKENS.map((word, i) => [word, i]));