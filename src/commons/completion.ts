
/**
 * enum representing the different kind of hint
 */
export enum CompletionKind {
    DEFAULT,
    CLASS,
    INTERFACE,
    ENUM,
    MODULE,
    VARIABLE,
    METHOD,
    FUNCTION,
    KEYWORD
}

/**
 * interface representing a hint
 */
export interface CompletionEntry {
    name: string;
    type: string;
    kind: CompletionKind;
    doc: string;
}


export interface CompletionResult {
    match: string;
    entries: CompletionEntry[]
}