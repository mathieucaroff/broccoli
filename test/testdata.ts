import { BroccoliTreeProgram, BroccoliValue } from "../src/type"
import { success, failure, Case } from "./lib/languageTestEngine"

let litteralString = (value: string) => ({
    kind: "litteral",
    value: { kind: "string", value },
})
let litteralNumber = (value: number) => ({
    kind: "litteral" as const,
    value: { kind: "number" as const, value },
})
let codeblockLitteral = (program: BroccoliTreeProgram) => ({
    kind: "litteral",
    value: { kind: "codeblock", value: program },
})

export let caseArray: Case<string, any>[] = [
    success("iidentifier89_", { kind: "identifier", name: "identifier89_" }),
    success("x.propertyname", { kind: "access", name: "propertyname" }),
    success('s"abc"', litteralString("abc")),
    success("n0", litteralNumber(0)),
    success("n1", litteralNumber(1)),
    success("n98", litteralNumber(98)),
    success("o+28", { kind: "operation", operator: "+", target: litteralNumber(28) }),
    success("o<=18", { kind: "operation", operator: "<=", target: litteralNumber(18) }),
    success("a=meaning", { kind: "assignment", target: "meaning" }),
    success("c{}", codeblockLitteral([])),
    success("c{a}", codeblockLitteral([{ kind: "identifier", name: "a" }])),
    success("c{a 9}", codeblockLitteral([{ kind: "identifier", name: "a" }, litteralNumber(9)])),
    success("g()", { kind: "group", program: [] }),
    success("g(a)", { kind: "group", program: [{ kind: "identifier", name: "a" }] }),
    success("p", []),
    success("pa", [{ kind: "identifier", name: "a" }]),
    success("pa b c", [
        { kind: "identifier", name: "a" },
        { kind: "identifier", name: "b" },
        { kind: "identifier", name: "c" },
    ]),
    success("eidentifier89_", { kind: "identifier", name: "identifier89_" }),
    success("e.propertyname", { kind: "access", name: "propertyname" }),
    success('e"abc"', litteralString("abc")),
    success("e98", litteralNumber(98)),
    success("e+28", { kind: "operation", operator: "+", target: litteralNumber(28) }),
    success("e<=18", { kind: "operation", operator: "<=", target: litteralNumber(18) }),
    success("e=meaning", { kind: "assignment", target: "meaning" }),
    success("e{}", codeblockLitteral([])),
    success("e()", { kind: "group", program: [] }),
    failure("e("),
    failure("e)"),
    failure("e{"),
    failure("e}"),
    failure('e"'),
    failure("e[]"),
]
