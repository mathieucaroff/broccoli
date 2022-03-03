// /\
// TREE
// BroccoliTree*
export type BroccoliTreeProgram = BroccoliTreeExpression[]

export type BroccoliTreeExpression =
    | BroccoliTreeIdentifier
    | BroccoliTreeAccess
    | BroccoliTreeString
    | BroccoliTreeNumber
    | BroccoliTreeOperation
    | BroccoliTreeAssignment
    | BroccoliTreeCodeBlock
    | BroccoliTreeGroup

export interface BroccoliTreeIdentifier {
    kind: "identifier"
    name: string
}
export interface BroccoliTreeAccess {
    kind: "access"
    name: string
}
export interface BroccoliTreeString {
    kind: "string"
    value: string
}
export interface BroccoliTreeNumber {
    kind: "number"
    value: number
}
export interface BroccoliTreeOperation {
    kind: "operation"
    operator: "<=" | ">=" | "<<" | ">>" | "-" | "+" | "*" | "/" | "%" | "<" | ">" | "&" | "^" | "|"
    target: BroccoliTreeExpression
}
export interface BroccoliTreeAssignment {
    kind: "assignment"
    target: string
}
export interface BroccoliTreeCodeBlock {
    kind: "codeblock"
    program: BroccoliTreeProgram
}
export interface BroccoliTreeGroup {
    kind: "group"
    program: BroccoliTreeProgram
}
// TREE
// \/

export type BroccoliValue = BroccoliString | BroccoliNumber | BroccoliBoolean | BroccoliCodeBlock

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
