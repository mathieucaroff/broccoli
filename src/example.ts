import { dedent } from "./util/dedent"

export let exampleObject = {
    "Hello world": [`"Hello World!" output`, ""],
    "Precedence": [`3 + 3 * 3 output`, ""],
    "Factorial": [
        dedent`
        input number = a
        1 = b
        { a * b = b a - 1 = a }
        { a > 0 }
        while

        b output`,
        "4",
    ],
    "Truth machine": [
        dedent`
        { { 1 stdout .write } { true } while }
        { 0 output }
        input number == 1
        if
        `,
        "0",
    ],
    "Copy input lines on output": [
        dedent`
        input
        { output input }
        { = a a a }
        while
        `,
        dedent`
        abc
        defg
        hijkl
        `,
    ],
    "Copy the whole input on output": [
        dedent`
        stdin .read
        stdout .write
        `,
        dedent`
        abc
        defg

        _
        `,
    ],
}
