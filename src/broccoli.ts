import { default as nearley } from "nearley"

import broccoliGrammar from "../grammar.ne"
import { createStringReader, Reader } from "./util"
import {
    BroccoliTreeExpression,
    BroccoliTreeOperation,
    BroccoliTreeProgram,
    BroccoliValue,
} from "./type"

export function createBroccoli(programString: string) {
    let parser = new nearley.Parser(broccoliGrammar)
    parser.feed(programString)
    let program = parser.results[0]

    return {
        run(stdinString: string) {
            return runProgram(program, createStringReader(stdinString))
        },
    }
}

function runProgram(program: BroccoliTreeProgram, stdin: Reader) {
    let stack: BroccoliValue[] = []
    let frame: Record<string, BroccoliValue> = {}
    program.forEach((expression) => {
        processExpression(expression, stack, frame, stdin)
    })
    return stack
}

function processExpression(
    expression: BroccoliTreeExpression,
    stack: BroccoliValue[],
    frame: Record<string, BroccoliValue>,
    stdin: Reader,
) {
    switch (expression.kind) {
        case "access":
            stack.push(stack.pop()![expression.name])
            break
        case "assignment":
            frame[expression.target] = stack.pop()!
            break
        case "codeblock":
            stack.push(expression)
            break
        case "group":
            stack.push(...runProgram(expression.program, stdin))
            break
        case "identifier":
            // Todo: check the predefined table
            // Todo: throw if the identifier value is undefined
            stack.push(frame[expression.name])
            break
        case "number":
            stack.push(expression)
            break
        case "operation":
            let operator = getOperator(expression.operator)
            stack.push(operator(stack.pop(), expression.target))
            break
    }
}

function getOperator(
    operatorString: BroccoliTreeOperation["operator"],
): (a: BroccoliValue, b: BroccoliValue) => BroccoliValue {
    return {}[operatorString]
}
