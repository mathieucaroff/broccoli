braced[X] -> "{" $X "}"
parenthesized[X] -> "(" $X ")"
bracketed[X] -> "[" $X "]"

main -> _ program _ {% ([, program]) => program %}

program -> (expression (__ expression):*):? {% ([content]) => {
    if (content === null) return []
    return [content[0], ...content[1].map(([, c]) => c)]
} %}

expression -> expression_ {% ([[value]]) => (value) %}
expression_ -> identifier | access | string | number | operation | assignment | functionassignment | codeblock | group

identifier -> [A-Za-z_] [0-9A-Za-z_]:* {% ([first, rest]) => ({ kind: "identifier", name: first+rest.join("") }) %}

access -> "." identifier {% ([, { name }]) => ({ kind: "access", name }) %}

string -> "\"" string_content:* "\"" {% ([, value]) => ({ kind: "litteral", value: { kind: "string", value: value.join("") }}) %}

string_content -> [^"\n\\] | "\\" [ntr"\\] {% ([, character]) => {
    switch (character) {
        case "n": return "\n"
        case "t": return "\t"
        case "r": return "\r"
        case "\"": return "\""
        case "\\": return "\\"
    }
} %}

number -> ("0" | [1-9] [0-9]:*) {% ([[head, body = []]]) => ({
    kind: "litteral",
    value: { kind: "number", value: +(head + body.join(""))
}}) %}

operation -> operator __ expression {% ([[operator], , target]) => ({ kind: "operation", operator, target }) %}

operator -> "==" | "!=" | "<=" | ">=" | "<<" | ">>" | [-+*/%<>&^|]

assignment -> "=" _ identifier {% ([, , { name }]) => ({ kind: "assignment", target: name }) %}
functionassignment -> ":" _ identifier {% ([, , { name }]) => ({ kind: "functionassignment", target: name }) %}

codeblock -> braced[_ program _] {% ([[, [, program]]]) => ({ kind: "litteral", value: { kind: "codeblock", value: program }}) %}

group -> parenthesized[_ program _] {% ([[, [, program]]])=> ({ kind: "group", program }) %}

_  -> [ \t\n]:* (comment [ \t\n]:*):?
__ -> [ \t\n]:+ (comment [ \t\n]:*):?

comment -> "#" .:* "\n"
