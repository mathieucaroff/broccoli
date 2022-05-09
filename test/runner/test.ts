import * as specimen from "specimen-test"
import broccoliData from "./broccoli.yaml"
import { createBroccoli } from "../../src/broccoli"

export function runTest() {
    specimen.run(
        specimen.makeCodeboxSet({
            execute: (context, input) => {
                let output = ""
                let broccoli = createBroccoli(input.program, (v) => (output += v))
                broccoli.run(input.stdin)
                context.expectEqual(output, input.output)
            },
        }),
        [{ path: "broccoli.yaml", content: broccoliData }],
    )
    return "find the test result in the developer console"
}
