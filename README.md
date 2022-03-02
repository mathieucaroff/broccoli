# Broccoli

# Nearly grammar for broccoli

```ne
braced[X] -> "{" $X "}"
parenthesized[X] -> "(" $X ")"

main -> program

program -> (expression (__ expression):*):?

expression -> expression_
expression_ -> identifier | string | number | operation | assignment | codeblock | group

identifier -> [A-Za-z_] [0-9A-Za-z_]:*

string -> "\"" string_content:* "\""

string_content -> [^"\n\\] | "\\" .

number -> [1-9] [0-9]:*

operation -> operator _ expression

operator -> "<=" | ">=" | "<<" | ">>" | [-+*/%<>&^|]

assignment -> "=" _ identifier

codeblock -> braced[_ program _]

group -> parenthesized[_ program _]

_  -> [ \t\n]:* (comment [ \t\n]:*):?
__ -> [ \t\n]:+ (comment [ \t\n]:*):?

comment -> "#" .:* "\n"
```