@include "../grammar.ne"

test -> test_ {% ([[, content]]) => content %}

test_ -> "p" program
 | "e" expression
 | "i" identifier
 | "s" string
 | "n" number
 | "o" operation
 | "a" assignment
 | "c" codeblock
 | "g" group
