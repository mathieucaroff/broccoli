import { default as nearley } from "nearley"

import broccoliGrammar from "../grammar.ne"
import { createStringReader, createStringWriter } from "./util"
import {
    BroccoliFrame,
    BroccoliRuntime,
    BroccoliTreeExpression,
    BroccoliTreeOperation,
    BroccoliTreeProgram,
    BroccoliValue,
} from "./type"

export function createBroccoli(programString: string) {
    let parser = new nearley.Parser(broccoliGrammar)
    parser.feed(programString)
    let program = parser.results[0]
    if (!program) {
        throw "The program doesn't parse"
    }

    return {
        run(stdinString: string) {
            let runtime: BroccoliRuntime = {
                reader: createStringReader(stdinString),
                writer: createStringWriter(),
                stack: [],
            }
            runProgram(program, runtime, predefinedFrame, true)
            return runtime.writer.get()
        },
        runeval(rt: BroccoliRuntime, frame: BroccoliFrame) {
            runProgram(program, rt, frame, false)
        },
    }
}

export function isScalar(value: BroccoliValue) {
    return ["string", "number", "boolean"].includes(value.kind)
}

export let predefinedFrame: BroccoliFrame = {
    data: {
        printstack: {
            kind: "nativefunction",
            value: (rt, frame) => {
                rt.writer.write("<" + JSON.stringify(rt.stack, null, 2) + ">")
            },
        },
        true: { kind: "boolean", value: true },
        false: { kind: "boolean", value: false },
        stdin: {
            kind: "native",
            value: {
                data: {
                    read: {
                        kind: "nativefunction",
                        value: (rt, frame) => {
                            let textArray: string[] = []
                            let chunk = rt.reader.read(1000)
                            textArray.push(chunk)
                            while (chunk.length === 1000) {
                                chunk = rt.reader.read(1000)
                                textArray.push(chunk)
                            }
                            rt.stack.push({ kind: "string", value: textArray.join("") })
                        },
                    },
                },
            },
        },
        stdout: {
            kind: "native",
            value: {
                data: {
                    write: {
                        kind: "nativefunction",
                        value: (rt, frame) => {
                            let entry = rt.stack.pop()!
                            if (!isScalar(entry)) {
                                throw new TypeError(`Expected a scalar but got a ${entry.kind}`)
                            }
                            rt.writer.write(entry.value.toString())
                        },
                    },
                },
            },
        },
        output: {
            kind: "nativefunction",
            value: (rt, frame) => {
                let entry = rt.stack.pop()!
                if (!isScalar(entry)) {
                    throw new TypeError(`Expected a scalar but got a ${entry.kind}`)
                }
                rt.writer.write(entry.value.toString() + "\n")
            },
        },
        input: {
            kind: "nativefunction",
            value: (rt, frame) => {
                let valueArray: string[] = []
                let c = rt.reader.read(1)
                while (c !== "\n" && c !== "") {
                    valueArray.push(c)
                    c = rt.reader.read(1)
                }
                rt.stack.push({ kind: "string", value: valueArray.join("") })
            },
        },
        number: {
            kind: "nativefunction",
            value: (rt, frame) => {
                let entry = rt.stack.pop()!
                if (!isScalar(entry)) {
                    throw new TypeError(`Expected a scalar value but got ${entry.kind}`)
                }
                rt.stack.push({ kind: "number", value: +entry.value })
            },
        },
        loop: {
            kind: "nativefunction",
            value: (rt, frame) => {
                let last = rt.stack.pop()!
                if (last.kind !== "codeblock") {
                    throw TypeError(`Expected a codeblock but got a ${last.kind}`)
                }
                for (let k = 0; k < 1000; k++) {
                    runProgram(last.value, rt, frame, false)
                }
            },
        },
        if: {
            kind: "nativefunction",
            value: (rt, frame) => {
                let [ifyes, ifno, testresult] = rt.stack.splice(-3, 3)
                if (
                    ifyes.kind !== "codeblock" ||
                    ifno.kind !== "codeblock" ||
                    testresult.kind !== "boolean"
                ) {
                    throw new TypeError(
                        `Expected two codeblocks and a boolean but got ${ifyes.kind}, ${ifno.kind} and ${testresult.kind}`,
                    )
                }
                runProgram(testresult.value ? ifyes.value : ifno.value, rt, frame, false)
            },
        },
        run: {
            kind: "nativefunction",
            value: (rt, frame) => {
                let codeblock = rt.stack.pop()!
                if (codeblock.kind !== "codeblock") {
                    throw new TypeError(`Expected a codeblock but got a ${codeblock.kind}`)
                }
                runProgram(codeblock.value, rt, frame, true)
            },
        },
        eval: {
            kind: "nativefunction",
            value: (rt, frame) => {
                let text = rt.stack.pop()!
                if (text.kind !== "string") {
                    throw new TypeError(`Expected a string but got a ${text.kind}`)
                }
                createBroccoli(text.value).runeval(rt, frame)
            },
        },
        while: {
            kind: "nativefunction",
            value: (rt, frame) => {
                let [body, test] = rt.stack.splice(-2, 2)
                if (body.kind !== "codeblock" || test.kind !== "codeblock") {
                    throw new TypeError(
                        `Expected two codeblocks but got ${body.kind} and ${test.kind}`,
                    )
                }
                let k = 0
                while (
                    (runProgram(test.value, rt, frame, false), rt.stack.pop()!.value && k < 1000)
                ) {
                    runProgram(body.value, rt, frame, false)
                    k += 1
                }
            },
        },
    },
}

