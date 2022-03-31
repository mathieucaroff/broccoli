export function dedent(a: TemplateStringsArray): string {
    let b = a[0].split("\n")
    if (b[0].length === 0) {
        b.splice(0, 1)
    }
    return b.map((line) => line.trimStart()).join("\n")
}
