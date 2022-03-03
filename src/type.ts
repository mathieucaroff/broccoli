// /\
// TREE
// BroccoliTree*
export type BroccoliTreeProgram = BroccoliTreeExpression[]

export type BroccoliTreeExpression =
    | BroccoliTreeIdentifier
    | BroccoliTreeAccess
    | BroccoliTreeLitteral
    | BroccoliTreeOperation
    | BroccoliTreeAssignment
    | BroccoliTreeFunctionAssignment
    | BroccoliTreeGroup

export interface BroccoliTreeIdentifier {
    kind: "identifier"
    name: string
}
export interface BroccoliTreeAccess {
    kind: "access"
    name: string
}
export interface BroccoliTreeLitteral {
    kind: "litteral"
    value: BroccoliValue
}
export interface BroccoliTreeOperation {
    kind: "operation"
    operator:
        | "-"
        | "+"
        | "*"
        | "/"
        | "%"
        | "<<"
        | ">>"
        | "&"
        | "^"
        | "|"
        | "<"
        | ">"
        | "<="
        | ">="
        | "=="
        | "!="
    target: BroccoliTreeExpression
}
export interface BroccoliTreeAssignment {
    kind: "assignment"
    target: string
}
export interface BroccoliTreeFunctionAssignment {
    kind: "functionassignment"
    target: string
}
export interface BroccoliTreeGroup {
    kind: "group"
    program: BroccoliTreeProgram
}
// TREE
// \/

// /\
// VALUE
export type BroccoliValue =
    | BroccoliString
    | BroccoliNumber
    | BroccoliBoolean
    | BroccoliCodeBlock
    | BroccoliFunction
    | BroccoliNativeFunction
    | BroccoliNative

export interface BroccoliString {
    kind: "string"
    value: string
}
export interface BroccoliNumber {
    kind: "number"
    value: number
}
export interface BroccoliBoolean {
    kind: "boolean"
    value: boolean
}
export interface BroccoliCodeBlock {
    kind: "codeblock"
    value: BroccoliTreeProgram
}
export interface BroccoliFunction {
    kind: "function"
    value: BroccoliTreeProgram
}
export interface BroccoliNative {
    kind: "native"
    value: any
}
export interface BroccoliNativeFunction {
    kind: "nativefunction"
    value: (runtime: BroccoliRuntime, frame: BroccoliFrame) => void
}
// VALUE
// \/

// /\
// UTIL
export interface Reader {
    read(count: number): string
}
export interface Writer {
    write(v: string): void
    get(): string
}
// UTIL
// \/

// /\
// RUN
export interface BroccoliRuntime {
    reader: Reader
    writer: Writer
    stack: BroccoliValue[]
}

export interface BroccoliFrame {
    data: Record<string, BroccoliValue>
    parent?: BroccoliFrame
}
// RUN
// \/
