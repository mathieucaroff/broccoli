import { deepEqual } from "../lib/deepEqual"

export interface SuccessCase<TI, TO> {
    input: TI
    output: TO
    target: "success"
}

export interface FailureCase<TI> {
    input: TI
    output?: undefined
    target: "failure"
}

export let success = <T>(input: string, output: T): Case<string, T> => {
    return {
        input,
        target: "success",
        output,
    }
}

export let failure = <T>(input): Case<string, T> => {
    return {
        input,
        target: "failure",
    }
}

export type Case<TI = any, TO = any> = SuccessCase<TI, TO> | FailureCase<TI>

const PASSED = true
const FAILED = false
export let testEngine = <TI extends string, TO = any>(
    caseList: Case<TI, TO>[],
    createParser: () => nearley.Parser,
) => {
    let reportArray = [] as string[]

    let caseRes = caseList.filter(({ input, output, target }) => {
        let parser = createParser()
        let results: TO[] = []
        let success: "success" | "failure" = "failure"
        let err: string = ""

        // Run
        try {
            parser.feed(input)
        } catch (e) {
            err = e
        }

        // Aquire results
        if (parser.results?.length > 0) {
            results = parser.results
            success = "success"
        } else {
            results = []
            success = "failure"
        }

        // Check success
        if (success !== target) {
            let r = JSON.stringify(results)
            reportArray.push(`input : ${input} expected: ${target}, got: ${success} ${err} ${r}`)
            return FAILED
        }
        if (success === "failure") {
            return PASSED
        }

        // Check result length
        if (results.length !== 1) {
            reportArray.push(`with input ${input}, there are several results (${results.length})`)
            return FAILED
        }

        // Check that result is deepEqual to expected output
        if (!deepEqual(results[0], output)) {
            let r = JSON.stringify(results[0])
            let o = JSON.stringify(output)
            reportArray.push(`input : ${input}\nwanted: ${o}\ngot   : ${r}`)
            return FAILED
        }

        // All check succeeded
        return PASSED
    })

    reportArray.push(`${caseRes.length} passing / ${caseList.length} total\n`)

    return reportArray.join("\n\n")
}
