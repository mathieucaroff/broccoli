import { success, failure, Case } from "./lib/languageTestEngine"

export let caseArray: Case<string, any>[] = [
    success("iidentifier89_", { kind: "identifier", name: "identifier89_" }),
    success("x.propertyname", { kind: "access", name: "propertyname" }),
    success('s"abc"', { kind: "string", value: "abc" }),
    success("n98", { kind: "number", value: 98 }),
    success("o+28", { kind: "operation", operator: "+", target: { kind: "number", value: 28 } }),
    success("o<=18", { kind: "operation", operator: "<=", target: { kind: "number", value: 18 } }),
    success("a=meaning", { kind: "assignment", target: "meaning" }),
    success("c{}", { kind: "codeblock", program: [] }),
    success("c{a}", { kind: "codeblock", program: [{ kind: "identifier", name: "a" }] }),
    success("c{a 9}", {
        kind: "codeblock",
        program: [
            { kind: "identifier", name: "a" },
            { kind: "number", value: 9 },
        ],
    }),
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
    success('e"a"', { kind: "string", value: "a" }),
    success("e98", { kind: "number", value: 98 }),
    success("e+8", { kind: "operation", operator: "+", target: { kind: "number", value: 8 } }),
    success("e<=18", { kind: "operation", operator: "<=", target: { kind: "number", value: 18 } }),
    success("e{}", { kind: "codeblock", program: [] }),
    success("e()", { kind: "group", program: [] }),
    failure("e("),
    failure("e)"),
    failure("e{"),
    failure("e}"),
    failure('e"'),
    failure("e[]"),
]
