import { githubCornerHTML } from "./lib/githubCorner"
import { createBroccoli } from "./broccoli"
import { exampleObject } from "./example"
import { repository, version } from "../package.json"

let div = document.createElement("div")
div.innerHTML = githubCornerHTML(repository.url, version)
document.body.appendChild(div)

let select = document.getElementById("exampleSelect") as HTMLSelectElement
let program = document.getElementById("program") as HTMLTextAreaElement
let stdin = document.getElementById("stdin") as HTMLTextAreaElement
let stderr = document.getElementById("stderr")!
let stdout = document.getElementById("stdout")!

Object.keys(exampleObject).forEach((key) => {
    let option = document.createElement("option")
    option.textContent = key
    option.value = key
    select.appendChild(option)
})
select.addEventListener("change", () => {
    ;[program.value, stdin.value] = exampleObject[select.value]
    program.rows = Math.max(program.rows, program.value.split("\n").length)
    stdin.rows = stdin.value.split("\n").length
    update()
})

function handleChange() {
    setTimeout(update, 1)
}

function update() {
    if (program.value !== exampleObject[select.value]?.[0]) {
        select.value = "-"
    }
    stderr.innerText = ""
    try {
        stdout.innerText = ""
        createBroccoli(program.value, (v) => (stdout.innerText += v)).run(stdin.value)
    } catch (error) {
        let errorText = "" + error
        if (errorText.startsWith("Error: Syntax error at line ")) {
            errorText = errorText.replace(/ based on:(\n    .*)+/g, "")
        }
        stderr.innerText = errorText
    }
}

update()

program.addEventListener("input", handleChange, true)
stdin.addEventListener("input", handleChange, true)
