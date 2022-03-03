type BroccoliTree = 0
type BroccoliTreeProgram = BroccoliTreeExpression[]
type BroccoliTreeExpression = 0
interface BroccoliTreeIdentifier {
    kind: "identyifier"
    name: string
}
interface BroccoliTreeString {
    kind: "string"
    value: string
}
interface BroccoliTreeNumber {
    kind: "number"
    value: number
}
interface BroccoliTreeOperation {
    kind: "operation"
    operator: "<=" | ">=" | "<<" | ">>" | "-" | "+" | "*" | "/" | "%" | "<" | ">" | "&" | "^" | "|"
    target: BroccoliTreeExpression
}
interface BroccoliTreeAssignment {
    kind: "assignment"
    target: string
}
interface BroccoliTreeCodeBlock {
    kind: "codeblock"
    program: BroccoliTreeProgram
}
interface BroccoliTreeGroup {
    kind: "group"
    program: BroccoliTreeProgram
}
