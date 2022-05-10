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
    "Run a code block": [
        dedent`
        { input output } = copy
        copy run
        `,
        dedent`
        content line one
        content line two
        `,
    ],
    "Create and invoke a function": [
        dedent`
        { "Hello world!" output } : hello
        hello
        `,
        "",
    ],
    "Create and manipulate objects and arrays": [
        dedent`
        # find all the methods available at: https://github.com/mathieucaroff/broccoli/blob/743cad0168fcd6c32736497278607dc7e088720d/src/broccoli.ts#L236
        array = a
        0 a .push
        10 a .push
        20 a .push
        a toJson output

        object = b # 
        2 "foo" b .set
        4 "bar" b .set
        b toJson output
        `,
        "",
    ],
}