function runProgram(
    program: BroccoliTreeProgram,
    runtime: BroccoliRuntime,
    frame: BroccoliFrame,
    createNewFrame: boolean,
) {
    if (createNewFrame) {
        frame = {
            parent: frame,
            data: {},
        }
    }
    program.forEach((expression) => {
        runExpression(expression, runtime, frame)
    })
}
function runExpression(
    expression: BroccoliTreeExpression,
    runtime: BroccoliRuntime,
    frame: BroccoliFrame,
) {
    let { stack } = runtime
    let entry: BroccoliValue
    let previous: BroccoliValue
    switch (expression.kind) {
        case "access":
            previous = stack.pop()!
            if (previous.kind === "native") {
                entry = previous.value.data[expression.name]
                runEntry(entry, runtime, frame)
            } else {
                throw new Error("unhandled access case")
            }
            break
        case "assignment":
            frame.data[expression.target] = stack.pop()!
            break
        case "functionassignment":
            previous = stack.pop()!
            if (previous.kind !== "codeblock") {
                throw new TypeError(`Expected a codeblock but got a ${previous.kind}`)
            }
            frame.data[expression.target] = { kind: "function", value: previous.value }
            break
        case "litteral":
            stack.push(expression.value)
            break
        case "group":
            runProgram(expression.program, runtime, frame, true)
            break
        case "identifier":
            let { name } = expression
            entry = frameLookup(frame, name, `unrecognized identifier ${name}`)
            runEntry(entry, runtime, frame)
            break
        case "operation":
            let operator = operatorMap[expression.operator]
            let left = stack.pop()!
            runExpression(expression.target, runtime, frame)
            let right = stack.pop()!
            stack.push(operator(left, right))
            break
    }
}

function runEntry(entry: BroccoliValue, runtime: BroccoliRuntime, frame: BroccoliFrame) {
    if (entry.kind === "function") {
        runProgram(entry.value, runtime, frame, true)
    } else if (entry.kind === "nativefunction") {
        entry.value(runtime, frame)
    } else {
        runtime.stack.push(entry)
    }
}

function frameLookup(initialFrame: BroccoliFrame, name: string, error: string): BroccoliValue {
    let frame = initialFrame
    let result = frame.data[name]
    let k = 0
    while (!result && frame.parent && k < 100) {
        frame = frame.parent
        result = frame.data[name]
        k += 1
    }
    if (!result) {
        throw new ReferenceError(error)
    }
    return result
}

function numericOperator(
    f: (a: number, b: number) => number,
): (a: BroccoliValue, b: BroccoliValue) => BroccoliValue {
    return (a, b) => {
        if (a.kind !== "number" || b.kind !== "number") {
            throw new TypeError(`expected number inputs but got ${a.kind} and ${b.kind}`)
        }
        return { kind: "number", value: f(a.value, b.value) }
    }
}

function comparisonOperator(
    f: (a: number, b: number) => boolean,
): (a: BroccoliValue, b: BroccoliValue) => BroccoliValue {
    return (a, b) => {
        if (a.kind !== "number" || b.kind !== "number") {
            throw new TypeError(
                `expected numbers, got ${a.kind} and ${b.kind} in comparision operator`,
            )
        }
        return { kind: "boolean", value: f(a.value, b.value) }
    }
}

let operatorMap: Record<
    BroccoliTreeOperation["operator"],
    (a: BroccoliValue, b: BroccoliValue) => BroccoliValue
> = {
    "*": numericOperator((a, b) => a * b),
    "/": numericOperator((a, b) => a / b),
    "%": numericOperator((a, b) => ((a % b) + b) % b),
    "+": numericOperator((a, b) => a + b),
    "-": numericOperator((a, b) => a - b),
    "<<": numericOperator((a, b) => a << b),
    ">>": numericOperator((a, b) => a >> b),
    "&": numericOperator((a, b) => a & b),
    "^": numericOperator((a, b) => a ^ b),
    "|": numericOperator((a, b) => a | b),
    "<": comparisonOperator((a, b) => a < b),
    "<=": comparisonOperator((a, b) => a <= b),
    ">": comparisonOperator((a, b) => a > b),
    ">=": comparisonOperator((a, b) => a >= b),
    "==": (a: BroccoliValue, b: BroccoliValue) => {
        return { kind: "boolean", value: a.kind === b.kind && a.value === b.value }
    },
    "!=": (a: BroccoliValue, b: BroccoliValue) => {
        return { kind: "boolean", value: a.kind !== b.kind || a.value !== b.value }
    },
}
