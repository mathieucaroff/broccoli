import { default as nearley } from "nearley"

import broccoliGrammar from "../grammar.ne"
import { createStringReader } from "./util"
import {
    BroccoliFrame,
    BroccoliRuntime,
    BroccoliTreeExpression,
    BroccoliTreeOperation,
    BroccoliTreeProgram,
    BroccoliValue,
} from "./type"

export function createBroccoli(programString: string, write: (v: string) => void) {
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
                write,
                stack: [],
            }
            runProgram(program, runtime, predefinedFrame, true)
        },
        runeval(rt: BroccoliRuntime, frame: BroccoliFrame) {
            runProgram(program, rt, frame, false)
        },
    }
}

export function isScalar(value: BroccoliValue) {
    return ["string", "number", "boolean"].includes(value.kind)
}

/**
 * The predefined frame contains all the soft keywords as well as the value
 * they are associated with.
 */
export let predefinedFrame: BroccoliFrame = {
    data: {
        printstack: {
            kind: "nativefunction",
            value: (rt, frame) => {
                rt.write("<" + JSON.stringify(rt.stack, null, 2) + ">")
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
                            rt.write(entry.value.toString())
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
                rt.write(entry.value.toString() + "\n")
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
        array: {
            kind: "nativefunction",
            value: (rt, frame) => {
                rt.stack.push({
                    kind: "array",
                    value: [],
                })
            },
        },
        object: {
            kind: "nativefunction",
            value: (rt, frame) => {
                rt.stack.push({
                    kind: "object",
                    value: {},
                })
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
                createBroccoli(text.value, rt.write).runeval(rt, frame)
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
        // TODO:
        // toJson: {}
        // fromJson: {}
    },
}

export let arrayMethodMap: BroccoliFrame["data"] = {
    push: {
        kind: "nativefunction",
        value: (rt, frame) => {
            let [value, array] = rt.stack.splice(-2, 2)
            array.value.push(value)
        },
    },
    pop: {
        kind: "nativefunction",
        value: (rt, frame) => {
            let array = rt.stack.pop()!
            rt.stack.push(array.value.pop())
        },
    },
    unshift: {
        kind: "nativefunction",
        value: (rt, frame) => {
            let [value, array] = rt.stack.splice(-2, 2)
            array.value.unshift(value)
        },
    },
    shift: {
        kind: "nativefunction",
        value: (rt, frame) => {
            let array = rt.stack.pop()!
            rt.stack.push(array.value.shift())
        },
    },
    get: {
        kind: "nativefunction",
        value: (rt, frame) => {
            let [index, array] = rt.stack.splice(-2, 2)
            if (index.kind !== "number") {
                throw TypeError(`expected a number index, got a ${index.kind}`)
            }
            rt.stack.push(array.value[index.value])
        },
    },
    set: {
        kind: "nativefunction",
        value: (rt, frame) => {
            let [value, index, array] = rt.stack.splice(-3, 3)
            if (index.kind !== "number") {
                throw TypeError(`expected a number index, got a ${index.kind}`)
            }
            array.value[index.value] = value
        },
    },
}

export let objectMethodMap: BroccoliFrame["data"] = {
    get: {
        kind: "nativefunction",
        value: (rt, frame) => {
            let [key, obj] = rt.stack.splice(-2, 2)
            rt.stack.push(obj.value[key.value])
        },
    },
    set: {
        kind: "nativefunction",
        value: (rt, frame) => {
            let [value, key, obj] = rt.stack.splice(-3, 3)
            obj.value[key.value] = value
        },
    },
}

/**
 * Run the given broccoli code, possibly inside a new frame
 * @param program
 * @param runtime
 * @param frame
 * @param createNewFrame
 */
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

/**
 * Execute the given expression according to its kind
 *
 * @param expression The expression to run
 * @param runtime The runtime
 * @param frame The current frame
 */
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
            } else if (previous.kind === "array") {
                entry = arrayMethodMap[expression.name]
                stack.push(previous)
            } else if (previous.kind === "object") {
                entry = objectMethodMap[expression.name]
                stack.push(previous)
            } else {
                throw new Error("unhandled access case")
            }
            if (entry === undefined) {
                throw new ReferenceError(`unrecognized identifier ${expression.name}`)
            }
            runEntry(entry, runtime, frame)
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
            entry = frameLookup(frame, name)
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

/**
 * runEntry performs the action related to the given entry, be it running a
 * function or just adding it as a value to the stack.
 *
 * @param entry The entry to run
 * @param runtime The runtime context
 * @param frame The current frame
 */
function runEntry(entry: BroccoliValue, runtime: BroccoliRuntime, frame: BroccoliFrame) {
    if (entry.kind === "function") {
        runProgram(entry.value, runtime, frame, true)
    } else if (entry.kind === "nativefunction") {
        entry.value(runtime, frame)
    } else {
        runtime.stack.push(entry)
    }
}

function frameLookup(initialFrame: BroccoliFrame, name: string): BroccoliValue {
    let frame = initialFrame
    let result = frame.data[name]
    let k = 0
    let recursionLimit = 100
    while (result === undefined && frame.parent && k < recursionLimit) {
        frame = frame.parent
        result = frame.data[name]
        k += 1
    }
    if (result === undefined) {
        if (k >= recursionLimit) {
            throw new Error("too much codeblock recursion")
        } else {
            throw new ReferenceError(`unrecognized identifier ${name}`)
        }
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
    "+": (a: BroccoliValue, b: BroccoliValue) => {
        if (!["string", "number"].includes(a.kind) || !["string", "number"].includes(b.kind)) {
            throw new TypeError(
                `got incompatible types ${a.kind} and ${b.kind} in addition operator`,
            )
        }
        let kind: BroccoliValue["kind"] = "string"
        if (a.kind === "number" && b.kind === "number") {
            kind = "number"
        }
        return { kind, value: a.value + b.value }
    },
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
