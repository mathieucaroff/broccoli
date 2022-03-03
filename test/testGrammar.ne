@include "../grammar.ne"

test -> test_ {% ([[, content]]) => content %}

test_ -> "p" program
 | "e" expression
 | "i" identifier
 | "s" string
 | "n" number
 | "o" operation
 | "a" assignment
 | "x" access
 | "c" codeblock
 | "g" group
